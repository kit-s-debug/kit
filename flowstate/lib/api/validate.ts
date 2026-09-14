/**
 * Request validation for the AI routes.
 *
 * Hand-written rather than pulled from a schema library: the payloads are
 * small, and every field is clamped rather than merely checked, so a hostile
 * body cannot turn into an oversized upstream prompt.
 */

import type { AssistLevel, Difficulty, TopicId } from '@/types';

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'expert'];
const ASSISTS: AssistLevel[] = ['off', 'hints', 'full'];
const TOPICS: TopicId[] = [
  'money', 'ambition', 'struggle', 'confidence', 'city',
  'time', 'love', 'party', 'family', 'mind', 'craft',
];

export const LIMITS = {
  recentText: 600,
  previousBar: 300,
  transcript: 6000,
  usedWords: 60,
  bars: 400,
} as const;

function str(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, max);
}

function num(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === 'string' && (allowed as string[]).includes(value)
    ? (value as T)
    : fallback;
}

export interface ValidSuggestBody {
  recentText: string;
  previousBar: string | null;
  difficulty: Difficulty;
  assist: AssistLevel;
  bpm: number;
  barIndex: number;
  topicHint: TopicId | null;
  usedWords: string[];
  revision: number;
}

export function parseSuggestBody(raw: unknown): ValidSuggestBody | null {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as Record<string, unknown>;

  const recentText = str(body.recentText, LIMITS.recentText);
  if (recentText.length < 2) return null;

  const usedWords = Array.isArray(body.usedWords)
    ? body.usedWords
        .filter((w): w is string => typeof w === 'string')
        .slice(0, LIMITS.usedWords)
        .map((w) => w.slice(0, 32))
    : [];

  return {
    recentText,
    previousBar: str(body.previousBar, LIMITS.previousBar) || null,
    difficulty: oneOf(body.difficulty, DIFFICULTIES, 'beginner'),
    assist: oneOf(body.assist, ASSISTS, 'full'),
    bpm: num(body.bpm, 40, 220, 90),
    barIndex: num(body.barIndex, 0, 10_000, 0),
    topicHint:
      typeof body.topicHint === 'string' && (TOPICS as string[]).includes(body.topicHint)
        ? (body.topicHint as TopicId)
        : null,
    usedWords,
    revision: num(body.revision, 0, Number.MAX_SAFE_INTEGER, 0),
  };
}

export interface ValidAnalyseBody {
  transcript: string;
  bpm: number;
  durationSec: number;
  difficulty: Difficulty;
  breakdown: {
    rhymeQuality: number;
    flow: number;
    consistency: number;
    vocabulary: number;
    creativity: number;
    beatTiming: number;
  };
  longestRhymeChain: number;
}

export function parseAnalyseBody(raw: unknown): ValidAnalyseBody | null {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as Record<string, unknown>;
  const transcript = str(body.transcript, LIMITS.transcript);
  if (transcript.split(/\s+/).filter(Boolean).length < 6) return null;

  const breakdown = (body.breakdown ?? {}) as Record<string, unknown>;
  return {
    transcript,
    bpm: num(body.bpm, 40, 220, 90),
    durationSec: num(body.durationSec, 1, 3600, 60),
    difficulty: oneOf(body.difficulty, DIFFICULTIES, 'beginner'),
    breakdown: {
      rhymeQuality: num(breakdown.rhymeQuality, 0, 100, 0),
      flow: num(breakdown.flow, 0, 100, 0),
      consistency: num(breakdown.consistency, 0, 100, 0),
      vocabulary: num(breakdown.vocabulary, 0, 100, 0),
      creativity: num(breakdown.creativity, 0, 100, 0),
      beatTiming: num(breakdown.beatTiming, 0, 100, 0),
    },
    longestRhymeChain: num(body.longestRhymeChain, 0, 200, 0),
  };
}
