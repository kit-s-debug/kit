"use client";

import { useCallback, useEffect, useState } from "react";
import { safety } from "@/content/site";

type Mode = "auto" | "day" | "evening";

function resolve(pref: Mode): "day" | "evening" {
  if (pref !== "auto") return pref;
  const hour = new Date().getHours();
  const prefersDark =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  return prefersDark || hour >= 20 || hour < 7 ? "evening" : "day";
}

/**
 * Calm mode and the lighting toggle.
 *
 * Both are read before first paint by lib/boot-script, so these controls only
 * have to keep the DOM and localStorage in step afterwards. They render as
 * plain buttons with aria-pressed rather than as switches, because a switch
 * that has to explain itself is not a calm control.
 */
export function Preferences({ compact = false }: { compact?: boolean }) {
  const [calm, setCalm] = useState(false);
  const [pref, setPref] = useState<Mode>("auto");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setCalm(root.getAttribute("data-calm") === "on");
    setPref((root.getAttribute("data-mode-pref") as Mode) ?? "auto");
    setReady(true);
  }, []);

  // Follow the system if the visitor has not chosen for themselves.
  useEffect(() => {
    if (pref !== "auto" || typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => document.documentElement.setAttribute("data-mode", resolve("auto"));
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [pref]);

  const toggleCalm = useCallback(() => {
    const next = !calm;
    setCalm(next);
    const root = document.documentElement;
    if (next) root.setAttribute("data-calm", "on");
    else root.removeAttribute("data-calm");
    try {
      localStorage.setItem("sage:calm", next ? "on" : "off");
    } catch {
      /* storage blocked — the toggle still works for this visit */
    }
  }, [calm]);

  const cycleMode = useCallback(() => {
    const order: Mode[] = ["auto", "day", "evening"];
    const next = order[(order.indexOf(pref) + 1) % order.length];
    setPref(next);
    const root = document.documentElement;
    root.setAttribute("data-mode-pref", next);
    root.setAttribute("data-mode", resolve(next));
    try {
      localStorage.setItem("sage:mode", next);
    } catch {
      /* as above */
    }
  }, [pref]);

  const modeLabel =
    pref === "auto" ? safety.modeAuto : pref === "day" ? safety.modeDay : safety.modeEvening;

  return (
    <div className="prefs" data-compact={compact || undefined}>
      <button
        type="button"
        className="pref-button"
        onClick={toggleCalm}
        aria-pressed={ready ? calm : undefined}
        title={safety.calmHelp}
      >
        <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            d="M1.5 8h13M1.5 4.5h9M1.5 11.5h9"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span>{safety.calmLabel}</span>
      </button>
      <button type="button" className="pref-button" onClick={cycleMode}>
        <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <circle cx="8" cy="8" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1m11-5-1.1 1.1M5.1 10.9 4 12m8 0-1.1-1.1M5.1 5.1 4 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <span>
          <span className="visually-hidden">{safety.modeLabel}: </span>
          {ready ? modeLabel : safety.modeAuto}
        </span>
      </button>
    </div>
  );
}
