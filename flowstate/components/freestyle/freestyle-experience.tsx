'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AssistLevel, Difficulty } from '@/types';
import { useAppStore } from '@/lib/store/app-store';
import { useSessionStore } from '@/lib/store/session-store';
import { FreestyleController } from '@/lib/freestyle/controller';
import { getBeat } from '@/lib/beats';
import { challengeForDay, dayKey } from '@/lib/challenges';
import { SessionSetup } from '@/components/freestyle/session-setup';
import { LiveStage } from '@/components/freestyle/live-stage';
import { ResultsScreen } from '@/components/analysis/results-screen';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

/**
 * Orchestrates the whole loop: set up, run, score.
 *
 * The controller is created once and kept in a ref — it holds the audio graph
 * and the microphone, neither of which should be torn down by a re-render.
 */
export function FreestyleExperience() {
  const router = useRouter();

  const hydrated = useAppStore((state) => state.hydrated);
  const settings = useAppStore((state) => state.settings);
  const preferences = useAppStore((state) => state.preferences);
  const aiLive = useAppStore((state) => state.aiStatus.live);
  const storageOk = useAppStore((state) => state.storageOk);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const recordSession = useAppStore((state) => state.recordSession);

  const phase = useSessionStore((state) => state.phase);
  const analysis = useSessionStore((state) => state.analysis);
  const challengeResult = useSessionStore((state) => state.challengeResult);
  const demoMode = useSessionStore((state) => state.demoMode);
  const savedSessionId = useSessionStore((state) => state.savedSessionId);
  const resetSession = useSessionStore((state) => state.reset);

  // Lazy initialiser rather than a ref assignment: the controller owns the
  // audio graph and the microphone, so it must be created exactly once and
  // never during a server render.
  const [controller] = useState<FreestyleController | null>(() =>
    typeof window === 'undefined' ? null : new FreestyleController(),
  );
  const [starting, setStarting] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [challengeAccepted, setChallengeAccepted] = useState(true);
  const [reward, setReward] = useState({ xpEarned: 0, leveledUp: false });
  const [ranDurationSec, setRanDurationSec] = useState(0);

  const beat = useMemo(() => getBeat(settings.beatId), [settings.beatId]);
  const challenge = useMemo(() => challengeForDay(dayKey()), []);

  // Send first-time visitors through onboarding before the setup screen.
  useEffect(() => {
    if (hydrated && !preferences.onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [hydrated, preferences.onboardingComplete, router]);

  // Releases the microphone, the beat and every timer when the screen goes
  // away. Deliberately `abandon` rather than `dispose`: strict mode runs this
  // cleanup once before the real mount, and the controller has to survive it.
  useEffect(() => {
    return () => {
      controller?.abandon();
      useSessionStore.getState().reset();
    };
  }, [controller]);

  // Guard against navigating away mid-run and silently losing the session.
  useEffect(() => {
    const live = phase === 'live' || phase === 'countdown' || phase === 'starting';
    if (!live) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [phase]);

  const handleStart = useCallback(async () => {
    if (!controller || starting) return;
    setStarting(true);
    setReward({ xpEarned: 0, leveledUp: false });
    setRanDurationSec(settings.durationSec);

    const activeChallenge =
      challengeAccepted && settings.durationSec >= challenge.minDurationSec ? challenge : null;

    try {
      await controller.start(
        {
          settings,
          beat,
          challenge: activeChallenge,
          aiLive,
          metronome: preferences.metronomeClick,
        },
        ({ session }) => {
          setRanDurationSec(session.actualDurationSec);
          void recordSession(session).then((result) => {
            setReward(result);
            useSessionStore.setState({ xpEarned: result.xpEarned });
          });
        },
      );
    } finally {
      setStarting(false);
    }
  }, [
    aiLive,
    beat,
    challenge,
    challengeAccepted,
    controller,
    preferences.metronomeClick,
    recordSession,
    settings,
    starting,
  ]);

  const handleFinish = useCallback(() => {
    void controller?.finish('manual');
  }, [controller]);

  const handleExit = useCallback(() => {
    setExitOpen(true);
  }, []);

  const confirmExit = useCallback(() => {
    controller?.abandon();
    setExitOpen(false);
    resetSession();
    router.push('/');
  }, [controller, resetSession, router]);

  const backToSetup = useCallback(() => {
    controller?.abandon();
    resetSession();
  }, [controller, resetSession]);

  if (!hydrated) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-6">
        <p className="text-sm text-faint">Loading your setup…</p>
      </main>
    );
  }

  if (phase === 'results' && analysis) {
    return (
      <ResultsScreen
        analysis={analysis}
        beatName={beat.name}
        bpm={beat.bpm}
        durationSec={ranDurationSec || settings.durationSec}
        demoMode={demoMode}
        xpEarned={reward.xpEarned}
        leveledUp={reward.leveledUp}
        challenge={challengeResult ? challenge : null}
        challengeResult={challengeResult}
        savedSessionId={savedSessionId}
        storageOk={storageOk}
        onAgain={() => {
          resetSession();
          void handleStart();
        }}
        onChangeSetup={backToSetup}
      />
    );
  }

  if (controller && (phase === 'starting' || phase === 'countdown' || phase === 'live' || phase === 'finishing')) {
    return (
      <>
        <LiveStage
          controller={controller}
          beat={beat}
          totalMs={settings.durationSec * 1000}
          assist={settings.assist}
          volume={settings.beatVolume}
          onAssistChange={(assist: AssistLevel) => updateSettings({ assist })}
          onVolumeChange={(volume) => {
            updateSettings({ beatVolume: volume });
            controller.setVolume(volume);
          }}
          onExit={handleExit}
          onFinish={handleFinish}
        />
        <Sheet
          open={exitOpen}
          onClose={() => setExitOpen(false)}
          title="Leave this freestyle?"
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setExitOpen(false)}>
                Keep going
              </Button>
              <Button variant="danger" fullWidth onClick={confirmExit}>
                Leave
              </Button>
            </div>
          }
        >
          <p className="text-[15px] leading-relaxed text-muted">
            This run will not be scored or saved. If you want the breakdown, use
            <span className="font-semibold text-text"> Finish </span>
            instead — it stops the beat and scores whatever you have so far.
          </p>
        </Sheet>
      </>
    );
  }

  return (
    <SessionSetup
      beat={beat}
      difficulty={settings.difficulty}
      assist={settings.assist}
      durationSec={settings.durationSec}
      forceDemoMode={settings.forceDemoMode}
      challenge={challenge}
      challengeAccepted={challengeAccepted}
      starting={starting}
      onChange={(patch) => {
        const next: Partial<typeof settings> = {};
        if (patch.beatId !== undefined) next.beatId = patch.beatId;
        if (patch.difficulty !== undefined) next.difficulty = patch.difficulty as Difficulty;
        if (patch.assist !== undefined) next.assist = patch.assist;
        if (patch.durationSec !== undefined) next.durationSec = patch.durationSec;
        if (patch.forceDemoMode !== undefined) next.forceDemoMode = patch.forceDemoMode;
        updateSettings(next);
      }}
      onToggleChallenge={setChallengeAccepted}
      onStart={() => void handleStart()}
    />
  );
}
