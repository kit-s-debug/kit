"use client";
import { motion, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { WHERE } from "../content";
import { TOWNS } from "../data/pembrokeshire";
import { useDrift } from "../lib/motion";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";
import { Terrain } from "./Terrain";

/* The Pembrokeshire beat. No illustrated map: this is the point where the
   landscape behind the section stops being abstract and resolves into the
   real coastline, so the copy gets out of its way. */
export function Where() {
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLDivElement>(null);
  const headingY = useDrift(headingRef);

  return (
    <section
      id="where"
      data-surface="dark"
      className="s-dark relative min-h-[86vh] overflow-hidden py-[clamp(3.5rem,9vh,6rem)]"
    >
      <Terrain mode="coast" className="absolute inset-0 h-full w-full" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(110%_100%_at_0%_45%,rgba(12,13,16,0.95)_0%,rgba(12,13,16,0.55)_45%,rgba(12,13,16,0)_78%)]"
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--color-ink)] to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--color-ink)] to-transparent" />

      <div className="u-wide relative flex min-h-[68vh] items-center">
        <div className="max-w-[34rem]">
          <motion.div ref={headingRef} style={reduce ? undefined : { y: headingY }}>
            <p className="u-label">Where I work</p>
            <WordReveal text={WHERE.heading} className="u-h2 mt-4 max-w-[13ch]" />
          </motion.div>
          <Reveal delay={0.12}>
            <p className="u-lede mt-6 max-w-[40ch]">{WHERE.body}</p>
          </Reveal>
          <Reveal delay={0.2}>
            <ul className="mt-8 flex max-w-[28rem] flex-wrap gap-x-5 gap-y-1.5 text-[0.9rem] text-[var(--fg-2)]">
              {TOWNS.map((t) => (
                <li key={t.name}>{t.name}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
