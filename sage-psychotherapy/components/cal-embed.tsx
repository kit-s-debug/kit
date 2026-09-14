"use client";

import { useEffect, useState } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { booking, practice } from "@/content/site";

/**
 * Real availability, through Cal.com's free tier. It handles timezones,
 * buffers, reminders and reschedules, and — the reason it is here rather than a
 * home-made calendar — it keeps appointment data out of this codebase entirely.
 *
 * Loaded through next/dynamic from the booking flow and only once step two is
 * reached, so it never touches first paint.
 */
export function CalEmbed() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cal = await getCalApi({ namespace: practice.cal.namespace });
      if (cancelled) return;
      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
        cssVarsPerTheme: {
          light: { "cal-brand": "#1f3d47" },
          dark: { "cal-brand": "#a3bc96" },
        },
      });
      setReady(true);
    })().catch(() => {
      /* offline or blocked — the phone number below still works */
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!practice.cal.link) {
    return (
      <p className="booking-fallback">
        {booking.timeMissing.split(practice.phone)[0]}
        <a href={practice.phoneHref} className="link-plain">
          {practice.phone}
        </a>
        {booking.timeMissing.split(practice.phone)[1]}
      </p>
    );
  }

  return (
    <div className="cal-frame" data-ready={ready || undefined}>
      <Cal
        namespace={practice.cal.namespace}
        calLink={practice.cal.link}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
        config={{ layout: "month_view" }}
      />
    </div>
  );
}
