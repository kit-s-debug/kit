'use client';

import Link from 'next/link';
import { CHALLENGES, challengeForDay, dayKey } from '@/lib/challenges';
import { useAppStore } from '@/lib/store/app-store';
import { Panel, SectionLabel } from '@/components/ui/panel';
import { Tag } from '@/components/ui/misc';
import { ProfileStrip } from '@/components/dashboard/profile-strip';

const DIFFICULTY_TONE = {
  beginner: 'accent',
  intermediate: 'ai',
  expert: 'gold',
} as const;

export function ChallengeBoard() {
  const today = challengeForDay(dayKey());
  const completed = useAppStore((state) => state.profile.completedChallengeIds);
  const hydrated = useAppStore((state) => state.hydrated);

  return (
    <div className="space-y-6">
      <Panel className="relative overflow-hidden p-5 sm:p-6">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-28 opacity-30"
          style={{
            background:
              'radial-gradient(100% 100% at 15% 0%, rgba(255,106,43,0.6), transparent 70%)',
          }}
        />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <SectionLabel>Today</SectionLabel>
            <Tag tone={DIFFICULTY_TONE[today.difficulty]}>{today.difficulty}</Tag>
            <Tag tone="gold">+{today.xpReward} XP</Tag>
          </div>
          <h2 className="mt-3 font-display text-[clamp(1.6rem,6vw,2.25rem)] font-black leading-tight">
            {today.title}
          </h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
            {today.description}
          </p>
          <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">
            Goal · {today.goalLabel} · minimum {today.minDurationSec}s
          </p>
          <Link
            href="/freestyle"
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-accent px-6 text-sm font-bold text-[#180700] transition-colors hover:bg-accent-soft"
          >
            Take it on
          </Link>
        </div>
      </Panel>

      <ProfileStrip />

      <section>
        <SectionLabel>All challenges</SectionLabel>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {CHALLENGES.map((challenge) => {
            const done = hydrated && completed.includes(challenge.id);
            return (
              <li key={challenge.id} className="panel p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-[15px] font-extrabold">{challenge.title}</h3>
                  {done ? <Tag tone="accent">Done</Tag> : null}
                  {challenge.id === today.id ? <Tag tone="gold">Live today</Tag> : null}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {challenge.description}
                </p>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
                  {challenge.goalLabel} · {challenge.difficulty} · +{challenge.xpReward} XP
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
