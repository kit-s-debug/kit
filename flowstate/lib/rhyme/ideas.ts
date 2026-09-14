/**
 * Short line ideas built from the rhyme the rapper is already on.
 *
 * These are scaffolding, not lyrics. Each one is four to six words, ends on the
 * rhyme so it can be sung straight off the screen, and is chosen by the
 * grammatical shape of the rhyme word so the line reads as English.
 */

import type { IdeaSuggestion, RhymeSuggestion, TopicId } from '@/types';
import type { PartOfSpeech } from './lexicon';
import { lookupEntry } from './lexicon';
import { countSyllables } from './g2p';

type Shape = 'verb' | 'noun' | 'plural' | 'adj' | 'gerund' | 'past';

/** Templates that work for any subject. `{r}` is the rhyming phrase. */
const GENERIC: Record<Shape, string[]> = {
  verb: [
    'nobody can {r}',
    "I'm ready to {r}",
    'had to risk it to {r}',
    'watch me {r}',
    'still learning how to {r}',
    'too far in to {r}',
    'came a long way to {r}',
    "don't tell me I can't {r}",
  ],
  noun: [
    'all about the {r}',
    'came here for the {r}',
    'never asked for the {r}',
    'one more shot at the {r}',
    'put my whole name on the {r}',
  ],
  plural: [
    'nothing but {r}',
    'all of these {r}',
    'surrounded by {r}',
    'came here for the {r}',
  ],
  adj: [
    'never been this {r}',
    'woke up {r}',
    'came out the dark and {r}',
    'somehow still {r}',
    'stayed {r}',
  ],
  gerund: [
    'still {r}',
    'out here {r}',
    'kept on {r}',
    'woke up {r}',
    'left them all {r}',
  ],
  past: [
    'never even {r}',
    'everything {r}',
    "that's how it {r}",
    'by the time it {r}',
  ],
};

/** Topic-flavoured openers, tried first when a topic is confidently detected. */
const BY_TOPIC: Partial<Record<TopicId, Partial<Record<Shape, string[]>>>> = {
  money: {
    verb: ['had to risk it to {r}', 'work all week to {r}', 'count it up and {r}'],
    noun: ['chasing down the {r}', 'rent was due on the {r}'],
    plural: ['counting up the {r}', 'nothing in it but {r}'],
    adj: ['broke but never {r}', 'paid and still {r}'],
  },
  ambition: {
    verb: ['started low to {r}', 'no plan B, just {r}', 'up every morning to {r}'],
    noun: ['one shot at the {r}', 'building toward the {r}'],
    plural: ['made a list of {r}'],
    adj: ['hungry and {r}', 'climbing and still {r}'],
  },
  struggle: {
    verb: ['learned the hard way to {r}', 'lost enough to {r}', 'kept going just to {r}'],
    noun: ['made it through the {r}', 'carried all the {r}'],
    plural: ['came up out of {r}'],
    adj: ['tired but never {r}', 'cold outside and {r}'],
  },
  confidence: {
    verb: ['let them try to {r}', 'step up if you can {r}', 'been ready, watch me {r}'],
    noun: ['still the one they call the {r}', 'no debate about the {r}'],
    plural: ['never worried about {r}'],
    adj: ['calm and {r}', 'never rattled, always {r}'],
  },
  city: {
    verb: ['whole block watching me {r}', 'came off the corner to {r}'],
    noun: ['concrete made the {r}', 'city taught me the {r}'],
    plural: ['raised between the {r}'],
    adj: ['streetlights had it {r}'],
  },
  time: {
    verb: ['no time left to {r}', 'clock running while I {r}'],
    noun: ['every hour is the {r}', 'borrowed all the {r}'],
    plural: ['counting down the {r}'],
    adj: ['always early, never {r}'],
  },
  love: {
    verb: ['never learned how to {r}', 'she told me to {r}'],
    noun: ['gave it all for the {r}', 'half of me is the {r}'],
    plural: ['tired of all these {r}'],
    adj: ['honest and {r}'],
  },
  party: {
    verb: ['whole room about to {r}', 'lights go down, we {r}'],
    noun: ['speakers full of the {r}', 'nights like this is the {r}'],
    plural: ['room is full of {r}'],
    adj: ['loud and {r}'],
  },
  family: {
    verb: ['did it so they could {r}', 'promised my mum I would {r}'],
    noun: ['everything I got is the {r}', 'name on it, that is the {r}'],
    plural: ['doing it all for {r}'],
    adj: ['raised me {r}'],
  },
  mind: {
    verb: ['quiet enough to {r}', 'had to think before I {r}'],
    noun: ['peace is worth the {r}', 'head is full of the {r}'],
    plural: ['head full of {r}'],
    adj: ['clear headed and {r}'],
  },
  craft: {
    verb: ['pen never stopped to {r}', 'straight off the top I {r}'],
    noun: ['gave the booth the {r}', 'every bar is the {r}'],
    plural: ['booth is full of {r}'],
    adj: ['off the dome and {r}'],
  },
};

/**
 * Work out which templates a rhyme can take. Past-tense verbs and modals are
 * deliberately unshaped: there is no short template they slot into cleanly, so
 * they stay in the rhyme list and out of the ideas.
 */
function shapeOf(phrase: string): Shape | null {
  const words = phrase.split(/\s+/).filter(Boolean);
  // "heart in it" -> "start in it" rhymes fine but makes a clumsy line.
  if (words.length > 2) return null;

  const head = words[0] ?? '';
  const hasTail = words.length > 1;
  const entry = lookupEntry(head);
  const pos: PartOfSpeech = entry?.pos ?? 'n';

  if (pos === 'p') return null;
  // Inflected forms generated by the search get their own short templates.
  if (!entry && !hasTail) {
    if (/ing$/.test(head)) return 'gerund';
    if (/ed$/.test(head)) return 'past';
  }
  // A trailing object forces a verb reading: "make it", "shake them".
  if (hasTail) return 'verb';
  if (pos === 'v') return 'verb';
  if (pos === 'a') return 'adj';
  if (pos === 'l') return 'plural';
  if (pos === 'r') return null;
  return 'noun';
}

/** Deterministic pick so the same bar does not reshuffle on every update. */
function pickTemplate(pool: string[], salt: number): string | null {
  if (pool.length === 0) return null;
  return pool[salt % pool.length] ?? null;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export interface IdeaOptions {
  topic: TopicId | null;
  limit?: number;
  /** Excluded so a suggestion never repeats a line already offered. */
  recentIdeas?: ReadonlySet<string>;
}

export function buildIdeas(
  rhymes: RhymeSuggestion[],
  options: IdeaOptions,
): IdeaSuggestion[] {
  const limit = options.limit ?? 3;
  const recent = options.recentIdeas ?? new Set<string>();
  const out: IdeaSuggestion[] = [];
  const usedTemplates = new Set<string>();

  // Lead with on-topic rhymes, then fall back to the strongest remaining ones.
  const ordered = [...rhymes].sort((a, b) => {
    if (a.onTopic !== b.onTopic) return a.onTopic ? -1 : 1;
    return b.score - a.score;
  });

  for (const rhyme of ordered) {
    if (out.length >= limit) break;
    // A shaky rhyme makes a shaky line — leave it in the rhyme list only.
    if (rhyme.score < 0.72) continue;
    // Long rhymes make unwieldy lines to read mid-bar.
    if (countSyllables(rhyme.word.split(' ')[0] ?? '') > 4) continue;

    const shape = shapeOf(rhyme.word);
    if (!shape) continue;

    const salt = hash(rhyme.word);
    const topical = options.topic ? BY_TOPIC[options.topic]?.[shape] ?? [] : [];
    const pool = [...topical, ...GENERIC[shape]].filter((t) => !usedTemplates.has(t));
    const template = pickTemplate(pool, salt);
    if (!template) continue;

    const text = template.replace('{r}', rhyme.word);
    if (recent.has(text)) continue;

    usedTemplates.add(template);
    out.push({ text, origin: 'local', rhymeWord: rhyme.word });
  }

  return out;
}
