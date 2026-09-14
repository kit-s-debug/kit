'use client';

import { useEffect, useState } from 'react';

/**
 * The overall score, counted up once on arrival.
 *
 * The ring is an SVG stroke-dashoffset transition rather than a per-frame
 * redraw, so it costs nothing after the first paint.
 */
export function ScoreDial({ score, label = 'Overall' }: { score: number; label?: string }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(score);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const duration = 900;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Ease-out so it settles rather than snapping.
      setShown(Math.round(score * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);

  return (
    <div className="relative mx-auto grid h-48 w-48 place-items-center sm:h-56 sm:w-56">
      <svg viewBox="0 0 180 180" className="absolute inset-0 h-full w-full -rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-line-soft"
          strokeWidth="10"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="url(#score-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)' }}
        />
        <defs>
          <linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff6a2b" />
            <stop offset="100%" stopColor="#f2c76b" />
          </linearGradient>
        </defs>
      </svg>
      <div className="relative text-center">
        <div className="tabular font-display text-[3.5rem] font-black leading-none sm:text-[4rem]">
          {shown}
        </div>
        <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
          {label} / 100
        </div>
      </div>
    </div>
  );
}
