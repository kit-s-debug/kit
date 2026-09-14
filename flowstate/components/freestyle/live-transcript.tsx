'use client';

import { useMemo } from 'react';
import { useSessionStore } from '@/lib/store/session-store';

/**
 * The words as they arrive.
 *
 * Finals are announced to assistive tech; the interim line is visual only,
 * because reading a half-formed phrase aloud on every keystroke would be
 * unusable. The most recent line is the largest — during a performance you are
 * glancing, not reading.
 */
export function LiveTranscript({ demoMode }: { demoMode: boolean }) {
  const chunks = useSessionStore((state) => state.chunks);
  const interim = useSessionStore((state) => state.interim);

  const recent = useMemo(() => chunks.slice(-3), [chunks]);
  const last = recent[recent.length - 1];
  const earlier = recent.slice(0, -1);

  const empty = recent.length === 0 && !interim;

  return (
    <section aria-label="Live transcript" className="min-h-[7.5rem]">
      <div className="flex items-center gap-2">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">
          Live transcript
        </h2>
        {demoMode ? (
          <span className="rounded-full border border-ai/30 bg-ai/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ai">
            Scripted
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-1">
        {earlier.map((chunk) => (
          <p key={chunk.id} className="truncate text-[14px] leading-snug text-faint">
            {chunk.text}
          </p>
        ))}

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {last?.text ?? ''}
        </p>

        <p
          aria-hidden="true"
          className="font-display text-[clamp(1.1rem,4.6vw,1.6rem)] font-bold leading-snug text-text"
        >
          {last?.text ? <span>{last.text} </span> : null}
          {interim ? <span className="text-accent">{interim}</span> : null}
          {empty ? (
            <span className="font-sans text-[15px] font-normal text-faint">
              {demoMode
                ? 'Demo transcript starting…'
                : 'Start rapping — your words appear here.'}
            </span>
          ) : null}
        </p>
      </div>
    </section>
  );
}
