"use client";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FEATURED, HERO, SITE } from "../content";
import { EASE } from "../lib/motion";
import { BrowserFrame } from "./primitives/BrowserFrame";
import { Cta } from "./primitives/Cta";
import { WordReveal } from "./primitives/WordReveal";
import { Terrain } from "./Terrain";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const frameY = useTransform(scrollYProgress, [0, 1], [0, -180]);

  /* The frame leans a few degrees toward the cursor. Motion values only, so
     the pointer never re-renders the tree. */
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const ry = useSpring(useTransform(px, [0, 1], [-17, -7]), { stiffness: 120, damping: 22 });
  const rx = useSpring(useTransform(py, [0, 1], [9, 1]), { stiffness: 120, damping: 22 });

  /* The lean is a desktop idea. On a phone the frame is the whole width and a
     fixed rotation just reads as a skewed image. */
  const [tilt, setTilt] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
    const on = () => setTilt(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return (
    <section
      ref={ref}
      id="top"
      data-surface="dark"
      className="s-dark relative min-h-[100dvh] overflow-hidden"
      onPointerMove={(e) => {
        if (reduce) return;
        px.set(e.clientX / window.innerWidth);
        py.set(e.clientY / window.innerHeight);
      }}
    >
      <Terrain mode="drift" className="absolute inset-0 h-full w-full" />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_95%_at_10%_60%,rgba(12,13,16,0.94)_0%,rgba(12,13,16,0.72)_38%,rgba(12,13,16,0.15)_78%)]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[var(--color-ink)]" />

      <div className="u-wide relative grid min-h-[100dvh] grid-cols-12 items-center gap-y-14 pt-28 pb-16 md:pt-24 md:pb-20">
        <motion.div
          style={reduce ? undefined : { y: copyY, opacity: fade }}
          className="col-span-12 lg:col-span-7 xl:col-span-6"
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

        {/* The work is in the hero, not two screens below it. */}
        <motion.div
          className="col-span-12 lg:col-span-5 xl:col-span-6"
          style={reduce ? undefined : { y: frameY }}
          initial={reduce ? false : { opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.7, ease: EASE }}
        >
          <div className="lg:-mr-[14vw] xl:-mr-[10vw]" style={{ perspective: 1400 }}>
            <motion.div
              style={tilt && !reduce ? { rotateY: ry, rotateX: rx, transformStyle: "preserve-3d" } : undefined}
              className="origin-left"
            >
              <BrowserFrame
                url="eddierocks.co.uk"
                className="shadow-[0_50px_120px_-30px_rgba(0,0,0,0.85)]"
              >
                <img
                  src={FEATURED.poster}
                  alt={`The ${FEATURED.name} website`}
                  width={1200}
                  height={676}
                  fetchPriority="high"
                  className="block w-full"
                />
              </BrowserFrame>
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          className="col-span-12 text-[0.8rem] tracking-[0.02em] text-[var(--fg-2)]"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 1.4 }}
        >
          <span className="u-accent">{SITE.place}</span>
          <span className="mx-3 opacity-40">/</span>
          {HERO.proof}
        </motion.p>
      </div>
    </section>
  );
}
