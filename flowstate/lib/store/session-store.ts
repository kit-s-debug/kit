'use client';

/**
 * Live freestyle state.
 *
 * Kept apart from the app store because it changes constantly while a session
 * runs. Components subscribe to single fields, so a new interim word re-renders
 * the transcript line and nothing else. Anything updating at frame rate — the
 * waveform, the beat playhead — does not live here at all; it is read straight
 * off the engines by the component that draws it.
 */

import { create } from 'zustand';
import type {
  Beat,
  ChallengeResult,
  FreestyleSettings,
  MicPermission,
  PerformanceAnalysis,
  SpeechCapability,
  SuggestionSet,
  TranscriptChunk,
} from '@/types';

export type SessionPhase = 'setup' | 'starting' | 'countdown' | 'live' | 'finishing' | 'results';

export interface SessionError {
  title: string;
  body: string;
  kind: 'mic' | 'speech' | 'audio' | 'ai' | 'storage';
  recoverable: boolean;
  /** Show a one-tap switch to Demo Mode — the session continues either way. */
  offerDemo?: boolean;
}

interface SessionState {
  phase: SessionPhase;
  beat: Beat | null;
  settings: FreestyleSettings | null;

  chunks: TranscriptChunk[];
  interim: string;

  suggestions: SuggestionSet | null;
  aiPending: boolean;

  micPermission: MicPermission;
  micLive: boolean;
  speechCapability: SpeechCapability | null;
  /** True when the transcript is scripted rather than heard. */
  demoMode: boolean;

  remainingMs: number;
  elapsedMs: number;
  countInBars: number;
  currentBar: number;
  paused: boolean;

  errors: SessionError[];
  analysis: PerformanceAnalysis | null;
  challengeResult: ChallengeResult | null;
  xpEarned: number;
  savedSessionId: string | null;

  setPhase: (phase: SessionPhase) => void;
  reset: () => void;
  pushError: (error: SessionError) => void;
  dismissError: (index: number) => void;
}

const INITIAL = {
  phase: 'setup' as SessionPhase,
  beat: null,
  settings: null,
  chunks: [] as TranscriptChunk[],
  interim: '',
  suggestions: null,
  aiPending: false,
  micPermission: 'unknown' as MicPermission,
  micLive: false,
  speechCapability: null,
  demoMode: false,
  remainingMs: 0,
  elapsedMs: 0,
  countInBars: 0,
  currentBar: 0,
  paused: false,
  errors: [] as SessionError[],
  analysis: null,
  challengeResult: null,
  xpEarned: 0,
  savedSessionId: null,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...INITIAL,

  setPhase: (phase) => set({ phase }),

  reset: () => set({ ...INITIAL }),

  pushError: (error) =>
    set((state) => {
      // Never stack the same message twice — one notice per problem.
      if (state.errors.some((existing) => existing.title === error.title)) return state;
      return { errors: [...state.errors, error] };
    }),

  dismissError: (index) =>
    set((state) => ({ errors: state.errors.filter((_, i) => i !== index) })),
}));

/** Direct handle for the controller, which writes outside of React. */
export const sessionStore = useSessionStore;
