'use client';

import { useRouter } from 'next/navigation';
import { getBeat } from '@/lib/beats';
import { useAppStore } from '@/lib/store/app-store';
import { BeatLibrary } from '@/components/beat-player/beat-library';
import { Button } from '@/components/ui/button';

/**
 * The standalone beat browser. Selecting a beat writes it straight into the
 * saved settings, so the freestyle screen opens on whatever was chosen here.
 */
export function BeatBrowser() {
  const router = useRouter();
  const beatId = useAppStore((state) => state.settings.beatId);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const selected = getBeat(beatId);

  return (
    <BeatLibrary
      selectedId={beatId}
      onSelect={(beat) => updateSettings({ beatId: beat.id })}
      footer={
        <div className="panel flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
              Selected
            </p>
            <p className="mt-1 truncate font-display text-base font-extrabold">
              {selected.name} · <span className="tabular">{selected.bpm} BPM</span>
            </p>
          </div>
          <Button onClick={() => router.push('/freestyle')}>Freestyle on this beat</Button>
        </div>
      }
    />
  );
}
