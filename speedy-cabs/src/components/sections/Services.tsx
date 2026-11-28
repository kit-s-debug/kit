"use client";

import { motion, useReducedMotion } from "framer-motion";
import { business, type Service, type ServiceId } from "@/lib/business";
import { useBooking } from "@/lib/booking";
import { ArrowRight } from "../ui/Icons";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

/* ── Custom illustrations: one visual language, four distinct scenes ─────── */

function LocalArt() {
  // Abstract town grid with a route threading to a pin
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="la-glow" cx="70%" cy="40%" r="60%">
          <stop offset="0" stopColor="#e9ab3c" stopOpacity="0.22" />
          <stop offset="1" stopColor="#e9ab3c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill="url(#la-glow)" />
      <g stroke="#f4efe6" strokeOpacity="0.09" strokeWidth="1">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 36 - 10} y1="0" x2={i * 36 + 30} y2="240" />
        ))}
        {Array.from({ length: 7 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 40 + 10} x2="400" y2={i * 40 - 10} />
        ))}
      </g>
      {/* River Cleddau, abstracted */}
      <path d="M-10 200 C 80 170, 120 210, 200 180 S 330 120, 420 140" fill="none" stroke="#6e9cc0" strokeOpacity="0.35" strokeWidth="10" strokeLinecap="round" />
      <path
        className="svc-draw"
        d="M60 190 L 98 150 L 170 140 L 182 98 L 262 86 L 290 60"
        fill="none"
        stroke="#e9ab3c"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="190" r="5" fill="#f4efe6" />
      <g transform="translate(290 60)">
        <circle r="16" fill="#e9ab3c" fillOpacity="0.15" className="svc-pulse" />
        <circle r="6" fill="#e9ab3c" />
      </g>
    </svg>
  );
}

function MinibusArt() {
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="mb-floor" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#6e9cc0" stopOpacity="0" />
          <stop offset="1" stopColor="#6e9cc0" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <rect y="150" width="400" height="90" fill="url(#mb-floor)" />
      <line x1="20" y1="186" x2="380" y2="186" stroke="#f4efe6" strokeOpacity="0.15" />
      {/* Generic minibus in fine linework */}
      <g fill="none" stroke="#dbe6f2" strokeWidth="1.6" strokeLinejoin="round" className="svc-float">
        <path d="M70 172 V 92 Q 70 78 84 78 H 290 Q 304 78 312 90 L 338 132 Q 342 140 342 150 V 172 Z" strokeOpacity="0.9" />
        <path d="M296 88 L 322 132 H 296 Z" strokeOpacity="0.6" />
        {[86, 136, 186, 236].map((x) => (
          <rect key={x} x={x} y="92" width="40" height="36" rx="4" strokeOpacity="0.55" />
        ))}
        <circle cx="120" cy="174" r="17" fill="#0f1a2e" />
        <circle cx="290" cy="174" r="17" fill="#0f1a2e" />
        <circle cx="120" cy="174" r="6" />
        <circle cx="290" cy="174" r="6" />
      </g>
      {/* Seats: the group, filling in */}
      <g>
        {[0, 1, 2, 3].map((col) =>
          [0, 1].map((row) => (
            <circle
              key={`${col}${row}`}
              cx={100 + col * 50 + row * 14}
              cy={112 + row * 6}
              r="5"
              fill="#e9ab3c"
              className="svc-seat"
              style={{ transitionDelay: `${(col * 2 + row) * 60}ms` }}
            />
          )),
        )}
      </g>
      <rect x="342" y="140" width="7" height="10" rx="2" fill="#e9ab3c" />
    </svg>
  );
}

function AirportArt() {
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="ap-sky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0f1a2e" stopOpacity="0" />
          <stop offset="0.75" stopColor="#c76b3a" stopOpacity="0.25" />
          <stop offset="1" stopColor="#e9ab3c" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#ap-sky)" />
      <line x1="0" y1="200" x2="400" y2="200" stroke="#f4c873" strokeOpacity="0.6" />
      {/* Runway lights */}
      {Array.from({ length: 14 }).map((_, i) => (
        <circle key={i} cx={20 + i * 28} cy="214" r="1.8" fill="#f4c873" opacity={0.25 + (i % 3) * 0.2} />
      ))}
      <path id="ap-arc" d="M30 200 Q 200 20 370 120" fill="none" stroke="#f4efe6" strokeOpacity="0.45" strokeDasharray="2 6" strokeWidth="1.4" />
      <g className="svc-plane">
        <path d="M0 0 L 18 -3 L 24 0 L 18 3 Z M6 0 L 0 -9 L 4 -9 L 13 -1 Z M6 0 L 0 9 L 4 9 L 13 1 Z" fill="#f4efe6" />
      </g>
      <circle cx="30" cy="200" r="4" fill="#e9ab3c" />
    </svg>
  );
}

function StationArt() {
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full" aria-hidden>
      {/* Converging rails */}
      <g stroke="#c3c9d3" strokeOpacity="0.5" strokeWidth="1.5">
        <line x1="120" y1="240" x2="196" y2="70" />
        <line x1="280" y1="240" x2="204" y2="70" />
      </g>
      <g stroke="#c3c9d3" strokeOpacity="0.22">
        {Array.from({ length: 10 }).map((_, i) => {
          const t = Math.pow(i / 10, 1.8);
          const y = 240 - t * 170;
          const half = 80 - t * 76;
          return <line key={i} x1={200 - half - 10} y1={y} x2={200 + half + 10} y2={y} />;
        })}
      </g>
      {/* Platform edge */}
      <path d="M0 240 L 0 200 L 110 120 L 120 120 L 30 240 Z" fill="#f4efe6" fillOpacity="0.05" stroke="#f4efe6" strokeOpacity="0.2" />
      <path d="M38 230 L 116 126" stroke="#e9ab3c" strokeOpacity="0.8" strokeWidth="2" strokeDasharray="6 5" />
      {/* Platform clock */}
      <g transform="translate(310 74)">
        <line x1="0" y1="-50" x2="0" y2="-26" stroke="#c3c9d3" strokeOpacity="0.5" />
        <circle r="26" fill="#0f1a2e" stroke="#f4efe6" strokeOpacity="0.7" strokeWidth="1.5" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={i} x1="0" y1="-21" x2="0" y2="-18" stroke="#f4efe6" strokeOpacity="0.6" transform={`rotate(${i * 30})`} />
        ))}
        <line x1="0" y1="0" x2="0" y2="-13" stroke="#f4efe6" strokeWidth="2" strokeLinecap="round" transform="rotate(-60)" />
        <line x1="0" y1="0" x2="0" y2="-19" stroke="#e9ab3c" strokeWidth="1.5" strokeLinecap="round" className="svc-hand" />
        <circle r="2" fill="#e9ab3c" />
      </g>
      {/* Approaching train lights */}
      <circle cx="196" cy="76" r="2.5" fill="#f4efe6" className="svc-pulse" />
      <circle cx="204" cy="76" r="2.5" fill="#f4efe6" className="svc-pulse" />
    </svg>
  );
}

const art: Record<ServiceId, { Art: () => React.JSX.Element; tint: string; span: string; tag: string }> = {
  local: {
    Art: LocalArt,
    tint: "from-[#1a2236] via-[#121a2c] to-[#0d1424]",
    span: "lg:col-span-7",
    tag: "Around town",
  },
  minibus: {
    Art: MinibusArt,
    tint: "from-[#16263a] via-[#112033] to-[#0c1726]",
    span: "lg:col-span-5",
    tag: "Groups",
  },
  airport: {
    Art: AirportArt,
    tint: "from-[#221d2b] via-[#181a2a] to-[#0f1424]",
    span: "lg:col-span-5",
    tag: "Pre-booked",
  },
  station: {
    Art: StationArt,
    tint: "from-[#1b2130] via-[#141b29] to-[#0e1422]",
    span: "lg:col-span-7",
    tag: "Rail",
  },
};

function ServiceCard({ s, i }: { s: Service; i: number }) {
  const { prefill } = useBooking();
  const reduce = useReducedMotion();
  const a = art[s.id];

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <Reveal as="li" delay={(i % 2) * 0.08} className={a.span}>
      <motion.article
        onPointerMove={onMove}
        whileHover={reduce ? undefined : { y: -6 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className={`svc-card group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-gradient-to-br ${a.tint}`}
      >
        {/* Cursor spotlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(233,171,60,0.10), transparent 60%)" }}
          aria-hidden
        />
        <div className="relative aspect-[5/3] w-full overflow-hidden border-b border-white/[0.06] sm:aspect-[2/1]">
          <a.Art />
          <span className="absolute top-5 left-5 rounded-full border border-white/10 bg-midnight/60 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-mist backdrop-blur">
            {a.tag}
          </span>
          <span className="display absolute top-4 right-6 text-5xl text-white/[0.06]" aria-hidden>
            0{i + 1}
          </span>
        </div>
        <div className="relative flex flex-1 flex-col p-7 sm:p-9">
          <h3 className="display text-3xl text-ivory sm:text-[2.4rem]">{s.title}</h3>
          <p className="mt-2 text-lg text-gold-soft">{s.short}</p>
          <p className="mt-4 max-w-lg leading-relaxed text-mist">{s.description}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {s.points.map((p) => (
              <li key={p} className="rounded-full border border-white/10 px-3 py-1.5 text-[0.82rem] text-mist">
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-8">
            <button
              type="button"
              onClick={() => prefill({ service: s.id, vehicle: s.vehicle })}
              className="group/btn inline-flex items-center gap-3 rounded-full border border-gold/40 py-2 pr-2 pl-5 text-[0.95rem] font-semibold text-ivory transition-colors hover:border-gold hover:bg-gold hover:text-midnight"
            >
              Enquire about {s.title.toLowerCase()}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gold text-midnight transition-colors group-hover/btn:bg-midnight group-hover/btn:text-gold">
                <ArrowRight width={16} height={16} />
              </span>
            </button>
          </div>
        </div>
      </motion.article>
    </Reveal>
  );
}

export function Services() {
  return (
    <section id="services" aria-labelledby="services-title" className="relative bg-midnight py-24 sm:py-32">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            id="services-title"
            index="01"
            eyebrow="Services"
            title="Every journey,"
            accent="handled locally."
            intro="From a quick hop across town to a group trip or an early airport run, choose the journey and we'll take it from there."
          />
          <Reveal delay={0.1} className="text-sm text-fog lg:max-w-xs lg:text-right">
            Also available: {business.extraServices.join(" and ").toLowerCase()}.
          </Reveal>
        </div>
        <ul className="mt-14 grid gap-5 lg:grid-cols-12">
          {business.services.map((s, i) => (
            <ServiceCard key={s.id} s={s} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
