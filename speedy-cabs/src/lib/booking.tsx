"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { business, type ServiceId } from "./business";

export type Vehicle = "taxi" | "minibus";

export type BookingDraft = {
  pickup: string;
  destination: string;
  date: string;
  time: string;
  passengers: string;
  vehicle: Vehicle;
  service: ServiceId | "other";
  name: string;
  phone: string;
  notes: string;
};

export const emptyDraft: BookingDraft = {
  pickup: "",
  destination: "",
  date: "",
  time: "",
  passengers: "1",
  vehicle: "taxi",
  service: "local",
  name: "",
  phone: "",
  notes: "",
};

type Ctx = {
  draft: BookingDraft;
  setDraft: React.Dispatch<React.SetStateAction<BookingDraft>>;
  /** Merge values into the booking form, scroll to it and focus the first empty field. */
  prefill: (values: Partial<BookingDraft>) => void;
};

const BookingContext = createContext<Ctx | null>(null);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft);

  const prefill = useCallback((values: Partial<BookingDraft>) => {
    setDraft((d) => ({ ...d, ...values }));
    // Return the booking panel to the form if it is showing the review step.
    window.dispatchEvent(new Event("booking:edit"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = document.getElementById("book");
    section?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    // Focus the first field that still needs filling, after the scroll settles.
    window.setTimeout(
      () => {
        const form = document.getElementById("booking-form");
        const fields = Array.from(form?.querySelectorAll<HTMLInputElement>("[data-required='true']") ?? []);
        const empty = fields.find((f) => !f.value.trim());
        (empty ?? fields[0])?.focus({ preventScroll: true });
      },
      reduce ? 50 : 750,
    );
  }, []);

  const value = useMemo(() => ({ draft, setDraft, prefill }), [draft, prefill]);
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}

/* ── Validation ──────────────────────────────────────────────────────────── */

export type Errors = Partial<Record<keyof BookingDraft, string>>;

const UK_PHONE = /^(?:(?:\+|00)44\s?|0)(?:\d\s?){9,10}$/;

export function todayISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function validate(d: BookingDraft): Errors {
  const e: Errors = {};
  if (d.pickup.trim().length < 3) e.pickup = "Enter a pickup address or postcode.";
  if (d.destination.trim().length < 3) e.destination = "Enter a destination address or postcode.";
  if (!d.date) e.date = "Choose the date of your journey.";
  else if (d.date < todayISO()) e.date = "That date has passed. Choose today or a later date.";
  if (!d.time) e.time = "Choose a pickup time.";
  else if (d.date === todayISO()) {
    const [h, m] = d.time.split(":").map(Number);
    const now = new Date();
    if (h * 60 + m < now.getHours() * 60 + now.getMinutes() - 5) e.time = "That time has passed today. Choose a later time.";
  }
  const pax = Number(d.passengers);
  if (!Number.isInteger(pax) || pax < 1) e.passengers = "Enter the number of passengers.";
  else if (pax > 16) e.passengers = "For more than 16 passengers, please call us to arrange.";
  if (d.name.trim().length < 2) e.name = "Enter your name so the driver knows who to look for.";
  if (!UK_PHONE.test(d.phone.trim())) e.phone = "Enter a UK phone number, e.g. 07700 900123.";
  return e;
}

/* ── Enquiry message ─────────────────────────────────────────────────────── */

const serviceLabel = (id: BookingDraft["service"]) =>
  id === "other" ? "Other / long-distance" : business.services.find((s) => s.id === id)?.title ?? id;

function formatDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function buildMessage(d: BookingDraft) {
  const lines = [
    `Booking request for ${business.name}`,
    ``,
    `Pickup: ${d.pickup.trim()}`,
    `Destination: ${d.destination.trim()}`,
    `When: ${formatDate(d.date)} at ${d.time}`,
    `Passengers: ${d.passengers}`,
    `Vehicle: ${d.vehicle === "minibus" ? "Minibus" : "Taxi"}`,
    `Service: ${serviceLabel(d.service)}`,
    `Name: ${d.name.trim()}`,
    `Contact: ${d.phone.trim()}`,
  ];
  if (d.notes.trim()) lines.push(`Notes: ${d.notes.trim()}`);
  lines.push(``, `Please confirm availability and the fare. Thank you.`);
  return lines.join("\n");
}

export const whatsappHref = (msg: string) =>
  `https://wa.me/${business.whatsapp.number}?text=${encodeURIComponent(msg)}`;

/** `sms:` with `?&body=` is understood by both iOS and Android. */
export const smsHref = (msg: string) => `sms:${business.sms.number}?&body=${encodeURIComponent(msg)}`;

export { serviceLabel, formatDate };
