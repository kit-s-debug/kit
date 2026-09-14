'use client';

import { useState } from 'react';
import type { AssistLevel, Beat } from '@/types';
import { useSessionStore } from '@/lib/store/session-store';
import { StageHeader } from '@/components/freestyle/stage-header';
import { MicOrb, type OrbState } from '@/components/freestyle/mic-orb';
import { LiveTranscript } from '@/components/freestyle/live-transcript';
import { SuggestionPanel } from '@/components/ai-suggestions/suggestion-panel';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Segmented } from '@/components/ui/segmented';
import { ErrorNotice } from '@/components/ui/misc';
import type { FreestyleController } from '@/lib/freestyle/controller';

const ASSIST_OPTIONS = [
  { value: 'off' as const, label: 'Off' },
  { value: 'hints' as const, label: 'Hints' },
  { value: 'full' as const, label: 'Full' },
];

interface LiveStageProps {
  controller: FreestyleController;
  beat: Beat;
  totalMs: number;
  assist: AssistLevel;
  volume: number;
  onAssistChange: (assist: AssistLevel) => void;
  onVolumeChange: (volume: number) => void;
  onExit: () => void;
  onFinish: () => void;
}

export function LiveStage({
  controller,
  beat,
  totalMs,
  assist,
  volume,
  onAssistChange,
  onVolumeChange,
  onExit,
  onFinish,
}: LiveStageProps) {
  const phase = useSessionStore((state) => state.phase);
  const paused = useSessionStore((state) => state.paused);
  const demoMode = useSessionStore((state) => state.demoMode);
  const micLive = useSessionStore((state) => state.micLive);
  const countIn = useSessionStore((state) => state.countInBars);
  const errors = useSessionStore((state) => state.errors);
  const dismissError = useSessionStore((state) => state.dismissError);

  const [settingsOpen, setSettingsOpen] = useState(false);

  const orbState: OrbState = paused
    ? 'paused'
    : demoMode
      ? 'demo'
      : micLive && phase === 'live'
        ? 'listening'
        : 'idle';

  return (
    <div className="flex min-h-dvh flex-col">
      <StageHeader
        beat={beat}
        beatEngine={controller.beatEngine}
        totalMs={totalMs}
        active={phase === 'live' && !paused}
        onSettings={() => setSettingsOpen(true)}
        onExit={onExit}
      />

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-3 sm:px-6 sm:pb-32 sm:pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill demoMode={demoMode} micLive={micLive} paused={paused} />
          <span className="rounded-full border border-line-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-faint">
            {assist === 'off' ? 'No assist' : assist === 'hints' ? 'Hints' : 'Full assist'}
          </span>
        </div>

        {errors.length > 0 ? (
          <div className="mt-4 space-y-2">
            {errors.map((error, index) => (
              <ErrorNotice
                key={error.title}
                title={error.title}
                body={error.body}
                actions={
                  <>
                    {error.offerDemo && !demoMode ? (
                      <button
                        type="button"
                        onClick={() => controller.switchToDemo()}
                        className="rounded-lg border border-ai/40 bg-ai/10 px-3 py-1.5 text-[12px] font-semibold text-ai transition-colors hover:bg-ai/20"
                      >
                        Switch to Demo Mode
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => dismissError(index)}
                      className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-text"
                    >
                      Dismiss
                    </button>
                  </>
                }
              />
            ))}
          </div>
        ) : null}

        <div className="mt-3 grid gap-4 sm:mt-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
          <div>
            <div className="relative">
              <MicOrb
                state={orbState}
                mic={controller.mic}
                beatEngine={controller.beatEngine}
                hue={beat.hue}
              />
              {countIn > 0 ? (
                <div className="absolute inset-0 grid place-items-center">
                  <span
                    className="tabular font-display text-[clamp(4rem,18vw,7rem)] font-black leading-none text-accent"
                    aria-live="assertive"
                  >
                    {countIn}
                  </span>
                </div>
              ) : null}
              {paused ? (
                <div className="absolute inset-0 grid place-items-center">
                  <span className="rounded-full border border-line bg-void/80 px-4 py-2 text-[12px] font-bold uppercase tracking-[0.16em] text-muted backdrop-blur">
                    Paused
                  </span>
                </div>
              ) : null}
            </div>

            <div className="mt-4 sm:mt-6">
              <LiveTranscript demoMode={demoMode} />
            </div>
          </div>

          <div className="lg:sticky lg:top-32">
            <SuggestionPanel assist={assist} />
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line-soft bg-void/90 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-5xl gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => void (paused ? controller.resume() : controller.pause())}
          >
            {paused ? 'Resume' : 'Pause'}
          </Button>
          <Button variant="live" size="lg" className="flex-[1.4]" onClick={onFinish}>
            Finish
          </Button>
        </div>
      </div>

      <Sheet
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Session settings"
      >
        <div className="space-y-7">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">
              Assistance
            </span>
            <div className="mt-2.5">
              <Segmented
                label="Assistance level"
                value={assist}
                options={ASSIST_OPTIONS}
                onChange={onAssistChange}
              />
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-muted">
              Changes apply immediately — you can drop the help mid-verse.
            </p>
          </div>

          <div>
            <label
              htmlFor="beat-volume"
              className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint"
            >
              Beat volume
            </label>
            <div className="mt-3 flex items-center gap-4">
              <input
                id="beat-volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(event) => onVolumeChange(Number(event.target.value))}
                className="h-1.5 flex-1 accent-[#ff6a2b]"
              />
              <span className="tabular w-12 text-right text-sm font-semibold">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-faint">
              Beat
            </span>
            <p className="mt-2 font-display text-base font-extrabold">
              {beat.name} · <span className="tabular">{beat.bpm} BPM</span>
            </p>
            <p className="mt-1 text-[13px] text-muted">
              Changing beat mid-session would break the bar grid, so it is fixed until
              this run finishes.
            </p>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function StatusPill({
  demoMode,
  micLive,
  paused,
}: {
  demoMode: boolean;
  micLive: boolean;
  paused: boolean;
}) {
  if (demoMode) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-ai/40 bg-ai/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ai">
        <span className="h-1.5 w-1.5 rounded-full bg-ai" />
        Demo mode
      </span>
    );
  }
  if (!micLive) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-faint">
        Microphone off
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-live/40 bg-live/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-live">
      <span className="relative flex h-1.5 w-1.5">
        {!paused ? (
          <span className="animate-live-ring absolute inset-0 rounded-full bg-live" />
        ) : null}
        <span className="relative h-1.5 w-1.5 rounded-full bg-live" />
      </span>
      {paused ? 'Paused' : 'Listening'}
    </span>
  );
}
