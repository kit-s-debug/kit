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

    // Anything outside the run of rooms — the inner pages — still reveals by
    // element, since those pages are prose rather than a sequence.
    const pageGroups: [string, "rise" | "scale" | "draw" | "step"][] = [
      [".page-heading, .about-section-heading, .prose-section h2", "rise"],
      [".about-portrait", "scale"],
      [".page .sill", "draw"],
    ];

    /**
     * On the home page a section arrives as one thing: the chapter opener, then
     * each block beneath it a beat later. Tagging the shell's own children —
     * rather than every heading, list item and card — is what makes the page
     * read as a continuous scroll instead of a field of things popping in.
     */
    const tag = () => {
      if (tagged) return;
      tagged = true;

      document.querySelectorAll<HTMLElement>("main > section").forEach((section) => {
        section.querySelectorAll<HTMLElement>(":scope > .shell-editorial").forEach((shell) => {
          let i = 0;
          // The booking flow rebuilds its own contents as you move through the
          // steps, so only its opening is ours to animate.
          const blocks =
            section.id === "book"
              ? Array.from(shell.children).slice(0, 3)
              : Array.from(shell.children);

          blocks.forEach((child) => {
            const el = child as HTMLElement;
            el.classList.add("reveal");
            el.dataset.reveal = el.classList.contains("chapter-open")
              ? "none"
              : el.classList.contains("sill")
                ? "draw"
                : "rise";
            el.style.setProperty("--i", String(Math.min(i, 3)));
            i += 1;
          });
        });
      });

      for (const [selector, kind] of pageGroups) {
        document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          el.classList.add("reveal");
          el.dataset.reveal = kind;
        });
      }

      // The walk to the front door is a sequence, so it arrives as one: each
      // step a beat behind the last, on the hairline that draws itself beside
      // them. This is the one place a per-item stagger earns its keep.
      document.querySelectorAll<HTMLElement>(".thread-step").forEach((step, i) => {
        step.classList.add("reveal");
        step.dataset.reveal = "step";
        step.style.setProperty("--i", String(i));
      });

      // Photographs settle the last two per cent rather than rising.
      document.querySelectorAll<HTMLElement>(".welcome-portrait").forEach((el) => {
        el.classList.add("reveal");
        el.dataset.reveal = "scale";
      });
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

    // --- where you are in the page --------------------------------------
    // Not motion, so it is deliberately outside the gate above: somebody with
    // reduced motion or calm mode on still benefits from the nav saying which
    // room they are in. It marks the link with aria-current, so it is not
    // conveyed by the underline alone.
    const navLinks = new Map<string, HTMLAnchorElement>();
    document
      .querySelectorAll<HTMLAnchorElement>('.site-nav a[href*="#"]')
      .forEach((link) => {
        const id = link.getAttribute("href")?.split("#")[1];
        if (id && document.getElementById(id)) navLinks.set(id, link);
      });

    let spy: IntersectionObserver | null = null;
    if (navLinks.size) {
      const seen = new Set<string>();
      const mark = () => {
        // The topmost section currently in the reading band wins, so scrolling
        // back up hands the mark back rather than leaving it on the last one.
        const current = [...navLinks.keys()].find((id) => seen.has(id));
        navLinks.forEach((link, id) => {
          if (id === current) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      };
      spy = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = entry.target.id;
            if (entry.isIntersecting) seen.add(id);
            else seen.delete(id);
          }
          mark();
        },
        // A band across the middle of the viewport: a section counts as "here"
        // when it is what you are actually reading, not when it first peeks in.
        { rootMargin: "-45% 0px -45% 0px" },
      );
      navLinks.forEach((_, id) => {
        const section = document.getElementById(id);
        if (section) spy!.observe(section);
      });
    }

    return () => {
      observer?.disconnect();
      spy?.disconnect();
      calmWatcher.disconnect();
      reduceMq.removeEventListener("change", arm);
      if (frame) cancelAnimationFrame(frame);
      fields.forEach((field) => field.removeEventListener("pointermove", onMove as EventListener));
    };
  }, []);

  return null;
}
