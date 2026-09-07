"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react";
import { useRef, useState, type FormEvent } from "react";
import { CONTACT, SITE } from "../content";
import { EASE, useDrift } from "../lib/motion";
import { Cta } from "./primitives/Cta";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";

type Fields = { name: string; email: string; business: string; projectType: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", email: "", business: "", projectType: CONTACT.projectTypes[0], message: "" };

const field =
  "w-full border border-[var(--field-line)] bg-[var(--field)] px-4 py-3.5 text-[0.98rem] text-[var(--fg)] " +
  "transition-colors duration-300 hover:border-[var(--fg)] focus:border-[var(--accent)] focus:outline-none";

function validate(v: Fields): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Please add your name.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email.trim())) e.email = "Please add an email I can reply to.";
  if (v.message.trim().length < 10) e.message = "A sentence or two about the project is enough.";
  return e;
}

export function Contact() {
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const reduce = useReducedMotion();
  const headingRef = useRef<HTMLDivElement>(null);
  const headingY = useDrift(headingRef);

  const set = (k: keyof Fields) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setState("sending");

    /* With no endpoint configured the form still has to work, so it hands the
       message to the visitor's own mail client instead of failing quietly. */
    if (!SITE.formEndpoint) {
      const body = `Name: ${values.name}\nBusiness: ${values.business || "n/a"}\nProject: ${values.projectType}\n\n${values.message}`;
      window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
        `Project enquiry from ${values.name}`,
      )}&body=${encodeURIComponent(body)}`;
      setState("sent");
      return;
    }

    try {
      /* Web3Forms identifies the account by a key in the body, not the URL, so
         it rides along only when one is configured. Every other provider
         ignores a field it was not expecting. */
      const payload = SITE.formAccessKey ? { access_key: SITE.formAccessKey, ...values } : values;
      const res = await fetch(SITE.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("sent");
      setValues(EMPTY);
    } catch {
      setState("failed");
    }
  }

  return (
    <section id="contact" data-surface="light" className="s-light py-[clamp(3.25rem,8vh,5.5rem)]">
      <div className="u-wide">
      <div className="grid gap-12 md:grid-cols-12 md:gap-12">
        <div className="flex flex-col md:col-span-5">
          <motion.div ref={headingRef} style={reduce ? undefined : { y: headingY }}>
            <p className="u-label">Start here</p>
            <WordReveal text={CONTACT.heading} stagger={0.035} className="u-h2 mt-4 max-w-[15ch]" />
          </motion.div>
          <Reveal delay={0.15}>
            <p className="u-lede mt-6 max-w-[36ch]">{CONTACT.sub}</p>
          </Reveal>

          <Reveal delay={0.22} className="mt-auto">
            <div className="pt-10">
              {/* Stacked, not inline: two inline-flex links share a line and the
                 email's arrow ends up butted against the phone number. */}
              <div className="flex flex-col items-start gap-3.5">
              <a
                href={`mailto:${SITE.email}`}
                className="group inline-flex items-center gap-2 text-[clamp(1.05rem,1.7vw,1.35rem)]"
              >
                <span className="relative">
                  {SITE.email}
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent-graphic)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </span>
                <ArrowUpRight size={17} weight="regular" aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              {/* Half this audience rings rather than types. Rendered only when a
                 number is set, so an unset one is never a dead tel: link. */}
              {SITE.phone && (
                <a
                  href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
                  className="group inline-flex items-center gap-2 text-[clamp(1.05rem,1.7vw,1.35rem)]"
                >
                  <span className="relative">
                    {SITE.phone}
                    <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent-graphic)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                  </span>
                </a>
              )}
              </div>

              {/* Real availability, the one status indicator on the page. Gone
                 entirely when the line is empty, rather than claiming nothing. */}
              {SITE.availability && (
                <p className="mt-7 flex items-center gap-2.5 text-[0.9rem] text-[var(--fg-2)]">
                  <span aria-hidden className="relative flex h-2 w-2">
                    {!reduce && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-pill bg-[var(--accent-graphic)] opacity-60" />
                    )}
                    <span className="relative inline-flex h-2 w-2 rounded-pill bg-[var(--accent-graphic)]" />
                  </span>
                  {SITE.availability}
                </p>
              )}

              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2">
                {SITE.socials
                  .filter((s) => s.href)
                  .map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[0.92rem] text-[var(--fg-2)] transition-colors duration-300 hover:text-[var(--fg)]"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <AnimatePresence mode="wait">
            {state === "sent" ? (
              <motion.div
                key="sent"
                role="status"
                className="flex min-h-[22rem] flex-col justify-center border border-[var(--line)] bg-[var(--panel)] p-10"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <CheckCircle size={30} weight="regular" className="text-[var(--accent)]" aria-hidden />
                <h3 className="u-display mt-5 text-[1.6rem]">Message on its way.</h3>
                <p className="u-body mt-3 max-w-[34ch] text-[0.95rem]">
                  {SITE.formEndpoint
                    ? "I read every enquiry myself and usually reply the same day."
                    : "Your email app should be open with the details filled in. Send it and I will reply the same day."}
                </p>
                <button
                  type="button"
                  onClick={() => setState("idle")}
                  className="mt-8 self-start text-[0.9rem] text-[var(--fg-2)] underline underline-offset-4 transition-colors hover:text-[var(--fg)]"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={onSubmit}
                noValidate
                className="grid gap-6"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {([
                    ["name", "Name", "text", "name"],
                    ["email", "Email", "email", "email"],
                  ] as const).map(([key, label, type, auto]) => (
                    <div key={key} className="grid gap-2">
                      <label htmlFor={key} className="text-[0.85rem] text-[var(--fg-2)]">
                        {label}
                      </label>
                      <input
                        id={key}
                        name={key}
                        type={type}
                        autoComplete={auto}
                        value={values[key]}
                        onChange={set(key)}
                        aria-invalid={Boolean(errors[key])}
                        aria-describedby={errors[key] ? `${key}-error` : undefined}
                        className={`${field} ${errors[key] ? "border-[var(--accent)]" : ""}`}
                      />
                      {errors[key] && (
                        <p id={`${key}-error`} className="text-[0.82rem] text-[var(--accent)]">
                          {errors[key]}
                        </p>
                      )}
                    </div>
                  ))}
                  <div className="grid gap-2">
                    <label htmlFor="business" className="text-[0.85rem] text-[var(--fg-2)]">
                      Business <span className="text-[var(--fg-2)]">(optional)</span>
                    </label>
                    <input
                      id="business"
                      name="business"
                      type="text"
                      autoComplete="organization"
                      value={values.business}
                      onChange={set("business")}
                      className={field}
                    />
                  </div>
                </div>

                <fieldset className="grid gap-3">
                  <legend className="mb-1 text-[0.85rem] text-[var(--fg-2)]">Project type</legend>
                  <div className="flex flex-wrap gap-2">
                    {CONTACT.projectTypes.map((t) => {
                      const on = values.projectType === t;
                      return (
                        <label
                          key={t}
                          className={`cursor-pointer rounded-pill border px-4 py-2 text-[0.88rem] transition-colors duration-300 ${
                            on
                              ? "border-[var(--btn-bg)] bg-[var(--btn-bg)] text-[var(--btn-fg)]"
                              : "border-[var(--field-line)] text-[var(--fg-2)] hover:border-[var(--fg)] hover:text-[var(--fg)]"
                          }`}
                        >
                          <input
                            type="radio"
                            name="projectType"
                            value={t}
                            checked={on}
                            onChange={set("projectType")}
                            className="sr-only"
                          />
                          {t}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="grid gap-2">
                  <label htmlFor="message" className="text-[0.85rem] text-[var(--fg-2)]">
                    What are you building?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={values.message}
                    onChange={set("message")}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className={`${field} resize-y ${errors.message ? "border-[var(--accent)]" : ""}`}
                  />
                  {errors.message && (
                    <p id="message-error" className="text-[0.82rem] text-[var(--accent)]">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-5">
                  <Cta type="submit" disabled={state === "sending"} magnetic={false} icon={state !== "sending"}>
                    {state === "sending" ? "Sending" : "Send enquiry"}
                  </Cta>
                  {state === "failed" && (
                    <p role="alert" className="text-[0.88rem] text-[var(--accent)]">
                      That did not send. Email me directly at {SITE.email}.
                    </p>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
      </div>
    </section>
  );
}
