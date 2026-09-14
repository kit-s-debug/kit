'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { SessionSummary } from '@/types';
import { getSessionRepository } from '@/lib/storage';
import { EmptyState, Tag } from '@/components/ui/misc';
import { formatDuration } from '@/lib/gamification';

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistoryList() {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getSessionRepository()
      .list()
      .then((list) => {
        if (!cancelled) setSessions(list);
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (sessions === null) {
    return (
      <div className="space-y-3" aria-busy="true">
        {[0, 1, 2].map((index) => (
          <div key={index} className="panel h-[88px] animate-pulse opacity-40" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        title="No sessions yet"
        body="Finish a freestyle and it will show up here with its full breakdown — score, rhyme highlights and transcript."
        action={{ href: '/freestyle', label: 'Start freestyling' }}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {sessions.map((session) => (
        <li key={session.id}>
          <Link
            href={`/history/${session.id}`}
            className="panel flex items-center gap-4 p-4 transition-colors hover:border-line"
          >
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line-soft bg-ink">
              <span className="tabular font-display text-xl font-black leading-none">
                {session.score}
              </span>
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="truncate font-display text-[15px] font-extrabold">
                  {session.beatName}
                </span>
                {session.demoMode ? <Tag tone="ai">Demo</Tag> : null}
              </span>
              <span className="tabular mt-1 block text-[12px] text-faint">
                {formatDate(session.createdAt)} · {session.bpm} BPM ·{' '}
                {formatDuration(session.durationSec)}
              </span>
              {session.bestRhyme ? (
                <span className="mt-1 block truncate text-[13px] text-muted">
                  Best rhyme: {session.bestRhyme}
                </span>
              ) : null}
            </span>

            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              aria-hidden="true"
              className="shrink-0 text-faint"
            >
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  );
}
