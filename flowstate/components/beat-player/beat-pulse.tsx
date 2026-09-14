'use client';

import { useEffect, useRef } from 'react';
import type { BeatEngine } from '@/services/audio/beat-engine';

/**
 * Four dots, one per beat in the bar, lit by the transport's own clock.
 *
 * Updated by writing to the DOM from a rAF loop rather than through React
 * state — this runs sixty times a second and must never cause a render.
 */
export function BeatPulse({
  beatEngine,
  hue,
  active,
}: {
  beatEngine: BeatEngine | null;
  hue: number;
  active: boolean;
}) {
  const dotsRef = useRef<Array<HTMLSpanElement | null>>([]);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!beatEngine) return;
    let running = true;
    let lastBeat = -1;
    let lastBar = -1;

    const tick = () => {
      if (!running) return;
      const position = beatEngine.getPosition();

      if (position.beat !== lastBeat || position.countIn > 0) {
        lastBeat = position.beat;
        dotsRef.current.forEach((dot, index) => {
          if (!dot) return;
          const on = active && position.countIn === 0 && index === position.beat;
          dot.style.transform = on ? 'scale(1.5)' : 'scale(1)';
          dot.style.background = on
            ? `hsl(${hue} 92% 62%)`
            : 'rgba(255,255,255,0.16)';
        });
      }

      if (position.bar !== lastBar && barRef.current) {
        lastBar = position.bar;
        barRef.current.textContent = String(position.countIn > 0 ? 0 : position.bar + 1);
      }

      requestAnimationFrame(tick);
    };

    const raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [beatEngine, hue, active]);

  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            ref={(node) => {
              dotsRef.current[index] = node;
            }}
            className="h-1.5 w-1.5 rounded-full bg-white/15 transition-transform duration-100 ease-out"
          />
        ))}
      </div>
      <span className="tabular text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
        Bar <span ref={barRef}>1</span>
      </span>
    </div>
  );
}
