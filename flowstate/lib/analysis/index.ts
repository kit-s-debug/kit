/**
 * Performance analysis.
 *
 * Every number on the results screen is computed from something that actually
 * happened: the words that came back from the transcriber, when they arrived,
 * and — where the microphone was live — the vocal onsets captured by the
 * analyser. Nothing here is a decorative random number.
 */

import type {
  Bar,
  Difficulty,
  PerformanceAnalysis,
  RhymeHighlight,
  ScoreBreakdown,
  StrongestMoment,
  TranscriptChunk,
} from '@/types';
import { compareKeys, countSyllables, keyForWord, tokenise } from '@/lib/rhyme';

/** Words too common to say anything about a performer's range. */
const COMMON = new Set(
  `the a an and but or so if then than that this these those i im ive id ill me my mine you your
   yours he him his she her hers it its we us our ours they them their theirs is am are was were be
   been being do does did doing have has had having will would can could should shall may might must
   to of in on at by for with from up down out off over under again just now here there when where
   why how all any both each few more most other some such no nor not only own same too very s t
   dont cant wont aint gonna wanna gotta yeah uh um like get got go going know said say says one two
   what who which whom while about into onto after before because`
    .split(/\s+/)
    .filter(Boolean),
);

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Maps a raw measurement onto 0-100 through a low/high band. */
function band(value: number, low: number, high: number): number {
  if (high === low) return 50;
  return clamp(((value - low) / (high - low)) * 100);
}

function round(value: number): number {
  return Math.round(clamp(value));
}

export function barDurationMs(bpm: number): number {
  return (4 * 60_000) / Math.max(40, bpm);
}

/**
 * Slice the transcript onto the beat grid. A chunk belongs to the bar its first
 * word landed in, which is how a listener would hear it.
 */
export function segmentBars(
  chunks: TranscriptChunk[],
  bpm: number,
  durationMs: number,
): Bar[] {
  const barMs = barDurationMs(bpm);
  const barCount = Math.max(1, Math.ceil(durationMs / barMs));
  const buckets: TranscriptChunk[][] = Array.from({ length: barCount }, () => []);

  for (const chunk of chunks) {
    if (!chunk.isFinal || !chunk.text.trim()) continue;
    const index = Math.min(barCount - 1, Math.max(0, Math.floor(chunk.startMs / barMs)));
    buckets[index]?.push(chunk);
  }

  return buckets.map((bucket, index) => {
    const text = bucket.map((c) => c.text).join(' ').trim();
    const words = tokenise(text);
    const endWord = lastContentWord(words);
    return {
      index,
      text,
      startMs: index * barMs,
      endMs: (index + 1) * barMs,
      words,
      syllables: words.reduce((sum, w) => sum + countSyllables(w), 0),
      endWord,
      endRhymeKey: endWord ? keyForWord(endWord) : null,
    };
  });
}

function lastContentWord(words: string[]): string | null {
  for (let i = words.length - 1; i >= 0; i -= 1) {
    const word = words[i];
    if (word && word.length > 1 && !COMMON.has(word)) return word;
  }
  return words[words.length - 1] ?? null;
}

/* ------------------------------------------------------------- components */

interface RhymePair {
  a: number;
  b: number;
  words: [string, string];
  score: number;
  kind: 'perfect' | 'near' | 'assonance';
}

function endRhymePairs(bars: Bar[]): RhymePair[] {
  const pairs: RhymePair[] = [];
  const filled = bars.filter((bar) => bar.endRhymeKey);
  for (let i = 0; i < filled.length; i += 1) {
    const current = filled[i];
    if (!current?.endRhymeKey || !current.endWord) continue;
    // Rappers rhyme across a short window, not just adjacent lines.
    for (let j = i + 1; j < Math.min(filled.length, i + 4); j += 1) {
      const other = filled[j];
      if (!other?.endRhymeKey || !other.endWord) continue;
      if (other.endWord === current.endWord) continue;
      const similarity = compareKeys(current.endRhymeKey, other.endRhymeKey);
      if (similarity.kind === 'none') continue;
      pairs.push({
        a: current.index,
        b: other.index,
        words: [current.endWord, other.endWord],
        score: similarity.score,
        kind: similarity.kind,
      });
    }
  }
  return pairs;
}

function internalRhymes(bars: Bar[]): RhymePair[] {
  const found: RhymePair[] = [];
  for (const bar of bars) {
    const content = bar.words.filter((w) => w.length > 2 && !COMMON.has(w));
    for (let i = 0; i < content.length; i += 1) {
      const first = content[i];
      if (!first) continue;
      const keyA = keyForWord(first);
      if (!keyA) continue;
      for (let j = i + 1; j < content.length; j += 1) {
        const second = content[j];
        if (!second || second === first) continue;
        const keyB = keyForWord(second);
        if (!keyB) continue;
        const similarity = compareKeys(keyA, keyB);
        if (similarity.kind === 'none' || similarity.score < 0.72) continue;
        found.push({
          a: bar.index,
          b: bar.index,
          words: [first, second],
          score: similarity.score,
          kind: similarity.kind,
        });
      }
    }
  }
  return found;
}

function longestChain(bars: Bar[]): number {
  let best = 0;
  let run = 0;
  let anchorKey: string | null = null;

  for (const bar of bars) {
    if (!bar.endRhymeKey) {
      if (bar.text.trim() === '') continue; // a silent bar does not break a chain
      run = 0;
      anchorKey = null;
      continue;
    }
    if (anchorKey && compareKeys(anchorKey, bar.endRhymeKey).score >= 0.62) {
      run += 1;
    } else {
      anchorKey = bar.endRhymeKey;
      run = 1;
    }
    if (run > best) best = run;
  }
  return best;
}

/**
 * Pocket tightness. Rather than measuring how close each onset is to a beat —
 * which would punish someone who deliberately sits behind it — this measures
 * how *consistently* they land in the same place in the bar.
 */
function timingScore(onsets: readonly number[], bpm: number): number | null {
  const beatMs = 60_000 / Math.max(40, bpm);
  const usable = onsets.filter((t) => Number.isFinite(t) && t > 0);
  if (usable.length < 6) return null;

  let x = 0;
  let y = 0;
  for (const onset of usable) {
    const phase = ((onset % beatMs) / beatMs) * Math.PI * 2;
    x += Math.cos(phase);
    y += Math.sin(phase);
  }
  const r = Math.hypot(x, y) / usable.length;
  // r is 0 for scattered timing, 1 for a metronome. Neither extreme is real.
  return round(38 + r * 74);
}

export interface AnalyseOptions {
  bpm: number;
  durationMs: number;
  difficulty: Difficulty;
  /** Vocal onsets in ms from the mic analyser; empty in demo mode. */
  onsets?: readonly number[];
}

export function analysePerformance(
  chunks: TranscriptChunk[],
  options: AnalyseOptions,
): PerformanceAnalysis {
  const bars = segmentBars(chunks, options.bpm, options.durationMs);
  const spoken = bars.filter((bar) => bar.words.length > 0);
  const allWords = bars.flatMap((bar) => bar.words);
  const wordCount = allWords.length;
  const uniqueWords = new Set(allWords).size;

  const endPairs = endRhymePairs(bars);
  const internals = internalRhymes(bars);
  const chain = longestChain(bars);

  const minutes = Math.max(options.durationMs / 60_000, 1 / 60);
  const wordsPerMinute = wordCount / minutes;
  const avgSyllablesPerBar =
    spoken.length > 0
      ? spoken.reduce((sum, bar) => sum + bar.syllables, 0) / spoken.length
      : 0;
  const silenceRatio = bars.length > 0 ? 1 - spoken.length / bars.length : 1;

  /* Rhyme quality: how many bars resolve, and how cleanly. */
  const rhymedBars = new Set(endPairs.flatMap((p) => [p.a, p.b])).size;
  const coverage = spoken.length > 0 ? rhymedBars / spoken.length : 0;
  const avgPairScore =
    endPairs.length > 0
      ? endPairs.reduce((sum, p) => sum + p.score, 0) / endPairs.length
      : 0;
  const internalBonus = Math.min(12, internals.length * 2.5);
  const rhymeQuality = round(
    band(coverage, 0.15, 0.9) * 0.55 +
      band(avgPairScore, 0.5, 0.95) * 0.35 +
      internalBonus,
  );

  /* Flow: an even syllable count bar to bar reads as control. */
  const syllableCounts = spoken.map((bar) => bar.syllables).filter((n) => n > 0);
  const mean =
    syllableCounts.length > 0
      ? syllableCounts.reduce((a, b) => a + b, 0) / syllableCounts.length
      : 0;
  const variance =
    syllableCounts.length > 1
      ? syllableCounts.reduce((sum, n) => sum + (n - mean) ** 2, 0) /
        (syllableCounts.length - 1)
      : 0;
  const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
  const density = band(mean, 4, 14);
  const flow = round(band(1 - cv, 0.35, 0.92) * 0.62 + density * 0.38);

  /* Consistency: did they keep going? */
  const consistency = round(
    band(1 - silenceRatio, 0.4, 1) * 0.7 + band(spoken.length, 2, 16) * 0.3,
  );

  /* Vocabulary: range, discounting filler. */
  const contentWords = allWords.filter((w) => !COMMON.has(w) && w.length > 2);
  const ttr = wordCount > 0 ? uniqueWords / Math.sqrt(2 * wordCount) : 0;
  const contentRatio = wordCount > 0 ? contentWords.length / wordCount : 0;
  const vocabulary = round(band(ttr, 2.4, 6) * 0.6 + band(contentRatio, 0.3, 0.62) * 0.4);

  /* Creativity: distinct sounds, multis and reach. */
  const distinctSounds = new Set(
    bars.map((bar) => bar.endRhymeKey).filter((key): key is string => Boolean(key)),
  ).size;
  const multis = endPairs.filter(
    (p) => countSyllables(p.words[0]) >= 2 && p.score >= 0.72,
  ).length;
  const creativity = round(
    band(distinctSounds, 1, 8) * 0.4 +
      band(multis, 0, 6) * 0.35 +
      band(chain, 1, 5) * 0.25,
  );

  /* Beat timing: real onsets where we have them. */
  const measured = timingScore(options.onsets ?? [], options.bpm);
  const fallbackOnsets = chunks.filter((c) => c.isFinal).map((c) => c.startMs);
  const beatTiming = measured ?? timingScore(fallbackOnsets, options.bpm) ?? 62;

  const breakdown: ScoreBreakdown = {
    rhymeQuality,
    flow,
    consistency,
    vocabulary,
    creativity,
    beatTiming,
  };

  const overall = round(
    rhymeQuality * 0.26 +
      flow * 0.18 +
      consistency * 0.16 +
      vocabulary * 0.13 +
      creativity * 0.13 +
      beatTiming * 0.14,
  );

  return {
    overall: wordCount < 4 ? 0 : overall,
    breakdown,
    strongestMoment: pickStrongestMoment(bars, endPairs),
    highlights: buildHighlights(endPairs, internals),
    observations: [],
    stats: {
      wordCount,
      uniqueWords,
      bars: spoken.length,
      wordsPerMinute: Math.round(wordsPerMinute),
      avgSyllablesPerBar: Math.round(avgSyllablesPerBar * 10) / 10,
      longestRhymeChain: chain,
      silenceRatio: Math.round(silenceRatio * 100) / 100,
    },
    aiEnriched: false,
  };
}

function pickStrongestMoment(
  bars: Bar[],
  pairs: RhymePair[],
): StrongestMoment | null {
  const spoken = bars.filter((bar) => bar.words.length >= 3);
  if (spoken.length === 0) return null;

  const pairScoreByBar = new Map<number, number>();
  for (const pair of pairs) {
    const weight = pair.score * (countSyllables(pair.words[0]) >= 2 ? 1.4 : 1);
    pairScoreByBar.set(pair.a, (pairScoreByBar.get(pair.a) ?? 0) + weight);
    pairScoreByBar.set(pair.b, (pairScoreByBar.get(pair.b) ?? 0) + weight);
  }

  let best = spoken[0]!;
  let bestScore = -Infinity;
  let bestReason = 'The most complete bar in the run.';

  for (const bar of spoken) {
    const rhyme = pairScoreByBar.get(bar.index) ?? 0;
    const richness =
      bar.words.filter((w) => !COMMON.has(w) && w.length > 3).length / bar.words.length;
    const density = Math.min(bar.syllables / 12, 1.3);
    const score = rhyme * 1.6 + richness * 1.1 + density;

    if (score > bestScore) {
      bestScore = score;
      best = bar;
      bestReason =
        rhyme >= 1.3
          ? 'The rhyme carried across more than one syllable and resolved cleanly.'
          : richness > 0.45
            ? 'The widest vocabulary in the run, with no filler carrying the line.'
            : 'Full bar, even syllable count, landed in the pocket.';
    }
  }

  return {
    text: best.text,
    barIndex: best.index,
    startMs: best.startMs,
    reason: bestReason,
  };
}

function buildHighlights(pairs: RhymePair[], internals: RhymePair[]): RhymeHighlight[] {
  const highlights: RhymeHighlight[] = [];
  const seen = new Set<string>();

  const push = (
    kind: RhymeHighlight['kind'],
    pair: RhymePair,
  ) => {
    const label = `${pair.words[0]} / ${pair.words[1]}`;
    const id = `${kind}:${label}`;
    if (seen.has(id)) return;
    seen.add(id);
    highlights.push({
      kind,
      words: [pair.words[0], pair.words[1]],
      barIndexes: [pair.a, pair.b],
      label,
    });
  };

  for (const pair of [...pairs].sort((a, b) => b.score - a.score)) {
    const multi = countSyllables(pair.words[0]) >= 2 && pair.score >= 0.72;
    if (multi) push('multi', pair);
    else if (pair.kind === 'perfect') push('perfect', pair);
    else if (pair.kind === 'near') push('near', pair);
    else push('assonance', pair);
  }

  for (const pair of internals.sort((a, b) => b.score - a.score).slice(0, 3)) {
    push('internal', pair);
  }

  return highlights.slice(0, 8);
}
