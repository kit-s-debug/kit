"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { business, telHref } from "@/lib/business";
import {
  buildMessage,
  formatDate,
  serviceLabel,
  smsHref,
  todayISO,
  useBooking,
  validate,
  whatsappHref,
  type BookingDraft,
  type Errors,
} from "@/lib/booking";
import {
  ArrowRight,
  BusIcon,
  CarIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  FlagIcon,
  MessageIcon,
  PhoneIcon,
  PinIcon,
  UsersIcon,
  WhatsAppIcon,
} from "../ui/Icons";
import { Pending } from "../ui/Pending";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const ORDER: (keyof BookingDraft)[] = ["pickup", "destination", "date", "time", "passengers", "name", "phone"];

function Field({
  id,
  label,
  icon,
  error,
  hint,
  children,
  className = "",
}: {
  id: string;
  label: string;
  icon?: React.ReactNode;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 flex items-center gap-2 text-[0.8rem] font-semibold tracking-wide text-mist">
        {icon && <span className="text-gold">{icon}</span>}
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="mt-2 flex items-start gap-1.5 text-[0.82rem] text-[#f4a397]" role="alert">
          <span aria-hidden>!</span>
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-2 text-[0.8rem] text-fog">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Steps() {
  const steps = [
    { t: "Request", d: "Tell us where, when and how many. It takes under a minute." },
    { t: "We confirm", d: "The operator checks availability and confirms your journey and fare with you." },
    { t: "Travel", d: "Your driver collects you at the agreed time and place." },
  ];
  return (
    <ol id="how" className="mt-12 space-y-0" aria-label="How booking works">
      {steps.map((s, i) => (
        <Reveal as="li" key={s.t} delay={i * 0.08} className="relative flex gap-5 pb-8 last:pb-0">
          {i < steps.length - 1 && <span className="absolute top-11 bottom-1 left-[1.3rem] w-px bg-gradient-to-b from-gold/60 to-gold/0" aria-hidden />}
          <span className="display grid h-[2.6rem] w-[2.6rem] shrink-0 place-items-center rounded-full border border-gold/50 text-sm text-gold">
            {i + 1}
          </span>
          <div>
            <h3 className="display text-xl text-ivory">{s.t}</h3>
            <p className="mt-1 max-w-sm text-[0.95rem] leading-relaxed text-mist">{s.d}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}

function Review({ draft, onEdit }: { draft: BookingDraft; onEdit: () => void }) {
  const msg = buildMessage(draft);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const rows: [string, string][] = [
    ["From", draft.pickup],
    ["To", draft.destination],
    ["When", `${formatDate(draft.date)}, ${draft.time}`],
    ["Passengers", draft.passengers],
    ["Vehicle", draft.vehicle === "minibus" ? "Minibus" : "Taxi"],
    ["Service", serviceLabel(draft.service)],
    ["Name", draft.name],
    ["Contact", draft.phone],
  ];
  if (draft.notes.trim()) rows.push(["Notes", draft.notes]);

  return (
    <div>
      <p className="eyebrow text-gold">Review & send</p>
      <h3 ref={headingRef} tabIndex={-1} className="display mt-3 text-3xl text-ivory focus:outline-none">
        Your request is ready.
      </h3>
      <p className="mt-2 text-mist">
        Nothing has been sent yet. Choose how you&apos;d like to send it, and the operator will reply to confirm.
      </p>

      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 rounded-2xl border border-white/10 bg-midnight/50 p-5 text-[0.95rem]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-fog">{k}</dt>
            <dd className="break-words text-ivory">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {business.whatsapp.enabled && (
          <a
            href={whatsappHref(msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 items-center justify-center gap-2.5 rounded-full bg-gold px-6 font-semibold text-midnight transition-colors hover:bg-gold-soft"
          >
            <WhatsAppIcon />
            Send via WhatsApp
            {!business.whatsapp.confirmed && <Pending className="text-midnight" />}
          </a>
        )}
        {business.sms.enabled && (
          <a
            href={smsHref(msg)}
            className={`flex h-14 items-center justify-center gap-2.5 rounded-full px-6 font-semibold transition-colors ${
              business.whatsapp.enabled
                ? "border border-white/20 text-ivory hover:border-gold/60"
                : "bg-gold text-midnight hover:bg-gold-soft"
            }`}
          >
            <MessageIcon />
            Send by text message
          </a>
        )}
        <a
          href={telHref(business.phones.primary.e164)}
          className="flex h-14 items-center justify-center gap-2.5 rounded-full border border-white/20 px-6 font-semibold text-ivory transition-colors hover:border-gold/60"
        >
          <PhoneIcon />
          Call {business.phones.primary.display}
        </a>
        <button
          type="button"
          onClick={copy}
          className="flex h-14 items-center justify-center gap-2.5 rounded-full border border-white/20 px-6 font-semibold text-ivory transition-colors hover:border-gold/60"
        >
          {copied ? <CheckIcon className="text-gold" /> : <CopyIcon />}
          <span aria-live="polite">{copied ? "Copied to clipboard" : "Copy details"}</span>
        </button>
      </div>

      <button type="button" onClick={onEdit} className="mt-6 text-sm font-semibold text-gold underline-offset-4 hover:underline">
        ← Edit details
      </button>
    </div>
  );
}

export function Booking() {
  const { draft, setDraft } = useBooking();
  const reduce = useReducedMotion();
  const uid = useId();
  const id = (k: string) => `${uid}-${k}`;
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [stage, setStage] = useState<"form" | "review">("form");
  const formRef = useRef<HTMLFormElement>(null);
  const [today, setToday] = useState("");
  useEffect(() => setToday(todayISO()), []);
  useEffect(() => {
    const toForm = () => setStage("form");
    window.addEventListener("booking:edit", toForm);
    return () => window.removeEventListener("booking:edit", toForm);
  }, []);

  const set = <K extends keyof BookingDraft>(k: K, v: BookingDraft[K]) => {
    const next = { ...draft, [k]: v };
    setDraft(next);
    if (submitted) setErrors(validate(next));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(draft);
    setErrors(errs);
    const first = ORDER.find((k) => errs[k]);
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }
    setStage("review");
    document.getElementById("booking-panel")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const svc = business.services.find((s) => s.id === draft.service);
  const errCount = Object.keys(errors).length;
  const aria = (k: keyof BookingDraft) => ({
    id: id(k),
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${id(k)}-err` : undefined,
  });

  const pax = Number(draft.passengers) || 0;

  return (
    <section id="book" aria-labelledby="book-title" className="grain relative overflow-hidden bg-navy py-24 sm:py-32">
      {/* Coastline contour lines in the background */}
      <svg className="pointer-events-none absolute -top-20 right-0 h-[130%] w-auto opacity-[0.07]" viewBox="0 0 600 900" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <path
            key={i}
            d={`M${600 - i * 18} 0 C ${420 - i * 22} 180, ${560 - i * 16} 360, ${380 - i * 20} 520 S ${480 - i * 14} 800, ${300 - i * 18} 900`}
            fill="none"
            stroke="#6e9cc0"
            strokeWidth="1"
          />
        ))}
      </svg>

      <div className="relative mx-auto grid max-w-[88rem] gap-14 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <SectionHeading
            id="book-title"
            index="03"
            eyebrow="Book a journey"
            title="Request a ride"
            accent="in seconds."
            intro="Send us the details and we'll confirm your journey. Prefer to talk? Call us any time we're open."
          />
          <Steps />
          <Reveal delay={0.1} className="mt-12 rounded-2xl border border-white/10 bg-midnight/40 p-6">
            <p className="text-sm text-fog">Rather speak to someone?</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-6">
              <a href={telHref(business.phones.primary.e164)} className="display flex items-center gap-2 text-2xl text-ivory hover:text-gold-soft">
                <PhoneIcon className="text-gold" />
                {business.phones.primary.display}
              </a>
              <a href={telHref(business.phones.alternative.e164)} className="display flex items-center gap-2 text-2xl text-mist hover:text-gold-soft">
                {business.phones.alternative.display}
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <div id="booking-panel" className="hairline relative scroll-mt-28 rounded-[2rem] bg-deep/80 p-6 backdrop-blur sm:p-10">
            <AnimatePresence mode="wait" initial={false}>
              {stage === "form" ? (
                <motion.form
                  key="form"
                  id="booking-form"
                  ref={formRef}
                  noValidate
                  onSubmit={onSubmit}
                  initial={reduce ? false : { opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -16 }}
                  transition={{ duration: 0.35 }}
                  aria-describedby={`${uid}-notice`}
                >
                  {submitted && errCount > 0 && (
                    <div role="alert" className="mb-6 rounded-xl border border-[#f0857a]/40 bg-[#f0857a]/10 px-4 py-3 text-sm text-[#f8c1b9]">
                      Please check {errCount === 1 ? "1 field" : `${errCount} fields`} below.
                    </div>
                  )}

                  <fieldset>
                    <legend className="eyebrow mb-5 text-fog">Journey</legend>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id={id("pickup")} label="Pickup address or postcode" icon={<PinIcon width={16} height={16} />} error={errors.pickup}>
                        <input
                          {...aria("pickup")}
                          data-required="true"
                          className="field"
                          value={draft.pickup}
                          onChange={(e) => set("pickup", e.target.value)}
                          placeholder="e.g. 12 High Street, SA61 2DA"
                          autoComplete="street-address"
                          required
                        />
                      </Field>
                      <Field id={id("destination")} label="Destination address or postcode" icon={<FlagIcon width={16} height={16} />} error={errors.destination}>
                        <input
                          {...aria("destination")}
                          data-required="true"
                          className="field"
                          value={draft.destination}
                          onChange={(e) => set("destination", e.target.value)}
                          placeholder="e.g. Tenby, or Haverfordwest station"
                          required
                        />
                      </Field>
                      <Field id={id("date")} label="Date" icon={<ClockIcon width={16} height={16} />} error={errors.date}>
                        <input
                          {...aria("date")}
                          data-required="true"
                          type="date"
                          min={today || undefined}
                          className="field [color-scheme:dark]"
                          value={draft.date}
                          onChange={(e) => set("date", e.target.value)}
                          required
                        />
                      </Field>
                      <Field id={id("time")} label="Pickup time" icon={<ClockIcon width={16} height={16} />} error={errors.time}>
                        <input
                          {...aria("time")}
                          data-required="true"
                          type="time"
                          step={300}
                          className="field [color-scheme:dark]"
                          value={draft.time}
                          onChange={(e) => set("time", e.target.value)}
                          required
                        />
                      </Field>
                    </div>
                  </fieldset>

                  <fieldset className="mt-8 border-t border-white/[0.07] pt-8">
                    <legend className="eyebrow mb-5 text-fog">Vehicle & passengers</legend>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div role="radiogroup" aria-label="Vehicle type" className="grid grid-cols-2 gap-2 sm:col-span-2">
                        {(
                          [
                            ["taxi", "Taxi", "Everyday journeys", CarIcon],
                            ["minibus", "Minibus", "Groups & luggage", BusIcon],
                          ] as const
                        ).map(([v, label, sub, Icon]) => {
                          const on = draft.vehicle === v;
                          return (
                            <label
                              key={v}
                              className={`relative flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-all has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${
                                on ? "border-gold bg-gold/[0.08]" : "border-white/10 hover:border-white/25"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`${uid}-vehicle`}
                                value={v}
                                checked={on}
                                onChange={() => set("vehicle", v)}
                                className="sr-only"
                              />
                              <span className={`grid h-11 w-11 place-items-center rounded-xl ${on ? "bg-gold text-midnight" : "bg-white/5 text-mist"}`}>
                                <Icon />
                              </span>
                              <span>
                                <span className="block font-semibold text-ivory">{label}</span>
                                <span className="block text-[0.8rem] text-fog">{sub}</span>
                              </span>
                              {on && <CheckIcon width={18} height={18} className="absolute top-3 right-3 text-gold" />}
                            </label>
                          );
                        })}
                      </div>
                      <Field
                        id={id("passengers")}
                        label="Passengers"
                        icon={<UsersIcon width={16} height={16} />}
                        error={errors.passengers}
                        hint={pax >= 5 && draft.vehicle === "taxi" ? "Larger groups may need a minibus. We'll advise when we confirm." : undefined}
                      >
                        <div className="flex items-stretch gap-2">
                          <button
                            type="button"
                            onClick={() => set("passengers", String(Math.max(1, pax - 1)))}
                            className="w-12 shrink-0 rounded-xl border border-white/12 text-xl text-ivory hover:border-gold/60"
                            aria-label="One fewer passenger"
                          >
                            −
                          </button>
                          <input
                            {...aria("passengers")}
                            data-required="true"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={16}
                            className="field text-center tabular-nums"
                            value={draft.passengers}
                            onChange={(e) => set("passengers", e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => set("passengers", String(Math.min(16, pax + 1)))}
                            className="w-12 shrink-0 rounded-xl border border-white/12 text-xl text-ivory hover:border-gold/60"
                            aria-label="One more passenger"
                          >
                            +
                          </button>
                        </div>
                      </Field>
                      <Field id={id("service")} label="Type of journey">
                        <select
                          id={id("service")}
                          className="field"
                          value={draft.service}
                          onChange={(e) => set("service", e.target.value as BookingDraft["service"])}
                        >
                          {business.services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title}
                            </option>
                          ))}
                          <option value="other">Other / long-distance</option>
                        </select>
                      </Field>
                    </div>
                  </fieldset>

                  <fieldset className="mt-8 border-t border-white/[0.07] pt-8">
                    <legend className="eyebrow mb-5 text-fog">Your details</legend>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id={id("name")} label="Your name" error={errors.name}>
                        <input
                          {...aria("name")}
                          data-required="true"
                          className="field"
                          value={draft.name}
                          onChange={(e) => set("name", e.target.value)}
                          autoComplete="name"
                          placeholder="Full name"
                          required
                        />
                      </Field>
                      <Field id={id("phone")} label="Contact number" error={errors.phone}>
                        <input
                          {...aria("phone")}
                          data-required="true"
                          type="tel"
                          inputMode="tel"
                          className="field"
                          value={draft.phone}
                          onChange={(e) => set("phone", e.target.value)}
                          autoComplete="tel"
                          placeholder="07700 900123"
                          required
                        />
                      </Field>
                      <Field id={id("notes")} label="Notes (optional)" className="sm:col-span-2">
                        <textarea
                          id={id("notes")}
                          className="field min-h-[5.5rem] resize-y"
                          value={draft.notes}
                          onChange={(e) => set("notes", e.target.value)}
                          placeholder={svc?.notesHint ?? "Anything we should know? e.g. return journey, luggage"}
                          maxLength={500}
                        />
                      </Field>
                    </div>
                  </fieldset>

                  <div className="mt-9 flex flex-col gap-5 border-t border-white/[0.07] pt-8 sm:flex-row sm:items-center sm:justify-between">
                    <p id={`${uid}-notice`} className="flex max-w-sm items-start gap-2.5 text-[0.82rem] leading-relaxed text-fog">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gold/50 text-[0.65rem] font-bold text-gold" aria-hidden>
                        i
                      </span>
                      All journeys are subject to confirmation by the operator. This is a request, not a confirmed booking, and no fare is
                      agreed until we confirm.
                    </p>
                    <button
                      type="submit"
                      className="group inline-flex h-14 shrink-0 items-center justify-center gap-3 rounded-full bg-gold pr-2 pl-7 font-semibold text-midnight shadow-[0_12px_40px_-14px_rgba(233,171,60,0.7)] transition-colors hover:bg-gold-soft"
                    >
                      Request a Booking
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-midnight text-gold transition-transform group-hover:translate-x-0.5">
                        <ArrowRight width={18} height={18} />
                      </span>
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="review"
                  initial={reduce ? false : { opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: 16 }}
                  transition={{ duration: 0.35 }}
                >
                  <Review draft={draft} onEdit={() => setStage("form")} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
