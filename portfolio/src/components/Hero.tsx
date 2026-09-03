"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { HERO, SITE } from "../content";
import { EASE } from "../lib/motion";
import { Cta } from "./primitives/Cta";
import { WordReveal } from "./primitives/WordReveal";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} id="top" className="relative min-h-[100dvh]">
      {/* The terrain runs wild on the right. This only protects the words. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(95%_80%_at_4%_76%,rgba(8,9,11,0.95)_0%,rgba(8,9,11,0.66)_40%,rgba(8,9,11,0)_74%)]"
      />

      <motion.div
        style={reduce ? undefined : { y, opacity: fade }}
        className="u-container relative flex min-h-[100dvh] flex-col justify-end pt-24 pb-[12vh]"
      >
        <motion.p
          className="u-wordmark text-[0.78rem] tracking-[0.34em] text-mist"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        >
          {SITE.name}
        </motion.p>

        <WordReveal
          as="h1"
          play="load"
          delay={0.35}
          stagger={0.05}
          text={HERO.headline}
          className="u-display mt-7 max-w-[min(100%,1180px)] text-[clamp(2rem,4.9vw,4.05rem)] text-chalk"
        />

        <motion.p
          className="mt-7 max-w-[44ch] text-[clamp(0.98rem,1.1vw,1.1rem)] leading-[1.7] text-mist"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
        >
          {HERO.sub}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-3.5"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.15, ease: EASE }}
        >
          <Cta href={HERO.primary.href}>{HERO.primary.label}</Cta>
          <Cta href={HERO.secondary.href} variant="ghost" icon={false}>
            {HERO.secondary.label}
          </Cta>
        </motion.div>
      </motion.div>
    </section>
  );
}
