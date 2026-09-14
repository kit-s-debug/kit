'use client';

import type { Beat } from '@/types';
import { Wordmark } from '@/components/nav/wordmark';
import { SessionTimer } from '@/components/freestyle/session-timer';
import { BeatPulse } from '@/components/beat-player/beat-pulse';
import type { BeatEngine } from '@/services/audio/beat-engine';

export function StageHeader({
  beat,
  beatEngine,
  totalMs,
  active,
  onSettings,
  onExit,
}: {
  beat: Beat;
  beatEngine: BeatEngine | null;
  totalMs: number;
  active: boolean;
  onSettings: () => void;
  onExit: () => void;
}) {
  return (
    <header className="border-b border-line-soft bg-void/85 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <Wordmark className="shrink-0 scale-90 origin-left sm:scale-100" />
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onSettings}
              aria-label="Session settings"
              className="grid h-10 w-10 place-items-center rounded-xl border border-line text-muted transition-colors hover:text-text"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M19.4 13a7.9 7.9 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.9 7.9 0 0 0-1.7-1l-.4-2.5h-4l-.4 2.5c-.6.2-1.2.6-1.7 1l-2.3-1-2 3.4L6.6 11a7.9 7.9 0 0 0 0 2l-2 1.5 2 3.4 2.3-1c.5.4 1.1.8 1.7 1l.4 2.5h4l.4-2.5c.6-.2 1.2-.6 1.7-1l2.3 1 2-3.4-2-1.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={onExit}
              aria-label="Exit freestyle"
              className="grid h-10 w-10 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-live/50 hover:text-live"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-extrabold leading-tight">
                {beat.name}
              </p>
              <p className="tabular text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
                {beat.bpm} BPM
              </p>
            </div>
            <span className="hidden h-8 w-px bg-line-soft sm:block" />
            <div className="hidden sm:block">
              <BeatPulse beatEngine={beatEngine} hue={beat.hue} active={active} />
            </div>
          </div>
          <SessionTimer totalMs={totalMs} />
        </div>
      </div>
    </header>
  );
}
