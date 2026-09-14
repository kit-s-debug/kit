/**
 * A small ARPAbet-flavoured phoneme model.
 *
 * FLOWSTATE needs to answer one question thousands of times per session:
 * "how close do these two word endings sound?" A full pronunciation
 * dictionary is megabytes, so instead the lexicon stores a hand-written rhyme
 * key per family and this module supplies the distance metric between keys.
 *
 * A rhyme key is a `-` separated phoneme list running from the last stressed
 * vowel to the end of the word: "make" -> "EY-K", "money" -> "AH-N-IY".
 */

export const VOWELS = new Set([
  'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'EH', 'ER',
  'EY', 'IH', 'IY', 'OW', 'OY', 'UH', 'UW',
]);

/** Consonants that sound near-identical to a listener mid-bar. */
const CONSONANT_CLASS: Record<string, string> = {
  P: 'stop-vl', T: 'stop-vl', K: 'stop-vl',
  B: 'stop-vd', D: 'stop-vd', G: 'stop-vd',
  F: 'fric-vl', TH: 'fric-vl', S: 'fric-vl', SH: 'fric-vl', HH: 'fric-vl',
  V: 'fric-vd', DH: 'fric-vd', Z: 'fric-vd', ZH: 'fric-vd',
  M: 'nasal', N: 'nasal', NG: 'nasal',
  L: 'liquid', R: 'liquid',
  CH: 'affric-vl', JH: 'affric-vd',
  W: 'glide', Y: 'glide',
};

/** Voiced/voiceless twins — "back"/"bag" is a slant rhyme, not a miss. */
const VOICING_TWIN: Record<string, string> = {
  P: 'B', B: 'P', T: 'D', D: 'T', K: 'G', G: 'K',
  F: 'V', V: 'F', S: 'Z', Z: 'S', SH: 'ZH', ZH: 'SH',
  TH: 'DH', DH: 'TH', CH: 'JH', JH: 'CH',
};

/** Vowels a rapper can comfortably bend into each other. */
const VOWEL_NEIGHBOURS: Record<string, readonly string[]> = {
  IY: ['IH'], IH: ['IY', 'EH'],
  EY: ['EH', 'AY'], EH: ['EY', 'IH', 'AE'],
  AE: ['EH', 'AH'], AH: ['AE', 'AA', 'ER', 'UH'],
  AA: ['AH', 'AO'], AO: ['AA', 'OW'],
  OW: ['AO', 'UH'], UH: ['UW', 'AH', 'OW'],
  UW: ['UH'], ER: ['AH'],
  AY: ['EY', 'OY'], OY: ['AY'], AW: ['AA'],
};

export function isVowel(p: string): boolean {
  return VOWELS.has(p);
}

export function splitKey(key: string): string[] {
  return key.split('-').filter(Boolean);
}

/** Number of vowels in a key — how many syllables the rhyme actually spans. */
export function keySyllables(key: string): number {
  return splitKey(key).filter(isVowel).length;
}

function vowelDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (VOWEL_NEIGHBOURS[a]?.includes(b)) return 0.35;
  return 1;
}

function consonantDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (VOICING_TWIN[a] === b) return 0.25;
  const ca = CONSONANT_CLASS[a];
  const cb = CONSONANT_CLASS[b];
  if (ca && ca === cb) return 0.45;
  if (ca && cb) {
    const base = (c: string) => c.split('-')[0];
    // Same manner, different voicing (k/d) still blurs at freestyle speed.
    if (base(ca) === base(cb)) return 0.55;
    if (
      (ca === 'nasal' || ca === 'liquid') &&
      (cb === 'nasal' || cb === 'liquid')
    ) {
      return 0.6;
    }
  }
  return 1;
}

/** Cost of a consonant present in one key but not the other. */
const ABSENT_CONSONANT_COST = 0.5;
/** A whole missing syllable is a far bigger deal than a missing consonant. */
const ABSENT_VOWEL_COST = 1;

export type RhymeGrade = 'perfect' | 'near' | 'assonance' | 'none';

export interface KeySimilarity {
  /** 0-1, where 1 is an identical key. */
  score: number;
  kind: RhymeGrade;
}

/**
 * Compare two rhyme keys.
 *
 * Alignment runs *forward* from the stressed vowel, which is how English
 * rhyme actually works: "money" and "running" line up as AH-N-IY / AH-N-IH-NG
 * and read as a slant rhyme, even though their endings differ.
 */
export function compareKeys(a: string, b: string): KeySimilarity {
  if (!a || !b) return { score: 0, kind: 'none' };
  if (a === b) return { score: 1, kind: 'perfect' };

  const pa = splitKey(a);
  const pb = splitKey(b);
  const va = pa[0];
  const vb = pb[0];
  if (!va || !vb) return { score: 0, kind: 'none' };

  const nucleusPenalty = vowelDistance(va, vb);
  if (nucleusPenalty === 1) return { score: 0, kind: 'none' };

  const len = Math.max(pa.length, pb.length);
  let penalty = nucleusPenalty;

  for (let i = 1; i < len; i += 1) {
    const x = pa[i];
    const y = pb[i];
    if (x === undefined || y === undefined) {
      const present = x ?? y;
      penalty += present && isVowel(present)
        ? ABSENT_VOWEL_COST
        : ABSENT_CONSONANT_COST;
      continue;
    }
    penalty += isVowel(x) || isVowel(y) ? vowelDistance(x, y) : consonantDistance(x, y);
  }

  // "paper" and "shape" share a stressed syllable but not a syllable count,
  // and a listener hears that difference immediately.
  const syllableGap = Math.abs(keySyllables(a) - keySyllables(b));
  const raw = Math.max(0, 1 - penalty / len);
  const score = raw / (1 + 0.5 * syllableGap);

  if (score >= 0.62) return { score, kind: 'near' };
  if (score >= 0.38) return { score, kind: 'assonance' };
  return { score, kind: 'none' };
}
