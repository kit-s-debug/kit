/**
 * FLOWSTATE domain model.
 *
 * Everything the app persists or passes across a service boundary is declared
 * here so the storage layer, the AI layer and the UI agree on one shape.
 */

/* ------------------------------------------------------------------ beats */

export type BeatCategory =
  | 'boom-bap'
  | 'trap'
  | 'drill'
  | 'chill'
  | 'freestyle'
  | 'old-school';

export type BeatSource =
  /** Generated in the browser with the Web Audio API. No files, no licensing. */
  | { kind: 'synth'; pattern: string }
  /** A hosted audio file. Drop a royalty-free loop in /public/beats and point here. */
  | { kind: 'file'; url: string };

export interface Beat {
  id: string;
  name: string;
  bpm: number;
  category: BeatCategory;
  /** Two or three words. Shown as a chip under the beat name. */
  mood: string;
  /** Seconds. Synth beats loop, so this is the offered session length. */
  duration: number;
  source: BeatSource;
  /** Hue (0-360) used for the beat's accent colour in the UI. */
  hue: number;
  description: string;
}

/* -------------------------------------------------------------- settings */

export type Difficulty = 'beginner' | 'intermediate' | 'expert';
export type AssistLevel = 'off' | 'hints' | 'full';

export interface FreestyleSettings {
  difficulty: Difficulty;
  assist: AssistLevel;
  /** Session length in seconds. */
  durationSec: number;
  beatId: string;
  beatVolume: number;
  /** Force the scripted demo transcript even when live speech is available. */
  forceDemoMode: boolean;
  countInBars: number;
}

export interface AppPreferences {
  reducedMotion: boolean | null;
  keepTranscripts: boolean;
  onboardingComplete: boolean;
  metronomeClick: boolean;
}

/* ------------------------------------------------------------ transcript */

export interface TranscriptChunk {
  id: string;
  text: string;
  /** ms from session start */
  startMs: number;
  endMs: number;
  isFinal: boolean;
  /** 0-1 from the speech engine when it reports one. */
  confidence: number;
}

/** A transcript segmented against the beat grid. */
export interface Bar {
  index: number;
  text: string;
  startMs: number;
  endMs: number;
  words: string[];
  syllables: number;
  /** Rhyme key of the bar-ending word, if it could be resolved. */
  endRhymeKey: string | null;
  endWord: string | null;
}

/* ----------------------------------------------------------- suggestions */

export type RhymeKind = 'perfect' | 'near' | 'multi' | 'assonance';

export interface RhymeSuggestion {
  word: string;
  kind: RhymeKind;
  syllables: number;
  /** 0-1. Blend of phonetic closeness and topical fit. */
  score: number;
  /** True when the word was boosted because it matches the detected topic. */
  onTopic: boolean;
}

export interface IdeaSuggestion {
  text: string;
  /** Where the line came from, so the UI can label AI output honestly. */
  origin: 'local' | 'ai';
  rhymeWord?: string;
}

export interface SuggestionSet {
  /** The word/phrase the rhymes are answering. */
  anchor: string;
  anchorRhymeKey: string | null;
  rhymes: RhymeSuggestion[];
  ideas: IdeaSuggestion[];
  topic: TopicId | null;
  /** Monotonic counter — lets the UI drop out-of-order responses. */
  revision: number;
  source: 'local' | 'ai' | 'hybrid';
}

export type TopicId =
  | 'money'
  | 'ambition'
  | 'struggle'
  | 'confidence'
  | 'city'
  | 'time'
  | 'love'
  | 'party'
  | 'family'
  | 'mind'
  | 'craft';

/* -------------------------------------------------------------- analysis */

export interface ScoreBreakdown {
  rhymeQuality: number;
  flow: number;
  consistency: number;
  vocabulary: number;
  creativity: number;
  beatTiming: number;
}

export interface RhymeHighlight {
  kind: RhymeKind | 'internal';
  words: string[];
  barIndexes: number[];
  /** A short human label, e.g. "make it / take it". */
  label: string;
}

export interface StrongestMoment {
  text: string;
  barIndex: number;
  startMs: number;
  reason: string;
}

export interface PerformanceAnalysis {
  overall: number;
  breakdown: ScoreBreakdown;
  strongestMoment: StrongestMoment | null;
  highlights: RhymeHighlight[];
  observations: string[];
  stats: {
    wordCount: number;
    uniqueWords: number;
    bars: number;
    wordsPerMinute: number;
    avgSyllablesPerBar: number;
    longestRhymeChain: number;
    silenceRatio: number;
  };
  /** Analysis is local-first; true when an AI pass enriched the observations. */
  aiEnriched: boolean;
}

/* -------------------------------------------------------------- sessions */

export interface ChallengeResult {
  challengeId: string;
  completed: boolean;
  progress: number;
  goalLabel: string;
}

export interface FreestyleSession {
  id: string;
  createdAt: number;
  beatId: string;
  beatName: string;
  bpm: number;
  durationSec: number;
  actualDurationSec: number;
  difficulty: Difficulty;
  assist: AssistLevel;
  /** True when the transcript came from the scripted demo, not a microphone. */
  demoMode: boolean;
  transcript: TranscriptChunk[];
  bars: Bar[];
  analysis: PerformanceAnalysis;
  xpEarned: number;
  challenge: ChallengeResult | null;
}

/** What the history list needs, without dragging the whole transcript around. */
export interface SessionSummary {
  id: string;
  createdAt: number;
  beatName: string;
  bpm: number;
  durationSec: number;
  score: number;
  bestRhyme: string | null;
  demoMode: boolean;
}

/* --------------------------------------------------------- gamification */

export interface PlayerProfile {
  xp: number;
  level: number;
  totalSessions: number;
  totalSecondsFreestyled: number;
  personalBest: number;
  streakDays: number;
  lastSessionDay: string | null;
  completedChallengeIds: string[];
}

/* ------------------------------------------------------------ challenges */

export type ChallengeId =
  | 'rhyme-chain'
  | 'no-pause'
  | 'topic-switch'
  | 'multi'
  | 'vocab-stretch'
  | 'pocket';

export interface DailyChallenge {
  id: ChallengeId;
  title: string;
  description: string;
  goalLabel: string;
  difficulty: Difficulty;
  xpReward: number;
  /** Minimum session length that makes the challenge meaningful. */
  minDurationSec: number;
}

/* ------------------------------------------------------------- speech/AI */

export type SpeechEngineId = 'web-speech' | 'demo';

export interface SpeechCapability {
  supported: boolean;
  engine: SpeechEngineId;
  reason?: string;
}

export type MicPermission = 'unknown' | 'prompt' | 'granted' | 'denied' | 'unavailable';

export interface AIStatus {
  /** True when a server-side provider key is configured. */
  live: boolean;
  provider: string;
  /** Human-readable, shown in Settings. */
  detail: string;
}
