'use client';

import Link from 'next/link';
import type {
  ChallengeResult,
  DailyChallenge,
  PerformanceAnalysis,
  RhymeHighlight,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Panel, SectionLabel } from '@/components/ui/panel';
import { Tag, ThinkingDots } from '@/components/ui/misc';
import { ScoreDial } from '@/components/analysis/score-dial';
import { BreakdownBars } from '@/components/analysis/breakdown-bars';
import { formatDuration } from '@/lib/gamification';

const HIGHLIGHT_LABEL: Record<RhymeHighlight['kind'], string> = {
  perfect: 'Perfect',
  near: 'Near',
  multi: 'Multi',
  assonance: 'Assonance',
  internal: 'Internal',
};

const HIGHLIGHT_TONE: Record<RhymeHighlight['kind'], 'accent' | 'ai' | 'gold' | 'neutral'> = {
  perfect: 'accent',
  multi: 'gold',
  near: 'ai',
  internal: 'gold',
  assonance: 'neutral',
};

interface ResultsScreenProps {
  analysis: PerformanceAnalysis;
  beatName: string;
  bpm: number;
  durationSec: number;
  demoMode: boolean;
  xpEarned: number;
  leveledUp: boolean;
  challenge: DailyChallenge | null;
  challengeResult: ChallengeResult | null;
  savedSessionId: string | null;
  storageOk: boolean;
  onAgain: () => void;
  onChangeSetup: () => void;
}

export function ResultsScreen({
  analysis,
  beatName,
  bpm,
  durationSec,
  demoMode,
  xpEarned,
  leveledUp,
  challenge,
  challengeResult,
  savedSessionId,
  storageOk,
  onAgain,
  onChangeSetup,
}: ResultsScreenProps) {
  const thin = analysis.stats.wordCount < 8;

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone="accent">Freestyle complete</Tag>
        {demoMode ? <Tag tone="ai">Demo mode</Tag> : null}
        {analysis.aiEnriched ? <Tag tone="ai">AI review</Tag> : null}
      </div>

      <h1 className="text-balance-tight mt-4 font-display text-[clamp(2rem,7.5vw,3.25rem)] font-black leading-[0.95]">
        {thin ? 'Not much to score' : 'Here is how that ran'}
      </h1>
      <p className="mt-2.5 text-[14px] text-muted">
        {beatName} · <span className="tabular">{bpm} BPM</span> ·{' '}
        {formatDuration(durationSec)}
      </p>

      {thin ? (
        <Panel className="mt-8 p-6">
          <p className="text-[15px] leading-relaxed text-muted">
            Only {analysis.stats.wordCount} word
            {analysis.stats.wordCount === 1 ? '' : 's'} came through, which is not enough to
            score fairly. If the microphone was not picking you up, check the permission
            and your input device — or run a session in Demo Mode to see the full flow.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={onAgain}>Try again</Button>
            <Button variant="secondary" onClick={onChangeSetup}>
              Change setup
            </Button>
          </div>
        </Panel>
      ) : (
        <>
          <div className="mt-8">
            <ScoreDial score={analysis.overall} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-center">
            <span className="rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-gold">
              +{xpEarned} XP
            </span>
            {leveledUp ? (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.14em] text-accent-soft">
                Level up
              </span>
            ) : null}
          </div>

          <Panel className="mt-8 p-5 sm:p-6">
            <SectionLabel>Breakdown</SectionLabel>
            <div className="mt-5">
              <BreakdownBars breakdown={analysis.breakdown} />
            </div>
          </Panel>

          {analysis.strongestMoment ? (
            <Panel className="mt-4 p-5 sm:p-6">
              <SectionLabel>Your strongest moment</SectionLabel>
              <blockquote className="mt-3 border-l-2 border-accent pl-4">
                <p className="font-display text-[clamp(1.05rem,4vw,1.35rem)] font-bold leading-snug">
                  “{analysis.strongestMoment.text}”
                </p>
              </blockquote>
              <p className="mt-3 text-[13px] leading-relaxed text-muted">
                Bar {analysis.strongestMoment.barIndex + 1} — {analysis.strongestMoment.reason}
              </p>
            </Panel>
          ) : null}

          {analysis.highlights.length > 0 ? (
            <Panel className="mt-4 p-5 sm:p-6">
              <SectionLabel>Rhyme highlights</SectionLabel>
              <ul className="mt-4 space-y-2">
                {analysis.highlights.map((highlight) => (
                  <li
                    key={`${highlight.kind}-${highlight.label}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line-soft bg-ink px-3.5 py-3"
                  >
                    <span className="min-w-0 truncate text-[15px] font-semibold">
                      {highlight.label}
                    </span>
                    <Tag tone={HIGHLIGHT_TONE[highlight.kind]}>
                      {HIGHLIGHT_LABEL[highlight.kind]}
                    </Tag>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <Panel className="mt-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <SectionLabel>Improvement</SectionLabel>
              {analysis.observations.length === 0 ? <ThinkingDots label="Reading" /> : null}
            </div>
            <ul className="mt-4 space-y-3">
              {analysis.observations.map((observation) => (
                <li key={observation} className="flex gap-3 text-[14px] leading-relaxed text-muted">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{observation}</span>
                </li>
              ))}
            </ul>
          </Panel>

          {challenge && challengeResult ? (
            <Panel className="mt-4 p-5 sm:p-6">
              <SectionLabel>Daily challenge</SectionLabel>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h3 className="font-display text-lg font-extrabold">{challenge.title}</h3>
                <Tag tone={challengeResult.completed ? 'accent' : 'neutral'}>
                  {challengeResult.completed ? 'Completed' : 'Not this time'}
                </Tag>
              </div>
              <p className="mt-2 text-[13px] text-muted">{challengeResult.goalLabel}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line-soft">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.max(2, challengeResult.progress * 100)}%` }}
                />
              </div>
              <p className="tabular mt-2 text-[12px] text-faint">
                {Math.round(challengeResult.progress * 100)}% of the goal
              </p>
            </Panel>
          ) : null}

          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Words', value: analysis.stats.wordCount },
              { label: 'Bars', value: analysis.stats.bars },
              { label: 'Words / min', value: analysis.stats.wordsPerMinute },
              { label: 'Longest chain', value: `${analysis.stats.longestRhymeChain} bars` },
            ].map((stat) => (
              <div key={stat.label} className="panel px-4 py-3.5">
                <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                  {stat.label}
                </dt>
                <dd className="tabular mt-1 font-display text-xl font-extrabold">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          {!storageOk ? (
            <p className="mt-4 rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-[13px] leading-relaxed text-gold">
              This session could not be saved — your browser is blocking local storage
              (private browsing often does). Everything above is still accurate for this run.
            </p>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1" onClick={onAgain}>
              Go again
            </Button>
            <Button variant="secondary" size="lg" className="flex-1" onClick={onChangeSetup}>
              Change setup
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13px]">
            {savedSessionId && storageOk ? (
              <Link href={`/history/${savedSessionId}`} className="text-muted hover:text-text">
                View this session
              </Link>
            ) : null}
            <Link href="/history" className="text-muted hover:text-text">
              All sessions
            </Link>
            <Link href="/" className="text-muted hover:text-text">
              Home
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
