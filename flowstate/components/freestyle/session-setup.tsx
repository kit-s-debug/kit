'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type {
  AssistLevel,
  Beat,
  DailyChallenge,
  Difficulty,
  MicPermission,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Segmented } from '@/components/ui/segmented';
import { Sheet } from '@/components/ui/sheet';
import { Tag } from '@/components/ui/misc';
import { SectionLabel } from '@/components/ui/panel';
import { BeatLibrary } from '@/components/beat-player/beat-library';
import { MicAnalyser } from '@/services/audio/mic';
import { useSpeechCapability } from '@/lib/hooks/use-environment';
import { categoryLabel } from '@/lib/beats';

const DIFFICULTIES: ReadonlyArray<{ value: Difficulty; label: string; hint: string }> = [
  {
    value: 'beginner',
    label: 'Beginner',
    hint: 'More suggestions, simpler rhymes, extra context to lean on.',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    hint: 'Fewer suggestions, a wider mix of near and multisyllabic rhymes.',
  },
  {
    value: 'expert',
    label: 'Expert',
    hint: 'Mostly multis and slant rhymes. Minimal assistance.',
  },
];

const ASSISTS: ReadonlyArray<{ value: AssistLevel; label: string; hint: string }> = [
  { value: 'off', label: 'Off', hint: 'Transcription and scoring only. Nothing on screen to lean on.' },
  { value: 'hints', label: 'Hints', hint: 'Rhyme words only — no lines written for you.' },
  { value: 'full', label: 'Full assist', hint: 'Rhymes plus short line starters you can say straight off the screen.' },
];

const DURATIONS = [
  { value: 30, label: '30s' },
  { value: 60, label: '60s' },
  { value: 120, label: '2 min' },
  { value: 300, label: '5 min' },
];

interface SessionSetupProps {
  beat: Beat;
  difficulty: Difficulty;
  assist: AssistLevel;
  durationSec: number;
  forceDemoMode: boolean;
  challenge: DailyChallenge | null;
  challengeAccepted: boolean;
  starting: boolean;
  onChange: (patch: {
    beatId?: string;
    difficulty?: Difficulty;
    assist?: AssistLevel;
    durationSec?: number;
    forceDemoMode?: boolean;
  }) => void;
  onToggleChallenge: (accepted: boolean) => void;
  onStart: () => void;
}

export function SessionSetup({
  beat,
  difficulty,
  assist,
  durationSec,
  forceDemoMode,
  challenge,
  challengeAccepted,
  starting,
  onChange,
  onToggleChallenge,
  onStart,
}: SessionSetupProps) {
  const [beatSheetOpen, setBeatSheetOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(
    !DURATIONS.some((option) => option.value === durationSec),
  );
  const [micPermission, setMicPermission] = useState<MicPermission>('unknown');
  const [checking, setChecking] = useState(false);
  const capability = useSpeechCapability();
  const speechSupported = capability.supported;
  const speechReason = capability.reason;

  useEffect(() => {
    // Asynchronous by nature, so this one does belong in an effect.
    void MicAnalyser.queryPermission().then(setMicPermission);
  }, []);

  const willBeDemo = forceDemoMode || !speechSupported;

  const checkMicrophone = async () => {
    setChecking(true);
    const analyser = new MicAnalyser();
    const result = await analyser.start();
    analyser.stop();
    setMicPermission(result.permission);
    setChecking(false);
  };

  return (
    <main id="main" className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-[clamp(2rem,7vw,2.75rem)] font-black leading-[0.95]">
          Set up your run
        </h1>
        <Link
          href="/"
          className="shrink-0 rounded-lg border border-line px-3 py-2 text-[13px] font-semibold text-muted transition-colors hover:text-text"
        >
          Back
        </Link>
      </div>

      {/* Beat ------------------------------------------------------- */}
      <section className="panel mt-8 p-4" aria-labelledby="setup-beat">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>Beat</SectionLabel>
          <button
            type="button"
            onClick={() => setBeatSheetOpen(true)}
            className="rounded-lg border border-line px-3 py-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-text"
          >
            Change
          </button>
        </div>
        <h2 id="setup-beat" className="mt-2 font-display text-xl font-extrabold">
          {beat.name}
        </h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-faint">
          <span className="tabular">{beat.bpm} BPM</span>
          <span aria-hidden="true">·</span>
          <span>{categoryLabel(beat.category)}</span>
          <span aria-hidden="true">·</span>
          <span className="normal-case tracking-normal text-muted">{beat.mood}</span>
        </p>
      </section>

      {/* Length ----------------------------------------------------- */}
      <section className="mt-6" aria-labelledby="setup-length">
        <SectionLabel>Length</SectionLabel>
        <h2 id="setup-length" className="sr-only">
          Session length
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {DURATIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={!customOpen && durationSec === option.value}
              onClick={() => {
                setCustomOpen(false);
                onChange({ durationSec: option.value });
              }}
              className={`min-w-[4.5rem] rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
                !customOpen && durationSec === option.value
                  ? 'border-accent/50 bg-accent/10 text-accent-soft'
                  : 'border-line-soft text-muted hover:border-line hover:text-text'
              }`}
            >
              {option.label}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={customOpen}
            onClick={() => setCustomOpen(true)}
            className={`min-w-[4.5rem] rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${
              customOpen
                ? 'border-accent/50 bg-accent/10 text-accent-soft'
                : 'border-line-soft text-muted hover:border-line hover:text-text'
            }`}
          >
            Custom
          </button>
        </div>

        {customOpen ? (
          <div className="panel mt-3 flex items-center gap-4 px-4 py-3.5">
            <label htmlFor="custom-duration" className="shrink-0 text-[13px] text-muted">
              Seconds
            </label>
            <input
              id="custom-duration"
              type="range"
              min={15}
              max={600}
              step={15}
              value={durationSec}
              onChange={(event) => onChange({ durationSec: Number(event.target.value) })}
              className="h-1.5 flex-1 accent-[#ff6a2b]"
            />
            <span className="tabular w-16 shrink-0 text-right font-display text-base font-extrabold">
              {Math.floor(durationSec / 60)}:{`${durationSec % 60}`.padStart(2, '0')}
            </span>
          </div>
        ) : null}
      </section>

      {/* Difficulty -------------------------------------------------- */}
      <section className="mt-8">
        <SectionLabel>Difficulty</SectionLabel>
        <div className="mt-3">
          <Segmented
            label="Difficulty"
            detailed
            value={difficulty}
            options={DIFFICULTIES}
            onChange={(value) => onChange({ difficulty: value })}
          />
        </div>
      </section>

      {/* Assistance --------------------------------------------------- */}
      <section className="mt-8">
        <SectionLabel>Assistance</SectionLabel>
        <div className="mt-3">
          <Segmented
            label="Assistance"
            detailed
            value={assist}
            options={ASSISTS}
            onChange={(value) => onChange({ assist: value })}
          />
        </div>
      </section>

      {/* Challenge ---------------------------------------------------- */}
      {challenge ? (
        <section className="mt-8">
          <SectionLabel>Today&rsquo;s challenge</SectionLabel>
          <label
            className={`panel mt-3 flex cursor-pointer items-start gap-3 p-4 transition-colors ${
              challengeAccepted ? 'border-accent/40' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={challengeAccepted}
              onChange={(event) => onToggleChallenge(event.target.checked)}
              className="mt-1 h-5 w-5 shrink-0 accent-[#ff6a2b]"
            />
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display text-base font-extrabold">{challenge.title}</span>
                <Tag tone="gold">+{challenge.xpReward} XP</Tag>
              </span>
              <span className="mt-1 block text-[13px] leading-relaxed text-muted">
                {challenge.description}
              </span>
              {durationSec < challenge.minDurationSec ? (
                <span className="mt-2 block text-[12px] text-gold">
                  Needs at least {challenge.minDurationSec}s to count.
                </span>
              ) : null}
            </span>
          </label>
        </section>
      ) : null}

      {/* Microphone --------------------------------------------------- */}
      <section className="mt-8">
        <SectionLabel>Microphone</SectionLabel>
        <div className="panel mt-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MicStatusPill permission={micPermission} demo={willBeDemo} />
            <button
              type="button"
              onClick={() => void checkMicrophone()}
              disabled={checking}
              className="rounded-lg border border-line px-3 py-2 text-[13px] font-semibold text-muted transition-colors hover:text-text disabled:opacity-50"
            >
              {checking ? 'Checking…' : 'Check microphone'}
            </button>
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Your microphone is only used while freestyle mode is active, and it is
            released the moment the session ends.
          </p>

          {!speechSupported ? (
            <p className="mt-3 rounded-xl border border-ai/25 bg-ai/5 px-3 py-2.5 text-[13px] leading-relaxed text-ai">
              {speechReason} Sessions will run in Demo Mode with a scripted transcript,
              clearly marked throughout.
            </p>
          ) : null}

          {speechSupported ? (
            <label className="mt-4 flex items-start gap-3">
              <input
                type="checkbox"
                checked={forceDemoMode}
                onChange={(event) => onChange({ forceDemoMode: event.target.checked })}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[#ff6a2b]"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">Run in Demo Mode</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted">
                  Uses a scripted transcript instead of your voice. Nothing is recorded and
                  the microphone is never opened.
                </span>
              </span>
            </label>
          ) : null}
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line-soft bg-void/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto max-w-2xl">
          <Button size="lg" fullWidth onClick={onStart} disabled={starting}>
            {starting ? 'Starting…' : willBeDemo ? 'Start Demo Freestyle' : 'Start Freestyle'}
          </Button>
        </div>
      </div>

      <Sheet
        open={beatSheetOpen}
        onClose={() => setBeatSheetOpen(false)}
        title="Choose a beat"
      >
        <BeatLibrary
          selectedId={beat.id}
          onSelect={(chosen) => {
            onChange({ beatId: chosen.id });
            setBeatSheetOpen(false);
          }}
        />
      </Sheet>
    </main>
  );
}

function MicStatusPill({
  permission,
  demo,
}: {
  permission: MicPermission;
  demo: boolean;
}) {
  if (demo) return <Tag tone="ai">Demo mode — mic not used</Tag>;
  switch (permission) {
    case 'granted':
      return <Tag tone="accent">Microphone ready</Tag>;
    case 'denied':
      return <Tag tone="live">Microphone blocked</Tag>;
    case 'unavailable':
      return <Tag tone="live">No microphone found</Tag>;
    case 'prompt':
      return <Tag>Permission will be requested</Tag>;
    default:
      return <Tag>Permission unknown</Tag>;
  }
}
