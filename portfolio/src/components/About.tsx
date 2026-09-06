"use client";
import { motion, useReducedMotion } from "motion/react";
import { ABOUT, CTA, SITE } from "../content";
import { EASE, viewportOnce } from "../lib/motion";
import { Cta } from "./primitives/Cta";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";

/* Three straight answers, set as a zigzag rather than three equal columns, so
   the block reads as a composition instead of a spec sheet. This used to be a
   list of disciplines, which was the services section again in other words. */
const SPANS = ["md:col-span-6", "md:col-span-5 md:col-start-8", "md:col-span-6 md:col-start-2"];

export function About() {
  const reduce = useReducedMotion();
  const hasPortrait = Boolean(ABOUT.portrait);

  return (
    <section id="about" data-surface="light" className="s-light py-[clamp(3.25rem,8vh,5.5rem)]">
      <div className="u-wide">
        <div className="grid gap-10 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-7">
            <p className="u-label">Who you are hiring</p>
            <WordReveal text={ABOUT.heading} stagger={0.03} className="u-h2 mt-4 max-w-[13ch]" />
          </div>

          <div className="md:col-span-4 md:col-start-9">
            {ABOUT.body.map((p, i) => (
              <Reveal key={p.slice(0, 20)} delay={0.06 * i} className="mb-5 last:mb-0">
                <p className="u-body max-w-[46ch] text-[1rem]">{p}</p>
              </Reveal>
            ))}
            <Reveal delay={0.18}>
              <div className="u-line-t mt-8 pt-6">
                <p className="flex items-center gap-2.5 text-[0.9rem]">
                  <span aria-hidden className="relative flex h-2 w-2">
                    {!reduce && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-[var(--accent-graphic)] opacity-60" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-pill bg-[var(--accent-graphic)]" />
                  </span>
                  {SITE.availability}
                </p>
                <div className="mt-5">
                  <Cta href={CTA.href} variant="text">
                    {CTA.label}
                  </Cta>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {hasPortrait && (
          <Reveal delay={0.1}>
            <img
              src={ABOUT.portrait}
              alt="Kit Ryder"
              width={900}
              height={600}
              loading="lazy"
              className="mt-14 aspect-[3/2] w-full object-cover"
            />
          </Reveal>
        )}

        <ol className="mt-[clamp(3rem,7vh,4.5rem)] grid gap-x-10 gap-y-[clamp(2rem,4vh,3rem)] md:grid-cols-12">
          {ABOUT.straight.map((step, i) => (
            <motion.li
              key={step.title}
              className={SPANS[i % SPANS.length]}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.6, delay: (i % 2) * 0.08, ease: EASE }}
            >
              <div className="u-line-t flex items-start gap-5 pt-5">
                <span aria-hidden className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 bg-[var(--accent-graphic)]" />
                <div>
                  <h3 className="u-display text-[clamp(1.25rem,1.9vw,1.6rem)]">{step.title}</h3>
                  <p className="u-body mt-2 max-w-[42ch] text-[0.95rem]">{step.note}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
