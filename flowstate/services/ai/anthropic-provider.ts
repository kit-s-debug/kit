/**
 * Hosted-model provider (server only).
 *
 * Called from the API routes, never from the browser — the key is read from
 * the server environment and no request from this file is reachable from
 * client code. It is deliberately narrow: enrich the line ideas and the
 * closing observations. Rhymes stay local because a network round trip is far
 * too slow to keep up with a bar.
 */

import type { AIStatus, SuggestionSet } from '@/types';
import {
  sanitiseIdeas,
  sanitiseObservations,
  type AIProvider,
  type AnalyseInput,
  type AnalysisEnrichment,
  type SuggestInput,
} from './types';
import { localObservations, localSuggest } from './local-provider';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

/** Hard ceilings: a late suggestion is worse than no suggestion. */
const SUGGEST_TIMEOUT_MS = 3500;
const ANALYSE_TIMEOUT_MS = 9000;

interface AnthropicTextBlock {
  type: string;
  text?: string;
}

function extractText(payload: unknown): string {
  const content = (payload as { content?: unknown })?.content;
  if (!Array.isArray(content)) return '';
  return content
    .filter((block): block is AnthropicTextBlock => typeof block === 'object' && block !== null)
    .map((block) => (block.type === 'text' && typeof block.text === 'string' ? block.text : ''))
    .join('')
    .trim();
}

/** Models answer with prose around JSON often enough to be worth handling. */
function parseJsonBlock(text: string): unknown {
  const direct = text.trim();
  const fenced = direct.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced?.[1]?.trim() ?? direct;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch {
    return null;
  }
}

export class AnthropicProvider implements AIProvider {
  readonly id = 'anthropic';
  readonly live = true;
  readonly label = 'Anthropic';

  constructor(
    private apiKey: string,
    private model: string = DEFAULT_MODEL,
  ) {}

  private async call(
    system: string,
    user: string,
    maxTokens: number,
    timeoutMs: number,
  ): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': API_VERSION,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens,
          system,
          messages: [{ role: 'user', content: user }],
        }),
        signal: controller.signal,
      });
      if (!response.ok) return null;
      const payload: unknown = await response.json();
      return parseJsonBlock(extractText(payload));
    } catch {
      // Timeouts, aborts and network failures all land here and fall back.
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async suggest(input: SuggestInput): Promise<SuggestionSet> {
    // Rhymes are always local. The model only proposes lines around them.
    const base = localSuggest(input);
    if (input.assist !== 'full' || base.rhymes.length === 0) return base;

    const rhymeList = base.rhymes.slice(0, 6).map((r) => r.word).join(', ');
    const system = [
      'You help a rapper who is freestyling right now over a beat.',
      'Reply with JSON only: {"ideas":["...","...","..."]}.',
      'Each idea is one short line of four to eight words that could be said next.',
      'Every line must end on one of the supplied rhyme words.',
      'Match the subject the rapper is already on. Plain modern English.',
      'No hooks, no ad-libs, no quotation marks, no slurs, no cliches about ice or chains.',
    ].join(' ');
    const user = [
      `They just said: "${input.recentText.slice(-240)}"`,
      input.previousBar ? `Previous bar: "${input.previousBar}"` : '',
      `Rhyme words available: ${rhymeList}`,
      input.topicHint ? `Subject: ${input.topicHint}` : '',
      `Tempo: ${input.bpm} BPM.`,
    ]
      .filter(Boolean)
      .join('\n');

    const parsed = await this.call(system, user, 220, SUGGEST_TIMEOUT_MS);
    const ideas = sanitiseIdeas((parsed as { ideas?: unknown })?.ideas, 3);
    if (ideas.length === 0) return base;

    return { ...base, ideas, source: 'hybrid' };
  }

  async analyse(input: AnalyseInput): Promise<AnalysisEnrichment> {
    const fallback = { observations: localObservations(input) };
    if (input.transcript.trim().split(/\s+/).length < 12) return fallback;

    const system = [
      'You are a freestyle coach reviewing a performance that just finished.',
      'Reply with JSON only: {"observations":["...","...","..."]}.',
      'Give two or three specific, practical observations, one sentence each.',
      'Be direct and encouraging. Never insult the performer. No scores, no praise-only filler.',
      'Refer to what they actually said where it helps.',
    ].join(' ');
    const user = [
      `Transcript:\n${input.transcript.slice(0, 2400)}`,
      `Tempo: ${input.bpm} BPM over ${Math.round(input.durationSec)} seconds.`,
      `Measured: rhyme ${input.base.breakdown.rhymeQuality}, flow ${input.base.breakdown.flow}, timing ${input.base.breakdown.beatTiming}, vocabulary ${input.base.breakdown.vocabulary}.`,
      `Longest rhyme chain: ${input.base.stats.longestRhymeChain} bars.`,
    ].join('\n');

    const parsed = await this.call(system, user, 400, ANALYSE_TIMEOUT_MS);
    const observations = sanitiseObservations(
      (parsed as { observations?: unknown })?.observations,
      3,
    );
    if (observations.length === 0) return fallback;
    return { observations };
  }

  status(): AIStatus {
    return {
      live: true,
      provider: 'anthropic',
      detail: `Line ideas and the end-of-session review are generated by ${this.model}. Transcript text is sent to Anthropic for those two calls only.`,
    };
  }
}
