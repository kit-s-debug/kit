'use client';

import { useMemo, useState } from 'react';
import type { Beat, BeatCategory } from '@/types';
import { BEATS, BEAT_CATEGORIES } from '@/lib/beats';
import { BeatCard } from '@/components/beat-player/beat-card';
import { usePreviewBeat } from '@/components/beat-player/use-preview';
import { ErrorNotice } from '@/components/ui/misc';

interface BeatLibraryProps {
  selectedId: string;
  onSelect: (beat: Beat) => void;
  /** Rendered under the filters — used for the "use this beat" call to action. */
  footer?: React.ReactNode;
}

export function BeatLibrary({ selectedId, onSelect, footer }: BeatLibraryProps) {
  const [filter, setFilter] = useState<BeatCategory | 'all'>('all');
  const { playingId, toggle, stop, volume, setVolume, error, supported } = usePreviewBeat();

  const beats = useMemo(
    () => (filter === 'all' ? BEATS : BEATS.filter((beat) => beat.category === filter)),
    [filter],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
          All
        </FilterChip>
        {BEAT_CATEGORIES.map((category) => (
          <FilterChip
            key={category.id}
            active={filter === category.id}
            onClick={() => setFilter(category.id)}
          >
            {category.label}
          </FilterChip>
        ))}
      </div>

      {!supported ? (
        <div className="mt-4">
          <ErrorNotice
            title="Audio unavailable"
            body="This browser cannot play Web Audio, so beats will not sound. You can still run a session and get scored on your words."
          />
        </div>
      ) : null}

      {error ? (
        <div className="mt-4">
          <ErrorNotice title="Preview problem" body={error} />
        </div>
      ) : null}

      {playingId ? (
        <div className="panel mt-4 flex flex-wrap items-center gap-4 px-4 py-3">
          <span className="text-[12px] font-semibold uppercase tracking-[0.16em] text-faint">
            Previewing
          </span>
          <label className="flex flex-1 items-center gap-3 text-[12px] text-muted">
            <span className="shrink-0">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="h-1.5 w-full min-w-24 flex-1 accent-[#ff6a2b]"
              aria-label="Preview volume"
            />
          </label>
          <button
            type="button"
            onClick={stop}
            className="rounded-lg border border-line px-3 py-1.5 text-[13px] font-semibold text-muted transition-colors hover:text-text"
          >
            Stop
          </button>
        </div>
      ) : null}

      {footer ? <div className="mt-4">{footer}</div> : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {beats.map((beat) => (
          <BeatCard
            key={beat.id}
            beat={beat}
            selected={beat.id === selectedId}
            playing={playingId === beat.id}
            onSelect={(chosen) => {
              stop();
              onSelect(chosen);
            }}
            onTogglePreview={(chosen) => void toggle(chosen)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors ${
        active
          ? 'border-accent/50 bg-accent/10 text-accent-soft'
          : 'border-line-soft text-muted hover:border-line hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}
