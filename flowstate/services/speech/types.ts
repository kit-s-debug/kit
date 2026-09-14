import type { SpeechCapability, SpeechEngineId } from '@/types';

export type SpeechErrorCode =
  | 'not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'unsupported'
  | 'aborted'
  | 'unknown';

export interface SpeechError {
  code: SpeechErrorCode;
  message: string;
  /** False when the session can carry on — a silent patch, say. */
  fatal: boolean;
}

export interface SpeechResult {
  text: string;
  confidence: number;
  /** ms since the engine was started. */
  atMs: number;
}

export interface SpeechHandlers {
  /** Interim text — replaces whatever the last interim was. */
  onPartial: (text: string) => void;
  /** A settled phrase. Append this to the transcript. */
  onFinal: (result: SpeechResult) => void;
  onError: (error: SpeechError) => void;
  /** The engine stopped for good. */
  onEnd: () => void;
}

/**
 * One interface over the browser's speech recognition and the scripted demo,
 * so a streaming server-side transcriber can be dropped in later without the
 * freestyle screen knowing about it.
 */
export interface SpeechEngine {
  readonly id: SpeechEngineId;
  readonly capability: SpeechCapability;
  start(handlers: SpeechHandlers): void;
  stop(): void;
  abort(): void;
}
