'use client';

import { useSessionStore } from '@/lib/store/session-store';
import { formatClock } from '@/lib/gamification';

/**
 * Large enough to read from arm's length, quiet enough to ignore.
 * Turns amber in the last ten seconds — the only moment it asks for attention.
 */
export function SessionTimer({ totalMs }: { totalMs: number }) {
  const remainingMs = useSessionStore((state) => state.remainingMs);
  const countIn = useSessionStore((state) => state.countInBars);

  const seconds = remainingMs / 1000;
  const ratio = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  const closing = seconds <= 10 && seconds > 0;

  return (
    <div className="flex items-center gap-3">
      <div
        className="h-1 w-16 overflow-hidden rounded-full bg-line-soft sm:w-24"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={Math.round(totalMs / 1000)}
        aria-valuenow={Math.round(seconds)}
        aria-label="Time remaining"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-200 ease-linear ${
            closing ? 'bg-live' : 'bg-accent'
          }`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <span
        className={`tabular font-display text-2xl font-extrabold leading-none sm:text-3xl ${
          closing ? 'text-live' : 'text-text'
        }`}
      >
        {countIn > 0 ? `${countIn}` : formatClock(seconds)}
      </span>
    </div>
  );
}
