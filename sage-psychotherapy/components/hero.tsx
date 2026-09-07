"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import roomImage from "@/public/images/room.jpg";
import { cta, hero, practice } from "@/content/site";

/**
 * The hero, and the pinned act that follows it, are one section sharing one
 * photograph — which matters when the whole site has three images.
 *
 * Progressive enhancement, in this order:
 *   1. No JavaScript: the room, the sentence, the button, then the three lines
 *      stacked underneath. Everything readable, nothing pinned.
 *   2. JavaScript, motion allowed: the section becomes 320vh tall, the image
 *      pins, and the lines cross-fade over it as you scroll.
 *   3. Calm mode or prefers-reduced-motion: back to (1).
 *
 * The scroll work is an IntersectionObserver over four sentinels against a line
 * across the middle of the viewport. No scroll listener, no per-frame work, no
 * animation library.
 */
export function Hero() {
  const [pinned, setPinned] = useState(false);
  const [beat, setBeat] = useState(0);
  const stage = useRef<HTMLElement>(null);

  useEffect(() => {
    const calm = () =>
      document.documentElement.getAttribute("data-calm") === "on" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const settle = () => setPinned(!calm());
    settle();

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    motion.addEventListener("change", settle);
    // Calm mode is a DOM attribute rather than a media query, so watch for it.
    const observer = new MutationObserver(settle);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-calm"],
    });

    return () => {
      motion.removeEventListener("change", settle);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!pinned || !stage.current) return;
    const marks = stage.current.querySelectorAll<HTMLElement>("[data-mark]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setBeat(Number(entry.target.getAttribute("data-mark")));
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    marks.forEach((mark) => io.observe(mark));
    return () => io.disconnect();
  }, [pinned]);

  return (
    <section
      id="top"
      ref={stage}
      className="hero-stage"
      data-pin={pinned || undefined}
      aria-label="Sage Psychotherapy and Counselling"
    >
      <div className="hero-viewport" data-beat={beat}>
        <div className="hero-image">
          <Image
            src={roomImage}
            alt={hero.imageAlt}
            fill
            priority
            sizes="100vw"
            placeholder="blur"
            quality={78}
            className="hero-photo"
          />
          <div className="hero-vignette" aria-hidden="true" />
          <div className="hero-warm" aria-hidden="true" />
        </div>

        <div className="shell-editorial hero-content">
          <div className="hero-opening">
            <p className="kicker hero-kicker">{hero.kicker}</p>
            <h1 className="hero-headline">
              <span lang="cy" className="hero-croeso">
                {hero.welcomeWelsh}.
              </span>{" "}
              {hero.headline}
            </h1>
            <hr className="sill hero-sill" />
            <p className="hero-credit">{hero.credit}</p>
            <a href="#book" className="action hero-action">
              {cta.primary}
            </a>
            <p className="hero-phone">
              {cta.phoneLabel}{" "}
              <a href={practice.phoneHref} className="link-plain">
                {practice.phone}
              </a>
            </p>
          </div>

          <div className="hero-beats">
            {hero.beats.map((line, index) => (
              <p key={line} className="hero-beat" data-i={index + 1}>
                {/* split into words so each can rise in turn — a line that
                    arrives word by word reads as considered, where a single
                    fade reads as a slide transition */}
                {line.split(" ").map((word, w) => (
                  <Fragment key={`${word}-${w}`}>
                    {/* a real space between words, so the line still reads as a
                        sentence to a screen reader and copies out correctly */}
                    {w > 0 ? " " : null}
                    <span className="beat-word" style={{ "--w": w } as React.CSSProperties}>
                      <span>{word}</span>
                    </span>
                  </Fragment>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* Sentinels for the pinned act. Zero height, no paint, no layout cost. */}
      <div className="hero-marks" aria-hidden="true">
        {Array.from({ length: hero.beats.length + 1 }).map((_, i) => (
          <div key={i} data-mark={i} />
        ))}
      </div>
    </section>
  );
}
