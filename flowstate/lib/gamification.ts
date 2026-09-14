/**
 * XP, levels and streaks.
 *
 * Tuned to be quiet: no confetti, no badges, no pressure. It exists so that
 * coming back tomorrow shows you something, and so a good run is recorded.
 */

import type { FreestyleSession, PlayerProfile } from '@/types';
import { dayKey } from '@/lib/challenges';

/** XP needed to reach each level. Gaps widen slowly rather than exponentially. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(220 * (level - 1) ** 1.45);
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (level < 60 && xp >= xpForLevel(level + 1)) level += 1;
  return level;
}

export interface LevelProgress {
  level: number;
  current: number;
  needed: number;
  ratio: number;
}

export function levelProgress(xp: number): LevelProgress {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const span = Math.max(1, ceiling - floor);
  return {
    level,
    current: xp - floor,
    needed: span,
    ratio: Math.max(0, Math.min(1, (xp - floor) / span)),
  };
}

export function xpForSession(session: FreestyleSession): number {
  const minutes = session.actualDurationSec / 60;
  const base = Math.round(minutes * 60);
  const performance = Math.round(session.analysis.overall * 0.9);
  const difficultyMultiplier =
    session.difficulty === 'expert' ? 1.35 : session.difficulty === 'intermediate' ? 1.15 : 1;
  const assistMultiplier =
    session.assist === 'off' ? 1.3 : session.assist === 'hints' ? 1.12 : 1;
  const challengeBonus = session.challenge?.completed ? 100 : 0;

  return Math.max(
    10,
    Math.round((base + performance) * difficultyMultiplier * assistMultiplier) + challengeBonus,
  );
}

function isConsecutiveDay(previous: string, today: string): boolean {
  const [py, pm, pd] = previous.split('-').map(Number);
  const [ty, tm, td] = today.split('-').map(Number);
  if (!py || !pm || !pd || !ty || !tm || !td) return false;
  const prevDate = Date.UTC(py, pm - 1, pd);
  const todayDate = Date.UTC(ty, tm - 1, td);
  return todayDate - prevDate === 86_400_000;
}

export function applySession(
  profile: PlayerProfile,
  session: FreestyleSession,
  today: string = dayKey(),
): { profile: PlayerProfile; xpEarned: number; leveledUp: boolean } {
  const xpEarned = xpForSession(session);
  const xp = profile.xp + xpEarned;
  const beforeLevel = levelFromXp(profile.xp);
  const afterLevel = levelFromXp(xp);

  let streakDays = profile.streakDays;
  if (profile.lastSessionDay === today) {
    streakDays = Math.max(1, streakDays);
  } else if (profile.lastSessionDay && isConsecutiveDay(profile.lastSessionDay, today)) {
    streakDays += 1;
  } else {
    streakDays = 1;
  }

  const completedChallengeIds = session.challenge?.completed
    ? Array.from(new Set([...profile.completedChallengeIds, session.challenge.challengeId]))
    : profile.completedChallengeIds;

  return {
    xpEarned,
    leveledUp: afterLevel > beforeLevel,
    profile: {
      xp,
      level: afterLevel,
      totalSessions: profile.totalSessions + 1,
      totalSecondsFreestyled: profile.totalSecondsFreestyled + session.actualDurationSec,
      personalBest: Math.max(profile.personalBest, session.analysis.overall),
      streakDays,
      lastSessionDay: today,
      completedChallengeIds,
    },
  };
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
}
