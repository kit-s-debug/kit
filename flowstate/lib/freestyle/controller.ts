'use client';

/**
 * The freestyle session controller.
 *
 * Owns the beat transport, the microphone, the speech engine, the suggestion
 * pipeline and the clock, and writes results into the session store. It lives
 * outside React on purpose: the pieces it coordinates fire far more often than
 * a component should re-render, so the store only ever sees settled state.
 */

import type {
  Beat,
  ChallengeResult,
  DailyChallenge,
  FreestyleSession,
  FreestyleSettings,
  TopicId,
  TranscriptChunk,
} from '@/types';
import { BeatEngine } from '@/services/audio/beat-engine';
import { MicAnalyser } from '@/services/audio/mic';
import { createSpeechEngine, type SpeechEngine } from '@/services/speech';
import { SuggestionClient, enrichAnalysis } from '@/services/ai/client';
import { localObservations } from '@/services/ai/local-provider';
import { analysePerformance, barDurationMs, segmentBars } from '@/lib/analysis';
import { detectTopic, tokenise } from '@/lib/rhyme';
import { evaluateChallenge } from '@/lib/challenges';
import { sessionStore, type SessionError } from '@/lib/store/session-store';

/** How much recent text the rhyme engine reads. Roughly the last two bars. */
const CONTEXT_CHARS = 140;
const TICK_MS = 200;

export type FinishReason = 'timer' | 'manual' | 'error';

export interface StartOptions {
  settings: FreestyleSettings;
  beat: Beat;
  challenge: DailyChallenge | null;
  aiLive: boolean;
  metronome: boolean;
}

export interface FinishResult {
  session: FreestyleSession;
}

export class FreestyleController {
  readonly beatEngine: BeatEngine;
  readonly mic = new MicAnalyser();

  private speech: SpeechEngine | null = null;
  private suggestions: SuggestionClient;

  private settings: FreestyleSettings | null = null;
  private beat: Beat | null = null;
  private challenge: DailyChallenge | null = null;
  private aiLive = false;

  private chunks: TranscriptChunk[] = [];
  private interim = '';
  private phraseStartMs: number | null = null;
  private lastFinalMs = 0;
  private topicsSeen = new Set<TopicId>();

  /** Watchdog state: is transcription actually producing anything? */
  private heardAnything = false;
  private micActiveMs = 0;
  private warnedSilent = false;

  private ticker: ReturnType<typeof setInterval> | null = null;
  private startedAt = 0;
  private finished = false;
  private disposed = false;

  private onFinish: ((result: FinishResult) => void) | null = null;

  constructor() {
    this.beatEngine = new BeatEngine({
      onError: (message) =>
        this.error({
          kind: 'audio',
          title: 'Beat playback problem',
          body: message,
          recoverable: true,
        }),
      onBar: (bar) => {
        sessionStore.setState({ currentBar: bar });
      },
    });

    this.suggestions = new SuggestionClient({
      onUpdate: (set) => sessionStore.setState({ suggestions: set }),
      onPending: (aiPending) => sessionStore.setState({ aiPending }),
    });
  }

  private error(error: SessionError) {
    sessionStore.getState().pushError(error);
  }

  /* ------------------------------------------------------------- start */

  async start(options: StartOptions, onFinish: (result: FinishResult) => void): Promise<void> {
    if (this.disposed) return;
    this.onFinish = onFinish;
    this.settings = options.settings;
    this.beat = options.beat;
    this.challenge = options.challenge;
    this.aiLive = options.aiLive;
    this.finished = false;
    this.chunks = [];
    this.interim = '';
    this.phraseStartMs = null;
    this.lastFinalMs = 0;
    this.topicsSeen.clear();
    this.heardAnything = false;
    this.micActiveMs = 0;
    this.warnedSilent = false;
    this.suggestions.reset();

    sessionStore.setState({
      phase: 'starting',
      beat: options.beat,
      settings: options.settings,
      chunks: [],
      interim: '',
      suggestions: null,
      analysis: null,
      challengeResult: null,
      errors: [],
      remainingMs: options.settings.durationSec * 1000,
      elapsedMs: 0,
      currentBar: 0,
      paused: false,
      xpEarned: 0,
      savedSessionId: null,
    });

    this.suggestions.configure({
      difficulty: options.settings.difficulty,
      assist: options.settings.assist,
      bpm: options.beat.bpm,
      aiLive: options.aiLive,
    });

    // 1. Microphone. Skipped entirely in forced demo mode — we never open a
    //    stream we do not need, and never claim to be listening when we are not.
    let micLive = false;
    if (!options.settings.forceDemoMode) {
      const result = await this.mic.start();
      sessionStore.setState({ micPermission: result.permission });
      if (result.permission === 'granted') {
        micLive = true;
      } else {
        this.error({
          kind: 'mic',
          title:
            result.permission === 'denied'
              ? 'Microphone blocked'
              : 'No microphone available',
          body: `${result.message ?? 'The microphone could not be opened.'} You can still run a session in Demo Mode.`,
          recoverable: true,
        });
      }
    } else {
      sessionStore.setState({ micPermission: 'unknown' });
    }

    // 2. Speech engine. Falls back to the scripted transcript, clearly marked.
    const choice = createSpeechEngine(options.settings.forceDemoMode || !micLive);
    this.speech = choice.engine;
    const demoMode = choice.demo;

    sessionStore.setState({
      micLive: micLive && !demoMode,
      demoMode,
      speechCapability: choice.capability,
    });

    if (!demoMode && !choice.capability.supported) {
      this.error({
        kind: 'speech',
        title: 'Speech recognition unavailable',
        body: choice.capability.reason ?? 'This browser cannot transcribe speech.',
        recoverable: true,
      });
    }

    // 3. Beat. A failure here is survivable — the session runs without audio.
    try {
      await this.beatEngine.load(options.beat);
      this.beatEngine.setVolume(options.settings.beatVolume);
      this.beatEngine.setMetronome(options.metronome);
      await this.beatEngine.play(options.settings.countInBars);
    } catch {
      this.error({
        kind: 'audio',
        title: 'Beat could not start',
        body: 'The session will run without audio. Try another beat, or reload the page.',
        recoverable: true,
      });
    }

    this.startedAt = performance.now();
    sessionStore.setState({
      phase: options.settings.countInBars > 0 ? 'countdown' : 'live',
    });

    // 4. Transcription.
    this.speech.start({
      onPartial: (text) => this.handlePartial(text),
      onFinal: (result) => this.handleFinal(result.text, result.confidence),
      onError: (error) => {
        if (error.code === 'no-speech') return; // normal during a gap
        this.error({
          kind: 'speech',
          title: error.fatal ? 'Transcription stopped' : 'Transcription problem',
          body: error.message,
          recoverable: !error.fatal,
          offerDemo: true,
        });
      },
      onEnd: () => undefined,
    });

    this.startTicker();
  }

  /* ------------------------------------------------------------ clock */

  private elapsedMs(): number {
    const position = this.beatEngine.getPosition();
    if (position.countIn > 0) return 0;
    if (position.elapsed > 0) return position.elapsed * 1000;
    // No audio clock available — fall back to wall time.
    return Math.max(0, performance.now() - this.startedAt);
  }

  private startTicker() {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = setInterval(() => {
      if (this.finished || this.disposed) return;
      const state = sessionStore.getState();
      if (state.paused) return;

      const position = this.beatEngine.getPosition();
      if (position.countIn > 0) {
        sessionStore.setState({ countInBars: position.countIn, phase: 'countdown' });
        return;
      }

      const elapsed = this.elapsedMs();
      const total = (this.settings?.durationSec ?? 60) * 1000;
      const remaining = Math.max(0, total - elapsed);

      sessionStore.setState({
        countInBars: 0,
        phase: state.phase === 'countdown' || state.phase === 'starting' ? 'live' : state.phase,
        elapsedMs: elapsed,
        remainingMs: remaining,
      });

      // Keep the mic level moving even if nothing is drawing it right now.
      if (this.mic.isActive()) {
        this.mic.sample();
        if (this.mic.getRawLevel() > 0.025) this.micActiveMs += TICK_MS;
      }
      this.checkTranscriptionAlive(elapsed);

      if (remaining <= 0) void this.finish('timer');
    }, TICK_MS);
  }

  /**
   * Catches the case where the browser reports speech support but the service
   * never returns anything — offline, blocked, or an unkeyed build. Without
   * this the screen says "Listening" forever and the user is left guessing.
   */
  private checkTranscriptionAlive(elapsedMs: number) {
    if (this.warnedSilent || this.heardAnything) return;
    const state = sessionStore.getState();
    if (state.demoMode || !state.micLive) return;
    // Only complain once we know they have actually been making sound.
    if (elapsedMs < 8000 || this.micActiveMs < 3000) return;

    this.warnedSilent = true;
    this.error({
      kind: 'speech',
      title: 'No words are coming through',
      body: 'Your microphone is picking up sound, but the browser\u2019s speech service has not returned any text. It may be offline or unavailable on this browser.',
      recoverable: true,
      offerDemo: true,
    });
  }

  /**
   * Swaps live transcription for the scripted demo without ending the run.
   * The microphone is closed, and the UI relabels itself as Demo Mode.
   */
  switchToDemo(): void {
    if (this.finished) return;
    this.speech?.abort();
    this.mic.stop();
    this.warnedSilent = true;

    const engine = createSpeechEngine(true);
    this.speech = engine.engine;
    sessionStore.setState({
      demoMode: true,
      micLive: false,
      errors: [],
      speechCapability: engine.capability,
    });

    this.speech.start({
      onPartial: (text) => this.handlePartial(text),
      onFinal: (result) => this.handleFinal(result.text, result.confidence),
      onError: () => undefined,
      onEnd: () => undefined,
    });
  }

  /* ------------------------------------------------------- transcript */

  private recentText(): string {
    const finals = this.chunks.map((chunk) => chunk.text).join(' ');
    const combined = `${finals} ${this.interim}`.trim();
    return combined.slice(-CONTEXT_CHARS);
  }

  private previousBar(): string | null {
    const last = this.chunks[this.chunks.length - 1];
    return last ? last.text : null;
  }

  private handlePartial(text: string) {
    if (this.finished) return;
    if (text) this.heardAnything = true;
    if (text && this.phraseStartMs === null) this.phraseStartMs = this.elapsedMs();
    this.interim = text;
    sessionStore.setState({ interim: text });
    this.pushSuggestions();
  }

  private handleFinal(text: string, confidence: number) {
    if (this.finished || !text.trim()) return;
    this.heardAnything = true;

    const now = this.elapsedMs();
    const chunk: TranscriptChunk = {
      id: `${now.toFixed(0)}-${this.chunks.length}`,
      text: text.trim(),
      startMs: this.phraseStartMs ?? this.lastFinalMs,
      endMs: now,
      isFinal: true,
      confidence,
    };

    this.chunks = [...this.chunks, chunk];
    this.lastFinalMs = now;
    this.phraseStartMs = null;
    this.interim = '';

    const words = tokenise(chunk.text);
    this.suggestions.noteSpokenWords(words);

    const reading = detectTopic(this.chunks.map((c) => c.text).join(' '));
    if (reading.topic) this.topicsSeen.add(reading.topic);

    sessionStore.setState({ chunks: this.chunks, interim: '' });
    this.pushSuggestions();
  }

  private pushSuggestions() {
    const text = this.recentText();
    if (text.length < 3) return;
    const barMs = barDurationMs(this.beat?.bpm ?? 90);
    this.suggestions.push(text, this.previousBar(), Math.floor(this.elapsedMs() / barMs));
  }

  /* ---------------------------------------------------------- controls */

  async pause(): Promise<void> {
    if (this.finished) return;
    sessionStore.setState({ paused: true });
    await this.beatEngine.pause();
    this.speech?.stop();
  }

  async resume(): Promise<void> {
    if (this.finished) return;
    await this.beatEngine.resume();
    // A stopped recogniser cannot be restarted, so a fresh one is created.
    const settings = this.settings;
    if (settings) {
      const choice = createSpeechEngine(
        settings.forceDemoMode || !sessionStore.getState().micLive,
      );
      this.speech = choice.engine;
      this.speech.start({
        onPartial: (text) => this.handlePartial(text),
        onFinal: (result) => this.handleFinal(result.text, result.confidence),
        onError: (error) => {
          if (error.code === 'no-speech') return;
          this.error({
            kind: 'speech',
            title: 'Transcription hiccup',
            body: error.message,
            recoverable: true,
          });
        },
        onEnd: () => undefined,
      });
    }
    sessionStore.setState({ paused: false });
  }

  setVolume(volume: number): void {
    this.beatEngine.setVolume(volume);
  }

  /* ------------------------------------------------------------ finish */

  async finish(reason: FinishReason): Promise<void> {
    if (this.finished || !this.settings || !this.beat) return;
    this.finished = true;

    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;

    sessionStore.setState({ phase: 'finishing' });

    this.speech?.stop();
    this.suggestions.reset();

    const onsets = [...this.mic.getOnsets()];
    this.mic.stop();

    if (reason === 'timer') this.beatEngine.fadeOut(1.6);
    else this.beatEngine.fadeOut(0.55);

    const elapsed = Math.max(this.elapsedMs(), 1);
    const durationMs =
      reason === 'timer' ? this.settings.durationSec * 1000 : Math.min(elapsed, this.settings.durationSec * 1000);

    const analysis = analysePerformance(this.chunks, {
      bpm: this.beat.bpm,
      durationMs,
      difficulty: this.settings.difficulty,
      onsets,
    });

    const transcriptText = this.chunks.map((chunk) => chunk.text).join(' ');
    analysis.observations = localObservations({
      bars: [],
      transcript: transcriptText,
      bpm: this.beat.bpm,
      durationSec: durationMs / 1000,
      difficulty: this.settings.difficulty,
      base: analysis,
    });

    const bars = segmentBars(this.chunks, this.beat.bpm, durationMs).filter(
      (bar) => bar.words.length > 0,
    );

    let challengeResult: ChallengeResult | null = null;
    if (this.challenge) {
      challengeResult = evaluateChallenge(this.challenge, {
        analysis,
        bars,
        durationSec: durationMs / 1000,
        distinctTopics: this.topicsSeen.size,
      });
    }

    const session: FreestyleSession = {
      id: `fs_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      beatId: this.beat.id,
      beatName: this.beat.name,
      bpm: this.beat.bpm,
      durationSec: this.settings.durationSec,
      actualDurationSec: Math.round(durationMs / 1000),
      difficulty: this.settings.difficulty,
      assist: this.settings.assist,
      demoMode: sessionStore.getState().demoMode,
      transcript: this.chunks,
      bars,
      analysis,
      xpEarned: 0,
      challenge: challengeResult,
    };

    sessionStore.setState({
      phase: 'results',
      analysis,
      challengeResult,
      savedSessionId: session.id,
    });

    this.onFinish?.({ session });

    // The written observations arrive after the screen is already up. With no
    // hosted provider there is nothing to ask for — the local observations
    // above are already the best available, and computed from richer stats
    // than the route could reconstruct.
    if (this.aiLive && transcriptText.split(/\s+/).length >= 12) {
      void enrichAnalysis(
        {
          transcript: transcriptText,
          bpm: this.beat.bpm,
          durationSec: durationMs / 1000,
          difficulty: this.settings.difficulty,
          analysis,
        },
        analysis.observations,
      ).then(({ observations, aiEnriched }) => {
        if (this.disposed) return;
        const current = sessionStore.getState().analysis;
        if (!current) return;
        sessionStore.setState({
          analysis: { ...current, observations, aiEnriched },
        });
      });
    }
  }

  /**
   * Releases every live resource — microphone, speech, audio graph, timers —
   * without making the controller unusable. Used by the exit button and by
   * React's unmount cleanup.
   *
   * It has to be reversible: React's strict mode mounts, cleans up and mounts
   * again, so a terminal teardown here would leave the controller dead before
   * the user ever pressed start. `start()` rebuilds whatever this released.
   */
  abandon(): void {
    this.finished = true;
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = null;
    this.speech?.abort();
    this.speech = null;
    this.mic.stop();
    this.suggestions.reset();
    // Closes the AudioContext; `ensureContext()` builds a fresh one on replay.
    this.beatEngine.dispose();
  }

  /** Terminal teardown. After this the controller will not start again. */
  dispose(): void {
    this.abandon();
    this.disposed = true;
    this.suggestions.dispose();
  }
}
