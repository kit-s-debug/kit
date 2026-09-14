/**
 * Persistence.
 *
 * Sessions live in localStorage behind a repository interface. Everything the
 * app touches goes through `SessionRepository`, so moving to a database later
 * means writing one more implementation and changing one line in
 * `getSessionRepository` — no component knows where the data lives.
 */

import type {
  AppPreferences,
  FreestyleSession,
  FreestyleSettings,
  PlayerProfile,
  SessionSummary,
} from '@/types';
import { DEFAULT_BEAT_ID } from '@/lib/beats';

const KEYS = {
  sessions: 'flowstate.sessions.v1',
  profile: 'flowstate.profile.v1',
  settings: 'flowstate.settings.v1',
  prefs: 'flowstate.prefs.v1',
  challengeDay: 'flowstate.challenge.v1',
} as const;

/** Cap growth so a heavy user never hits the storage quota. */
const MAX_SESSIONS = 120;

export const DEFAULT_SETTINGS: FreestyleSettings = {
  difficulty: 'beginner',
  assist: 'full',
  durationSec: 60,
  beatId: DEFAULT_BEAT_ID,
  beatVolume: 0.75,
  forceDemoMode: false,
  countInBars: 1,
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  reducedMotion: null,
  hapticsEnabled: true,
  keepTranscripts: true,
  onboardingComplete: false,
  metronomeClick: false,
};

export const DEFAULT_PROFILE: PlayerProfile = {
  xp: 0,
  level: 1,
  totalSessions: 0,
  totalSecondsFreestyled: 0,
  personalBest: 0,
  streakDays: 0,
  lastSessionDay: null,
  completedChallengeIds: [],
};

function hasStorage(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const probe = '__flowstate__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    // Private browsing, disabled storage, or a quota of zero.
    return false;
  }
}

function read<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object') return fallback;
    return { ...fallback, ...(parsed as object) } as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  if (!hasStorage()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ---------------------------------------------------------- sessions ---- */

export interface SessionRepository {
  list(): Promise<SessionSummary[]>;
  get(id: string): Promise<FreestyleSession | null>;
  save(session: FreestyleSession): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
  isAvailable(): boolean;
}

function toSummary(session: FreestyleSession): SessionSummary {
  const best = session.analysis.highlights[0]?.label ?? null;
  return {
    id: session.id,
    createdAt: session.createdAt,
    beatName: session.beatName,
    bpm: session.bpm,
    durationSec: session.actualDurationSec,
    score: session.analysis.overall,
    bestRhyme: best,
    demoMode: session.demoMode,
  };
}

class LocalSessionRepository implements SessionRepository {
  isAvailable(): boolean {
    return hasStorage();
  }

  private readAll(): FreestyleSession[] {
    if (!hasStorage()) return [];
    try {
      const raw = window.localStorage.getItem(KEYS.sessions);
      if (!raw) return [];
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isSession);
    } catch {
      return [];
    }
  }

  async list(): Promise<SessionSummary[]> {
    return this.readAll()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(toSummary);
  }

  async get(id: string): Promise<FreestyleSession | null> {
    return this.readAll().find((session) => session.id === id) ?? null;
  }

  async save(session: FreestyleSession): Promise<void> {
    const all = this.readAll().filter((item) => item.id !== session.id);
    all.unshift(session);
    const trimmed = all.slice(0, MAX_SESSIONS);
    if (!write(KEYS.sessions, trimmed)) {
      // Quota hit: keep the most recent handful rather than losing everything.
      write(KEYS.sessions, trimmed.slice(0, 20));
    }
  }

  async remove(id: string): Promise<void> {
    write(KEYS.sessions, this.readAll().filter((session) => session.id !== id));
  }

  async clear(): Promise<void> {
    if (!hasStorage()) return;
    window.localStorage.removeItem(KEYS.sessions);
  }
}

function isSession(value: unknown): value is FreestyleSession {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<FreestyleSession>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.createdAt === 'number' &&
    typeof candidate.beatName === 'string' &&
    typeof candidate.analysis === 'object' &&
    candidate.analysis !== null
  );
}

let repository: SessionRepository | null = null;

export function getSessionRepository(): SessionRepository {
  repository ??= new LocalSessionRepository();
  return repository;
}

/* ------------------------------------------------- settings & profile --- */

export function loadSettings(): FreestyleSettings {
  const stored = read<FreestyleSettings>(KEYS.settings, DEFAULT_SETTINGS);
  return {
    ...stored,
    durationSec: Math.max(15, Math.min(1800, Number(stored.durationSec) || 60)),
    beatVolume: Math.max(0, Math.min(1, Number(stored.beatVolume) || 0.75)),
  };
}

export function saveSettings(settings: FreestyleSettings): void {
  write(KEYS.settings, settings);
}

export function loadPreferences(): AppPreferences {
  return read<AppPreferences>(KEYS.prefs, DEFAULT_PREFERENCES);
}

export function savePreferences(prefs: AppPreferences): void {
  write(KEYS.prefs, prefs);
}

export function loadProfile(): PlayerProfile {
  return read<PlayerProfile>(KEYS.profile, DEFAULT_PROFILE);
}

export function saveProfile(profile: PlayerProfile): void {
  write(KEYS.profile, profile);
}

export function loadChallengeState(): { day: string | null; completed: boolean } {
  return read<{ day: string | null; completed: boolean }>(KEYS.challengeDay, {
    day: null,
    completed: false,
  });
}

export function saveChallengeState(state: { day: string; completed: boolean }): void {
  write(KEYS.challengeDay, state);
}

export function storageAvailable(): boolean {
  return hasStorage();
}

/** Used by the "delete everything" control in settings. */
export function wipeAllData(): void {
  if (!hasStorage()) return;
  Object.values(KEYS).forEach((key) => window.localStorage.removeItem(key));
}
