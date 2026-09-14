'use client';

import type { Beat } from '@/types';
import { categoryLabel } from '@/lib/beats';

interface BeatCardProps {
  beat: Beat;
  selected: boolean;
  playing: boolean;
  onSelect: (beat: Beat) => void;
  onTogglePreview: (beat: Beat) => void;
}

export function BeatCard({
  beat,
  selected,
  playing,
  onSelect,
  onTogglePreview,
}: BeatCardProps) {
  return (
    <div
      className={`panel relative overflow-hidden transition-colors duration-200 ${
        selected ? 'border-accent/50' : ''
      }`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-24 opacity-25"
        style={{
          background: `radial-gradient(120% 100% at 20% 0%, hsl(${beat.hue} 90% 55% / 0.7), transparent 70%)`,
        }}
      />

      <div className="relative p-4">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onSelect(beat)}
            aria-pressed={selected}
            className="min-w-0 flex-1 text-left"
          >
            <span className="block truncate font-display text-[17px] font-extrabold leading-tight">
              {beat.name}
            </span>
            <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-faint">
              <span className="tabular">{beat.bpm} BPM</span>
              <span aria-hidden="true">·</span>
              <span>{categoryLabel(beat.category)}</span>
              <span aria-hidden="true">·</span>
              <span className="normal-case tracking-normal text-muted">{beat.mood}</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTogglePreview(beat)}
            aria-label={playing ? `Stop preview of ${beat.name}` : `Preview ${beat.name}`}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors ${
              playing
                ? 'border-accent bg-accent text-[#180700]'
                : 'border-line text-muted hover:border-faint hover:text-text'
            }`}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
                <rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-muted">{beat.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <BeatBars hue={beat.hue} animated={playing} />
          <button
            type="button"
            onClick={() => onSelect(beat)}
            className={`rounded-lg px-3 py-2 text-[13px] font-bold transition-colors ${
              selected
                ? 'bg-accent text-[#180700]'
                : 'border border-line text-muted hover:text-text'
            }`}
          >
            {selected ? 'Selected' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BeatBars({ hue, animated }: { hue: number; animated: boolean }) {
  return (
    <span aria-hidden="true" className="flex h-6 items-end gap-[3px]">
      {Array.from({ length: 16 }).map((_, index) => (
        <span
          key={index}
          className="w-[3px] rounded-full"
          style={{
            height: `${20 + Math.abs(Math.sin(index * 1.1)) * 70}%`,
            background: `hsl(${hue} 85% 60% / ${animated ? 0.85 : 0.3})`,
            animation: animated ? 'sheen 1.6s ease-in-out infinite' : undefined,
            animationDelay: `${(index % 7) * 0.1}s`,
          }}
        />
      ))}
    </span>
  );
}
