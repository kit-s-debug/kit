"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { SceneQuality } from "./HeroScene";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

type Mode = { webgl: boolean; quality: SceneQuality; animate: boolean };

function detect(): Mode {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  if (conn?.saveData) webgl = false;
  const small = window.innerWidth < 900;
  const weak = (navigator.hardwareConcurrency ?? 8) <= 4;
  return { webgl, quality: small || weak ? "lite" : "high", animate: !reduce };
}

/**
 * The hero backdrop. A static poster (a still of the same scene) paints
 * immediately; the interactive 3D scene loads after first paint and fades in
 * over it. Devices without WebGL, or with data saver on, keep the poster.
 */
export function HeroVisual() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = detect();
    setMode(m);
    if (!m.webgl) return;
    // Defer the 3D bundle until the page has painted and the main thread is idle.
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const start = () => setLoad(true);
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 1200 });
    else window.setTimeout(start, 400);
  }, []);

  // Stop rendering when the hero is off screen to save battery.
  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0 });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden bg-midnight" aria-hidden="true">
      {/* Poster: always present underneath, so there is never an empty frame */}
      <picture>
        <source media="(max-aspect-ratio: 9/10)" srcSet="/hero-poster-portrait.webp" type="image/webp" />
        <img
          src="/hero-poster.webp"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[70%_50%]"
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      {mode?.webgl && load && (
        <div className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${ready ? "opacity-100" : "opacity-0"}`}>
          <HeroScene quality={mode.quality} animate={mode.animate} active={active} onReady={() => setReady(true)} />
        </div>
      )}
    </div>
  );
}
