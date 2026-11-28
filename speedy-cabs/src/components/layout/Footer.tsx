import { business, telHref, visibleClaim } from "@/lib/business";
import { ArrowRight, PhoneIcon } from "../ui/Icons";
import { Pending } from "../ui/Pending";
import { Reveal } from "../ui/Reveal";
import { Logo } from "./Logo";

export function Footer() {
  const a = business.address;
  const open247 = visibleClaim(business.claims.open247);
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative overflow-hidden bg-midnight pb-28 md:pb-10">
      {/* Closing call to action */}
      <div className="relative mx-auto max-w-[88rem] px-5 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-gold/20 bg-[radial-gradient(ellipse_at_top_right,rgba(233,171,60,0.18),transparent_55%),linear-gradient(135deg,#131f36,#0f1a2e)] px-7 py-14 sm:px-14 sm:py-20">
            <svg className="pointer-events-none absolute right-0 bottom-0 h-full w-2/3 opacity-60" viewBox="0 0 600 300" preserveAspectRatio="none" aria-hidden>
              <path d="M0 280 C 150 260, 220 180, 330 170 S 520 90, 600 20" fill="none" stroke="#e9ab3c" strokeOpacity="0.5" strokeDasharray="1 7" strokeLinecap="round" strokeWidth="2" />
            </svg>
            <p className="eyebrow text-gold">Ready when you are</p>
            <h2 className="display mt-4 max-w-3xl text-[2.6rem] text-ivory sm:text-6xl lg:text-7xl">
              Where are you <span className="serif-accent font-normal text-gold-soft">heading?</span>
            </h2>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#book"
                className="group inline-flex h-14 items-center gap-3 rounded-full bg-gold pr-2 pl-7 font-semibold text-midnight transition-colors hover:bg-gold-soft"
              >
                Book a Journey
                <span className="grid h-10 w-10 place-items-center rounded-full bg-midnight text-gold">
                  <ArrowRight width={18} height={18} />
                </span>
              </a>
              <a
                href={telHref(business.phones.primary.e164)}
                className="inline-flex h-14 items-center gap-3 rounded-full border border-ivory/25 px-6 font-semibold text-ivory transition-colors hover:border-gold/60"
              >
                <PhoneIcon width={18} height={18} className="text-gold" />
                Call {business.phones.primary.display}
              </a>
            </div>
          </div>
        </Reveal>

        <div className="mt-20 grid gap-12 border-t border-white/[0.07] pt-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <address className="mt-6 text-[0.95rem] not-italic leading-relaxed text-mist">
              {business.fullName}
              <br />
              {a.street}, {a.town}
              <br />
              {a.county} {a.postcode}
            </address>
            <a
              href={business.links.directions}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-gold underline-offset-4 hover:underline"
            >
              Directions<span className="sr-only"> (opens Google Maps in a new tab)</span> →
            </a>
          </div>

          <nav aria-label="Footer">
            <p className="eyebrow text-fog">Explore</p>
            <ul className="mt-5 space-y-3 text-[0.95rem]">
              {[
                ["#services", "Services"],
                ["#journeys", "Where we go"],
                ["#book", "Book a journey"],
                ["#local", "About us"],
              ].map(([h, l]) => (
                <li key={h}>
                  <a href={h} className="text-mist transition-colors hover:text-ivory">
                    {l}
                  </a>
                </li>
              ))}
              <li>
                <a href={business.links.googleProfile} target="_blank" rel="noopener noreferrer" className="text-mist transition-colors hover:text-ivory">
                  Google profile<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>

          <div>
            <p className="eyebrow text-fog">Service areas</p>
            <ul className="mt-5 space-y-3 text-[0.95rem] text-mist">
              {business.areas.map((t) => (
                <li key={t.name}>{t.name}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow text-fog">Contact</p>
            <ul className="mt-5 space-y-3">
              <li>
                <a href={telHref(business.phones.primary.e164)} className="display text-2xl text-ivory hover:text-gold-soft">
                  {business.phones.primary.display}
                </a>
              </li>
              <li>
                <a href={telHref(business.phones.alternative.e164)} className="display text-xl text-mist hover:text-gold-soft">
                  {business.phones.alternative.display}
                </a>
              </li>
              {open247.show && (
                <li className="pt-2 text-sm text-mist">
                  {business.claims.open247.label}
                  {open247.pending && <Pending />}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.07] pt-8 text-xs text-fog sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {business.fullName}. All journeys subject to confirmation by the operator.
          </p>
          <p>The vehicle in the opening scene is an illustration, not a company vehicle.</p>
        </div>
        {business.demoMode && (
          <p className="mt-3 text-xs text-fog">
            <span className="text-gold">†</span> Demo website: claims marked † are taken from existing business listings and must be
            confirmed by the owner before launch.
          </p>
        )}
      </div>
    </footer>
  );
}
