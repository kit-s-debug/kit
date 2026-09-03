"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ABOUT } from "../content";
import { EASE, viewportOnce } from "../lib/motion";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";

/* The progression rail. The line fills as the section is read, so the eye is
   pulled down it rather than the stops all arriving at once. */
function Progression() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 78%", "end 70%"] });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <ol ref={ref} className="relative mt-12 pl-7 md:mt-14 md:pl-10">
      <span aria-hidden className="absolute top-2 bottom-2 left-0 w-px bg-[var(--color-slate-line)]" />
      <motion.span
        aria-hidden
        className="absolute top-2 bottom-2 left-0 w-px origin-top bg-rust"
        style={reduce ? { scaleY: 1 } : { scaleY }}
      />
      {ABOUT.progression.map((step, i) => (
        <li key={step.title} className="relative grid gap-1.5 pb-6 last:pb-0 md:grid-cols-12 md:gap-10">
          <motion.span
            aria-hidden
            className="absolute top-[0.6rem] -left-7 -ml-[2.5px] h-1.5 w-1.5 bg-chalk md:-left-10"
            initial={reduce ? false : { scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={viewportOnce}
            transition={{ duration: 0.4, delay: 0.05 * i, ease: EASE }}
          />
          <Reveal delay={0.05 * i} y={16} className="md:col-span-4">
            <h3 className="u-display text-[clamp(1.3rem,2vw,1.7rem)] text-chalk">{step.title}</h3>
          </Reveal>
          <Reveal delay={0.05 * i + 0.05} y={16} className="md:col-span-6 md:col-start-6">
            <p className="max-w-[52ch] text-[0.97rem] leading-[1.7] text-mist">{step.note}</p>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

export function About() {
  const hasPortrait = Boolean(ABOUT.portrait);

  return (
    <section id="about" className="u-container py-[clamp(3.5rem,8vh,5.5rem)]">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <WordReveal text={ABOUT.heading} stagger={0.03} className="u-h2 text-chalk" />
          {hasPortrait && (
            <Reveal delay={0.15}>
              <img
                src={ABOUT.portrait}
                alt="Kit Ryder"
                width={900}
                height={1125}
                loading="lazy"
                className="mt-12 aspect-[4/5] w-full max-w-[26rem] object-cover"
              />
            </Reveal>
          )}
        </div>

        <div className="md:col-span-6 md:col-start-7">
          {ABOUT.body.map((p, i) => (
            <Reveal key={p.slice(0, 24)} delay={0.06 * i} className="mb-5 last:mb-0">
              <p className="max-w-[56ch] text-[1.02rem] leading-[1.75] text-mist">{p}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <Progression />
    </section>
  );
}
