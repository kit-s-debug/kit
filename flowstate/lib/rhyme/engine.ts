/**
 * The rhyme engine.
 *
 * Given the tail of what the rapper just said, work out what they are rhyming
 * on and return ranked suggestions. Everything here is synchronous and runs in
 * well under a millisecond, which is what lets FLOWSTATE put words on screen
 * while the bar is still in the air.
 */

import type { Difficulty, RhymeKind, RhymeSuggestion, TopicId } from '@/types';
import { compareKeys, keySyllables } from './phonemes';
import { countSyllables, guessRhymeKey, normaliseWord } from './g2p';
import { ALL_KEYS, familyFor, lookupEntry, type LexEntry } from './lexicon';

/** Words that can trail the rhyme head and stay in the suggested phrase. */
const TAIL_WORDS = new Set([
  'it', 'them', 'em', 'up', 'out', 'in', 'on', 'off', 'down', 'back',
  'me', 'you', 'us', 'him', 'her', 'through', 'over', 'away', 'again',
  'now', 'too', 'though', 'there', 'here', 'that', 'this', 'right',
]);

/** Words that make a poor rhyme anchor — we look further back instead. */
const NEVER_HEAD = new Set([
  'the', 'a', 'an', 'and', 'but', 'or', 'of', 'to', 'for', 'with', 'at',
  'as', 'by', 'from', 'is', 'was', 'are', 'were', 'am', 'be', 'been',
  'being', 'i', 'im', 'ive', 'its', 'so', 'if', 'my', 'your', 'his',
  'their', 'our', 'her', 'do', 'does', 'did', 'gonna', 'wanna', 'gotta',
  'just', 'like', 'yeah', 'uh', 'um', 'okay', 'oh', 'hey', 'ayy', 'ay',
  'you', 'he', 'she', 'we', 'they', 'it', 'that', 'this', 'what', 'when',
  'then', 'than', 'very', 'really', 'about', 'into', 'onto', 'not',
  // Contractions survive normalisation with their apostrophe, and speech
  // engines emit them constantly. None of them is a rhyme worth answering.
  "i'm", "i've", "i'll", "i'd", "it's", "that's", "what's", "he's", "she's",
  "we're", "you're", "they're", "there's", "here's", "let's", "don't",
  "can't", "won't", "didn't", "isn't", "wasn't", "ain't", "couldn't",
  "wouldn't", "shouldn't", "gon'", "'cause", "y'all",
]);

export interface Anchor {
  /** The full phrase the rhymes answer, e.g. "make it". */
  phrase: string;
  /** The word carrying the rhyme, e.g. "make". */
  head: string;
  /** Words kept after the head, e.g. ["it"]. */
  tail: string[];
  key: string | null;
  syllables: number;
}

export function tokenise(text: string): string[] {
  return text
    .split(/\s+/)
    .map(normaliseWord)
    .filter((w) => w.length > 0);
}

/** The rhyme key for any word: lexicon first, spelling rules as a fallback. */
export function keyForWord(word: string): string | null {
  const entry = lookupEntry(word);
  if (entry) return entry.key;
  return guessRhymeKey(word);
}

/**
 * Work out what the rapper is rhyming on from the tail of the transcript.
 */
export function findAnchor(text: string): Anchor | null {
  const words = tokenise(text);
  if (words.length === 0) return null;

  const tail: string[] = [];
  let headIndex = words.length - 1;

  while (headIndex >= 0 && tail.length < 2) {
    const word = words[headIndex];
    if (!word) break;
    if (TAIL_WORDS.has(word) && headIndex > 0) {
      tail.unshift(word);
      headIndex -= 1;
      continue;
    }
    break;
  }

  let head = words[headIndex];

  // A single letter is a fragment, not a word: drop it and use what came before.
  if (head && head.length < 2 && headIndex > 0) {
    headIndex -= 1;
    tail.length = 0;
    head = words[headIndex];
  }

  // A function word makes a weak anchor — reach back for something with weight.
  if (head && NEVER_HEAD.has(head)) {
    let probe = headIndex - 1;
    const limit = Math.max(0, headIndex - 4);
    while (probe >= limit) {
      const candidate = words[probe];
      if (candidate && !NEVER_HEAD.has(candidate) && !TAIL_WORDS.has(candidate)) {
        head = candidate;
        tail.length = 0;
        break;
      }
      probe -= 1;
    }
  }

  if (!head || head.length < 2 || NEVER_HEAD.has(head)) return null;

  const phrase = [head, ...tail].join(' ');
  return {
    phrase,
    head,
    tail,
    key: keyForWord(head),
    syllables: [head, ...tail].reduce((sum, w) => sum + countSyllables(w), 0),
  };
}

export interface RhymeSearchOptions {
  difficulty: Difficulty;
  topic: TopicId | null;
  /** Words already used in the session; repeats get pushed down, not removed. */
  recentWords?: ReadonlySet<string>;
  limit?: number;
}

const DIFFICULTY_PROFILE: Record<
  Difficulty,
  { limit: number; minScore: number; multiBias: number; commonBias: number }
> = {
  beginner: { limit: 8, minScore: 0.55, multiBias: 0, commonBias: 0.22 },
  intermediate: { limit: 6, minScore: 0.45, multiBias: 0.12, commonBias: 0.1 },
  expert: { limit: 5, minScore: 0.36, multiBias: 0.3, commonBias: 0 },
};

/** A rhyme only counts as "on topic" if it sounds right in the first place. */
const TOPIC_BONUS = 0.2;
const TOPIC_BONUS_FLOOR = 0.55;

/* ------------------------------------------------------- inflected rhymes */

/**
 * When the rapper is on an "-ing" or "-ed" ending, the useful rhymes are the
 * inflected forms: "writing" wants "fighting", not "fight". The lexicon stores
 * base forms, so the search also tries each family through these transforms.
 */
type Morphology = 'ing' | 'ed' | null;

function anchorMorphology(head: string, key: string | null): Morphology {
  if (!key) return null;
  if (head.endsWith('ing') && key.endsWith('IH-NG') && key !== 'IH-NG') return 'ing';
  if (head.endsWith('ed') && /-(IH-D|T|D)$/.test(key)) return 'ed';
  return null;
}

function toIng(word: string): string {
  if (/ie$/.test(word)) return `${word.slice(0, -2)}ying`;
  if (/[^aeiou]e$/.test(word)) return `${word.slice(0, -1)}ing`;
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(word) && word.length <= 5) {
    return `${word}${word.slice(-1)}ing`;
  }
  return `${word}ing`;
}

/**
 * Verbs whose past tense is not "-ed". Inflecting these produces "taked" and
 * "thinked", so the search leaves them in their base form instead.
 */
const IRREGULAR_PAST = new Set([
  'make', 'take', 'break', 'shake', 'wake', 'come', 'become', 'overcome',
  'run', 'win', 'begin', 'spin', 'sing', 'bring', 'swing', 'ring', 'think',
  'drink', 'sink', 'rethink', 'leave', 'give', 'forgive', 'steal', 'feel',
  'lead', 'feed', 'bleed', 'keep', 'sleep', 'teach', 'catch', 'stick',
  'shoot', 'lose', 'choose', 'grow', 'throw', 'know', 'see', 'be', 'do',
  'hold', 'unfold', 'sell', 'tell', 'spend', 'send', 'bend', 'stand',
  'understand', 'fight', 'write', 'ride', 'hide', 'drive', 'rise', 'fly',
  'buy', 'lie', 'get', 'forget', 'set', 'let', 'bet', 'hit', 'quit',
  'split', 'spit', 'cut', 'shut', 'put', 'hurt', 'burst', 'hang', 'strike',
  'speak', 'freeze', 'mean', 'read', 'spread',
]);

function toEd(word: string): string {
  if (/e$/.test(word)) return `${word}d`;
  if (/[^aeiou]y$/.test(word)) return `${word.slice(0, -1)}ied`;
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(word) && word.length <= 5) {
    return `${word}${word.slice(-1)}ed`;
  }
  return `${word}ed`;
}

function edKey(key: string): string {
  const parts = key.split('-');
  const last = parts[parts.length - 1];
  if (last === 'T' || last === 'D') return `${key}-IH-D`;
  const voiceless = ['P', 'K', 'F', 'S', 'SH', 'CH', 'TH'];
  return `${key}-${last && voiceless.includes(last) ? 'T' : 'D'}`;
}

interface Variant {
  key: string;
  render: (entry: LexEntry) => string | null;
  extraSyllables: number;
}

function variantsFor(familyKey: string, morph: Morphology): Variant[] {
  const base: Variant = {
    key: familyKey,
    render: (entry) => entry.word,
    extraSyllables: 0,
  };
  if (morph === 'ing' && !familyKey.endsWith('IH-NG')) {
    return [
      base,
      {
        key: `${familyKey}-IH-NG`,
        render: (entry) => (entry.pos === 'v' ? toIng(entry.word) : null),
        extraSyllables: 1,
      },
    ];
  }
  if (morph === 'ed' && !/-(IH-D)$/.test(familyKey)) {
    const inflected = edKey(familyKey);
    return [
      base,
      {
        key: inflected,
        render: (entry) =>
          entry.pos === 'v' && !IRREGULAR_PAST.has(entry.word)
            ? toEd(entry.word)
            : null,
        extraSyllables: inflected.endsWith('IH-D') ? 1 : 0,
      },
    ];
  }
  return [base];
}

interface Candidate {
  suggestion: RhymeSuggestion;
  sort: number;
}

export function findRhymes(
  anchor: Anchor,
  options: RhymeSearchOptions,
): RhymeSuggestion[] {
  if (!anchor.key) return [];

  const profile = DIFFICULTY_PROFILE[options.difficulty];
  const limit = options.limit ?? profile.limit;
  const tailText = anchor.tail.length ? ` ${anchor.tail.join(' ')}` : '';
  const tailSyllables = anchor.tail.reduce((s, w) => s + countSyllables(w), 0);
  const recent = options.recentWords ?? new Set<string>();
  const morph = anchorMorphology(anchor.head, anchor.key);

  const candidates: Candidate[] = [];
  const seen = new Set<string>([anchor.head, anchor.phrase]);

  for (const familyKey of ALL_KEYS) {
    const family = familyFor(familyKey);
    if (family.length === 0) continue;

    for (const variant of variantsFor(familyKey, morph)) {
      const similarity = compareKeys(anchor.key, variant.key);
      if (similarity.kind === 'none' || similarity.score < profile.minScore) continue;

      const spanSyllables = keySyllables(variant.key);

      for (const entry of family) {
        const rendered = variant.render(entry);
        if (!rendered || seen.has(rendered)) continue;
        seen.add(rendered);

        const totalSyllables = entry.syllables + variant.extraSyllables + tailSyllables;
        const kind = classify(
          similarity.kind,
          totalSyllables,
          spanSyllables,
          tailSyllables + variant.extraSyllables,
        );
        const onTopic =
          options.topic !== null &&
          entry.topics.includes(options.topic) &&
          similarity.score >= TOPIC_BONUS_FLOOR;

        let sort = similarity.score;
        if (onTopic) sort += TOPIC_BONUS;
        sort += profile.commonBias * (1 - Math.min(entry.rank, 12) / 12);
        if (kind === 'multi') sort += profile.multiBias;
        if (options.difficulty === 'beginner' && totalSyllables > 3) sort -= 0.2;
        if (options.difficulty === 'expert' && totalSyllables <= 1) sort -= 0.18;
        if (recent.has(entry.word)) sort -= 0.45;

        candidates.push({
          suggestion: {
            word: `${rendered}${tailText}`,
            kind,
            syllables: totalSyllables,
            score: Math.round(similarity.score * 100) / 100,
            onTopic,
          },
          sort,
        });
      }
    }
  }

  candidates.sort((a, b) => b.sort - a.sort);

  // Keep a spread of kinds rather than eight variations on one sound.
  const out: RhymeSuggestion[] = [];
  const kindCount: Record<string, number> = {};
  const maxPerKind = options.difficulty === 'beginner' ? limit : Math.ceil(limit * 0.7);

  for (const candidate of candidates) {
    if (out.length >= limit) break;
    const kind = candidate.suggestion.kind;
    const used = kindCount[kind] ?? 0;
    if (used >= maxPerKind && out.length < limit - 1) continue;
    kindCount[kind] = used + 1;
    out.push(candidate.suggestion);
  }

  return out;
}

function classify(
  base: 'perfect' | 'near' | 'assonance',
  totalSyllables: number,
  spanSyllables: number,
  addedSyllables: number,
): RhymeKind {
  if (base === 'perfect') {
    // A rhyme that carries across two or more syllables is a multi.
    if (totalSyllables >= 2 && (spanSyllables >= 2 || addedSyllables >= 1)) return 'multi';
    return 'perfect';
  }
  return base === 'near' ? 'near' : 'assonance';
}
