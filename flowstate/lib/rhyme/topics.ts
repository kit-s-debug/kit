/**
 * Lightweight topic detection over the running transcript.
 *
 * The point is not classification accuracy for its own sake — it is that when
 * someone raps "I've been chasing money", the rhymes that surface should lean
 * towards work, risk and ambition rather than arriving as a dictionary dump.
 */

import type { TopicId } from '@/types';
import { topicsForWord } from './lexicon';
import { tokenise } from './engine';

export interface TopicReading {
  topic: TopicId | null;
  confidence: number;
  /** Every topic with a non-zero score, strongest first. */
  ranked: Array<{ topic: TopicId; weight: number }>;
}

/**
 * Recent words count for more than older ones, so the reading follows the
 * rapper when they switch subject mid-verse.
 */
export function detectTopic(text: string, windowSize = 60): TopicReading {
  const words = tokenise(text);
  const recent = words.slice(-windowSize);
  if (recent.length === 0) return { topic: null, confidence: 0, ranked: [] };

  const scores = new Map<TopicId, number>();
  recent.forEach((word, index) => {
    const hits = topicsForWord(word);
    if (hits.length === 0) return;
    // Linear recency ramp from 0.5 (oldest in window) to 1.5 (most recent).
    const recency = 0.5 + (index / Math.max(1, recent.length - 1));
    const share = recency / hits.length;
    for (const topic of hits) {
      scores.set(topic, (scores.get(topic) ?? 0) + share);
    }
  });

  if (scores.size === 0) return { topic: null, confidence: 0, ranked: [] };

  const ranked = Array.from(scores.entries())
    .map(([topic, weight]) => ({ topic, weight }))
    .sort((a, b) => b.weight - a.weight);

  const total = ranked.reduce((sum, item) => sum + item.weight, 0);
  const best = ranked[0];
  if (!best) return { topic: null, confidence: 0, ranked: [] };

  const confidence = total > 0 ? best.weight / total : 0;
  // Two topic hits is enough to steer suggestions; one is noise.
  const topic = best.weight >= 1.2 ? best.topic : null;

  return { topic, confidence, ranked };
}

export const TOPIC_LABELS: Record<TopicId, string> = {
  money: 'Money',
  ambition: 'Ambition',
  struggle: 'Struggle',
  confidence: 'Confidence',
  city: 'City',
  time: 'Time',
  love: 'Love',
  party: 'Night out',
  family: 'Family',
  mind: 'Headspace',
  craft: 'The craft',
};
