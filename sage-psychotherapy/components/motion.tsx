"use client";

import { useEffect } from "react";

/**
 * Arms the site's motion — but only when motion is welcome.
 *
 * With JavaScript off, calm mode on, or prefers-reduced-motion set, this does
 * nothing and every element stays at its resting, fully-visible state (the CSS
 * reveal styles are gated behind the `data-animate` flag this sets). So motion
 * is purely additive and never a barrier to reading.
 *
 * It does three things: sets `data-animate`, tags a curated set of elements as
 * scroll reveals (varied by type, not a uniform fade-up), and drives the warm
 * cursor-lamp in the dark rooms.
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    const motionOff = () =>
      reduceMq.matches || root.getAttribute("data-calm") === "on";

    let observer: IntersectionObserver | null = null;
    let tagged = false;

    // Each entry: selector, reveal kind, and whether items stagger in sequence.
    const groups: [string, "rise" | "scale" | "draw" | "none", boolean][] = [
      [
        ".finder-heading, .sessions-heading, .approach-heading, .arriving-heading, .booking-heading, .fees-free-heading, .fees-concession-heading, .credentials-aside-heading, .about-section-heading, .prose-section h2, .page-heading",
        "rise",
        false,
      ],
      [".sill", "draw", false],
      [".chapter-open", "none", false],
      [".welcome-portrait, .about-portrait", "scale", false],
      [".fees-number", "rise", false],
      [
        ".credentials-list li, .modalities li, .band, .thread-step, .clients li, .format-tab",
        "rise",
        true,
      ],
    ];

    const tag = () => {
      if (tagged) return;
      tagged = true;
      for (const [selector, kind, stagger] of groups) {
        document.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
          el.classList.add("reveal");
          el.dataset.reveal = kind;
          if (stagger) el.style.setProperty("--i", String(i % 7));
        });
      }
    };

    const arm = () => {
      if (motionOff()) {
        root.removeAttribute("data-animate");
        observer?.disconnect();
        observer = null;
        return;
      }
      root.setAttribute("data-animate", "on");
      tag();
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              obs.unobserve(entry.target);
            }
          }
        },
        { rootMargin: "0px 0px -12% 0px" },
      );
      document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => observer!.observe(el));
    };

    arm();

    // Re-evaluate when calm mode toggles or the OS motion setting changes.
    const calmWatcher = new MutationObserver(arm);
    calmWatcher.observe(root, { attributes: true, attributeFilter: ["data-calm"] });
    reduceMq.addEventListener("change", arm);

    // --- the cursor lamp -------------------------------------------------
    const fields: HTMLElement[] = [];
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      const target = event.currentTarget as HTMLElement;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (motionOff()) return;
        const rect = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
        target.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
      });
    };

    if (finePointer) {
      document.querySelectorAll<HTMLElement>(".welcome, .fees, .booking").forEach((field) => {
        field.classList.add("lamp-field");
        field.addEventListener("pointermove", onMove as EventListener);
        fields.push(field);
      });
    }

    return () => {
      observer?.disconnect();
      calmWatcher.disconnect();
      reduceMq.removeEventListener("change", arm);
      if (frame) cancelAnimationFrame(frame);
      fields.forEach((field) => field.removeEventListener("pointermove", onMove as EventListener));
    };
  }, []);

  return null;
}
