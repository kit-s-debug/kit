/**
 * "Finding the words" — everyday phrasing to the areas Lyndsay works with.
 *
 * Runs entirely in the browser. Nothing typed here is transmitted or stored;
 * that promise is the reason this is a plain function and not an API call.
 *
 * The approach: each area carries a list of cues (see content/site.ts). An
 * input scores against those cues by exact phrase, then by token overlap, then
 * by fuzzy token similarity for typos. Only the two best cue hits per area
 * count, so an area with twenty cues cannot out-shout one with four.
 */

export type ScoredArea = {
  name: string;
  cluster: string;
  score: number;
};

export type MatchResult = {
  matches: ScoredArea[];
  /** Cluster of the strongest match — chooses the warm line shown underneath. */
  cluster: string | null;
  /** True when the input mentions self-harm or suicide, so we lead with help lines. */
  urgent: boolean;
};

type AreaLike = { name: string; cluster: string; cues: readonly string[] };

/** Words people use that the cues don't, mapped onto the cues' word. */
const SYNONYMS: Record<string, string> = {
  kid: "child",
  kids: "child",
  children: "child",
  mum: "mother",
  mam: "mother",
  mummy: "mother",
  dad: "father",
  daddy: "father",
  missus: "wife",
  hubby: "husband",
  fella: "partner",
  bloke: "partner",
  misses: "wife",
  knackered: "exhausted",
  shattered: "exhausted",
  fuming: "angry",
  livid: "angry",
  gutted: "sad",
  down: "low",
  scared: "frightened",
  terrified: "frightened",
  petrified: "frightened",
  booze: "alcohol",
  pissed: "drunk",
  gear: "drugs",
  weed: "cannabis",
  telling: "shouting",
  yelling: "shouting",
  screaming: "shouting",
  temper: "anger",
  sleeping: "sleep",
  asleep: "sleep",
  worrying: "worry",
  worried: "worry",
  panicking: "panic",
  bereft: "grief",
  mourning: "grief",
  split: "separated",
  ex: "partner",
};

/** Ignored when they stand alone; still counted inside a longer phrase. */
const STOPWORDS = new Set([
  "i", "im", "me", "my", "mine", "myself", "we", "us", "our", "you", "your",
  "the", "a", "an", "and", "or", "but", "so", "to", "of", "in", "on", "at",
  "it", "its", "is", "am", "are", "was", "were", "be", "been", "do", "does",
  "did", "have", "has", "had", "get", "got", "getting", "go", "going", "gone",
  "all", "any", "some", "more", "most", "very", "really", "just", "even",
  "feel", "feeling", "felt", "think", "thing", "things", "time", "times",
  "day", "days", "week", "year", "years", "bit", "lot", "like", "about",
  "cant", "wont", "dont", "didnt", "not", "no", "never", "always", "keep",
  "keeps", "make", "makes", "made", "want", "wants", "need", "needs",
  "know", "knows", "there", "here", "what", "when", "who", "why", "how",
  "with", "for", "from", "out", "up", "down", "over", "again", "anymore",
  "everything", "nothing", "anything", "something", "people", "person",
  "life", "lately", "much", "too", "own", "them", "they", "he", "she", "his",
  "her", "him", "been", "being", "would", "could", "should", "will", "can",
]);

export function normalise(input: string): string {
  return input
    .toLowerCase()
    .replace(/[‘’ʼ]/g, "'")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stem(word: string): string {
  let s = word;
  if (s.length > 5 && s.endsWith("ings")) s = s.slice(0, -4);
  else if (s.length > 4 && s.endsWith("ing")) s = s.slice(0, -3);
  else if (s.length > 4 && s.endsWith("ed")) s = s.slice(0, -2);
  else if (s.length > 3 && s.endsWith("s") && !s.endsWith("ss")) s = s.slice(0, -1);
  else return s;
  // undo the spelling change English makes when it adds the ending, so that
  // "snapping" and "snap", or "races" and "racing", land on the same stem
  if (/([bdfglmnprt])\1$/.test(s)) return s.slice(0, -1);
  if (s.length < 4) return `${s}e`;
  return s;
}

function canonical(word: string): string {
  return stem(SYNONYMS[word] ?? word);
}

/** Sørensen–Dice on character bigrams — catches typos without a dictionary. */
function dice(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 3 || b.length < 3) return 0;
  const grams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const g = a.slice(i, i + 2);
    grams.set(g, (grams.get(g) ?? 0) + 1);
  }
  let hits = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const g = b.slice(i, i + 2);
    const count = grams.get(g) ?? 0;
    if (count > 0) {
      grams.set(g, count - 1);
      hits++;
    }
  }
  return (2 * hits) / (a.length + b.length - 2);
}

function containsPhrase(haystack: string, needle: string): boolean {
  const at = haystack.indexOf(needle);
  if (at === -1) return false;
  const before = at === 0 ? " " : haystack[at - 1];
  const afterAt = at + needle.length;
  const after = afterAt >= haystack.length ? " " : haystack[afterAt];
  return before === " " && after === " ";
}

/** Exact, or close enough that it is almost certainly a typo. */
function hasWord(word: string, tokens: Set<string>, contentTokens: string[]): boolean {
  const target = canonical(word);
  if (tokens.has(target)) return true;
  if (target.length < 5) return false;
  return contentTokens.some((t) => dice(canonical(t), target) >= 0.85);
}

const URGENT = new Set(["Suicidal thoughts", "Self-harm"]);

const THRESHOLD = 1.3;
const MAX_MATCHES = 3;
/** Only the two strongest cue hits count towards an area's score. */
const CUES_COUNTED = 2;

export function findAreas(
  input: string,
  areas: readonly AreaLike[],
  limit = MAX_MATCHES,
): MatchResult {
  const text = normalise(input);
  if (text.length < 2) return { matches: [], cluster: null, urgent: false };

  const padded = ` ${text} `;
  const rawTokens = text.split(" ");
  const tokens = new Set(rawTokens.map(canonical));
  const contentTokens = rawTokens.filter((t) => !STOPWORDS.has(t) && t.length > 2);

  const scored: ScoredArea[] = [];

  for (const area of areas) {
    const hits: number[] = [];

    for (const cue of area.cues) {
      const cueText = normalise(cue);
      const cueWords = cueText.split(" ");
      let best = 0;

      if (containsPhrase(padded, ` ${cueText} `)) {
        // whole phrase, verbatim — the strongest signal there is
        best = 2.2 + 0.7 * (cueWords.length - 1);
      } else if (cueWords.length > 1) {
        const present = cueWords.filter((w) => hasWord(w, tokens, contentTokens)).length;
        if (present === cueWords.length) {
          best = 1.5 + 0.35 * (cueWords.length - 1);
        } else if (present >= 2 && present / cueWords.length >= 0.66) {
          best = 0.9;
        }
      } else {
        const word = canonical(cueWords[0]);
        if (STOPWORDS.has(cueWords[0])) {
          best = 0;
        } else if (tokens.has(word)) {
          best = 1.5;
        } else {
          let fuzz = 0;
          for (const t of contentTokens) {
            fuzz = Math.max(fuzz, dice(canonical(t), word));
          }
          if (fuzz >= 0.8) best = 1.1 * fuzz;
        }
      }

      if (best > 0) hits.push(best);
    }

    if (!hits.length) continue;
    hits.sort((a, b) => b - a);
    const score = hits.slice(0, CUES_COUNTED).reduce((a, b) => a + b, 0);
    if (score >= THRESHOLD) {
      scored.push({ name: area.name, cluster: area.cluster, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const urgent = scored.some((s) => URGENT.has(s.name));
  // If someone has typed something urgent, it leads regardless of score.
  if (urgent) {
    scored.sort((a, b) => {
      const ua = URGENT.has(a.name) ? 1 : 0;
      const ub = URGENT.has(b.name) ? 1 : 0;
      return ub - ua || b.score - a.score;
    });
  }

  const matches = scored.slice(0, limit);
  return { matches, cluster: matches[0]?.cluster ?? null, urgent };
}
