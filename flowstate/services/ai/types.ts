/**
 * The AI boundary.
 *
 * Nothing above this layer knows which provider is answering. The local
 * provider is a real implementation — a rules engine that runs in under a
 * millisecond — not a stub, so the product works with no keys configured at
 * all. A hosted model, when one is configured, improves the *ideas* and the
 * closing observations; it never sits on the critical path of a bar.
 */

import type {
  AIStatus,
  AssistLevel,
  Bar,
  Difficulty,
  IdeaSuggestion,
  PerformanceAnalysis,
  SuggestionSet,
  TopicId,
} from '@/types';

export interface SuggestInput {
  /** The tail of the transcript — roughly the last two bars. */
  recentText: string;
  /** The bar before the current one, when there is one. */
  previousBar: string | null;
  difficulty: Difficulty;
  assist: AssistLevel;
  bpm: number;
  /** Position in the loop, so cadence advice can match where they are. */
  barIndex: number;
  topicHint: TopicId | null;
  /** Rhymes already offered this session, so suggestions keep moving. */
  usedWords: string[];
  revision: number;
}

export interface AnalyseInput {
  bars: Bar[];
  transcript: string;
  bpm: number;
  durationSec: number;
  difficulty: Difficulty;
  /** The locally computed analysis; a provider refines it, never replaces it. */
  base: PerformanceAnalysis;
}

export interface AnalysisEnrichment {
  observations: string[];
  strongestMomentReason?: string;
}

/**
 * Transcription is the fifth capability of this layer, and it lives next door
 * in `services/speech/types.ts` as `SpeechEngine` — the browser engine and the
 * scripted demo engine both implement it. It is separate because transcription
 * has to run in the browser against a live audio stream, while everything in
 * this file is callable from the server. Swapping in a hosted streaming
 * transcriber means adding a third `SpeechEngine`, not touching the UI.
 */

export interface AIProvider {
  readonly id: string;
  readonly live: boolean;
  readonly label: string;
  suggest(input: SuggestInput): Promise<SuggestionSet>;
  analyse(input: AnalyseInput): Promise<AnalysisEnrichment>;
  status(): AIStatus;
}

/** Narrow an unknown payload to a list of short, clean line ideas. */
export function sanitiseIdeas(value: unknown, limit = 3): IdeaSuggestion[] {
  if (!Array.isArray(value)) return [];
  const out: IdeaSuggestion[] = [];
  for (const item of value) {
    if (out.length >= limit) break;
    const text = typeof item === 'string' ? item : (item as { text?: unknown })?.text;
    if (typeof text !== 'string') continue;
    const cleaned = text
      .replace(/[\r\n]+/g, ' ')
      .replace(/["`*_#]/g, '')
      .trim()
      .slice(0, 64);
    if (cleaned.length < 3) continue;
    if (cleaned.split(/\s+/).length > 9) continue;
    out.push({ text: cleaned, origin: 'ai' });
  }
  return out;
}

/** Narrow an unknown payload to a short list of plain observations. */
export function sanitiseObservations(value: unknown, limit = 3): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    if (out.length >= limit) break;
    if (typeof item !== 'string') continue;
    const cleaned = item.replace(/[\r\n]+/g, ' ').replace(/["`*_#]/g, '').trim();
    if (cleaned.length < 12 || cleaned.length > 180) continue;
    out.push(cleaned);
  }
  return out;
}
