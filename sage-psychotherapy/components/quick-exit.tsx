"use client";

import { useEffect, useRef } from "react";
import { safety } from "@/content/site";

/**
 * Leave this site quickly.
 *
 * Standard on domestic abuse services and almost unheard of on private practice
 * sites. She works with domestic, emotional and narcissistic abuse, so it
 * belongs here.
 *
 * `location.replace` is what does the work: it overwrites this page's history
 * entry, so pressing Back from the weather forecast goes to whatever came
 * before this site rather than returning here. It cannot wipe the browsing
 * history — the footer says so plainly rather than implying otherwise.
 *
 * Escape twice inside a second and a half does the same thing, and works while
 * typing in a field: someone who needs this needs it mid-sentence too.
 */
const DOUBLE_TAP_MS = 1500;

export function useQuickExit() {
  const lastEscape = useRef(0);

  const leave = () => {
    try {
      window.location.replace(safety.exitTarget);
    } catch {
      window.location.href = safety.exitTarget;
    }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const now = Date.now();
      if (now - lastEscape.current < DOUBLE_TAP_MS) {
        lastEscape.current = 0;
        window.location.replace(safety.exitTarget);
      } else {
        lastEscape.current = now;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return leave;
}

export function QuickExitButton({ compact = false }: { compact?: boolean }) {
  const leave = useQuickExit();
  return (
    <button type="button" onClick={leave} className="exit-button" data-compact={compact || undefined}>
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path
          d="M9.5 2.5H13v11H9.5M10 8H2.5m0 0 3-3m-3 3 3 3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{compact ? safety.exitShort : safety.exitLabel}</span>
    </button>
  );
}
