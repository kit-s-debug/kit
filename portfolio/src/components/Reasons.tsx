"use client";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { useRef } from "react";
import { REASONS } from "../content";
import { WordReveal } from "./primitives/WordReveal";

/* Seven reasons is too many for a grid and far too many for a bulleted list, so
   they run as a rail the visitor drives. */
export function Reasons() {
  const rail = useRef<HTMLUListElement>(null);
  const reduce = useReducedMotion();
  const { scrollXProgress } = useScroll({ container: rail, axis: "x" });
  const scaleX = useTransform(scrollXProgress, [0, 1], [0.12, 1]);

  const nudge = (dir: 1 | -1) => {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 720), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="py-[clamp(4rem,10vh,7rem)]">
      <div className="u-container flex flex-wrap items-end justify-between gap-6">
        <WordReveal text="Why work with me" className="u-h2 max-w-[14ch] text-chalk" />
        <div className="hidden gap-2 md:flex">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => nudge(dir)}
              aria-label={dir === -1 ? "Previous reasons" : "More reasons"}
              className="rounded-pill border border-[var(--color-slate-line)] p-3 text-mist transition-colors duration-300 hover:border-chalk/40 hover:text-chalk"
            >
              {dir === -1 ? <ArrowLeft size={16} weight="regular" /> : <ArrowRight size={16} weight="regular" />}
            </button>
          ))}
        </div>
      </div>

      <ul
        ref={rail}
        className="u-rail-pad mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {REASONS.map((r) => (
          <li
            key={r.title}
            className="group relative flex min-h-[15rem] w-[17.5rem] shrink-0 snap-start flex-col justify-between border border-[var(--color-slate-line)] bg-ink-2 p-7 transition-colors duration-500 hover:bg-ink-3 sm:w-[19rem]"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-rust transition-transform duration-600 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
            />
            <h3 className="u-display text-[1.3rem] leading-[1.15] text-chalk">{r.title}</h3>
            <p className="mt-6 text-[0.92rem] leading-[1.65] text-mist">{r.body}</p>
          </li>
        ))}
      </ul>

      <div className="u-container mt-2">
        <div className="h-px w-full max-w-[22rem] bg-[var(--color-slate-line)]">
          <motion.div className="h-px origin-left bg-chalk/50" style={{ scaleX }} />
        </div>
      </div>
    </section>
  );
}
