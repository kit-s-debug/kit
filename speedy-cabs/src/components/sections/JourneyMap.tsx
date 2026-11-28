"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { business } from "@/lib/business";
import { useBooking } from "@/lib/booking";
import { ArrowRight } from "../ui/Icons";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

/* Simple equirectangular projection for a stylised, not-to-scale map. */
const LON0 = -5.36;
const LAT0 = 52.07;
const SX = 1180; // px per degree of longitude (already scaled by cos(lat))
const SY = 1900;
const px = (lon: number, lat: number): [number, number] => [(lon - LON0) * SX, (LAT0 - lat) * SY];

/** Approximate Pembrokeshire coastline, hand-simplified for illustration. */
const COAST: [number, number][] = [
  [-4.5, 52.12], [-4.62, 52.07], [-4.75, 52.04], [-4.84, 52.02], [-4.9, 52.03], [-4.94, 52.012],
  [-4.98, 52.0], [-5.03, 52.02], [-5.075, 52.03], [-5.11, 52.0], [-5.18, 51.965], [-5.21, 51.94],
  [-5.26, 51.915], [-5.315, 51.905], [-5.31, 51.875], [-5.27, 51.866], [-5.2, 51.872], [-5.14, 51.852],
  [-5.115, 51.81], [-5.105, 51.775], [-5.16, 51.758], [-5.25, 51.738], [-5.2, 51.705], [-5.17, 51.683],
  [-5.15, 51.703], [-5.1, 51.71], [-5.04, 51.712], [-4.98, 51.715], [-4.945, 51.722], [-4.93, 51.71],
  [-4.95, 51.697], [-5.03, 51.692], [-5.1, 51.683], [-5.075, 51.652], [-5.06, 51.64], [-4.98, 51.61],
  [-4.93, 51.598], [-4.87, 51.612], [-4.8, 51.638], [-4.75, 51.648], [-4.705, 51.665], [-4.69, 51.708],
  [-4.655, 51.735], [-4.5, 51.75],
];
const RIVER: [number, number][] = [
  [-4.945, 51.722], [-4.925, 51.745], [-4.93, 51.77], [-4.955, 51.787], [-4.969, 51.8015],
];

const toPath = (pts: [number, number][], close = false) =>
  pts.map(([lon, lat], i) => `${i ? "L" : "M"}${px(lon, lat).map((n) => n.toFixed(1)).join(" ")}`).join(" ") + (close ? " Z" : "");

const LAND = `${toPath(COAST)} L ${px(-4.5, 51.5).join(" ")} L ${px(-4.3, 51.5).join(" ")} L ${px(-4.3, 52.2).join(" ")} Z`;

const LABEL_SIDE: Record<string, "l" | "r" | "t" | "b"> = {
  Haverfordwest: "r",
  "Milford Haven": "l",
  "Pembroke Dock": "l",
  Pembroke: "r",
  Tenby: "l",
  Fishguard: "r",
  "St Davids": "b",
};

export function JourneyMap() {
  const { prefill } = useBooking();
  const reduce = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [active, setActive] = useState<string | null>(null);

  const hub = business.areas.find((a) => "hub" in a && a.hub)!;
  const towns = business.areas.filter((a) => a.name !== hub.name);
  const [hx, hy] = px(hub.lon, hub.lat);

  const routes = useMemo(
    () =>
      towns.map((t, i) => {
        const [x, y] = px(t.lon, t.lat);
        // Bend each route gently so they read as roads, not straight lines.
        const mx = (hx + x) / 2;
        const my = (hy + y) / 2;
        const dx = x - hx;
        const dy = y - hy;
        const bend = (i % 2 ? 1 : -1) * 0.18;
        const c = [mx - dy * bend, my + dx * bend];
        return { name: t.name, x, y, d: `M${hx} ${hy} Q ${c[0].toFixed(1)} ${c[1].toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}` };
      }),
    [towns, hx, hy],
  );

  const station = px(-4.959, 51.797);
  const selected = active ?? null;

  return (
    <section id="journeys" aria-labelledby="journeys-title" className="relative overflow-hidden bg-ivory pt-32 pb-36 text-ink sm:pt-44 sm:pb-48">
      {/* Coastline edges: dark sections meet the ivory map like land meets sea */}
      <svg className="pointer-events-none absolute inset-x-0 top-0 h-16 w-full sm:h-24" viewBox="0 0 1440 96" preserveAspectRatio="none" aria-hidden>
        <path
          d="M0 0 H1440 V38 C1380 52 1330 30 1270 44 S1150 70 1080 58 S960 30 880 46 S760 78 690 62 S560 34 480 50 S350 76 270 60 S130 36 60 52 L0 60 Z"
          fill="#0a1222"
        />
        <path
          d="M0 60 L60 52 C130 36 270 60 270 60 S350 76 480 50 S560 34 690 62 S760 78 880 46 S960 30 1080 58 S1150 70 1270 44 S1380 52 1440 38"
          fill="none"
          stroke="#e9ab3c"
          strokeOpacity="0.55"
          strokeWidth="1.2"
          strokeDasharray="1 6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full sm:h-24" viewBox="0 0 1440 96" preserveAspectRatio="none" aria-hidden>
        <path d="M0 96 H1440 V50 C1360 36 1300 64 1220 52 S1080 26 1000 42 S860 74 780 58 S650 30 570 44 S420 72 330 56 S170 30 90 44 L0 52 Z" fill="#0f1a2e" />
      </svg>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(rgba(17,24,39,0.07)_1px,transparent_1px)] [background-size:22px_22px]"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-[88rem] gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
        <div className="flex flex-col">
          <SectionHeading
            id="journeys-title"
            tone="light"
            index="02"
            eyebrow="Where we go"
            title="From Haverfordwest"
            accent="to the coast."
            intro="Based in the county town, we cover Haverfordwest and the wider county. Choose a destination to start a booking."
          />

          <Reveal delay={0.1} className="mt-10">
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2" aria-label="Destinations">
              {towns.map((t) => {
                const on = selected === t.name;
                return (
                  <li key={t.name}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(t.name)}
                      onFocus={() => setActive(t.name)}
                      onClick={() => setActive(t.name)}
                      aria-pressed={on}
                      className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all ${
                        on
                          ? "border-ink bg-ink text-ivory shadow-[0_18px_40px_-20px_rgba(17,24,39,0.6)]"
                          : "border-ink/10 bg-white/50 text-ink hover:border-ink/30"
                      }`}
                    >
                      <span className="display text-xl">{t.name}</span>
                      <span className={`text-sm ${on ? "text-gold" : "text-gold-deep"}`} aria-hidden>
                        ●
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 min-h-[8.5rem]" aria-live="polite">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -6 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-2xl border border-ink/10 bg-white/70 p-5"
                  >
                    <p className="text-sm text-ink-soft">
                      Haverfordwest <span aria-hidden>→</span>
                      <span className="sr-only">to</span> <strong className="text-ink">{selected}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => prefill({ destination: selected })}
                      className="group mt-3 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-navy"
                    >
                      Request a journey to {selected}
                      <ArrowRight width={16} height={16} className="text-gold transition-transform group-hover:translate-x-1" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.p key="hint" className="pt-2 text-sm text-ink-soft" initial={false}>
                    Not on the list? We also take pre-booked long-distance journeys. Just tell us where you&apos;re going.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <figure className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-[#dde4ea] shadow-[0_40px_80px_-40px_rgba(17,24,39,0.45)]">
            <svg ref={ref} viewBox="0 0 860 880" className="block h-auto w-full" role="img" aria-labelledby="map-title map-desc">
              <title id="map-title">Illustrated map of Pembrokeshire</title>
              <desc id="map-desc">
                A stylised map showing routes from Haverfordwest to {towns.map((t) => t.name).join(", ")}. Not to scale and not live
                tracking.
              </desc>
              <defs>
                <pattern id="sea-lines" width="26" height="12" patternUnits="userSpaceOnUse">
                  <path d="M0 8 Q 6.5 4 13 8 T 26 8" fill="none" stroke="#2c5878" strokeOpacity="0.12" strokeWidth="1" />
                </pattern>
                <pattern id="land-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                  <line x1="0" y1="0" x2="0" y2="8" stroke="#111827" strokeOpacity="0.035" strokeWidth="2" />
                </pattern>
                <filter id="land-shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#2c5878" floodOpacity="0.25" />
                </filter>
              </defs>
              <rect width="860" height="880" fill="url(#sea-lines)" />
              <path d={LAND} fill="#f1ece2" filter="url(#land-shadow)" />
              <path d={LAND} fill="url(#land-hatch)" />
              <path d={toPath(COAST)} fill="none" stroke="#111827" strokeOpacity="0.35" strokeWidth="1.2" strokeLinejoin="round" />
              <path d={toPath(RIVER)} fill="none" stroke="#6e9cc0" strokeWidth="3" strokeLinecap="round" opacity="0.8" />

              {/* Sea labels */}
              <text x="70" y="560" className="serif-accent" fontSize="22" fill="#2c5878" fillOpacity="0.55">
                St Brides Bay
              </text>
              <text x="260" y="830" fontSize="11" letterSpacing="4" fill="#2c5878" fillOpacity="0.5">
                BRISTOL CHANNEL
              </text>
              <text x="420" y="60" fontSize="11" letterSpacing="4" fill="#2c5878" fillOpacity="0.5">
                CARDIGAN BAY
              </text>

              {/* Routes */}
              {routes.map((r, i) => {
                const on = selected === r.name;
                return (
                  <g key={r.name}>
                    <path d={r.d} fill="none" stroke="#111827" strokeOpacity="0.08" strokeWidth="7" strokeLinecap="round" />
                    <motion.path
                      d={r.d}
                      fill="none"
                      stroke={on ? "#b77a12" : "#8a5a0d"}
                      strokeWidth={on ? 3.2 : 1.8}
                      strokeLinecap="round"
                      strokeDasharray={on ? undefined : "1 0"}
                      initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                      animate={inView || reduce ? { pathLength: 1, opacity: selected && !on ? 0.3 : 1 } : {}}
                      transition={{
                        pathLength: { duration: 1.6, ease: [0.65, 0, 0.35, 1], delay: 0.3 + i * 0.16 },
                        opacity: { duration: 0.3 },
                      }}
                    />
                  </g>
                );
              })}

              {/* Railway station */}
              <g transform={`translate(${station[0]} ${station[1]})`}>
                <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#2c5878" />
                <path d="M-3 -1 H 3 M-3 2 H 3" stroke="#f4efe6" strokeWidth="1.2" />
              </g>
              <text x={station[0] - 12} y={station[1] + 22} textAnchor="end" fontSize="11" fill="#2c5878" fontWeight="600">
                Rail station
              </text>

              {/* Towns */}
              {towns.map((t) => {
                const [x, y] = px(t.lon, t.lat);
                const side = LABEL_SIDE[t.name] ?? "r";
                const on = selected === t.name;
                const lx = side === "r" ? x + 14 : side === "l" ? x - 14 : x;
                const ly = side === "b" ? y + 26 : side === "t" ? y - 16 : y + 5;
                const anchor = side === "r" ? "start" : side === "l" ? "end" : "middle";
                return (
                  <g
                    key={t.name}
                    className="cursor-pointer"
                    onMouseEnter={() => setActive(t.name)}
                    onClick={() => setActive(t.name)}
                  >
                    <circle cx={x} cy={y} r="22" fill="transparent" />
                    {on && <circle cx={x} cy={y} r="14" fill="#e9ab3c" fillOpacity="0.25" />}
                    <circle cx={x} cy={y} r={on ? 7 : 5.5} fill={on ? "#e9ab3c" : "#111827"} stroke="#f4efe6" strokeWidth="2" />
                    <text
                      x={lx}
                      y={ly}
                      textAnchor={anchor}
                      fontSize="17"
                      fontWeight="700"
                      fill="#111827"
                      style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"wdth" 110' }}
                      paintOrder="stroke"
                      stroke="#f1ece2"
                      strokeWidth="5"
                    >
                      {t.name}
                    </text>
                  </g>
                );
              })}

              {/* Hub */}
              <g transform={`translate(${hx} ${hy})`}>
                <circle r="26" fill="#e9ab3c" fillOpacity="0.18">
                  {!reduce && <animate attributeName="r" values="18;30;18" dur="3.6s" repeatCount="indefinite" />}
                  {!reduce && <animate attributeName="fill-opacity" values="0.3;0;0.3" dur="3.6s" repeatCount="indefinite" />}
                </circle>
                <circle r="10" fill="#111827" stroke="#e9ab3c" strokeWidth="3" />
              </g>
              <text
                x={hx + 18}
                y={hy - 14}
                fontSize="21"
                fontWeight="800"
                fill="#111827"
                style={{ fontFamily: "var(--font-display)", fontVariationSettings: '"wdth" 115' }}
                paintOrder="stroke"
                stroke="#f1ece2"
                strokeWidth="6"
              >
                Haverfordwest
              </text>

              {/* Compass */}
              <g transform="translate(64 800)" opacity="0.6">
                <circle r="24" fill="none" stroke="#111827" strokeOpacity="0.3" />
                <path d="M0 -18 L 5 0 L 0 18 L -5 0 Z" fill="#111827" fillOpacity="0.15" />
                <path d="M0 -18 L 5 0 L -5 0 Z" fill="#8a5a0d" />
                <text y="-30" textAnchor="middle" fontSize="11" fontWeight="700" fill="#111827">
                  N
                </text>
              </g>
            </svg>
            <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 bg-ivory/80 px-5 py-3 text-xs text-ink-soft">
              <span>Illustrative map. Not to scale. Routes are indicative, not live vehicle tracking.</span>
              <span className="font-semibold text-ink">{business.areas.length} towns across Pembrokeshire</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
