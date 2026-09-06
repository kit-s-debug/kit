"use client";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { FEATURED } from "../content";
import { EASE, viewportOnce } from "../lib/motion";
import { BrowserFrame } from "./primitives/BrowserFrame";
import { Cta } from "./primitives/Cta";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";

/* The flagship case study. The recording of the real site is scrubbed by the
   scroll on a pointer device, so moving down the page moves down the site you
   are looking at. Touch devices get an ordinary muted loop instead, because
   seeking a video by finger is unreliable on iOS and janky everywhere else. */
export function Featured() {
  const ref = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [canPlay, setCanPlay] = useState(true);
  const [scrub, setScrub] = useState(false);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const frameScale = useTransform(scrollYProgress, [0, 0.35, 1], [0.94, 1, 1]);
  const frameY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  useEffect(() => {
    const probe = document.createElement("video");
    const ok = Boolean(probe.canPlayType('video/webm; codecs="vp8"'));
    setCanPlay(ok);
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setScrub(ok && fine && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  /* Target time is written by scroll and eased toward in a frame loop, so a
     fast flick does not turn into a stack of seeks. */
  const target = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const v = videoRef.current;
    if (!scrub || !v || !v.duration) return;
    target.current = Math.min(0.999, Math.max(0, (p - 0.12) / 0.66)) * v.duration;
  });

  useEffect(() => {
    if (!scrub) return;
    let raf = 0;
    const step = () => {
      raf = requestAnimationFrame(step);
      const v = videoRef.current;
      if (!v || !v.duration || v.seeking) return;
      const delta = target.current - v.currentTime;
      if (Math.abs(delta) > 0.03) v.currentTime += delta * 0.18;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [scrub]);

  return (
    <section
      ref={ref}
      id="work"
      data-surface="dark"
      className="s-dark relative overflow-hidden py-[clamp(3.25rem,8vh,5.5rem)]"
    >
      <div aria-hidden className="u-wide">
        <div className="u-rule" />
      </div>

      <div className="u-wide mt-[clamp(2.25rem,5vh,3.5rem)] grid gap-8 md:grid-cols-12">
        <div className="md:col-span-7">
          <Reveal>
            <p className="u-label">{FEATURED.kicker}</p>
          </Reveal>
          <WordReveal text={FEATURED.headline} className="u-h2 mt-5 max-w-[16ch]" />
        </div>
        <div className="md:col-span-4 md:col-start-9 md:self-end">
          <Reveal delay={0.12}>
            <p className="u-body text-[0.98rem]">{FEATURED.summary}</p>
          </Reveal>
        </div>
      </div>

      {/* The site itself, at the size it deserves. */}
      <motion.div
        style={reduce ? undefined : { scale: frameScale, y: frameY }}
        className="u-wide mt-[clamp(2rem,5vh,3.25rem)]"
      >
        <BrowserFrame url="eddierocks.co.uk" className="shadow-[0_60px_140px_-40px_rgba(0,0,0,0.9)]">
          <div className="relative aspect-[1200/676] w-full bg-[var(--color-ink-2)]">
            {canPlay ? (
              <video
                ref={videoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src={FEATURED.video}
                poster={FEATURED.poster}
                muted
                playsInline
                preload="metadata"
                loop={!scrub}
                autoPlay={!scrub && !reduce}
                aria-label={`A scroll through the ${FEATURED.name} website`}
              />
            ) : (
              <img
                src={FEATURED.poster}
                alt={`The ${FEATURED.name} website`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
        </BrowserFrame>
      </motion.div>

      <div className="u-wide mt-[clamp(2rem,5vh,3.25rem)] grid gap-10 md:grid-cols-12">
        <dl className="md:col-span-4">
          {FEATURED.facts.map((f, i) => (
            <motion.div
              key={f.k}
              className="u-line-t flex items-baseline justify-between gap-6 py-3"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 0.5, delay: i * 0.06, ease: EASE }}
            >
              <dt className="text-[0.78rem] tracking-[0.14em] text-[var(--fg-2)] uppercase">{f.k}</dt>
              <dd className="text-right text-[0.92rem]">{f.v}</dd>
            </motion.div>
          ))}
        </dl>

        <div className="md:col-span-6 md:col-start-7">
          {FEATURED.body.map((p, i) => (
            <Reveal key={p.slice(0, 20)} delay={0.06 * i} className="mb-5 last:mb-0">
              <p className="u-body max-w-[58ch] text-[1rem]">{p}</p>
            </Reveal>
          ))}
          <Reveal delay={0.18}>
            <p className="mt-7 max-w-[46ch] text-[1.05rem] leading-[1.5]">{FEATURED.outcome}</p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Cta href={FEATURED.cta.href}>{FEATURED.cta.label}</Cta>
              <a
                href={FEATURED.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-[0.95rem]"
              >
                <span className="relative">
                  View the live site
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent-graphic)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </span>
                <ArrowUpRight
                  size={16}
                  weight="regular"
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
