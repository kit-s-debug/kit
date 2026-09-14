/**
 * Daily challenges.
 *
 * One challenge is active per day, chosen deterministically from the date so
 * everyone on the same day gets the same one and it cannot be rerolled by
 * refreshing. Each is scored from the same analysis the results screen uses.
 */

import type {
  Bar,
  ChallengeResult,
  DailyChallenge,
  PerformanceAnalysis,
} from '@/types';

export const CHALLENGES: DailyChallenge[] = [
  {
    id: 'rhyme-chain',
    title: 'Rhyme Chain',
    description: 'Hold one rhyme sound across four bars in a row without dropping it.',
    goalLabel: '4 bars on one sound',
    difficulty: 'intermediate',
    xpReward: 120,
    minDurationSec: 30,
  },
  {
    id: 'no-pause',
    title: 'No Pause',
    description: 'Keep going for thirty seconds without a gap long enough to break the flow.',
    goalLabel: '30 seconds unbroken',
    difficulty: 'beginner',
    xpReward: 90,
    minDurationSec: 30,
  },
  {
    id: 'topic-switch',
    title: 'Topic Switch',
    description: 'Start on one subject and move cleanly into a different one mid-verse.',
    goalLabel: '2 distinct subjects',
    difficulty: 'intermediate',
    xpReward: 110,
    minDurationSec: 60,
  },
  {
    id: 'multi',
    title: 'Multi',
    description: 'Land a rhyme that runs across two or more syllables — "make it / break it".',
    goalLabel: '3 multisyllabic rhymes',
    difficulty: 'expert',
    xpReward: 150,
    minDurationSec: 30,
  },
  {
    id: 'vocab-stretch',
    title: 'Vocabulary Stretch',
    description: 'Keep repeats down. Reach for a different word instead of the nearest one.',
    goalLabel: 'Vocabulary score of 75',
    difficulty: 'intermediate',
    xpReward: 100,
    minDurationSec: 60,
  },
  {
    id: 'pocket',
    title: 'In The Pocket',
    description: 'Stay locked to the beat. Same place in the bar, every bar.',
    goalLabel: 'Beat timing of 80',
    difficulty: 'beginner',
    xpReward: 100,
    minDurationSec: 30,
  },
];

export function challengeById(id: string): DailyChallenge | undefined {
  return CHALLENGES.find((challenge) => challenge.id === id);
}

/** Stable day key in the user's own timezone. */
export function dayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hashDay(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i += 1) {
    h = (h * 31 + key.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function challengeForDay(key: string = dayKey()): DailyChallenge {
  const index = hashDay(key) % CHALLENGES.length;
  return CHALLENGES[index] ?? CHALLENGES[0]!;
}

export interface ChallengeContext {
  analysis: PerformanceAnalysis;
  bars: Bar[];
  durationSec: number;
  distinctTopics: number;
}

/** Scores a finished session against a challenge. */
export function evaluateChallenge(
  challenge: DailyChallenge,
  context: ChallengeContext,
): ChallengeResult {
  const { analysis, durationSec, distinctTopics } = context;
  let progress = 0;

  switch (challenge.id) {
    case 'rhyme-chain':
      progress = analysis.stats.longestRhymeChain / 4;
      break;
    case 'no-pause': {
      const unbroken = durationSec * (1 - analysis.stats.silenceRatio);
      progress = unbroken / 30;
      break;
    }
    case 'topic-switch':
      progress = distinctTopics / 2;
      break;
    case 'multi':
      progress = analysis.highlights.filter((h) => h.kind === 'multi').length / 3;
      break;
    case 'vocab-stretch':
      progress = analysis.breakdown.vocabulary / 75;
      break;
    case 'pocket':
      progress = analysis.breakdown.beatTiming / 80;
      break;
    default:
      progress = 0;
  }

  const clamped = Math.max(0, Math.min(1, progress));
  return {
    challengeId: challenge.id,
    completed: clamped >= 1,
    progress: Math.round(clamped * 100) / 100,
    goalLabel: challenge.goalLabel,
  };
}
