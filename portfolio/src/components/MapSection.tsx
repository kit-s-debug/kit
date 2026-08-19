"use client";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { MAP_SECTION } from "../content";
import { COAST_PATH, LAND_PATH, TOWNS } from "../data/pembrokeshire";
import { EASE, viewportOnce } from "../lib/motion";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";

const VIEW = { x: 132, y: -14, w: 836, h: 928 };
const GRID = [250, 430, 610, 790];

/* Two labels sit to the left of their marker so they do not collide with the
   town next door. Everything else reads left to right off the marker. */
const LEFT_OF_MARKER = new Set(["Haverfordwest", "Milford Haven"]);

/* Pembrokeshire, drawn from Natural Earth coastline data rather than an
   illustration, because anyone local will recognise the real shape. The names
   list beside it is the accessible control: the SVG itself is decorative. */
export function MapSection() {
  const [active, setActive] = useState<string | null>(null);
  const reduce = useReducedMotion();

  return (
    <section className="u-hairline-t u-hairline-b bg-ink-2 py-[clamp(4.5rem,11vh,8rem)]">
      <div className="u-container grid items-center gap-14 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <WordReveal text={MAP_SECTION.heading} className="u-h2 max-w-[13ch] text-chalk" />
          <Reveal delay={0.12}>
            <p className="u-lede mt-7">{MAP_SECTION.body}</p>
          </Reveal>

          <Reveal delay={0.2}>
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2.5">
              {TOWNS.map((t) => (
                <li key={t.name}>
                  <button
                    type="button"
                    onPointerEnter={() => setActive(t.name)}
                    onPointerLeave={() => setActive(null)}
                    onFocus={() => setActive(t.name)}
                    onBlur={() => setActive(null)}
                    className={`text-[0.92rem] transition-colors duration-300 ${
                      active === t.name ? "text-ember" : "text-mist hover:text-chalk"
                    }`}
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <svg
            viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
            className="w-full"
            aria-hidden
            focusable="false"
          >
            {GRID.map((g) => (
              <g key={g} stroke="rgb(238 236 231 / 0.05)" strokeWidth="1">
                <line x1={VIEW.x} x2={VIEW.x + VIEW.w} y1={g} y2={g} />
                <line y1={VIEW.y} y2={VIEW.y + VIEW.h} x1={g} x2={g} />
              </g>
            ))}

            <path d={LAND_PATH} fill="rgb(238 236 231 / 0.035)" />
            <motion.path
              d={COAST_PATH}
              fill="none"
              stroke="rgb(238 236 231 / 0.55)"
              strokeWidth="2.2"
              strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={viewportOnce}
              transition={{ duration: 2.4, ease: EASE }}
            />

            {TOWNS.map((t, i) => {
              const on = active === t.name;
              const flip = LEFT_OF_MARKER.has(t.name);
              return (
                <g
                  key={t.name}
                  onPointerEnter={() => setActive(t.name)}
                  onPointerLeave={() => setActive(null)}
                  style={{ pointerEvents: "auto" }}
                >
                  <circle cx={t.x} cy={t.y} r={26} fill="transparent" />
                  {on && (
                    <motion.circle
                      cx={t.x}
                      cy={t.y}
                      r={18}
                      fill="none"
                      stroke="var(--color-rust)"
                      strokeWidth="1.5"
                      initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ transformOrigin: `${t.x}px ${t.y}px` }}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  )}
                  <motion.rect
                    x={t.x - 4}
                    y={t.y - 4}
                    width={8}
                    height={8}
                    fill={on ? "var(--color-rust)" : "var(--color-chalk)"}
                    initial={reduce ? false : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={viewportOnce}
                    transition={{ duration: 0.4, delay: 0.9 + i * 0.06 }}
                  />
                  <motion.text
                    x={flip ? t.x - 16 : t.x + 16}
                    y={t.y + 7}
                    textAnchor={flip ? "end" : "start"}
                    fontSize="21"
                    className="font-sans"
                    fill={on ? "var(--color-chalk)" : "rgb(238 236 231 / 0.55)"}
                    initial={reduce ? false : { opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={viewportOnce}
                    transition={{ duration: 0.5, delay: 1 + i * 0.06 }}
                  >
                    {t.name}
                  </motion.text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
