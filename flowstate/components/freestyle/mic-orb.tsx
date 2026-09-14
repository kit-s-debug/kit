'use client';

import { useEffect, useRef } from 'react';
import type { BeatEngine } from '@/services/audio/beat-engine';
import type { MicAnalyser } from '@/services/audio/mic';

export type OrbState = 'idle' | 'listening' | 'demo' | 'paused';

interface MicOrbProps {
  state: OrbState;
  mic: MicAnalyser | null;
  beatEngine: BeatEngine | null;
  /** Accent hue taken from the current beat. */
  hue: number;
}

const BANDS = 72;

/**
 * The centre of the freestyle screen.
 *
 * When the microphone is live the ring is driven by real input from the
 * analyser. In Demo Mode there is no microphone at all, so the ring follows the
 * beat instead and the surrounding UI says DEMO MODE — it never animates to
 * fake a voice that is not being heard.
 */
export function MicOrb({ state, mic, beatEngine, hue }: MicOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const waveform = new Float32Array(BANDS);
    const smoothed = new Float32Array(BANDS);
    const pulses: Array<{ t: number }> = [];

    let frame = 0;
    let lastBar = -1;
    let lastBeat = -1;
    let running = true;
    let dpr = 1;
    let size = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = Math.max(1, Math.min(rect.width, rect.height));
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = (now: number) => {
      if (!running) return;
      frame += 1;

      const current = stateRef.current;
      const active = current === 'listening';
      const demo = current === 'demo';

      let level = 0;
      if (active && mic) {
        level = mic.sample();
        mic.getWaveform(waveform as unknown as Float32Array);
      } else if (demo && beatEngine) {
        // Beat-driven, not voice-driven — and labelled as such in the UI.
        const position = beatEngine.getPosition();
        const phase = (position.elapsed * 2) % 1;
        level = 0.28 + Math.pow(1 - phase, 3) * 0.45;
        for (let i = 0; i < BANDS; i += 1) {
          waveform[i] = level * (0.45 + 0.55 * Math.abs(Math.sin(i * 0.42 + now / 420)));
        }
      } else {
        for (let i = 0; i < BANDS; i += 1) waveform[i] = 0;
      }

      // Beat pulse rings.
      if (beatEngine && !reduceMotion && (active || demo)) {
        const position = beatEngine.getPosition();
        if (position.countIn === 0 && (position.beat !== lastBeat || position.bar !== lastBar)) {
          lastBeat = position.beat;
          lastBar = position.bar;
          pulses.push({ t: now });
          if (pulses.length > 4) pulses.shift();
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const baseRadius = (size * dpr) * 0.29;

      const accent = `hsl(${hue} 92% 62%)`;
      const accentSoft = `hsl(${hue} 96% 70%)`;
      const dim = 'rgba(255,255,255,0.16)';

      // Expanding beat rings.
      for (const pulse of pulses) {
        const age = (now - pulse.t) / 900;
        if (age > 1) continue;
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * (1 + age * 0.85), 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${hue} 92% 62% / ${(1 - age) * 0.22})`;
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();
      }

      // Static guide ring.
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();

      // Radial waveform.
      ctx.beginPath();
      for (let i = 0; i <= BANDS; i += 1) {
        const index = i % BANDS;
        const target = active || demo ? (waveform[index] ?? 0) : 0;
        const previous = smoothed[index] ?? 0;
        const value = previous + (target - previous) * (reduceMotion ? 0.4 : 0.28);
        smoothed[index] = value;

        const angle = (index / BANDS) * Math.PI * 2 - Math.PI / 2;
        const radius = baseRadius + value * baseRadius * 0.55;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = active ? accent : demo ? 'rgba(111,227,207,0.55)' : dim;
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      // Core.
      const coreRadius = baseRadius * (0.52 + level * 0.2);
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      if (active) {
        gradient.addColorStop(0, `hsla(${hue} 96% 70% / 0.5)`);
        gradient.addColorStop(1, `hsla(${hue} 96% 60% / 0)`);
      } else if (demo) {
        gradient.addColorStop(0, 'rgba(111,227,207,0.3)');
        gradient.addColorStop(1, 'rgba(111,227,207,0)');
      } else {
        gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
      }
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Centre dot: solid red only while genuinely recording.
      ctx.beginPath();
      ctx.arc(cx, cy, 5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#ff3355' : demo ? 'rgba(111,227,207,0.7)' : 'rgba(255,255,255,0.25)';
      ctx.fill();

      void accentSoft;
      if (reduceMotion && frame % 4 !== 0) {
        requestAnimationFrame(draw);
        return;
      }
      requestAnimationFrame(draw);
    };

    const raf = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [mic, beatEngine, hue]);

  const label =
    state === 'listening'
      ? 'Microphone is live and listening'
      : state === 'demo'
        ? 'Demo Mode — the visualiser follows the beat, not your voice'
        : state === 'paused'
          ? 'Session paused'
          : 'Microphone idle';

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(72vw,20rem)]">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        role="img"
        aria-label={label}
      />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <MicGlyph state={state} />
      </div>
    </div>
  );
}

function MicGlyph({ state }: { state: OrbState }) {
  const tone =
    state === 'listening'
      ? 'text-live'
      : state === 'demo'
        ? 'text-ai'
        : 'text-faint';
  return (
    <span className={`relative grid place-items-center ${tone}`}>
      {state === 'listening' ? (
        <span className="animate-live-ring absolute h-12 w-12 rounded-full bg-live/40" />
      ) : null}
      <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
        <rect x="9" y="2.5" width="6" height="11" rx="3" fill="currentColor" opacity="0.9" />
        <path
          d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
