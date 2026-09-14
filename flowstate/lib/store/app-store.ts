'use client';

/**
 * App-wide state: settings, preferences, profile, AI status.
 *
 * Deliberately separate from the live freestyle state, which changes many
 * times a second. Components subscribe to narrow slices so that a transcript
 * update never re-renders the settings sheet.
 */

import { create } from 'zustand';
import type {
  AIStatus,
  AppPreferences,
  FreestyleSession,
  FreestyleSettings,
  PlayerProfile,
} from '@/types';
import {
  DEFAULT_PREFERENCES,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
  getSessionRepository,
  loadPreferences,
  loadProfile,
  loadSettings,
  savePreferences,
  saveProfile,
  saveSettings,
  storageAvailable,
  wipeAllData,
} from '@/lib/storage';
import { applySession } from '@/lib/gamification';
import { fetchAIStatus } from '@/services/ai/client';

const OFFLINE_STATUS: AIStatus = {
  live: false,
  provider: 'local',
  detail:
    'Running on the on-device engine. Rhymes, scoring and topic detection all happen in your browser.',
};

interface AppState {
  hydrated: boolean;
  storageOk: boolean;
  settings: FreestyleSettings;
  preferences: AppPreferences;
  profile: PlayerProfile;
  aiStatus: AIStatus;
  aiStatusLoaded: boolean;

  hydrate: () => void;
  updateSettings: (patch: Partial<FreestyleSettings>) => void;
  updatePreferences: (patch: Partial<AppPreferences>) => void;
  recordSession: (session: FreestyleSession) => Promise<{ xpEarned: number; leveledUp: boolean }>;
  resetProgress: () => void;
  clearAllData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  storageOk: true,
  settings: DEFAULT_SETTINGS,
  preferences: DEFAULT_PREFERENCES,
  profile: DEFAULT_PROFILE,
  aiStatus: OFFLINE_STATUS,
  aiStatusLoaded: false,

  hydrate: () => {
    if (get().hydrated) return;
    set({
      hydrated: true,
      storageOk: storageAvailable(),
      settings: loadSettings(),
      preferences: loadPreferences(),
      profile: loadProfile(),
    });

    void fetchAIStatus().then((aiStatus) => set({ aiStatus, aiStatusLoaded: true }));
  },

  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    set({ settings });
    saveSettings(settings);
  },

  updatePreferences: (patch) => {
    const preferences = { ...get().preferences, ...patch };
    set({ preferences });
    savePreferences(preferences);
  },

  recordSession: async (session) => {
    const repository = getSessionRepository();
    const { preferences, profile } = get();

    // Honour the "do not keep transcripts" switch before anything is written.
    const toStore: FreestyleSession = preferences.keepTranscripts
      ? session
      : { ...session, transcript: [], bars: session.bars.map((bar) => ({ ...bar, text: '', words: [] })) };

    await repository.save(toStore);

    const result = applySession(profile, session);
    set({ profile: result.profile });
    saveProfile(result.profile);
    return { xpEarned: result.xpEarned, leveledUp: result.leveledUp };
  },

  resetProgress: () => {
    set({ profile: DEFAULT_PROFILE });
    saveProfile(DEFAULT_PROFILE);
  },

  clearAllData: async () => {
    await getSessionRepository().clear();
    wipeAllData();
    set({
      settings: DEFAULT_SETTINGS,
      preferences: { ...DEFAULT_PREFERENCES, onboardingComplete: true },
      profile: DEFAULT_PROFILE,
    });
    savePreferences({ ...DEFAULT_PREFERENCES, onboardingComplete: true });
  },
}));
