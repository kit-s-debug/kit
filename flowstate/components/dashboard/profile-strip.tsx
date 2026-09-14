'use client';

import { useAppStore } from '@/lib/store/app-store';
import { formatDuration, levelProgress } from '@/lib/gamification';

/**
 * Progress, kept deliberately quiet. No badges, no confetti — just the numbers
 * that tell you whether you are turning up.
 */
export function ProfileStrip() {
  const hydrated = useAppStore((state) => state.hydrated);
  const profile = useAppStore((state) => state.profile);

  if (!hydrated) {
    return <div className="panel h-[104px] animate-pulse opacity-40" aria-hidden="true" />;
  }

  const progress = levelProgress(profile.xp);

  return (
    <section className="panel p-5" aria-label="Your progress">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">Level</p>
          <p className="tabular font-display text-3xl font-black leading-none">
            {progress.level}
          </p>
        </div>
        <dl className="flex flex-wrap gap-x-7 gap-y-3">
          {[
            { label: 'Streak', value: `${profile.streakDays}d` },
            { label: 'Sessions', value: String(profile.totalSessions) },
            { label: 'Best', value: String(profile.personalBest) },
            { label: 'Time', value: formatDuration(profile.totalSecondsFreestyled) },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                {stat.label}
              </dt>
              <dd className="tabular mt-0.5 font-display text-lg font-extrabold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4">
        <div className="h-1.5 overflow-hidden rounded-full bg-line-soft">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-[width] duration-500"
            style={{ width: `${Math.max(2, progress.ratio * 100)}%` }}
          />
        </div>
        <p className="tabular mt-2 text-[12px] text-faint">
          {progress.current} / {progress.needed} XP to level {progress.level + 1}
        </p>
      </div>
    </section>
  );
}
