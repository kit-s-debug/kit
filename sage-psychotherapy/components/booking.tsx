"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { booking, chapters, crisis, formats, practice } from "@/content/site";
import { collectErrors, enquirySchema, type FieldErrors } from "@/lib/enquiry";
import { Chapter } from "./chapter";
import { Dapple, Field, Hills } from "./ground";
import { Sprig, Wreath } from "./sprig";

const CalEmbed = dynamic(() => import("./cal-embed").then((m) => m.CalEmbed), {
  ssr: false,
  loading: () => <p className="booking-fallback">Loading my calendar…</p>,
});

/**
 * Until the Cal.com link is set there is nothing to load, so the step says so
 * and offers the phone instead of sitting on a spinner that never resolves.
 */
function NoCalendarYet() {
  const [before, after] = booking.timeMissing.split(practice.phone);
  return (
    <p className="booking-fallback">
      {before}
      <a href={practice.phoneHref} className="link-plain">
        {practice.phone}
      </a>
      {after}
    </p>
  );
}

/**
 * A calm, single-column, four-step flow.
 *
 * With JavaScript off it is one plain form that posts to /api/enquiry and
 * redirects to /thanks — longer, but it works. The boot script sets data-js on
 * the document before first paint, so the steps are hidden by CSS from the
 * start and nothing jumps about on hydration.
 *
 * Nothing here asks what is wrong. That is deliberate and it is the whole
 * reason the free-text box says, twice, that it can be left empty.
 */
type StepIndex = 0 | 1 | 2 | 3;

export function Booking() {
  const ids = useId();
  const [step, setStep] = useState<StepIndex>(0);
  const [format, setFormat] = useState<string>(formats[0].id);
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [reachedTime, setReachedTime] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const heading = useRef<HTMLDivElement>(null);
  const startedAt = useMemo(() => Date.now(), []);

  useEffect(() => {
    if (step === 1) setReachedTime(true);
  }, [step]);

  const focusStep = () =>
    window.requestAnimationFrame(() => heading.current?.focus());

  const goTo = (next: StepIndex) => {
    setStep(next);
    focusStep();
  };

  /** Only the two fields the contact step owns, so Next can check its own step. */
  const validateContact = (): boolean => {
    if (!form.current) return true;
    const data = new FormData(form.current);
    const parsed = enquirySchema.safeParse({
      format: data.get("format"),
      name: String(data.get("name") ?? ""),
      method: data.get("method"),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      discreet: String(data.get("discreet") ?? ""),
      safeTimes: String(data.get("safeTimes") ?? ""),
      note: String(data.get("note") ?? ""),
      concession: data.get("concession") === "on",
      website: String(data.get("website") ?? ""),
    });
    if (parsed.success) {
      setErrors({});
      return true;
    }
    const found = collectErrors(parsed.error);
    const own: FieldErrors = {};
    if (found.name) own.name = found.name;
    if (found.phone) own.phone = found.phone;
    if (found.email) own.email = found.email;
    setErrors(own);
    return Object.keys(own).length === 0;
  };

  const validate = (): boolean => {
    if (!form.current) return true;
    const data = new FormData(form.current);
    const parsed = enquirySchema.safeParse({
      format: data.get("format"),
      name: String(data.get("name") ?? ""),
      method: data.get("method"),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      discreet: String(data.get("discreet") ?? ""),
      safeTimes: String(data.get("safeTimes") ?? ""),
      note: String(data.get("note") ?? ""),
      concession: data.get("concession") === "on",
      website: String(data.get("website") ?? ""),
    });
    if (parsed.success) {
      setErrors({});
      return true;
    }
    setErrors(collectErrors(parsed.error));
    return false;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) {
      // Contact problems live on step three; send them back to fix it there.
      goTo(2);
      return;
    }
    setState("sending");
    const data = new FormData(event.currentTarget);
    data.set("elapsed", String(Date.now() - startedAt));
    try {
      const response = await fetch("/api/enquiry", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (!response.ok) throw new Error(String(response.status));
      setState("sent");
      focusStep();
    } catch {
      // Never log or report what was in the form.
      setState("failed");
    }
  };

  if (state === "sent") {
    return (
      <section id="book" className="booking on-dark" aria-labelledby="booking-heading">
        <Hills horizon="far" className="booking-hills" />
        <Dapple id="booking" className="dapple-set booking-dapple" />
        <Field shape="band" className="booking-field" />
        <Wreath size={520} leaves={17} crown={40} className="greenery booking-greenery" />
        <div className="shell-editorial booking-shell">
          <div className="booking-done" ref={heading} tabIndex={-1}>
            <p lang="cy" className="booking-diolch">
              {booking.confirmation.welsh}.
            </p>
            <h2 id="booking-heading" className="booking-done-heading">
              {booking.confirmation.heading}
            </h2>
            {booking.confirmation.lines.map((line) => (
              <p key={line} className="booking-done-line">
                {line}
              </p>
            ))}
            <p className="booking-done-ring">
              {booking.confirmation.ring}{" "}
              <a href={practice.phoneHref} className="link-plain">
                {practice.phone}
              </a>
            </p>
            <div className="booking-done-crisis">
              <h3 className="label">{crisis.heading}</h3>
              <p className="booking-done-crisis-body">{crisis.body}</p>
              <ul className="crisis-list">
                {crisis.lines.map((line) => (
                  <li key={line.name}>
                    <a href={line.href} className="crisis-name link-plain">
                      {line.name}
                    </a>
                    <span className="crisis-detail">{line.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="booking on-dark" aria-labelledby="booking-heading">
      <Hills horizon="far" className="booking-hills" />
      <Dapple id="booking" className="dapple-set booking-dapple" />
      <Field shape="band" className="booking-field" />
      <Wreath size={520} leaves={17} crown={40} className="greenery booking-greenery" />
      <div className="shell-editorial booking-shell">
        <Chapter {...chapters.booking} />
        <div className="booking-head">
          <Sprig variant="five" size={22} className="booking-leaf" />
          <h2 id="booking-heading" className="booking-heading">
            {booking.heading}
          </h2>
          <p className="booking-intro">{booking.intro}</p>
        </div>

        <ol className="progress" aria-label="Progress">
          {booking.steps.map((item, index) => (
            <li
              key={item.id}
              className="progress-step"
              data-state={index === step ? "current" : index < step ? "done" : "todo"}
              aria-current={index === step ? "step" : undefined}
            >
              <span className="progress-rule" aria-hidden="true" />
              <span className="progress-name">{item.short}</span>
            </li>
          ))}
        </ol>

        <form
          ref={form}
          className="booking-form"
          method="post"
          action="/api/enquiry"
          onSubmit={onSubmit}
          noValidate
        >
          {/* Honeypot. Never shown, never focusable, must come back empty. */}
          <div className="honeypot" aria-hidden="true">
            <label htmlFor={`${ids}-website`}>Leave this field empty</label>
            <input id={`${ids}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="booking-steps" ref={heading} tabIndex={-1}>
            {/* --- 1. kind of session ------------------------------------ */}
            <fieldset className="booking-step" data-active={step === 0}>
              <legend className="booking-step-heading">{booking.formatQuestion}</legend>
              <p className="booking-step-help">{booking.formatHelp}</p>
              <div className="choices">
                {formats.map((option) => (
                  <label key={option.id} className="choice">
                    <input
                      type="radio"
                      name="format"
                      value={option.id}
                      checked={format === option.id}
                      onChange={() => setFormat(option.id)}
                    />
                    <span className="choice-name">{option.name}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* --- 2. pick a time ---------------------------------------- */}
            <div className="booking-step" data-active={step === 1}>
              <h3 className="booking-step-heading">{booking.timeHeading}</h3>
              <p className="booking-step-help">{booking.timeHelp}</p>
              {practice.cal.link ? reachedTime && <CalEmbed /> : <NoCalendarYet />}
            </div>

            {/* --- 3. how to reach you ----------------------------------- */}
            <fieldset className="booking-step" data-active={step === 2}>
              <legend className="booking-step-heading">{booking.contactHeading}</legend>
              <p className="booking-step-help">{booking.contactHelp}</p>
              <p className="booking-required-note">{booking.requiredNote}</p>
              {/* Only shown when JavaScript is off, where both contact rows
                  are on screen at once because nothing can toggle them. */}
              <p className="booking-nojs-note">{booking.noJsContactNote}</p>

              <div className="field-row">
                <label htmlFor={`${ids}-name`}>
                  {booking.nameLabel} <span className="field-flag">{booking.requiredMark}</span>
                </label>
                <input
                  id={`${ids}-name`}
                  name="name"
                  type="text"
                  className="field"
                  required
                  autoComplete="given-name"
                  placeholder={booking.namePlaceholder}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? `${ids}-name-error` : undefined}
                />
                {errors.name && (
                  <p id={`${ids}-name-error`} className="field-error" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="field-row">
                <span className="field-legend">{booking.methodLabel}</span>
                <div className="toggle-pair">
                  {(["phone", "email"] as const).map((option) => (
                    <label key={option} className="toggle-option">
                      <input
                        type="radio"
                        name="method"
                        value={option}
                        checked={method === option}
                        onChange={() => setMethod(option)}
                      />
                      <span>{option === "phone" ? booking.methodPhone : booking.methodEmail}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-row" data-hidden={method !== "phone"}>
                <label htmlFor={`${ids}-phone`}>
                  {booking.phoneLabel} <span className="field-flag">{booking.requiredMark}</span>
                </label>
                <input
                  id={`${ids}-phone`}
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  className="field"
                  autoComplete="tel"
                  aria-invalid={errors.phone ? true : undefined}
                  aria-describedby={errors.phone ? `${ids}-phone-error` : undefined}
                />
                {errors.phone && (
                  <p id={`${ids}-phone-error`} className="field-error" role="alert">
                    {errors.phone}
                  </p>
                )}
              </div>

              <div className="field-row" data-hidden={method !== "email"}>
                <label htmlFor={`${ids}-email`}>
                  {booking.emailLabel} <span className="field-flag">{booking.requiredMark}</span>
                </label>
                <input
                  id={`${ids}-email`}
                  name="email"
                  type="email"
                  className="field"
                  autoComplete="email"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? `${ids}-email-error` : undefined}
                />
                {errors.email && (
                  <p id={`${ids}-email-error`} className="field-error" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="field-row">
                <label htmlFor={`${ids}-discreet`}>
                  {booking.discreetLabel}{" "}
                  <span className="field-flag" data-optional="true">{booking.optionalMark}</span>
                </label>
                <p id={`${ids}-discreet-help`} className="field-help">
                  {booking.discreetHelp}
                </p>
                <input
                  id={`${ids}-discreet`}
                  name="discreet"
                  type="text"
                  className="field"
                  aria-describedby={`${ids}-discreet-help`}
                />
              </div>

              <div className="field-row">
                <label htmlFor={`${ids}-safe`}>
                  {booking.safeTimesLabel}{" "}
                  <span className="field-flag" data-optional="true">{booking.optionalMark}</span>
                </label>
                <input
                  id={`${ids}-safe`}
                  name="safeTimes"
                  type="text"
                  className="field"
                  placeholder={booking.safeTimesPlaceholder}
                />
              </div>
            </fieldset>

            {/* --- 4. anything I should know --------------------------- */}
            <fieldset className="booking-step" data-active={step === 3}>
              <legend className="booking-step-heading">{booking.noteHeading}</legend>
              <p className="booking-step-help">{booking.noteHelp}</p>
              <p className="booking-caution">{booking.noteCaution}</p>

              <div className="field-row">
                <label htmlFor={`${ids}-note`} className="visually-hidden">
                  {booking.noteHeading}
                </label>
                <textarea
                  id={`${ids}-note`}
                  name="note"
                  rows={4}
                  className="field booking-note"
                  placeholder={booking.notePlaceholder}
                />
              </div>

              <label className="checkbox">
                <input type="checkbox" name="concession" />
                <span>
                  <span className="checkbox-label">{booking.concessionLabel}</span>
                  <span className="checkbox-help">{booking.concessionHelp}</span>
                </span>
              </label>

              <div className="consent">
                <h3 className="label">{booking.consentHeading}</h3>
                <p className="consent-body">{booking.consentBody}</p>
              </div>

              {state === "failed" && (
                <div className="booking-error" role="alert">
                  <p className="booking-error-heading">{booking.errorHeading}</p>
                  <p>{booking.errorBody}</p>
                </div>
              )}
            </fieldset>
          </div>

          <div className="booking-controls">
            <button
              type="button"
              className="action-quiet booking-back"
              onClick={() => goTo(Math.max(0, step - 1) as StepIndex)}
              data-hidden={step === 0}
            >
              {booking.back}
            </button>

            {/* Distinct keys are load-bearing. Both branches render a <button>
                in the same slot, so without them React reuses the one DOM node
                and only rewrites its attributes — which flipped `type` from
                "button" to "submit" while the click that caused the step change
                was still being dispatched. The browser then ran the default
                action on the mutated node and posted the form, skipping this
                last step entirely. Separate keys mean separate nodes. */}
            {step < 3 ? (
              <button
                key="next"
                type="button"
                className="action"
                onClick={() => {
                  // Catching this here means the problem is fixed on the step
                  // that owns it, rather than at the end of the form.
                  if (step === 2 && !validateContact()) return;
                  goTo(Math.min(3, step + 1) as StepIndex);
                }}
              >
                {booking.next}
              </button>
            ) : (
              <button key="submit" type="submit" className="action" disabled={state === "sending"}>
                {state === "sending" ? booking.submitting : booking.submit}
              </button>
            )}
          </div>

          <noscript>
            <button type="submit" className="action">
              {booking.submit}
            </button>
          </noscript>
        </form>
      </div>
    </section>
  );
}
