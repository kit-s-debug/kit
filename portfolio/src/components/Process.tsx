"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { PROCESS } from "../content";
import { EASE, useDrift, viewportOnce } from "../lib/motion";
import { Cta } from "./primitives/Cta";
import { CTA } from "../content";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";

/* Four steps on one rule that draws itself as you read along it. Not four
   cards: the line is the thing, the steps hang off it. */
export function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const grow = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const headingY = useDrift(headingRef);

  return (
    <section data-surface="dark" className="s-dark py-[clamp(3.25rem,8vh,5.5rem)]">
      <div className="u-wide">
        <div className="grid gap-8 md:grid-cols-12">
          <motion.div ref={headingRef} style={reduce ? undefined : { y: headingY }} className="md:col-span-6">
            <p className="u-label">How it works</p>
            <WordReveal text={PROCESS.heading} className="u-h2 mt-4 max-w-[15ch]" />
          </motion.div>
          {/* This used to be three ticked promises, which were the fact strip and
             the About answers said a third time. One line about the process. */}
          <motion.p
            className="u-body md:col-span-5 md:col-start-8 md:self-end"
            initial={reduce ? false : { opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {PROCESS.note}
          </motion.p>
        </div>

        <div ref={ref} className="relative mt-[clamp(2.75rem,6vh,4rem)]">
          <span aria-hidden className="absolute top-[7px] right-0 left-0 hidden h-px bg-[var(--line)] md:block" />
          <motion.span
            aria-hidden
            className="absolute top-[7px] left-0 hidden h-px w-full origin-left bg-[var(--accent-graphic)] md:block"
            style={reduce ? { scaleX: 1 } : { scaleX: grow }}
          />
          <ol className="grid gap-10 md:grid-cols-4 md:gap-8">
            {PROCESS.steps.map((s, i) => (
              <motion.li
                key={s.k}
                className="relative md:pt-9"
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.6, delay: i * 0.09, ease: EASE }}
              >
                <span
                  aria-hidden
                  className="absolute top-[3px] left-0 hidden h-[9px] w-[9px] rounded-pill bg-[var(--accent-graphic)] md:block"
                />
                <h3 className="u-display text-[clamp(1.35rem,2vw,1.7rem)]">{s.k}</h3>
                <p className="u-body mt-3 max-w-[32ch] text-[0.93rem]">{s.v}</p>
                <p className="u-accent mt-3 text-[0.78rem] tracking-[0.12em] uppercase">{s.note}</p>
              </motion.li>
            ))}
          </ol>
        </div>

        <Reveal delay={0.1}>
          <div className="u-line-t mt-[clamp(2.5rem,5vh,3.5rem)] flex flex-wrap items-center justify-between gap-6 pt-8">
            <p className="max-w-[42ch] text-[1.05rem] leading-[1.5]">
              Bring the thing you are unhappy with. That is enough to start from.
            </p>
            <Cta href={CTA.href}>{CTA.label}</Cta>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
