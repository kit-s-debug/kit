"use client";

import { motion, useReducedMotion } from "framer-motion";
import { business, type Service, type ServiceId } from "@/lib/business";
import { servicePhotos } from "@/lib/photos";
import { Photo } from "../ui/Photo";
import { useBooking } from "@/lib/booking";
import { ArrowRight } from "../ui/Icons";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const art: Record<ServiceId, { span: string; tag: string }> = {
  local: { span: "lg:col-span-7", tag: "Around town" },
  minibus: { span: "lg:col-span-5", tag: "Groups" },
  airport: { span: "lg:col-span-5", tag: "Pre-booked" },
  station: { span: "lg:col-span-7", tag: "Rail" },
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
        className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-navy"
      >
        {/* Cursor spotlight */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(233,171,60,0.10), transparent 60%)" }}
          aria-hidden
        />
        <div className="relative aspect-[5/3] w-full overflow-hidden sm:aspect-[2/1]">
          <Photo
            id={servicePhotos[s.id]}
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,34,0.35)_0%,rgba(10,18,34,0)_35%,rgba(10,18,34,0)_60%,#0f1a2e_100%)]" aria-hidden />
          <span className="absolute top-5 left-5 rounded-full border border-white/10 bg-midnight/60 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-mist backdrop-blur">
            {a.tag}
          </span>
          <span className="display absolute top-4 right-6 text-4xl text-ivory/70" aria-hidden>
            0{i + 1}
          </span>
        </div>
        <div className="relative -mt-10 flex flex-1 flex-col p-7 pt-0 sm:p-9 sm:pt-0">
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
