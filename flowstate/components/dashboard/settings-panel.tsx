'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { MicPermission } from '@/types';
import { useAppStore } from '@/lib/store/app-store';
import { MicAnalyser } from '@/services/audio/mic';
import { useSpeechCapability } from '@/lib/hooks/use-environment';
import { getSessionRepository } from '@/lib/storage';
import { Panel, SectionLabel } from '@/components/ui/panel';
import { Toggle } from '@/components/ui/toggle';
import { Segmented } from '@/components/ui/segmented';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { Tag } from '@/components/ui/misc';

const MOTION_OPTIONS = [
  { value: 'system' as const, label: 'System' },
  { value: 'full' as const, label: 'Full motion' },
  { value: 'reduced' as const, label: 'Reduced' },
];

export function SettingsPanel() {
  const hydrated = useAppStore((state) => state.hydrated);
  const preferences = useAppStore((state) => state.preferences);
  const settings = useAppStore((state) => state.settings);
  const profile = useAppStore((state) => state.profile);
  const aiStatus = useAppStore((state) => state.aiStatus);
  const aiStatusLoaded = useAppStore((state) => state.aiStatusLoaded);
  const storageOk = useAppStore((state) => state.storageOk);
  const updatePreferences = useAppStore((state) => state.updatePreferences);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const clearAllData = useAppStore((state) => state.clearAllData);
  const resetProgress = useAppStore((state) => state.resetProgress);

  const [micPermission, setMicPermission] = useState<MicPermission>('unknown');
  const capability = useSpeechCapability();
  const speechSupported = capability.supported;
  const speechReason = capability.reason;
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [wipeOpen, setWipeOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void MicAnalyser.queryPermission().then(setMicPermission);
    void getSessionRepository()
      .list()
      .then((list) => setSessionCount(list.length))
      .catch(() => setSessionCount(0));
  }, []);

  const motionValue =
    preferences.reducedMotion === null ? 'system' : preferences.reducedMotion ? 'reduced' : 'full';

  const requestMic = async () => {
    const analyser = new MicAnalyser();
    const result = await analyser.start();
    analyser.stop();
    setMicPermission(result.permission);
    setNotice(
      result.permission === 'granted'
        ? 'Microphone access granted.'
        : result.message ?? 'Microphone access was not granted.',
    );
  };

  const deleteHistory = async () => {
    await getSessionRepository().clear();
    setSessionCount(0);
    setHistoryOpen(false);
    setNotice('Session history deleted from this device.');
  };

  const wipeEverything = async () => {
    await clearAllData();
    setSessionCount(0);
    setWipeOpen(false);
    setNotice('All FLOWSTATE data on this device has been deleted.');
  };

  if (!hydrated) {
    return <div className="panel h-96 animate-pulse opacity-40" aria-busy="true" />;
  }

  return (
    <div className="space-y-6">
      {notice ? (
        <p
          role="status"
          className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-[13px] text-accent-soft"
        >
          {notice}
        </p>
      ) : null}

      {/* Microphone & privacy ------------------------------------------ */}
      <Panel className="p-5">
        <SectionLabel>Microphone</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <MicTag permission={micPermission} />
          <Button variant="secondary" size="sm" onClick={() => void requestMic()}>
            {micPermission === 'granted' ? 'Re-check' : 'Request access'}
          </Button>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-muted">
          Your microphone is only opened while a freestyle is running, and the stream is
          released the moment the session ends. FLOWSTATE does not record or upload audio.
        </p>
        {!speechSupported ? (
          <p className="mt-3 rounded-xl border border-ai/25 bg-ai/5 px-3 py-2.5 text-[13px] leading-relaxed text-ai">
            {speechReason} Sessions will run in Demo Mode with a scripted transcript.
          </p>
        ) : (
          <p className="mt-3 text-[13px] leading-relaxed text-faint">
            Transcription uses your browser&rsquo;s built-in speech recognition. In
            Chrome and Edge that service processes audio on Google&rsquo;s servers — see{' '}
            <Link href="/privacy" className="underline hover:text-text">
              Privacy
            </Link>{' '}
            for what that means.
          </p>
        )}
      </Panel>

      {/* AI ------------------------------------------------------------ */}
      <Panel className="p-5">
        <SectionLabel>AI</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {!aiStatusLoaded ? (
            <Tag>Checking…</Tag>
          ) : aiStatus.live ? (
            <Tag tone="ai">Hosted model connected</Tag>
          ) : (
            <Tag>On-device only</Tag>
          )}
          <Tag>{aiStatus.provider}</Tag>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-muted">{aiStatus.detail}</p>
      </Panel>

      {/* Session defaults ---------------------------------------------- */}
      <Panel className="p-5">
        <SectionLabel>Session defaults</SectionLabel>
        <div className="mt-4 space-y-5">
          <Toggle
            label="Metronome click"
            description="Adds a quiet click on each beat, on top of the drums."
            checked={preferences.metronomeClick}
            onChange={(metronomeClick) => updatePreferences({ metronomeClick })}
          />
          <Toggle
            label="Force Demo Mode"
            description="Always use the scripted transcript. The microphone is never opened."
            checked={settings.forceDemoMode}
            onChange={(forceDemoMode) => updateSettings({ forceDemoMode })}
          />
          <div>
            <label
              htmlFor="count-in"
              className="block text-sm font-semibold"
            >
              Count-in
            </label>
            <p className="mt-0.5 text-[13px] text-muted">
              Bars of click before the beat starts, so you can find the tempo.
            </p>
            <div className="mt-3 flex items-center gap-4">
              <input
                id="count-in"
                type="range"
                min={0}
                max={4}
                step={1}
                value={settings.countInBars}
                onChange={(event) =>
                  updateSettings({ countInBars: Number(event.target.value) })
                }
                className="h-1.5 flex-1 accent-[#ff6a2b]"
              />
              <span className="tabular w-16 text-right text-sm font-semibold">
                {settings.countInBars === 0
                  ? 'None'
                  : `${settings.countInBars} bar${settings.countInBars === 1 ? '' : 's'}`}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Motion --------------------------------------------------------- */}
      <Panel className="p-5">
        <SectionLabel>Motion</SectionLabel>
        <p className="mt-2 text-[13px] leading-relaxed text-muted">
          System follows your device&rsquo;s reduced-motion setting. Override it here if
          you would rather decide per app.
        </p>
        <div className="mt-4">
          <Segmented
            label="Motion preference"
            value={motionValue}
            options={MOTION_OPTIONS}
            onChange={(value) =>
              updatePreferences({
                reducedMotion: value === 'system' ? null : value === 'reduced',
              })
            }
          />
        </div>
      </Panel>

      {/* Data ----------------------------------------------------------- */}
      <Panel className="p-5">
        <SectionLabel>Your data</SectionLabel>
        <div className="mt-4 space-y-5">
          <Toggle
            label="Keep transcripts"
            description="Store the words from each session so you can read them back. Scores are kept either way."
            checked={preferences.keepTranscripts}
            onChange={(keepTranscripts) => updatePreferences({ keepTranscripts })}
          />

          <dl className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line-soft bg-ink px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                Sessions stored
              </dt>
              <dd className="tabular mt-1 font-display text-xl font-extrabold">
                {sessionCount ?? '—'}
              </dd>
            </div>
            <div className="rounded-xl border border-line-soft bg-ink px-4 py-3">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                Total XP
              </dt>
              <dd className="tabular mt-1 font-display text-xl font-extrabold">{profile.xp}</dd>
            </div>
          </dl>

          {!storageOk ? (
            <p className="rounded-xl border border-gold/25 bg-gold/5 px-4 py-3 text-[13px] leading-relaxed text-gold">
              Local storage is blocked in this browser, so nothing can be saved between
              visits. Sessions will still run and score normally.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={() => setHistoryOpen(true)}>
              Delete session history
            </Button>
            <Button variant="secondary" size="sm" onClick={resetProgress}>
              Reset XP and streak
            </Button>
            <Button variant="danger" size="sm" onClick={() => setWipeOpen(true)}>
              Delete everything
            </Button>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <SectionLabel>Legal</SectionLabel>
        <ul className="mt-3 space-y-2 text-[14px]">
          <li>
            <Link href="/privacy" className="text-muted hover:text-text">
              Privacy policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="text-muted hover:text-text">
              Terms of use
            </Link>
          </li>
        </ul>
      </Panel>

      <Sheet
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Delete session history?"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setHistoryOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={() => void deleteHistory()}>
              Delete history
            </Button>
          </div>
        }
      >
        <p className="text-[15px] leading-relaxed text-muted">
          Removes every saved session and transcript from this device. Your XP, level and
          streak are kept. This cannot be undone.
        </p>
      </Sheet>

      <Sheet
        open={wipeOpen}
        onClose={() => setWipeOpen(false)}
        title="Delete everything?"
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setWipeOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" fullWidth onClick={() => void wipeEverything()}>
              Delete everything
            </Button>
          </div>
        }
      >
        <p className="text-[15px] leading-relaxed text-muted">
          Removes all sessions, transcripts, settings, XP and streak data from this
          device. FLOWSTATE will behave as though you had never used it. This cannot be
          undone.
        </p>
      </Sheet>
    </div>
  );
}

function MicTag({ permission }: { permission: MicPermission }) {
  switch (permission) {
    case 'granted':
      return <Tag tone="accent">Access granted</Tag>;
    case 'denied':
      return <Tag tone="live">Blocked in browser settings</Tag>;
    case 'unavailable':
      return <Tag tone="live">No microphone found</Tag>;
    case 'prompt':
      return <Tag>Not yet requested</Tag>;
    default:
      return <Tag>Status unknown</Tag>;
  }
}
