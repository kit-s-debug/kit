/**
 * Scripted transcript for Demo Mode.
 *
 * This exists so the product can be shown end to end on a browser with no
 * speech recognition, or with no microphone at all. It is never presented as
 * live transcription: every surface that can show demo text is labelled
 * DEMO MODE, and the session is stored with `demoMode: true` so the history
 * and the scores stay truthful.
 */

import type { SpeechCapability, SpeechEngineId } from '@/types';
import type { SpeechEngine, SpeechHandlers } from './types';

interface ScriptLine {
  text: string;
  /** Gap before this line, in ms. */
  gap: number;
}

/**
 * Written to exercise the engine rather than to flatter it: topic shifts,
 * multis, "-ing" endings and a couple of ordinary lines with nothing clever
 * in them, which is what a real freestyle sounds like.
 */
const SCRIPTS: ScriptLine[][] = [
  [
    { text: "I've been up since the morning", gap: 900 },
    { text: 'working on a vision that I never stopped forming', gap: 1500 },
    { text: 'they said the odds was low but I never took warning', gap: 1600 },
    { text: 'now the same ones watching, quiet in the corner', gap: 1700 },
    { text: "I've been chasing money but the money ain't the meaning", gap: 1800 },
    { text: "every early morning got a purpose that I'm keeping", gap: 1700 },
    { text: 'city never sleeping so I taught myself the timing', gap: 1700 },
    { text: "turned the pressure into patience and I'm still climbing", gap: 1800 },
    { text: 'nobody handed me a thing, I had to make it', gap: 1600 },
    { text: 'put the whole heart in the booth, I never fake it', gap: 1700 },
  ],
  [
    { text: 'started in the basement with a cheap microphone', gap: 1000 },
    { text: 'writing till the morning in a room on my own', gap: 1600 },
    { text: 'every single bar was a brick in the stone', gap: 1600 },
    { text: 'now the flow is second nature, feel it in my bones', gap: 1700 },
    { text: 'they want the finished picture, never seen the grinding', gap: 1800 },
    { text: 'hours in the dark before anybody finding', gap: 1700 },
    { text: 'so I keep it moving, never worried what they saying', gap: 1700 },
    { text: 'still the same person, just better at the playing', gap: 1800 },
  ],
  [
    { text: 'cold outside and the streetlights glowing', gap: 900 },
    { text: 'walking through the city with the whole world showing', gap: 1500 },
    { text: 'everybody talking but they never really knowing', gap: 1600 },
    { text: 'what it takes to keep a quiet kind of going', gap: 1700 },
    { text: 'family on my shoulders and I carry it proudly', gap: 1800 },
    { text: 'never say it softly when I say it I say it loudly', gap: 1700 },
    { text: 'one more verse and the doubt is getting smaller', gap: 1700 },
    { text: 'started at the bottom now the ceiling getting taller', gap: 1800 },
  ],
];

export class DemoSpeechEngine implements SpeechEngine {
  readonly id: SpeechEngineId = 'demo';
  readonly capability: SpeechCapability = {
    supported: true,
    engine: 'demo',
    reason: 'Scripted transcript — no microphone audio is being transcribed.',
  };

  private timers: ReturnType<typeof setTimeout>[] = [];
  private handlers: SpeechHandlers | null = null;
  private startedAt = 0;
  private running = false;

  constructor(private scriptIndex = Math.floor(Math.random() * SCRIPTS.length)) {}

  start(handlers: SpeechHandlers): void {
    this.handlers = handlers;
    this.running = true;
    this.startedAt = performance.now();

    const script = SCRIPTS[this.scriptIndex % SCRIPTS.length] ?? SCRIPTS[0]!;
    let clock = 600;

    script.forEach((line) => {
      clock += line.gap;
      const words = line.text.split(' ');
      // Reveal the line word by word so it behaves like interim results.
      const perWord = Math.max(110, line.gap / (words.length + 2));
      words.forEach((_, index) => {
        const partial = words.slice(0, index + 1).join(' ');
        this.timers.push(
          setTimeout(() => {
            if (this.running) this.handlers?.onPartial(partial);
          }, clock + index * perWord),
        );
      });
      const settleAt = clock + words.length * perWord + 80;
      this.timers.push(
        setTimeout(() => {
          if (!this.running) return;
          this.handlers?.onPartial('');
          this.handlers?.onFinal({
            text: line.text,
            confidence: 0.93,
            atMs: performance.now() - this.startedAt,
          });
        }, settleAt),
      );
      clock = settleAt;
    });

    // Loop the script so longer sessions keep producing material.
    this.timers.push(
      setTimeout(() => {
        if (!this.running) return;
        this.scriptIndex += 1;
        this.clearTimers();
        if (this.handlers) this.start(this.handlers);
      }, clock + 2200),
    );
  }

  private clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  stop(): void {
    this.running = false;
    this.clearTimers();
    this.handlers?.onEnd();
  }

  abort(): void {
    this.stop();
  }
}
