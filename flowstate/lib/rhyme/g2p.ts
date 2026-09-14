/**
 * Spelling -> approximate rhyme key, used only for words the lexicon has never
 * seen. It is deliberately conservative: it handles the common English endings
 * well and returns null rather than guessing wildly, because a confidently
 * wrong key produces confidently wrong rhymes, which is worse than none.
 */

import { splitKey } from './phonemes';

/** Whole-word irregulars that spelling rules reliably get wrong. */
const IRREGULAR: Record<string, string> = {
  love: 'AH-V', above: 'AH-V', glove: 'AH-V', shove: 'AH-V', dove: 'AH-V',
  come: 'AH-M', become: 'AH-M', some: 'AH-M', done: 'AH-N', none: 'AH-N',
  one: 'AH-N', won: 'AH-N', son: 'AH-N', ton: 'AH-N', gone: 'AO-N',
  live: 'IH-V', give: 'IH-V', have: 'AE-V', move: 'UW-V', prove: 'UW-V',
  lose: 'UW-Z', whose: 'UW-Z', do: 'UW', to: 'UW', into: 'UW', who: 'UW',
  two: 'UW', too: 'UW', through: 'UW', you: 'UW', true: 'UW', blue: 'UW',
  say: 'EY', said: 'EH-D', again: 'EH-N', against: 'EH-N-S-T',
  heart: 'AA-R-T', word: 'ER-D', world: 'ER-L-D', work: 'ER-K',
  worth: 'ER-TH', were: 'ER', earth: 'ER-TH', learn: 'ER-N',
  blood: 'AH-D', flood: 'AH-D', good: 'UH-D', foot: 'UH-T',
  put: 'UH-T', push: 'UH-SH', full: 'UH-L', pull: 'UH-L',
  eye: 'AY', buy: 'AY', guy: 'AY', try: 'AY', why: 'AY', high: 'AY',
  dry: 'AY', fly: 'AY', sky: 'AY', by: 'AY', my: 'AY', cry: 'AY',
  are: 'AA-R', star: 'AA-R', war: 'AO-R', door: 'AO-R', floor: 'AO-R',
  four: 'AO-R', your: 'AO-R', pour: 'AO-R', sure: 'UH-R', poor: 'UH-R',
  many: 'EH-N-IY', any: 'EH-N-IY', money: 'AH-N-IY', honey: 'AH-N-IY',
  friend: 'EH-N-D', been: 'IH-N', busy: 'IH-Z-IY', build: 'IH-L-D',
  bread: 'EH-D', dead: 'EH-D', head: 'EH-D', read: 'IY-D', ready: 'EH-D-IY',
  break: 'EY-K', great: 'EY-T', steak: 'EY-K', eight: 'EY-T', weight: 'EY-T',
  most: 'OW-S-T', host: 'OW-S-T', post: 'OW-S-T', ghost: 'OW-S-T',
  lost: 'AO-S-T', cost: 'AO-S-T', frost: 'AO-S-T', both: 'OW-TH',
  climb: 'AY-M', comb: 'OW-M', sign: 'AY-N', island: 'AY-L-AH-N-D',
  shall: 'AE-L', doll: 'AA-L', dull: 'AH-L', skull: 'AH-L',
};

/**
 * Spelling patterns where English reliably breaks its own short-vowel rule.
 * "grind" is /graind/, not /grind/ — and without this the engine would offer
 * "spending" as a rhyme for "grinding".
 */
const STEM_PATTERNS: ReadonlyArray<[RegExp, string]> = [
  [/ind$/, 'AY-N-D'],
  [/ild$/, 'AY-L-D'],
  [/old$/, 'OW-L-D'],
  [/olt$/, 'OW-L-T'],
  [/oll$/, 'OW-L'],
  [/ign$/, 'AY-N'],
  [/alk$/, 'AO-K'],
  [/alt$/, 'AO-L-T'],
  [/all$/, 'AO-L'],
];

/** Ordered longest-first: the first suffix match wins. */
const SUFFIX_RULES: ReadonlyArray<[RegExp, string]> = [
  [/ation$/, 'EY-SH-AH-N'],
  [/ition$/, 'IH-SH-AH-N'],
  [/ically$/, 'IH-K-L-IY'],
  [/ology$/, 'AA-L-AH-JH-IY'],
  [/ously$/, 'AH-S-L-IY'],
  [/ought$/, 'AO-T'],
  [/aught$/, 'AO-T'],
  [/eight$/, 'EY-T'],
  [/ight$/, 'AY-T'],
  [/tion$/, 'SH-AH-N'],
  [/sion$/, 'ZH-AH-N'],
  [/able$/, 'EY-B-AH-L'],
  [/ible$/, 'IH-B-AH-L'],
  [/ould$/, 'UH-D'],
  [/ance$/, 'AE-N-S'],
  [/ence$/, 'EH-N-S'],
  [/ment$/, 'EH-N-T'],
  [/ness$/, 'AH-S'],
  [/less$/, 'AH-S'],
  [/ity$/, 'IH-T-IY'],
  [/ful$/, 'UH-L'],
];

const CONSONANT_MAP: Record<string, string> = {
  b: 'B', c: 'K', d: 'D', f: 'F', g: 'G', h: 'HH', j: 'JH', k: 'K',
  l: 'L', m: 'M', n: 'N', p: 'P', q: 'K', r: 'R', s: 'S', t: 'T',
  v: 'V', w: 'W', x: 'K-S', z: 'Z',
};

const SHORT_VOWEL: Record<string, string> = {
  a: 'AE', e: 'EH', i: 'IH', o: 'AA', u: 'AH', y: 'IH',
};

const LONG_VOWEL: Record<string, string> = {
  a: 'EY', e: 'IY', i: 'AY', o: 'OW', u: 'UW', y: 'AY',
};

const DIGRAPHS: Record<string, string> = {
  ai: 'EY', ay: 'EY', ea: 'IY', ee: 'IY', ie: 'IY', ei: 'EY',
  oa: 'OW', oe: 'OW', oo: 'UW', ou: 'AW', ow: 'OW', oi: 'OY',
  oy: 'OY', au: 'AO', aw: 'AO', ue: 'UW', ui: 'UW', eu: 'UW',
};

const VOWEL_LETTERS = 'aeiouy';

export function normaliseWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[‘’']/g, "'")
    .replace(/[^a-z']/g, '')
    .replace(/^'+|'+$/g, '');
}

/**
 * Vowel-group syllable counter. Accurate enough for cadence maths, where the
 * signal that matters is variance between bars rather than absolute truth.
 */
export function countSyllables(raw: string): number {
  const word = normaliseWord(raw).replace(/'/g, '');
  if (!word) return 0;
  if (word.length <= 3) return 1;

  let trimmed = word
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    .replace(/^y/, '');
  if (!trimmed) trimmed = word;

  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  let count = groups ? groups.length : 0;

  if (/[^aeiouy]le$/.test(word)) count += 1;
  if (/(ism|ial|ian|iou)$/.test(word)) count += 1;

  return Math.max(1, count);
}

/**
 * Weak (unstressed) suffixes. English stress normally sits on the syllable
 * *before* these, so "paper" must resolve to EY-P-ER, not EH-R — otherwise the
 * engine offers rhymes for the wrong half of the word.
 */
const WEAK_SUFFIXES: ReadonlyArray<[RegExp, string]> = [
  [/ings$/, 'IH-NG-Z'],
  [/ing$/, 'IH-NG'],
  [/ers$/, 'ER-Z'],
  [/er$/, 'ER'],
  [/est$/, 'IH-S-T'],
  [/ily$/, 'AH-L-IY'],
  [/ly$/, 'L-IY'],
  [/ies$/, 'IY-Z'],
  [/ied$/, 'IY-D'],
  [/y$/, 'IY'],
  [/en$/, 'AH-N'],
  [/on$/, 'AH-N'],
  [/ish$/, 'IH-SH'],
  [/ard$/, 'ER-D'],
];

const VOICELESS_END = /(p|k|f|th|sh|ch|ss|x|ce|s)$/;

/** Derive a rhyme key from spelling, or null when the word is unreadable. */
export function guessRhymeKey(raw: string): string | null {
  const word = normaliseWord(raw).replace(/'/g, '');
  if (word.length < 2) return null;

  const irregular = IRREGULAR[word];
  if (irregular) return irregular;

  for (const [pattern, phonemes] of SUFFIX_RULES) {
    if (pattern.test(word)) {
      const tail = splitKey(phonemes);
      const first = tail[0];
      if (first && /^[AEIOU]/.test(first)) return tail.join('-');
      const stem = word.replace(pattern, '');
      const stemKey = keyFromLetters(stem);
      return stemKey ? [...stemKey, ...tail].join('-') : null;
    }
  }

  // Regular past tense: the "-ed" ending has three pronunciations.
  const past = pastTenseKey(word);
  if (past) return past;

  const pluralKey = plural(word);
  if (pluralKey) return pluralKey;

  for (const [pattern, phonemes] of WEAK_SUFFIXES) {
    if (!pattern.test(word)) continue;
    const stem = word.replace(pattern, '');
    if (stem.length < 2) break;
    const stemKey = stressedStemKey(stem);
    if (stemKey) return [...stemKey, ...splitKey(phonemes)].join('-');
    break;
  }

  const key = keyFromLetters(word);
  return key ? key.join('-') : null;
}

function pastTenseKey(word: string): string | null {
  if (!/ed$/.test(word) || word.length < 4) return null;
  let stem = word.slice(0, -2);
  // "chased" -> stem "chas" needs its silent e back to read as EY-S.
  if (/[^aeiouy][^aeiouy]$/.test(stem) && stem.slice(-1) === stem.slice(-2, -1)) {
    stem = stem.slice(0, -1) + stem.slice(-1);
  }
  const stemKey = stressedStemKey(stem);
  if (!stemKey) return null;
  const last = stemKey[stemKey.length - 1];
  if (last === 'T' || last === 'D') return [...stemKey, 'IH', 'D'].join('-');
  const suffix = VOICELESS_END.test(stem) ? 'T' : 'D';
  return [...stemKey, suffix].join('-');
}

function plural(word: string): string | null {
  if (!/s$/.test(word) || /ss$/.test(word) || word.length < 4) return null;
  if (/es$/.test(word) && /(sh|ch|ss|x|z|s)es$/.test(word)) {
    const stemKey = stressedStemKey(word.slice(0, -2));
    return stemKey ? [...stemKey, 'IH', 'Z'].join('-') : null;
  }
  const stem = word.slice(0, -1);
  const stemKey = stressedStemKey(stem);
  if (!stemKey) return null;
  return [...stemKey, VOICELESS_END.test(stem) ? 'S' : 'Z'].join('-');
}

/**
 * Key for the stressed syllable of a stem left behind by a weak suffix.
 *
 * The orthographic doubling rule does most of the work: "lett|er" has a
 * doubled consonant so the vowel is short (EH-T-ER), while "pap|er" has a
 * single one so the syllable is open and the vowel long (EY-P-ER).
 */
function stressedStemKey(stem: string): string[] | null {
  if (stem.length < 1) return null;

  // "working" must resolve through "work" (ER-K), not the spelling rules.
  const irregular = IRREGULAR[stem];
  if (irregular) return splitKey(irregular);

  // "rolling" keeps the long vowel of "roll" — the doubled "ll" below is not a
  // short-vowel marker here, so these patterns have to win first.
  for (const [pattern, phonemes] of STEM_PATTERNS) {
    if (pattern.test(stem)) return splitKey(phonemes);
  }

  const doubled = stem.match(/([aeiouy])([^aeiouy])\2$/);
  if (doubled) {
    const vowel = SHORT_VOWEL[doubled[1] ?? 'a'];
    const coda = codaToPhonemes(doubled[2] ?? '');
    return vowel ? [vowel, ...coda] : null;
  }

  const open = stem.match(/^(?:.*[^aeiouy])?([aeiouy])([^aeiouyr])$/);
  if (open && stem.length >= 2) {
    const vowel = LONG_VOWEL[open[1] ?? 'a'];
    const coda = codaToPhonemes(open[2] ?? '');
    return vowel ? [vowel, ...coda] : null;
  }

  // Stem ends on a vowel ("see" + "ing", "cry" + "ing").
  if (/[aeiouy]$/.test(stem)) {
    const m = stem.match(/([aeiouy]{1,2})$/);
    const letters = m?.[1] ?? 'a';
    const digraph = DIGRAPHS[letters];
    const single = letters[letters.length - 1] ?? 'a';
    const vowel = digraph ?? LONG_VOWEL[single];
    return vowel ? [vowel] : null;
  }

  return keyFromLetters(stem);
}

/** Walk back to the final vowel group and build [nucleus, ...coda]. */
function keyFromLetters(word: string): string[] | null {
  if (word.length < 2) return null;

  for (const [pattern, phonemes] of STEM_PATTERNS) {
    if (pattern.test(word)) return splitKey(phonemes);
  }

  // Silent final "e": make, time, hope.
  const beforeE = word[word.length - 2];
  if (
    word.endsWith('e') &&
    word.length > 3 &&
    beforeE !== undefined &&
    !VOWEL_LETTERS.includes(beforeE)
  ) {
    const stem = word.slice(0, -1);
    const m = stem.match(/([aeiouy])([^aeiouy]*)$/);
    if (m) {
      const vowel = LONG_VOWEL[m[1] ?? 'a'];
      if (vowel) return [vowel, ...codaToPhonemes(m[2] ?? '')];
    }
  }

  let end = -1;
  for (let i = word.length - 1; i >= 0; i -= 1) {
    const ch = word[i];
    if (ch && VOWEL_LETTERS.includes(ch)) { end = i; break; }
  }
  if (end === -1) return null;

  let start = end;
  while (start > 0) {
    const prev = word[start - 1];
    if (prev && VOWEL_LETTERS.includes(prev)) start -= 1;
    else break;
  }

  const nucleusLetters = word.slice(start, end + 1);
  const codaLetters = word.slice(end + 1);

  // R-controlled vowels: "start" is AA-R-T, never AE-R-T.
  if (codaLetters.startsWith('r')) {
    const rVowel = R_CONTROLLED[nucleusLetters];
    if (rVowel) {
      return [...splitKey(rVowel), ...codaToPhonemes(codaLetters.slice(1))];
    }
  }

  const digraph = DIGRAPHS[nucleusLetters];
  let nucleus: string | undefined;
  if (digraph) {
    nucleus = digraph;
  } else {
    const single = nucleusLetters[nucleusLetters.length - 1] ?? 'a';
    const openSyllable = codaLetters === '' && word.length > 2;
    nucleus = openSyllable ? LONG_VOWEL[single] : SHORT_VOWEL[single];
  }
  if (!nucleus) return null;

  return [nucleus, ...codaToPhonemes(codaLetters)];
}

const R_CONTROLLED: Record<string, string> = {
  a: 'AA-R', e: 'ER', i: 'ER', o: 'AO-R', u: 'ER', y: 'ER',
  ea: 'IH-R', ee: 'IH-R', ai: 'EH-R', oa: 'AO-R', ou: 'ER', oo: 'UH-R',
};

function codaToPhonemes(coda: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < coda.length) {
    const two = coda.slice(i, i + 2);
    if (two === 'ck') { out.push('K'); i += 2; continue; }
    if (two === 'ch') { out.push('CH'); i += 2; continue; }
    if (two === 'sh') { out.push('SH'); i += 2; continue; }
    if (two === 'th') { out.push('TH'); i += 2; continue; }
    if (two === 'ph') { out.push('F'); i += 2; continue; }
    if (two === 'ng') { out.push('NG'); i += 2; continue; }
    if (two === 'gh') { i += 2; continue; }
    const ch = coda[i];
    i += 1;
    if (!ch) continue;
    if (ch === 'e' && i === coda.length) continue;
    const mapped = CONSONANT_MAP[ch];
    if (mapped) out.push(...mapped.split('-'));
  }
  return out.filter((p, idx) => p !== out[idx - 1]);
}
