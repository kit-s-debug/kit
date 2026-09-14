'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { buildIdeas, detectTopic, findAnchor, findRhymes } from '@/lib/rhyme';
import type { IdeaSuggestion, RhymeSuggestion } from '@/types';

/**
 * A scripted line running through the real rhyme engine.
 *
 * The words below are typed out on a timer, but everything to the right of
 * them — the anchor, the rhymes, the line ideas — is computed live by the same
 * code the freestyle screen uses. It is a demonstration, not a mock-up, and it
 * is labelled as a preview rather than as live transcription.
 */
const SCRIPT = [
  "I've been working every day trying to make it",
  'never had a safety net, I had to chase it',
  "put the whole city on my back, I'm still standing",
  'turned the pressure into patience and I landed',
];

const TYPE_MS = 52;
const HOLD_MS = 2100;

export function HeroDemo() {
  const [lineIndex, setLineIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const line = SCRIPT[lineIndex] ?? '';
    if (reduce) {
      setCharCount(line.length);
      const hold = setTimeout(() => {
        setLineIndex((index) => (index + 1) % SCRIPT.length);
      }, HOLD_MS * 2);
      timers.current.push(hold);
      return () => clearTimeout(hold);
    }

    setCharCount(0);
    let char = 0;
    const interval = setInterval(() => {
      char += 1;
      setCharCount(char);
      if (char >= line.length) {
        clearInterval(interval);
        const hold = setTimeout(() => {
          setLineIndex((index) => (index + 1) % SCRIPT.length);
        }, HOLD_MS);
        timers.current.push(hold);
      }
    }, TYPE_MS);

    return () => {
      clearInterval(interval);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [lineIndex]);

  const visible = (SCRIPT[lineIndex] ?? '').slice(0, charCount);

  const { anchor, rhymes, ideas } = useMemo((): {
    anchor: string;
    rhymes: RhymeSuggestion[];
    ideas: IdeaSuggestion[];
  } => {
    const found = findAnchor(visible);
    if (!found) return { anchor: '', rhymes: [], ideas: [] };
    const topic = detectTopic(visible).topic;
    const found3 = findRhymes(found, { difficulty: 'beginner', topic, limit: 4 });
    return {
      anchor: found.phrase,
      rhymes: found3,
      ideas: buildIdeas(found3, { topic, limit: 2 }),
    };
  }, [visible]);

  return (
    <div className="panel relative overflow-hidden p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
          <span className="relative flex h-2 w-2">
            <span className="animate-live-ring absolute inset-0 rounded-full bg-accent" />
            <span className="relative h-2 w-2 rounded-full bg-accent" />
          </span>
          Preview
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
          92 BPM
        </span>
      </div>

      <p
        className="mt-4 min-h-[3.5rem] font-display text-[19px] font-bold leading-snug text-text sm:text-[22px]"
        aria-live="off"
      >
        {visible}
        <span className="ml-0.5 inline-block h-[1.1em] w-[3px] translate-y-[3px] bg-accent align-middle" />
      </p>

      <div className="mt-5 grid gap-4 border-t border-line-soft pt-5 sm:grid-cols-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
            Rhymes
          </div>
          <div className="mt-1.5 font-display text-sm font-extrabold uppercase tracking-[0.08em] text-accent">
            {anchor || '—'}
          </div>
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {rhymes.map((rhyme) => (
              <li
                key={rhyme.word}
                className="animate-bar-in rounded-lg border border-line-soft bg-ink px-2.5 py-1.5 text-[13px] font-semibold"
              >
                {rhyme.word}
              </li>
            ))}
            {rhymes.length === 0 ? (
              <li className="text-[13px] text-faint">listening…</li>
            ) : null}
          </ul>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
            Ideas
          </div>
          <ul className="mt-2.5 space-y-1.5">
            {ideas.map((idea) => (
              <li
                key={idea.text}
                className="animate-bar-in rounded-lg border border-line-soft bg-ink px-3 py-2 text-[13px] text-muted"
              >
                “{idea.text}”
              </li>
            ))}
            {ideas.length === 0 ? (
              <li className="text-[13px] text-faint">—</li>
            ) : null}
          </ul>
        </div>
      </div>
    </div>
  );
}
