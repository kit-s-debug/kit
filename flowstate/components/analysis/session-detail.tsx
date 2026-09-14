'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { FreestyleSession, RhymeHighlight } from '@/types';
import { getSessionRepository } from '@/lib/storage';
import { ScoreDial } from '@/components/analysis/score-dial';
import { BreakdownBars } from '@/components/analysis/breakdown-bars';
import { Panel, SectionLabel } from '@/components/ui/panel';
import { EmptyState, Tag } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { formatDuration } from '@/lib/gamification';
import { challengeById } from '@/lib/challenges';

const HIGHLIGHT_LABEL: Record<RhymeHighlight['kind'], string> = {
  perfect: 'Perfect',
  near: 'Near',
  multi: 'Multi',
  assonance: 'Assonance',
  internal: 'Internal',
};

export function SessionDetail() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';

  const [session, setSession] = useState<FreestyleSession | null | 'loading'>('loading');
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // A blank id simply finds nothing, which renders the not-found state.
    void getSessionRepository()
      .get(id)
      .then((found) => {
        if (!cancelled) setSession(found);
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (session === 'loading') {
    return (
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="panel h-64 animate-pulse opacity-40" aria-busy="true" />
      </main>
    );
  }

  if (!session) {
    return (
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Session not found"
          body="This session is not on this device. History is stored locally, so it will not appear in another browser or after clearing site data."
          action={{ href: '/history', label: 'Back to history' }}
        />
      </main>
    );
  }

  const { analysis } = session;
  const challenge = session.challenge ? challengeById(session.challenge.challengeId) : undefined;
  const transcript = session.transcript.map((chunk) => chunk.text).join(' ').trim();

  const remove = async () => {
    await getSessionRepository().remove(session.id);
    setConfirmOpen(false);
    router.push('/history');
  };

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/history" className="text-[13px] text-muted hover:text-text">
        ← All sessions
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Tag tone="accent">{session.difficulty}</Tag>
        <Tag>{session.assist === 'off' ? 'No assist' : session.assist}</Tag>
        {session.demoMode ? <Tag tone="ai">Demo mode</Tag> : null}
        {analysis.aiEnriched ? <Tag tone="ai">AI review</Tag> : null}
      </div>

      <h1 className="mt-4 font-display text-[clamp(2rem,7vw,3rem)] font-black leading-[0.95]">
        {session.beatName}
      </h1>
      <p className="tabular mt-2 text-[14px] text-muted">
        {new Date(session.createdAt).toLocaleString()} · {session.bpm} BPM ·{' '}
        {formatDuration(session.actualDurationSec)}
      </p>

      <div className="mt-8">
        <ScoreDial score={analysis.overall} />
      </div>

      <Panel className="mt-8 p-5 sm:p-6">
        <SectionLabel>Breakdown</SectionLabel>
        <div className="mt-5">
          <BreakdownBars breakdown={analysis.breakdown} />
        </div>
      </Panel>

      {analysis.strongestMoment ? (
        <Panel className="mt-4 p-5 sm:p-6">
          <SectionLabel>Strongest moment</SectionLabel>
          <blockquote className="mt-3 border-l-2 border-accent pl-4">
            <p className="font-display text-[clamp(1.05rem,4vw,1.3rem)] font-bold leading-snug">
              “{analysis.strongestMoment.text}”
            </p>
          </blockquote>
          <p className="mt-3 text-[13px] text-muted">{analysis.strongestMoment.reason}</p>
        </Panel>
      ) : null}

      {analysis.highlights.length > 0 ? (
        <Panel className="mt-4 p-5 sm:p-6">
          <SectionLabel>Rhyme highlights</SectionLabel>
          <ul className="mt-4 flex flex-wrap gap-2">
            {analysis.highlights.map((highlight) => (
              <li
                key={`${highlight.kind}-${highlight.label}`}
                className="rounded-xl border border-line-soft bg-ink px-3 py-2 text-[14px]"
              >
                <span className="font-semibold">{highlight.label}</span>
                <span className="ml-2 text-[11px] uppercase tracking-[0.12em] text-faint">
                  {HIGHLIGHT_LABEL[highlight.kind]}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {analysis.observations.length > 0 ? (
        <Panel className="mt-4 p-5 sm:p-6">
          <SectionLabel>Improvement</SectionLabel>
          <ul className="mt-4 space-y-3">
            {analysis.observations.map((observation) => (
              <li key={observation} className="flex gap-3 text-[14px] leading-relaxed text-muted">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{observation}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {challenge && session.challenge ? (
        <Panel className="mt-4 p-5 sm:p-6">
          <SectionLabel>Challenge</SectionLabel>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-base font-extrabold">{challenge.title}</h2>
            <Tag tone={session.challenge.completed ? 'accent' : 'neutral'}>
              {session.challenge.completed ? 'Completed' : 'Not completed'}
            </Tag>
          </div>
        </Panel>
      ) : null}

      <Panel className="mt-4 p-5 sm:p-6">
        <SectionLabel>Transcript</SectionLabel>
        {transcript ? (
          <p className="mt-3 whitespace-pre-line text-[14px] leading-relaxed text-muted">
            {transcript}
          </p>
        ) : (
          <p className="mt-3 text-[14px] leading-relaxed text-faint">
            No transcript was kept for this session — transcript storage was switched off
            in Settings when it was recorded.
          </p>
        )}
      </Panel>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => router.push('/freestyle')}>Freestyle again</Button>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Delete session
        </Button>
      </div>

      <Sheet
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this session?"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={() => void remove()}>
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-[15px] leading-relaxed text-muted">
          This removes the session and its transcript from this device. It cannot be undone.
        </p>
      </Sheet>
    </main>
  );
}
