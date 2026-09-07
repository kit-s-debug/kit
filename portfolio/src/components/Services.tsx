"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { SERVICES } from "../content";
import { EASE, useDrift } from "../lib/motion";
import { WordReveal } from "./primitives/WordReveal";

/* Big type rows that open in place. The first is open on arrival so the section
   never reads as a closed filing cabinet. */
export function Services() {
  const [open, setOpen] = useState(0);
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLDivElement>(null);
  const headingY = useDrift(headingRef);

  return (
    <section id="services" data-surface="light" className="s-light py-[clamp(3.25rem,8vh,5.5rem)]">
      <div className="u-wide">
      <motion.div ref={headingRef} style={reduce ? undefined : { y: headingY }}>
        <p className="u-label">What I do</p>
        <WordReveal text="Four things. Most projects need the first two." className="u-h2 mt-4 max-w-[18ch]" />
      </motion.div>

      <div className="mt-10 u-line-t">
        {SERVICES.map((s, i) => {
          const isOpen = open === i;
          return (
            <div key={s.title} className="u-line-b">
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`service-${i}`}
                  onClick={() => setOpen(i)}
                  onPointerEnter={() => !reduce && setOpen(i)}
                  className="group grid w-full cursor-pointer grid-cols-[1fr_auto] items-center gap-6 py-6 text-left md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)_auto] md:py-7"
                >
                  <span
                    className={`u-display text-[clamp(1.5rem,3.2vw,2.5rem)] transition-all duration-500 ease-[var(--ease-out-expo)] ${
                      isOpen ? "translate-x-2 md:translate-x-3" : "opacity-45 group-hover:opacity-100"
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="col-span-2 hidden max-w-[36ch] text-[0.92rem] leading-[1.55] text-[var(--fg-2)] md:col-span-1 md:block">
                    {s.lead}
                  </span>
                  <Plus
                    size={20}
                    weight="regular"
                    aria-hidden
                    className={`shrink-0 text-[var(--fg-2)] transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                      isOpen ? "rotate-45 text-[var(--accent)]" : "group-hover:rotate-90"
                    }`}
                  />
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`service-${i}`}
                    key="panel"
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-8 pb-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:pb-9">
                      <p className="max-w-[46ch] text-[1rem] leading-[1.7] md:pl-3">
                        {s.detail}
                        <span className="u-fg2 mt-4 block text-[0.92rem] md:hidden">{s.lead}</span>
                      </p>
                      <ul>
                        {s.points.map((p, j) => (
                          <motion.li
                            key={p}
                            className="u-line-t py-3 text-[0.92rem] text-mist first:border-t-0 first:pt-0"
                            initial={reduce ? false : { opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.45, delay: 0.08 + j * 0.06, ease: EASE }}
                          >
                            {p}
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
