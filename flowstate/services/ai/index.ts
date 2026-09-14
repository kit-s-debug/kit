/**
 * Provider registry.
 *
 * Server code asks for a provider here; if no key is configured it gets the
 * local engine and the app carries on working. Adding a provider means adding
 * a file and one branch below — nothing else in the app changes.
 */

import 'server-only';
import type { AIProvider } from './types';
import { LocalAIProvider } from './local-provider';
import { AnthropicProvider } from './anthropic-provider';

export type { AIProvider, SuggestInput, AnalyseInput } from './types';

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;

  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (anthropicKey) {
    cached = new AnthropicProvider(
      anthropicKey,
      process.env.FLOWSTATE_AI_MODEL?.trim() || undefined,
    );
    return cached;
  }

  cached = new LocalAIProvider();
  return cached;
}

/** Test seam — lets a route reset the memoised provider. */
export function resetAIProvider(): void {
  cached = null;
}
