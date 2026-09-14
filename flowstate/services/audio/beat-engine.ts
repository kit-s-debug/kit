/**
 * Beat transport.
 *
 * Wraps either a synthesised pattern or a hosted audio file behind one
 * interface, and owns the timing grid the rest of the app reads from: bar,
 * beat and step position, plus a bar-boundary callback that the suggestion
 * loop uses to decide when a new bar is worth analysing.
 */

import type { Beat } from '@/types';
import { patternFor, type DrumPattern, type VoiceName } from './patterns';
import {
  clap,
  createNoiseBuffer,
  hat,
  kick,
  metronomeClick,
  pluck,
  rim,
  snare,
  sub,
  type VoiceContext,
} from './synth';

export type BeatEngineState =
  | 'idle'
  | 'ready'
  | 'count-in'
  | 'playing'
  | 'paused'
  | 'stopped'
  | 'error';

export interface BeatPosition {
  /** Seconds since the beat started, excluding the count-in. */
  elapsed: number;
  bar: number;
  beat: number;
  step: number;
  /** Bars remaining in the count-in, 0 once the beat is running. */
  countIn: number;
}

export interface BeatEngineOptions {
  onState?: (state: BeatEngineState) => void;
  onBar?: (bar: number) => void;
  onError?: (message: string) => void;
}

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD = 0.14;

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export function isAudioSupported(): boolean {
  return getAudioContextCtor() !== null;
}

export class BeatEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private noise: AudioBuffer | null = null;

  private beat: Beat | null = null;
  private pattern: DrumPattern = patternFor('freestyle');

  private timer: ReturnType<typeof setInterval> | null = null;
  private nextStep = 0;
  private nextStepTime = 0;
  private originTime = 0;
  private countInSteps = 0;
  private lastBarFired = -1;

  private volume = 0.8;
  private metronome = false;
  private state: BeatEngineState = 'idle';

  private audioEl: HTMLAudioElement | null = null;
  private fileNode: MediaElementAudioSourceNode | null = null;

  constructor(private options: BeatEngineOptions = {}) {}

  getState(): BeatEngineState {
    return this.state;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  private setState(next: BeatEngineState) {
    if (this.state === next) return;
    this.state = next;
    this.options.onState?.(next);
  }

  private fail(message: string) {
    this.setState('error');
    this.options.onError?.(message);
  }

  /** Creates the AudioContext. Must be called from a user gesture. */
  private ensureContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctor = getAudioContextCtor();
    if (!Ctor) {
      this.fail('This browser does not support Web Audio, so beats cannot play.');
      return null;
    }
    try {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = this.volume;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.7;
      master.connect(analyser);
      analyser.connect(ctx.destination);

      this.ctx = ctx;
      this.master = master;
      this.analyser = analyser;
      this.noise = createNoiseBuffer(ctx);
      return ctx;
    } catch {
      this.fail('Audio could not start. Check that your device is not muted.');
      return null;
    }
  }

  async load(beat: Beat): Promise<void> {
    this.stop();
    this.beat = beat;
    this.pattern = patternFor(
      beat.source.kind === 'synth' ? beat.source.pattern : beat.category,
    );

    if (beat.source.kind === 'file') {
      const ctx = this.ensureContext();
      if (!ctx) return;
      await this.loadFile(beat.source.url, ctx);
    }
    this.setState('ready');
  }

  private async loadFile(url: string, ctx: AudioContext): Promise<void> {
    this.teardownFile();
    const el = new Audio();
    el.src = url;
    el.loop = true;
    el.crossOrigin = 'anonymous';
    el.preload = 'auto';

    const ready = new Promise<void>((resolve, reject) => {
      const onReady = () => { cleanup(); resolve(); };
      const onError = () => { cleanup(); reject(new Error('load failed')); };
      const cleanup = () => {
        el.removeEventListener('canplaythrough', onReady);
        el.removeEventListener('error', onError);
      };
      el.addEventListener('canplaythrough', onReady);
      el.addEventListener('error', onError);
    });

    try {
      el.load();
      await ready;
      this.audioEl = el;
      this.fileNode = ctx.createMediaElementSource(el);
      if (this.master) this.fileNode.connect(this.master);
    } catch {
      this.fail('That beat could not be loaded. Pick another one to keep going.');
    }
  }

  private teardownFile() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = '';
    }
    this.fileNode?.disconnect();
    this.audioEl = null;
    this.fileNode = null;
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
    if (this.audioEl) this.audioEl.volume = this.volume;
  }

  setMetronome(enabled: boolean): void {
    this.metronome = enabled;
  }

  async play(countInBars = 0): Promise<void> {
    const ctx = this.ensureContext();
    if (!ctx || !this.beat) return;

    try {
      if (ctx.state === 'suspended') await ctx.resume();
    } catch {
      this.fail('Audio is blocked. Tap the screen once, then start again.');
      return;
    }

    if (this.master) {
      this.master.gain.cancelScheduledValues(ctx.currentTime);
      this.master.gain.setValueAtTime(this.volume, ctx.currentTime);
    }

    if (this.beat.source.kind === 'file' && this.audioEl) {
      this.audioEl.volume = this.volume;
      this.originTime = ctx.currentTime;
      try {
        await this.audioEl.play();
      } catch {
        this.fail('Playback was blocked by the browser. Tap start again.');
        return;
      }
      this.setState('playing');
      return;
    }

    const stepDuration = this.stepDuration();
    this.countInSteps = countInBars * this.pattern.resolution;
    this.nextStep = -this.countInSteps;
    this.nextStepTime = ctx.currentTime + 0.08;
    this.originTime = this.nextStepTime + this.countInSteps * stepDuration;
    this.lastBarFired = -1;

    this.setState(countInBars > 0 ? 'count-in' : 'playing');
    this.startScheduler();
  }

  private startScheduler() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.tick(), LOOKAHEAD_MS);
    this.tick();
  }

  private stepDuration(): number {
    const bpm = this.beat?.bpm ?? 90;
    // Four beats per bar, `resolution` steps per bar.
    return (60 / bpm) * (4 / this.pattern.resolution);
  }

  private tick() {
    const ctx = this.ctx;
    if (!ctx || !this.master || !this.noise) return;
    if (this.state !== 'playing' && this.state !== 'count-in') return;

    const stepDuration = this.stepDuration();
    const voice: VoiceContext = { ctx, destination: this.master, noise: this.noise };

    while (this.nextStepTime < ctx.currentTime + SCHEDULE_AHEAD) {
      const swungTime = this.nextStepTime + this.swingOffset(this.nextStep, stepDuration);

      if (this.nextStep < 0) {
        const countStep = this.nextStep + this.countInSteps;
        if (countStep % 4 === 0) {
          metronomeClick(voice, swungTime, countStep % this.pattern.resolution === 0);
        }
      } else {
        this.scheduleStep(voice, this.nextStep, swungTime);
        if (this.state === 'count-in') this.setState('playing');
      }

      this.nextStepTime += stepDuration;
      this.nextStep += 1;
    }

    const position = this.getPosition();
    if (position.bar !== this.lastBarFired && position.countIn === 0) {
      this.lastBarFired = position.bar;
      this.options.onBar?.(position.bar);
    }
  }

  private swingOffset(step: number, stepDuration: number): number {
    if (this.pattern.swing <= 0 || step < 0) return 0;
    return step % 2 === 1 ? stepDuration * this.pattern.swing : 0;
  }

  private scheduleStep(voice: VoiceContext, step: number, when: number) {
    const p = this.pattern;
    const total = p.bars * p.resolution;
    const index = ((step % total) + total) % total;
    const bar = Math.floor(index / p.resolution);
    const inBar = index % p.resolution;

    const hits = (name: VoiceName) => p.voices[name]?.[index] ?? '.';

    if (hits('kick') !== '.') kick(voice, when, hits('kick') === 'o' ? 1.1 : 1);
    if (hits('snare') !== '.') snare(voice, when, hits('snare') === '-' ? 0.4 : 1);
    if (hits('clap') !== '.') clap(voice, when);
    if (hits('rim') !== '.') rim(voice, when);
    if (hits('hat') !== '.') hat(voice, when, false, hits('hat') === '-' ? 0.5 : 1);
    if (hits('openHat') !== '.') hat(voice, when, true);
    if (hits('sub') !== '.') {
      sub(voice, when, p.bassline[bar] ?? 0);
    } else if (hits('kick') !== '.' && !p.voices.sub) {
      sub(voice, when, p.bassline[bar] ?? 0, 0.55);
    }

    if (p.melody[index] === 'x') {
      const degree = p.scale[(inBar + bar * 3) % p.scale.length] ?? 0;
      const midi = p.root + 12 * p.melodyOctave + degree + (p.bassline[bar] ?? 0);
      pluck(voice, when, midi, this.stepDuration() * 2.2);
    }

    if (this.metronome && inBar % 4 === 0) {
      metronomeClick(voice, when, inBar === 0);
    }
  }

  getPosition(): BeatPosition {
    const ctx = this.ctx;
    const beat = this.beat;
    if (!ctx || !beat) return { elapsed: 0, bar: 0, beat: 0, step: 0, countIn: 0 };

    if (beat.source.kind === 'file' && this.audioEl) {
      const elapsed = this.audioEl.currentTime;
      const beats = (elapsed * beat.bpm) / 60;
      return {
        elapsed,
        bar: Math.floor(beats / 4),
        beat: Math.floor(beats) % 4,
        step: Math.floor(beats * 4) % 16,
        countIn: 0,
      };
    }

    const raw = ctx.currentTime - this.originTime;
    if (raw < 0) {
      const stepDuration = this.stepDuration();
      const barLength = stepDuration * this.pattern.resolution;
      return {
        elapsed: 0,
        bar: 0,
        beat: 0,
        step: 0,
        countIn: Math.max(1, Math.ceil(-raw / barLength)),
      };
    }

    const beats = (raw * beat.bpm) / 60;
    return {
      elapsed: raw,
      bar: Math.floor(beats / 4),
      beat: Math.floor(beats) % 4,
      step: Math.floor(beats * 4) % 16,
      countIn: 0,
    };
  }

  async pause(): Promise<void> {
    if (this.state !== 'playing' && this.state !== 'count-in') return;
    this.audioEl?.pause();
    try {
      await this.ctx?.suspend();
    } catch {
      /* Suspending is best-effort; the transport state is what the UI reads. */
    }
    this.setState('paused');
  }

  async resume(): Promise<void> {
    if (this.state !== 'paused') return;
    try {
      await this.ctx?.resume();
    } catch {
      this.fail('Audio could not resume. Try starting the session again.');
      return;
    }
    if (this.audioEl) await this.audioEl.play().catch(() => undefined);
    this.setState('playing');
  }

  /** Smooth exit used when the timer runs out. */
  fadeOut(seconds = 1.6): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), now);
    this.master.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
    if (this.audioEl) {
      const el = this.audioEl;
      const startVolume = el.volume;
      const startedAt = performance.now();
      const step = () => {
        const t = (performance.now() - startedAt) / (seconds * 1000);
        if (t >= 1 || !this.audioEl) { el.pause(); return; }
        el.volume = Math.max(0, startVolume * (1 - t));
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    window.setTimeout(() => this.stop(), seconds * 1000 + 60);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.audioEl?.pause();
    if (this.audioEl) this.audioEl.currentTime = 0;
    if (this.ctx && this.master) {
      const now = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(now);
      this.master.gain.setValueAtTime(0.0001, now);
    }
    this.nextStep = 0;
    this.lastBarFired = -1;
    if (this.state !== 'idle') this.setState('stopped');
  }

  dispose(): void {
    this.stop();
    this.teardownFile();
    this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.master = null;
    this.analyser = null;
    this.state = 'idle';
  }
}
