/**
 * Chooses a speech engine and reports honestly on what it is.
 *
 * The rule the whole app follows: if live transcription is not actually
 * running, the interface says Demo Mode. It never shows scripted words as if
 * they came from the microphone.
 */

import type { SpeechCapability } from '@/types';
import { DemoSpeechEngine } from './demo-speech';
import { WebSpeechEngine, webSpeechCapability } from './web-speech';
import type { SpeechEngine } from './types';

export type { SpeechEngine, SpeechError, SpeechHandlers, SpeechResult } from './types';
export { DemoSpeechEngine } from './demo-speech';
export { WebSpeechEngine, webSpeechCapability } from './web-speech';

export function detectSpeechCapability(): SpeechCapability {
  return webSpeechCapability();
}

export interface EngineChoice {
  engine: SpeechEngine;
  /** True when the transcript is scripted rather than heard. */
  demo: boolean;
  capability: SpeechCapability;
}

export function createSpeechEngine(forceDemo: boolean): EngineChoice {
  const capability = webSpeechCapability();
  if (forceDemo || !capability.supported) {
    const engine = new DemoSpeechEngine();
    return { engine, demo: true, capability };
  }
  return { engine: new WebSpeechEngine(), demo: false, capability };
}
