"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { business, telHref, visibleClaim } from "@/lib/business";
import { useBooking, type Vehicle } from "@/lib/booking";
import { ArrowRight, BusIcon, CarIcon, FlagIcon, PhoneIcon, PinIcon } from "../ui/Icons";
import { Magnetic } from "../ui/Magnetic";
import { Pending } from "../ui/Pending";
import { HeroVisual } from "./HeroVisual";

const ease = [0.16, 1, 0.3, 1] as const;

function useEntrance() {
  const reduce = useReducedMotion();
  return (delay: number, y = 22) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 1.1, ease, delay },
        };
}

/** Thin gold route line sweeping through the hero toward the coast road. */
function HeroRoute() {
  const reduce = useReducedMotion();
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hr-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#e9ab3c" stopOpacity="0" />
          <stop offset="0.25" stopColor="#e9ab3c" stopOpacity="0.7" />
          <stop offset="0.8" stopColor="#f4c873" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f4c873" stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M -40 860 C 200 830, 320 760, 520 745 S 900 770, 1100 730 S 1320 690, 1500 700"
        fill="none"
        stroke="url(#hr-grad)"
        strokeWidth="1.25"
        strokeDasharray="1 7"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3.2, ease, delay: 1.2 }}
      />
      <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1 }}>
        <circle cx="520" cy="745" r="3.5" fill="#e9ab3c" />
        <circle cx="520" cy="745" r="10" fill="none" stroke="#e9ab3c" strokeOpacity="0.35" />
      </motion.g>
    </svg>
  );
}

function QuickBook() {
  const { draft, prefill } = useBooking();
  const [pickup, setPickup] = useState(draft.pickup);
  const [destination, setDestination] = useState(draft.destination);
  const [vehicle, setVehicle] = useState<Vehicle>(draft.vehicle);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    prefill({ pickup, destination, vehicle, service: vehicle === "minibus" ? "minibus" : draft.service });
  };

  return (
    <form
      onSubmit={submit}
      aria-label="Start a booking"
      className="hairline grid gap-px overflow-hidden rounded-[1.4rem] bg-white/[0.07] backdrop-blur-xl lg:grid-cols-[1.2fr_1.2fr_auto_auto]"
    >
      <label className="group flex items-center gap-3 bg-midnight/70 px-5 py-3.5 transition-colors focus-within:bg-midnight/90">
        <PinIcon className="shrink-0 text-gold" />
        <span className="flex w-full flex-col">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Pickup</span>
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Address or postcode"
            autoComplete="street-address"
            className="w-full bg-transparent text-[1rem] text-ivory placeholder:text-[#7f8a9c] focus:outline-none"
          />
        </span>
      </label>
      <label className="group flex items-center gap-3 bg-midnight/70 px-5 py-3.5 transition-colors focus-within:bg-midnight/90">
        <FlagIcon className="shrink-0 text-gold" />
        <span className="flex w-full flex-col">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-fog">Destination</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where to?"
            className="w-full bg-transparent text-[1rem] text-ivory placeholder:text-[#7f8a9c] focus:outline-none"
          />
        </span>
      </label>
      <fieldset className="flex items-center gap-1 bg-midnight/70 px-3 py-3">
        <legend className="sr-only">Vehicle type</legend>
        {(
          [
            ["taxi", "Taxi", CarIcon],
            ["minibus", "Minibus", BusIcon],
          ] as const
        ).map(([v, label, Icon]) => (
          <label
            key={v}
            className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold ${
              vehicle === v ? "bg-ivory text-midnight" : "text-mist hover:text-ivory"
            }`}
          >
            <input type="radio" name="qb-vehicle" value={v} checked={vehicle === v} onChange={() => setVehicle(v)} className="sr-only" />
            <Icon width={18} height={18} />
            {label}
          </label>
        ))}
      </fieldset>
      <button
        type="submit"
        className="group flex items-center justify-center gap-2 bg-gold px-7 py-4 text-[0.95rem] font-semibold text-midnight transition-colors hover:bg-gold-soft"
      >
        Continue
        <ArrowRight width={18} height={18} className="transition-transform group-hover:translate-x-1" />
      </button>
    </form>
  );
}

export function Hero() {
  const enter = useEntrance();
  const reduce = useReducedMotion();
  const open247 = visibleClaim(business.claims.open247);
  const words = ["Your", "journey", "starts"];

  const trust = [
    { label: "Based in Haverfordwest", pending: false, show: true },
    { label: "Pre-booked journeys", pending: false, show: true },
    { label: "Taxis & minibuses", pending: false, show: true },
    { label: "Available 24/7", pending: open247.pending, show: open247.show },
  ].filter((t) => t.show);

  return (
    <section id="top" aria-labelledby="hero-title" className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <HeroVisual />
      {/* Legibility veils: darken behind the text without hiding the scene */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,34,0.55)_0%,rgba(10,18,34,0)_22%,rgba(10,18,34,0)_62%,rgba(10,18,34,0.85)_93%,#0a1222_100%)] max-md:bg-[linear-gradient(180deg,rgba(10,18,34,0.4)_0%,rgba(10,18,34,0)_20%,rgba(10,18,34,0)_86%,#0a1222_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_0%_45%,rgba(10,18,34,0.85)_0%,rgba(10,18,34,0.4)_45%,rgba(10,18,34,0)_70%)] max-md:bg-[linear-gradient(180deg,rgba(10,18,34,0.65)_0%,rgba(10,18,34,0.35)_50%,rgba(10,18,34,0)_72%)]"
        aria-hidden
      />
      <HeroRoute />

      <div className="relative z-10 mx-auto flex w-full max-w-[88rem] flex-1 flex-col px-5 pt-24 pb-8 sm:px-8 md:pt-36 lg:pb-10">
        <div className="max-w-[40rem]">
          <motion.p {...enter(0.25, 12)} className="eyebrow flex items-center gap-3 text-gold max-sm:tracking-[0.16em]">
            <span className="hidden h-px w-10 bg-gold/60 sm:block" aria-hidden />
            Haverfordwest · Pembrokeshire
          </motion.p>

          <h1 id="hero-title" className="display mt-5 text-[3.25rem] leading-[0.92] text-ivory sm:text-7xl lg:text-[6.4rem]">
            <span className="sr-only">Your journey starts here.</span>
            <span aria-hidden className="block">
              {words.map((w, i) => (
                <span key={w} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={reduce ? false : { y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.1, ease, delay: 0.4 + i * 0.09 }}
                  >
                    {w}&nbsp;
                  </motion.span>
                </span>
              ))}
              <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
                <motion.span
                  className="serif-accent inline-block pr-2 text-[1.08em] text-gold-soft"
                  initial={reduce ? false : { y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, ease, delay: 0.67 }}
                >
                  here.
                </motion.span>
              </span>
            </span>
          </h1>

          <motion.p {...enter(0.95)} className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-mist sm:mt-6 sm:text-xl">
            Local taxis, minibuses and airport transfers across Pembrokeshire.
          </motion.p>

          <motion.div {...enter(1.12)} className="mt-7 flex flex-wrap items-center gap-3 sm:mt-9">
            <Magnetic>
              <a
                href="#book"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-gold pr-2 pl-7 text-base font-semibold text-midnight shadow-[0_12px_40px_-12px_rgba(233,171,60,0.65)] transition-colors hover:bg-gold-soft"
              >
                Book a Journey
                <span className="grid h-10 w-10 place-items-center rounded-full bg-midnight text-gold transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-rotate-45">
                  <ArrowRight width={18} height={18} />
                </span>
              </a>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a
                href={telHref(business.phones.primary.e164)}
                className="inline-flex h-14 items-center gap-3 rounded-full border border-ivory/25 bg-midnight/30 px-6 text-base font-semibold text-ivory backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold-soft"
              >
                <PhoneIcon width={18} height={18} className="text-gold" />
                Call {business.phones.primary.display}
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <div className="mt-auto pt-14">
          <motion.div {...enter(1.45, 30)} className="hidden md:block">
            <QuickBook />
          </motion.div>
          <motion.ul
            {...enter(1.75, 10)}
            className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8rem] font-medium tracking-wide text-mist"
            aria-label="Why ride with us"
          >
            {trust.map((t) => (
              <li key={t.label} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-gold" aria-hidden />
                {t.label}
                {t.pending && <Pending />}
              </li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}
