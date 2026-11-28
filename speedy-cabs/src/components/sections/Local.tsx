"use client";

import { business, telHref, visibleClaim } from "@/lib/business";
import { CardIcon, ExternalIcon, MoonIcon, PhoneIcon, PinIcon, RouteIcon, StarIcon, UsersIcon } from "../ui/Icons";
import { Pending } from "../ui/Pending";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

function Locator() {
  // Stylised "you are here" locator for the Portfield base
  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="loc-g" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#e9ab3c" stopOpacity="0.25" />
          <stop offset="1" stopColor="#e9ab3c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="160" cy="160" r="150" fill="url(#loc-g)" />
      {[40, 75, 110, 145].map((r) => (
        <circle key={r} cx="160" cy="160" r={r} fill="none" stroke="#f4efe6" strokeOpacity={0.12} strokeDasharray={r > 100 ? "2 6" : undefined} />
      ))}
      <g stroke="#f4efe6" strokeOpacity="0.16">
        <line x1="160" y1="5" x2="160" y2="315" />
        <line x1="5" y1="160" x2="315" y2="160" />
      </g>
      {/* Abstract streets around Portfield */}
      <g fill="none" stroke="#c3c9d3" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round">
        <path d="M30 210 C 90 190, 130 170, 160 160 S 250 120, 300 70" />
        <path d="M90 40 C 120 100, 140 130, 160 160 S 190 250, 200 300" strokeOpacity="0.2" />
        <path d="M40 120 C 100 130, 220 200, 290 250" strokeOpacity="0.15" />
      </g>
      <circle cx="160" cy="160" r="22" fill="#e9ab3c" fillOpacity="0.2" className="svc-pulse" />
      <circle cx="160" cy="160" r="8" fill="#e9ab3c" stroke="#0a1222" strokeWidth="3" />
      <text x="174" y="150" fontSize="11" letterSpacing="2.5" fill="#f4efe6" fillOpacity="0.8" fontWeight="600">
        PORTFIELD
      </text>
      <text x="174" y="166" fontSize="10" letterSpacing="2" fill="#e9ab3c">
        {business.address.postcode}
      </text>
    </svg>
  );
}

export function Local() {
  const a = business.address;
  const open247 = visibleClaim(business.claims.open247);
  const cards = visibleClaim(business.claims.cardPayments);

  const facts = [
    { icon: PinIcon, k: "Based in", v: `${a.town}, ${a.county}`, pending: false, show: true },
    { icon: RouteIcon, k: "Journeys", v: "Local trips and longer distances", pending: false, show: true },
    { icon: UsersIcon, k: "Vehicles", v: "Taxi and minibus options", pending: false, show: true },
    { icon: PhoneIcon, k: "Bookings", v: `${business.phones.primary.display} · ${business.phones.alternative.display}`, pending: false, show: true },
    { icon: MoonIcon, k: "Hours", v: business.claims.open247.detail, pending: open247.pending, show: open247.show },
    { icon: CardIcon, k: "Payment", v: business.claims.cardPayments.detail, pending: cards.pending, show: cards.show },
  ].filter((f) => f.show);

  return (
    <section id="local" aria-labelledby="local-title" className="relative overflow-hidden bg-midnight py-24 sm:py-32">
      <div className="mx-auto max-w-[88rem] px-5 sm:px-8">
        <SectionHeading
          id="local-title"
          index="04"
          eyebrow="Local & established"
          title="Haverfordwest-based."
          accent="Pembrokeshire-wide."
          intro="A local firm on Portfield, serving the county town and the towns, villages and coast around it."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-12">
          {/* Address card */}
          <Reveal className="lg:col-span-5">
            <div className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-gradient-to-b from-deep to-navy">
              <div className="relative mx-auto aspect-square w-full max-w-[22rem] p-6">
                <Locator />
              </div>
              <div className="mt-auto border-t border-white/[0.07] p-7 sm:p-8">
                <p className="eyebrow text-fog">Find us</p>
                <address className="display mt-3 text-2xl not-italic leading-tight text-ivory sm:text-[1.7rem]">
                  {a.street}
                  <br />
                  {a.town}, {a.county}
                  <br />
                  <span className="text-gold-soft">{a.postcode}</span>
                </address>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={business.links.directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-3 text-sm font-semibold text-midnight transition-colors hover:bg-gold-soft"
                  >
                    Get directions
                    <ExternalIcon width={15} height={15} />
                    <span className="sr-only">(opens Google Maps in a new tab)</span>
                  </a>
                  <a
                    href={telHref(business.phones.primary.e164)}
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-ivory transition-colors hover:border-gold/60"
                  >
                    <PhoneIcon width={15} height={15} className="text-gold" />
                    Call
                  </a>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Spec-sheet facts */}
          <div className="grid gap-5 lg:col-span-7">
            <Reveal delay={0.06}>
              <dl className="grid overflow-hidden rounded-[1.75rem] border border-white/[0.07] sm:grid-cols-2">
                {facts.map(({ icon: Icon, k, v, pending }) => (
                  <div key={k} className="flex gap-4 border-white/[0.07] bg-navy/40 p-6 [&:not(:last-child)]:border-b sm:p-7 sm:odd:border-r sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/30 text-gold">
                      <Icon />
                    </span>
                    <div>
                      <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-fog">{k}</dt>
                      <dd className="mt-1.5 text-[1.05rem] leading-snug text-ivory">
                        {v}
                        {pending && <Pending />}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-[1.75rem] border border-white/[0.07] bg-navy/40 p-7 sm:p-8">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-fog">Service area</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {business.areas.map((t) => (
                    <li
                      key={t.name}
                      className={`rounded-full px-4 py-2 text-sm ${
                        "hub" in t && t.hub ? "bg-gold font-semibold text-midnight" : "border border-white/12 text-mist"
                      }`}
                    >
                      {t.name}
                    </li>
                  ))}
                  <li className="rounded-full border border-dashed border-white/15 px-4 py-2 text-sm text-fog">and the wider county</li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        <Reviews />
      </div>
    </section>
  );
}

function Reviews() {
  const { reviews, rating, links } = business;
  return (
    <div className="mt-5">
      {reviews.length > 0 ? (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-label="Customer reviews">
          {reviews.map((r, i) => (
            <Reveal as="li" key={i} delay={i * 0.05}>
              <figure className="h-full rounded-[1.75rem] border border-white/[0.07] bg-navy/40 p-7">
                <blockquote className="serif-accent text-xl leading-snug text-ivory">&ldquo;{r.text}&rdquo;</blockquote>
                <figcaption className="mt-5 text-sm text-fog">
                  {r.author} · via {r.source}
                  {r.date ? ` · ${r.date}` : ""}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      ) : null}

      <Reveal delay={0.05} className={reviews.length ? "mt-5" : ""}>
        <a
          href={links.googleProfile}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col gap-6 rounded-[1.75rem] border border-white/[0.07] bg-gradient-to-r from-deep to-navy p-7 transition-colors hover:border-gold/40 sm:flex-row sm:items-center sm:justify-between sm:p-9"
        >
          <div className="flex items-center gap-5">
            <span className="flex gap-1 text-gold" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} width={18} height={18} fill="currentColor" />
              ))}
            </span>
            <div>
              <p className="display text-2xl text-ivory">
                {rating.verified ? `Rated ${rating.value} from ${rating.count} reviews` : "See what customers say"}
              </p>
              <p className="mt-1 text-sm text-mist">Read reviews and find us on our Google Business Profile.</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-gold">
            Open Google profile
            <ExternalIcon width={16} height={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span className="sr-only">(opens in a new tab)</span>
          </span>
        </a>
        {business.demoMode && reviews.length === 0 && (
          <p className="mt-3 text-xs text-fog">
            Demo note: customer reviews can be shown here once their source and wording are verified. They are added in the business
            settings file.
          </p>
        )}
      </Reveal>
    </div>
  );
}
