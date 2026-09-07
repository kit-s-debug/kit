"use client";

import { useEffect, useRef, useState } from "react";
import { cta, practice } from "@/content/site";
import { QuickExitButton } from "./quick-exit";

/**
 * Appears once the hero has gone by, and holds the only three things anyone
 * needs from anywhere on the page: book, ring, leave. Bottom of the screen on a
 * phone because that is where a thumb is; a slim top bar on a desktop.
 *
 * Uses an IntersectionObserver on a sentinel rather than a scroll listener, so
 * there is no work done per frame.
 */
export function BookingBar({ sentinelId }: { sentinelId: string }) {
  const [shown, setShown] = useState(false);
  const seen = useRef(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        seen.current = true;
        setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinelId]);

  return (
    <div className="booking-bar" data-shown={shown || undefined} aria-hidden={!shown}>
      <div className="shell-wide booking-bar-inner">
        <a href="#book" className="action booking-bar-action" tabIndex={shown ? undefined : -1}>
          {/* the full label wraps to two lines on a narrow phone, so the bar
              carries the short one there */}
          <span className="bar-label-long">{cta.primary}</span>
          <span className="bar-label-short">{cta.short}</span>
        </a>
        <a href={practice.phoneHref} className="booking-bar-phone" tabIndex={shown ? undefined : -1}>
          <span className="visually-hidden">{cta.phoneLabel}: </span>
          {practice.phone}
        </a>
        <div className="booking-bar-exit">
          <QuickExitButton compact />
        </div>
      </div>
    </div>
  );
}
