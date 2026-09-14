/**
 * Microphone capture for the waveform and for onset timing.
 *
 * This is separate from speech recognition on purpose. The browser's speech
 * engine gives us words but no reliable timing; the raw analyser gives us
 * timing but no words. Onsets collected here are what the beat-timing score is
 * computed from, so it reflects when the rapper actually hit, not a guess.
 */

import type { MicPermission } from '@/types';

export interface MicStartResult {
  permission: MicPermission;
  message?: string;
}

const ONSET_RISE = 1.55;
const ONSET_FLOOR = 0.035;
const ONSET_MIN_GAP_MS = 110;

export class MicAnalyser {
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private buffer: Float32Array<ArrayBuffer> | null = null;

  private level = 0;
  private smoothed = 0;
  private baseline = 0.02;
  private lastOnsetAt = -Infinity;
  private onsets: number[] = [];
  private startedAt = 0;
  private active = false;

  isActive(): boolean {
    return this.active;
  }

  static isSupported(): boolean {
    return (
      typeof navigator !== 'undefined' &&
      typeof navigator.mediaDevices?.getUserMedia === 'function'
    );
  }

  /** Reads the permission state without prompting, where the browser allows. */
  static async queryPermission(): Promise<MicPermission> {
    if (!MicAnalyser.isSupported()) return 'unavailable';
    try {
      const permissions = navigator.permissions as
        | { query?: (d: { name: string }) => Promise<{ state: string }> }
        | undefined;
      if (!permissions?.query) return 'unknown';
      const status = await permissions.query({ name: 'microphone' });
      if (status.state === 'granted') return 'granted';
      if (status.state === 'denied') return 'denied';
      return 'prompt';
    } catch {
      return 'unknown';
    }
  }

  async start(): Promise<MicStartResult> {
    if (!MicAnalyser.isSupported()) {
      return {
        permission: 'unavailable',
        message: 'This browser cannot access a microphone.',
      };
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (error) {
      const name = (error as DOMException)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        return {
          permission: 'denied',
          message:
            'Microphone access was blocked. Allow it in your browser settings, then try again.',
        };
      }
      if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        return {
          permission: 'unavailable',
          message: 'No microphone was found on this device.',
        };
      }
      return {
        permission: 'unavailable',
        message: 'The microphone could not be opened. Close other apps using it and retry.',
      };
    }

    const Ctor =
      (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) {
      this.stopStream();
      return { permission: 'unavailable', message: 'Web Audio is unavailable in this browser.' };
    }

    this.ctx = new Ctor();
    const source = this.ctx.createMediaStreamSource(this.stream);
    const analyser = this.ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.45;
    source.connect(analyser);

    this.analyser = analyser;
    this.buffer = new Float32Array(new ArrayBuffer(analyser.fftSize * 4));
    this.startedAt = performance.now();
    this.onsets = [];
    this.lastOnsetAt = -Infinity;
    this.active = true;

    return { permission: 'granted' };
  }

  /**
   * Call once per animation frame. Returns the smoothed 0-1 level and records
   * an onset when the energy jumps clear of its running baseline.
   */
  sample(): number {
    const analyser = this.analyser;
    const buffer = this.buffer;
    if (!analyser || !buffer || !this.active) {
      this.smoothed *= 0.9;
      return this.smoothed;
    }

    analyser.getFloatTimeDomainData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 1) {
      const v = buffer[i] ?? 0;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / buffer.length);
    this.level = rms;

    // Perceptual curve — raw RMS barely moves for normal speaking volume.
    const shaped = Math.min(1, Math.pow(rms * 7.5, 0.75));
    this.smoothed = this.smoothed * 0.72 + shaped * 0.28;

    const now = performance.now();
    if (
      rms > ONSET_FLOOR &&
      rms > this.baseline * ONSET_RISE &&
      now - this.lastOnsetAt > ONSET_MIN_GAP_MS
    ) {
      this.lastOnsetAt = now;
      this.onsets.push(now - this.startedAt);
    }
    // Slow-moving noise floor so the detector adapts to the room.
    this.baseline = this.baseline * 0.96 + rms * 0.04;

    return this.smoothed;
  }

  /** Fills `target` with the current waveform, values in -1..1. */
  getWaveform(target: Float32Array): void {
    const analyser = this.analyser;
    const buffer = this.buffer;
    if (!analyser || !buffer || !this.active) {
      target.fill(0);
      return;
    }
    analyser.getFloatTimeDomainData(buffer);
    const bucket = Math.floor(buffer.length / target.length) || 1;
    for (let i = 0; i < target.length; i += 1) {
      let peak = 0;
      for (let j = 0; j < bucket; j += 1) {
        const value = Math.abs(buffer[i * bucket + j] ?? 0);
        if (value > peak) peak = value;
      }
      target[i] = Math.min(1, peak * 3.2);
    }
  }

  getLevel(): number {
    return this.smoothed;
  }

  getRawLevel(): number {
    return this.level;
  }

  /** Onset timestamps in ms, relative to when capture started. */
  getOnsets(): readonly number[] {
    return this.onsets;
  }

  private stopStream() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }

  stop(): void {
    this.active = false;
    this.stopStream();
    this.analyser?.disconnect();
    this.analyser = null;
    this.buffer = null;
    this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.smoothed = 0;
  }
}
