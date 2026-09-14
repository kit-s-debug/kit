/**
 * Browser-side suggestion pipeline.
 *
 * The latency budget is the whole product here, so the order is fixed:
 *
 *   1. Run the local engine synchronously and paint. This is sub-millisecond.
 *   2. Only if the rhyme anchor actually changed, consider a network call.
 *   3. Debounce that call, cap its rate, abort the previous one, and drop any
 *      response whose revision has already been superseded.
 *
 * Nothing in this file can block the beat or the transcript. A failed or slow
 * request simply means the local suggestions stand.
 */

import type {
  AIStatus,
  AssistLevel,
  Difficulty,
  PerformanceAnalysis,
  SuggestionSet,
  TopicId,
} from '@/types';
import { localSuggest } from './local-provider';
import { sanitiseIdeas, sanitiseObservations, type SuggestInput } from './types';

export interface SuggestionClientOptions {
  onUpdate: (suggestions: SuggestionSet) => void;
  onPending?: (pending: boolean) => void;
}

export interface SuggestionContext {
  difficulty: Difficulty;
  assist: AssistLevel;
  bpm: number;
  aiLive: boolean;
}

/** Wait for the phrase to settle before spending a request on it. */
const AI_DEBOUNCE_MS = 900;
/** Never exceed this rate, however fast the transcript moves. */
const AI_MIN_INTERVAL_MS = 2600;
const AI_TIMEOUT_MS = 4000;

export class SuggestionClient {
  private context: SuggestionContext = {
    difficulty: 'beginner',
    assist: 'full',
    bpm: 90,
    aiLive: false,
  };

  private revision = 0;
  private lastAnchor = '';
  private lastSent = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private controller: AbortController | null = null;
  private usedWords = new Set<string>();
  private latest: SuggestionSet | null = null;
  private disposed = false;

  constructor(private options: SuggestionClientOptions) {}

  configure(context: Partial<SuggestionContext>): void {
    this.context = { ...this.context, ...context };
  }

  getLatest(): SuggestionSet | null {
    return this.latest;
  }

  /**
   * Feed the tail of the transcript. Safe to call on every interim result —
   * the anchor check below is what stops that turning into network traffic.
   */
  push(recentText: string, previousBar: string | null, barIndex: number): void {
    if (this.disposed) return;
    if (this.context.assist === 'off') {
      this.emit({
        anchor: '',
        anchorRhymeKey: null,
        rhymes: [],
        ideas: [],
        topic: null,
        revision: this.revision,
        source: 'local',
      });
      return;
    }

    this.revision += 1;
    const input: SuggestInput = {
      recentText,
      previousBar,
      difficulty: this.context.difficulty,
      assist: this.context.assist,
      bpm: this.context.bpm,
      barIndex,
      topicHint: null,
      usedWords: Array.from(this.usedWords).slice(-40),
      revision: this.revision,
    };

    const local = localSuggest(input);
    const anchorChanged = local.anchor !== this.lastAnchor;

    // Re-paint only when there is something new to look at.
    if (anchorChanged || this.latest === null) {
      this.lastAnchor = local.anchor;
      this.emit(local);
    }

    if (!anchorChanged) return;
    if (!this.context.aiLive || this.context.assist !== 'full') return;
    if (local.rhymes.length === 0) return;

    this.scheduleEnrich(input, local);
  }

  /** Remember what has already been offered so rhymes keep moving. */
  noteSpokenWords(words: string[]): void {
    for (const word of words) {
      if (word.length > 2) this.usedWords.add(word);
    }
    if (this.usedWords.size > 200) {
      this.usedWords = new Set(Array.from(this.usedWords).slice(-120));
    }
  }

  private emit(suggestions: SuggestionSet) {
    this.latest = suggestions;
    this.options.onUpdate(suggestions);
  }

  private scheduleEnrich(input: SuggestInput, local: SuggestionSet) {
    if (this.timer) clearTimeout(this.timer);
    const sinceLast = Date.now() - this.lastSent;
    const wait = Math.max(AI_DEBOUNCE_MS, AI_MIN_INTERVAL_MS - sinceLast);

    this.timer = setTimeout(() => {
      void this.enrich(input, local);
    }, wait);
  }

  private async enrich(input: SuggestInput, local: SuggestionSet) {
    if (this.disposed) return;
    // A newer bar has already replaced this one — do not spend the request.
    if (input.revision !== this.revision) return;

    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    this.lastSent = Date.now();
    this.options.onPending?.(true);

    const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...input,
          topicHint: local.topic,
        }),
        signal: controller.signal,
      });
      if (!response.ok) return;

      const payload: unknown = await response.json();
      const ideas = sanitiseIdeas((payload as { ideas?: unknown })?.ideas, 3);
      if (ideas.length === 0) return;
      // Discard anything that arrived after the rapper moved on.
      if (input.revision !== this.revision) return;

      this.emit({ ...local, ideas, source: 'hybrid', revision: this.revision });
    } catch {
      // Aborts, timeouts and offline all land here. Local output stands.
    } finally {
      clearTimeout(timeout);
      if (this.controller === controller) {
        this.controller = null;
        this.options.onPending?.(false);
      }
    }
  }

  reset(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.controller?.abort();
    this.controller = null;
    this.revision = 0;
    this.lastAnchor = '';
    this.lastSent = 0;
    this.latest = null;
    this.usedWords.clear();
    this.options.onPending?.(false);
  }

  dispose(): void {
    this.disposed = true;
    this.reset();
  }
}

/* -------------------------------------------------------------- helpers */

export async function fetchAIStatus(signal?: AbortSignal): Promise<AIStatus> {
  const offline: AIStatus = {
    live: false,
    provider: 'local',
    detail:
      'Running on the on-device engine. Rhymes, scoring and topic detection all happen in your browser.',
  };
  try {
    const response = await fetch('/api/ai/status', { signal, cache: 'no-store' });
    if (!response.ok) return offline;
    const payload: unknown = await response.json();
    const candidate = payload as Partial<AIStatus>;
    if (typeof candidate?.live !== 'boolean') return offline;
    return {
      live: candidate.live,
      provider: typeof candidate.provider === 'string' ? candidate.provider : 'local',
      detail: typeof candidate.detail === 'string' ? candidate.detail : offline.detail,
    };
  } catch {
    return offline;
  }
}

export interface EnrichAnalysisInput {
  transcript: string;
  bpm: number;
  durationSec: number;
  difficulty: Difficulty;
  analysis: PerformanceAnalysis;
}

/**
 * Asks the server for written observations. Returns the local ones unchanged
 * if the call fails, so the results screen never waits on a spinner.
 */
export async function enrichAnalysis(
  input: EnrichAnalysisInput,
  localObservations: string[],
  timeoutMs = 9000,
): Promise<{ observations: string[]; aiEnriched: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        transcript: input.transcript,
        bpm: input.bpm,
        durationSec: input.durationSec,
        difficulty: input.difficulty,
        breakdown: input.analysis.breakdown,
        longestRhymeChain: input.analysis.stats.longestRhymeChain,
      }),
      signal: controller.signal,
    });
    if (!response.ok) return { observations: localObservations, aiEnriched: false };

    const payload: unknown = await response.json();
    const observations = sanitiseObservations(
      (payload as { observations?: unknown })?.observations,
      3,
    );
    const aiEnriched = Boolean((payload as { aiEnriched?: unknown })?.aiEnriched);
    if (observations.length === 0) return { observations: localObservations, aiEnriched: false };
    return { observations, aiEnriched };
  } catch {
    return { observations: localObservations, aiEnriched: false };
  } finally {
    clearTimeout(timer);
  }
}

export type { TopicId };
