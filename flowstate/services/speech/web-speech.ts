/**
 * Browser speech recognition.
 *
 * The Web Speech API is the only streaming transcriber available without a
 * server, and it has sharp edges: it ends itself after a stretch of silence, it
 * is Chromium/Safari only, and in Chrome the audio is processed by Google's
 * servers rather than on-device. All three are surfaced to the user rather than
 * papered over — see the privacy page and the mic status pill.
 */

import type { SpeechCapability, SpeechEngineId } from '@/types';
import type { SpeechEngine, SpeechError, SpeechHandlers } from './types';

interface RecognitionAlternative {
  transcript: string;
  confidence: number;
}
interface RecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: RecognitionAlternative;
}
interface RecognitionEvent {
  resultIndex: number;
  results: { length: number; [index: number]: RecognitionResult };
}
interface RecognitionErrorEvent {
  error: string;
  message?: string;
}
interface RecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}
type RecognitionCtor = new () => RecognitionInstance;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function webSpeechCapability(): SpeechCapability {
  if (typeof window === 'undefined') {
    return { supported: false, engine: 'demo', reason: 'Rendering on the server.' };
  }
  if (!getRecognitionCtor()) {
    return {
      supported: false,
      engine: 'demo',
      reason:
        'This browser has no speech recognition. Chrome, Edge or Safari support it; Firefox does not.',
    };
  }
  if (!window.isSecureContext) {
    return {
      supported: false,
      engine: 'demo',
      reason: 'Speech recognition needs a secure (https) connection.',
    };
  }
  return { supported: true, engine: 'web-speech' };
}

const ERROR_COPY: Record<string, { message: string; fatal: boolean }> = {
  'not-allowed': {
    message: 'Microphone access was blocked, so nothing can be transcribed.',
    fatal: true,
  },
  'service-not-allowed': {
    message: 'The browser blocked its speech service. Check your site permissions.',
    fatal: true,
  },
  'audio-capture': {
    message: 'No microphone input was found.',
    fatal: true,
  },
  network: {
    message: 'The speech service is unreachable. Check your connection.',
    fatal: false,
  },
  'no-speech': {
    message: 'No speech detected yet — the mic is still listening.',
    fatal: false,
  },
  aborted: { message: 'Listening was interrupted.', fatal: false },
};

export class WebSpeechEngine implements SpeechEngine {
  readonly id: SpeechEngineId = 'web-speech';
  readonly capability: SpeechCapability;

  private recognition: RecognitionInstance | null = null;
  private handlers: SpeechHandlers | null = null;
  private wantRunning = false;
  private startedAt = 0;
  private restartTimer: ReturnType<typeof setTimeout> | null = null;
  private restarts = 0;

  constructor(private lang = 'en-US') {
    this.capability = webSpeechCapability();
  }

  start(handlers: SpeechHandlers): void {
    this.handlers = handlers;
    if (!this.capability.supported) {
      handlers.onError({
        code: 'unsupported',
        message: this.capability.reason ?? 'Speech recognition is unavailable.',
        fatal: true,
      });
      return;
    }
    this.wantRunning = true;
    this.startedAt = performance.now();
    this.restarts = 0;
    this.launch();
  }

  private launch(): void {
    const Ctor = getRecognitionCtor();
    if (!Ctor || !this.handlers) return;

    const recognition = new Ctor();
    recognition.lang = this.lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const handlers = this.handlers;
      if (!handlers) return;
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (!result) continue;
        const alternative = result[0];
        if (!alternative) continue;
        const text = alternative.transcript.trim();
        if (!text) continue;
        if (result.isFinal) {
          handlers.onFinal({
            text,
            confidence: alternative.confidence || 0.8,
            atMs: performance.now() - this.startedAt,
          });
        } else {
          interim += `${text} `;
        }
      }
      handlers.onPartial(interim.trim());
    };

    recognition.onerror = (event) => {
      const handlers = this.handlers;
      if (!handlers) return;
      const copy = ERROR_COPY[event.error] ?? {
        message: 'Speech recognition hit an unexpected problem.',
        fatal: false,
      };
      const error: SpeechError = {
        code: (event.error as SpeechError['code']) ?? 'unknown',
        message: copy.message,
        fatal: copy.fatal,
      };
      if (copy.fatal) this.wantRunning = false;
      handlers.onError(error);
    };

    recognition.onend = () => {
      // Chrome ends the session after a pause; restart while the user is still going.
      if (!this.wantRunning) {
        this.handlers?.onEnd();
        return;
      }
      this.restarts += 1;
      if (this.restarts > 60) {
        this.wantRunning = false;
        this.handlers?.onError({
          code: 'unknown',
          message: 'Speech recognition kept dropping out and has been stopped.',
          fatal: true,
        });
        this.handlers?.onEnd();
        return;
      }
      this.restartTimer = setTimeout(() => {
        if (this.wantRunning) this.launch();
      }, 180);
    };

    try {
      recognition.start();
      this.recognition = recognition;
    } catch {
      // "already started" — the previous instance is still winding down.
      this.restartTimer = setTimeout(() => {
        if (this.wantRunning) this.launch();
      }, 320);
    }
  }

  stop(): void {
    this.wantRunning = false;
    if (this.restartTimer) clearTimeout(this.restartTimer);
    this.restartTimer = null;
    try {
      this.recognition?.stop();
    } catch {
      /* Already stopped. */
    }
  }

  abort(): void {
    this.wantRunning = false;
    if (this.restartTimer) clearTimeout(this.restartTimer);
    this.restartTimer = null;
    try {
      this.recognition?.abort();
    } catch {
      /* Already stopped. */
    }
    this.handlers?.onEnd();
  }
}
