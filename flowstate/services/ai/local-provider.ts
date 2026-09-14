/**
 * The always-on provider.
 *
 * Rhymes, topic reading and line scaffolds come from the local engine in
 * `lib/rhyme`. It needs no network, no key and no warm-up, which is what makes
 * suggestions land while the bar is still being said. Everything a hosted model
 * adds is layered on top of this, never in place of it.
 */

import type { AIStatus, SuggestionSet } from '@/types';
import { buildIdeas, detectTopic, findAnchor, findRhymes } from '@/lib/rhyme';
import type {
  AIProvider,
  AnalyseInput,
  AnalysisEnrichment,
  SuggestInput,
} from './types';

const EMPTY_SUGGESTIONS: SuggestionSet = {
  anchor: '',
  anchorRhymeKey: null,
  rhymes: [],
  ideas: [],
  topic: null,
  revision: 0,
  source: 'local',
};

export function localSuggest(input: SuggestInput): SuggestionSet {
  const anchor = findAnchor(input.recentText);
  if (!anchor) return { ...EMPTY_SUGGESTIONS, revision: input.revision };

  const reading = detectTopic(input.recentText);
  const topic = input.topicHint ?? reading.topic;

  const rhymes = findRhymes(anchor, {
    difficulty: input.difficulty,
    topic,
    recentWords: new Set(input.usedWords),
  });

  const ideas =
    input.assist === 'full'
      ? buildIdeas(rhymes, { topic, limit: 3 })
      : [];

  return {
    anchor: anchor.phrase,
    anchorRhymeKey: anchor.key,
    rhymes: input.assist === 'off' ? [] : rhymes,
    ideas,
    topic,
    revision: input.revision,
    source: 'local',
  };
}

/**
 * Observations derived from the measured stats. Kept specific and neutral —
 * the brief is to be useful to someone who just performed, not to grade them.
 */
export function localObservations(input: AnalyseInput): string[] {
  const { base } = input;
  const out: string[] = [];
  const { stats, breakdown } = base;

  if (breakdown.beatTiming >= 80) {
    out.push('You stayed in the pocket — your phrasing landed consistently with the beat.');
  } else if (breakdown.beatTiming <= 58 && stats.bars > 2) {
    out.push('Your phrases drifted ahead of and behind the beat. Try counting the first beat of each bar back in.');
  }

  if (stats.avgSyllablesPerBar > 0 && stats.avgSyllablesPerBar < 7) {
    out.push('There was room left in most bars. Adding two or three more syllables will fill the pocket without rushing.');
  } else if (stats.avgSyllablesPerBar > 16) {
    out.push('You packed a lot into each bar. Leaving a beat of space at the end of a line makes the rhyme land harder.');
  }

  if (breakdown.rhymeQuality >= 78) {
    out.push('Your rhyme sounds carried cleanly across lines rather than resetting every bar.');
  } else if (stats.longestRhymeChain <= 2 && stats.bars >= 4) {
    out.push('Most rhymes resolved after a single pair. Try extending one sound across three or four bars.');
  }

  if (breakdown.vocabulary < 65 && stats.wordCount > 40) {
    out.push('A handful of words did a lot of the work. Swapping in one fresh image per bar widens the range fast.');
  }

  if (stats.silenceRatio > 0.35) {
    out.push('There were some long gaps. Holding a simple repeated phrase buys thinking time without stopping.');
  }

  if (out.length === 0) {
    out.push('A steady, controlled run — nothing obvious to fix. Push the tempo or the rhyme complexity next time.');
  }

  return out.slice(0, 3);
}

export class LocalAIProvider implements AIProvider {
  readonly id = 'local';
  readonly live = false;
  readonly label = 'On-device rhyme engine';

  async suggest(input: SuggestInput): Promise<SuggestionSet> {
    return localSuggest(input);
  }

  async analyse(input: AnalyseInput): Promise<AnalysisEnrichment> {
    return { observations: localObservations(input) };
  }

  status(): AIStatus {
    return {
      live: false,
      provider: 'local',
      detail:
        'Rhymes, topic detection and scoring run entirely in your browser. No audio or text leaves the device.',
    };
  }
}
