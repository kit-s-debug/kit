"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { business, telHref, visibleClaim } from "@/lib/business";
import { useBooking, type Vehicle } from "@/lib/booking";
import { heroSlides, photos, type PhotoMeta } from "@/lib/photos";
import { ArrowRight, BusIcon, CarIcon, FlagIcon, PhoneIcon, PinIcon } from "../ui/Icons";
import { Magnetic } from "../ui/Magnetic";
import { Pending } from "../ui/Pending";
import { Photo } from "../ui/Photo";

const ease = [0.16, 1, 0.3, 1] as const;
const SLIDE_MS = 7000;

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

/** Full-bleed slideshow of real Pembrokeshire places, with a slow drift. */
function Slideshow({ index }: { index: number }) {
  const reduce = useReducedMotion();
  const id = heroSlides[index];
  return (
    <div className="absolute inset-0 overflow-hidden bg-midnight" aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.div
          key={id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 1.8, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { scale: 1.1 }}
            animate={{ scale: 1.0 }}
            transition={{ duration: SLIDE_MS / 1000 + 2, ease: "linear" }}
          >
            <Photo id={id} priority={index === 0} className="h-full w-full object-cover" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
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
      className="grid gap-px overflow-hidden rounded-2xl bg-ink/10 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] lg:grid-cols-[1.2fr_1.2fr_auto_auto]"
    >
      <label className="flex items-center gap-3 bg-ivory px-5 py-3.5 transition-colors focus-within:bg-white">
        <PinIcon className="shrink-0 text-gold-deep" />
        <span className="flex w-full flex-col">
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">Pickup</span>
          <input
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            placeholder="Address or postcode"
            autoComplete="street-address"
            className="w-full bg-transparent text-[1rem] text-ink placeholder:text-ink-soft/70 focus:outline-none"
          />
        </span>
      </label>
      <label className="flex items-center gap-3 bg-ivory px-5 py-3.5 transition-colors focus-within:bg-white">
        <FlagIcon className="shrink-0 text-gold-deep" />
        <span className="flex w-full flex-col">
          <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-ink-soft">Destination</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Where to?"
            className="w-full bg-transparent text-[1rem] text-ink placeholder:text-ink-soft/70 focus:outline-none"
          />
        </span>
      </label>
      <fieldset className="flex items-center gap-1 bg-ivory px-3 py-3">
        <legend className="sr-only">Vehicle type</legend>
        {(
          [
            ["taxi", "Taxi", CarIcon],
            ["minibus", "Minibus", BusIcon],
          ] as const
        ).map(([v, label, Icon]) => (
          <label
            key={v}
            className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold-deep ${
              vehicle === v ? "bg-ink text-ivory" : "text-ink-soft hover:text-ink"
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
        className="group flex items-center justify-center gap-2 bg-gold px-8 py-4 text-[0.95rem] font-semibold text-midnight transition-colors hover:bg-gold-soft"
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
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const open247 = visibleClaim(business.claims.open247);

  // Respect reduced motion: no autoplay.
  useEffect(() => {
    if (reduce) setPlaying(false);
  }, [reduce]);

  const next = useCallback(() => setIndex((i) => (i + 1) % heroSlides.length), []);
  useEffect(() => {
    if (!playing) return;
    const t = window.setTimeout(next, SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, next]);

  const current: PhotoMeta = photos[heroSlides[index]];
  const words = ["Your", "journey", "starts"];

  const trust = [
    { label: "Based in Haverfordwest", pending: false, show: true },
    { label: "Pre-booked journeys", pending: false, show: true },
    { label: "Taxis & minibuses", pending: false, show: true },
    { label: "Available 24/7", pending: open247.pending, show: open247.show },
  ].filter((t) => t.show);

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <Slideshow index={index} />
      {/* Legibility veils, kept light so the photography stays the hero */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,18,34,0.6)_0%,rgba(10,18,34,0.12)_24%,rgba(10,18,34,0.18)_55%,rgba(10,18,34,0.9)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,18,34,0.72)_0%,rgba(10,18,34,0.28)_45%,rgba(10,18,34,0)_72%)] max-md:bg-[linear-gradient(180deg,rgba(10,18,34,0.45)_0%,rgba(10,18,34,0.2)_60%,rgba(10,18,34,0.1)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[88rem] flex-1 flex-col px-5 pt-28 pb-24 sm:px-8 md:pt-40 md:pb-8 lg:pb-10">
        <div className="max-w-[42rem]">
          <motion.p {...enter(0.2, 12)} className="eyebrow flex items-center gap-3 text-gold-soft max-sm:tracking-[0.16em]">
            <span className="hidden h-px w-10 bg-gold-soft/70 sm:block" aria-hidden />
            Haverfordwest · Pembrokeshire
          </motion.p>

          <h1
            id="hero-title"
            className="display mt-5 text-[3.25rem] leading-[0.94] text-ivory drop-shadow-[0_2px_30px_rgba(0,0,0,0.35)] sm:text-7xl lg:text-[6.2rem]"
          >
            <span className="sr-only">Your journey starts here.</span>
            <span aria-hidden className="block">
              {words.map((w, i) => (
                <span key={w} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={reduce ? false : { y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.1, ease, delay: 0.35 + i * 0.09 }}
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
                  transition={{ duration: 1.1, ease, delay: 0.62 }}
                >
                  here.
                </motion.span>
              </span>
            </span>
          </h1>

          <motion.p {...enter(0.9)} className="mt-6 max-w-md text-[1.08rem] leading-relaxed text-ivory/90 sm:text-xl">
            Local taxis, minibuses and airport transfers across Pembrokeshire.
          </motion.p>

          <motion.div {...enter(1.05)} className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
            <Magnetic>
              <a
                href="#book"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-gold pr-2 pl-7 text-base font-semibold text-midnight shadow-[0_12px_40px_-12px_rgba(233,171,60,0.65)] transition-colors hover:bg-gold-soft"
              >
                Book a Journey
                <span className="grid h-10 w-10 place-items-center rounded-full bg-midnight text-gold transition-transform duration-500 group-hover:-rotate-45">
                  <ArrowRight width={18} height={18} />
                </span>
              </a>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a
                href={telHref(business.phones.primary.e164)}
                className="inline-flex h-14 items-center gap-3 rounded-full border border-ivory/35 bg-midnight/25 px-6 text-base font-semibold text-ivory backdrop-blur-md transition-colors hover:border-gold-soft hover:text-gold-soft"
              >
                <PhoneIcon width={18} height={18} className="text-gold-soft" />
                Call {business.phones.primary.display}
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <div className="mt-auto pt-14">
          <motion.div {...enter(1.3, 10)} className="mb-5 flex items-end justify-between gap-6">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.8rem] font-medium tracking-wide text-ivory/85" aria-label="Why ride with us">
              {trust.map((t) => (
                <li key={t.label} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-gold" aria-hidden />
                  {t.label}
                  {t.pending && <Pending />}
                </li>
              ))}
            </ul>
            {/* Location caption and slideshow controls */}
            <div className="hidden shrink-0 items-center gap-4 md:flex">
              <p className="text-right text-[0.8rem] leading-tight text-ivory/90" aria-live="polite">
                <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-gold-soft">
                  {String(index + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
                </span>
                {current.caption}
              </p>
              <div className="flex items-center gap-1.5">
                {heroSlides.map((id, i) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show photo ${i + 1}: ${photos[id].caption}`}
                    aria-current={i === index}
                    className="relative h-6 w-8"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden rounded bg-ivory/30">
                      <span
                        key={`${index}-${playing}`}
                        className={`absolute inset-y-0 left-0 bg-gold ${
                          i < index ? "w-full" : i === index ? (playing ? "hero-progress" : "w-full") : "w-0"
                        }`}
                        style={{ animationDuration: `${SLIDE_MS}ms` }}
                      />
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPlaying((p) => !p)}
                  className="ml-2 grid h-8 w-8 place-items-center rounded-full border border-ivory/30 text-ivory hover:border-gold-soft"
                  aria-label={playing ? "Pause slideshow" : "Play slideshow"}
                >
                  {playing ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                      <path d="M2 1h2v8H2zM6 1h2v8H6z" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                      <path d="M2 1l7 4-7 4z" fill="currentColor" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
          <motion.div {...enter(1.45, 30)} className="hidden md:block">
            <QuickBook />
          </motion.div>
          {/* Mobile: caption only */}
          <p className="text-[0.72rem] text-ivory/75 md:hidden">{current.caption}</p>
        </div>
      </div>
    </section>
  );
}
