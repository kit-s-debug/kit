'use client';

import type { ScoreBreakdown } from '@/types';

const ROWS: Array<{ key: keyof ScoreBreakdown; label: string; hint: string }> = [
  { key: 'rhymeQuality', label: 'Rhyme Quality', hint: 'How many bars resolved, and how cleanly.' },
  { key: 'flow', label: 'Flow', hint: 'How even your syllable count stayed bar to bar.' },
  { key: 'consistency', label: 'Consistency', hint: 'How much of the run you kept filled.' },
  { key: 'vocabulary', label: 'Vocabulary', hint: 'Range of words, discounting filler.' },
  { key: 'creativity', label: 'Creativity', hint: 'Distinct rhyme sounds, multis and chains.' },
  { key: 'beatTiming', label: 'Beat Timing', hint: 'How consistently you landed in the same place in the bar.' },
];

export function BreakdownBars({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <dl className="space-y-4">
      {ROWS.map((row, index) => {
        const value = breakdown[row.key];
        return (
          <div key={row.key}>
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-sm font-semibold">{row.label}</dt>
              <dd className="tabular font-display text-base font-extrabold">{value}</dd>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line-soft">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-gold"
                style={{
                  width: `${Math.max(2, value)}%`,
                  transition: 'width 800ms cubic-bezier(0.22,1,0.36,1)',
                  transitionDelay: `${index * 70}ms`,
                }}
              />
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-faint">{row.hint}</p>
          </div>
        );
      })}
    </dl>
  );
}
