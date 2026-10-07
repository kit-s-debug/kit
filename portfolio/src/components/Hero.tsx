"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { HERO, SITE } from "../content";
import { EASE } from "../lib/motion";
import { Cta } from "./primitives/Cta";
import { WordReveal } from "./primitives/WordReveal";
import { Terrain } from "./Terrain";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section ref={ref} id="top" data-surface="dark" className="s-dark relative min-h-[100dvh] overflow-hidden">
      <Terrain mode="drift" className="absolute inset-0 h-full w-full" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_95%_at_10%_60%,rgba(12,13,16,0.94)_0%,rgba(12,13,16,0.72)_38%,rgba(12,13,16,0.15)_78%)]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[var(--color-ink)]" />

      <div className="u-wide relative grid min-h-[100dvh] grid-cols-12 items-center gap-y-14 pt-28 pb-16 md:pt-24 md:pb-20">
        <motion.div
          style={reduce ? undefined : { y: copyY, opacity: fade }}
          className="col-span-12 max-w-[42rem]"
        >
          <motion.p
            className="u-label"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          >
            {HERO.eyebrow}
          </motion.p>

          <h1 className="mt-7">
            {HERO.headline.map((line, i) => (
              <WordReveal
                key={line}
                as="span"
                play="load"
                delay={0.35 + i * 0.14}
                stagger={0.045}
                text={line}
                className={`u-display block text-[clamp(2.15rem,6vw,4.4rem)] ${i === 2 ? "text-[var(--accent)]" : ""}`}
              />
            ))}
          </h1>

          <motion.p
            className="u-body mt-7 max-w-[38ch] text-[clamp(0.98rem,1.05vw,1.08rem)]"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
          >
            {HERO.sub}
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-3.5"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: EASE }}
          >
            <Cta href={HERO.primary.href}>{HERO.primary.label}</Cta>
            <Cta href={HERO.secondary.href} variant="ghost" icon={false}>
              {HERO.secondary.label}
            </Cta>
          </motion.div>
        </motion.div>

        <motion.p
          className="col-span-12 text-[0.8rem] tracking-[0.02em] text-[var(--fg-2)]"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.4 }}
        >
          <span className="u-accent">{SITE.place}</span>
        </motion.p>
      </div>
    </section>
  );
}
