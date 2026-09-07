import { ArrowLeft } from "@phosphor-icons/react";
import { LEGAL, SITE } from "./content";
import { Logo } from "./components/primitives/Logo";
import { analyticsEnabled } from "./lib/analytics";

/* The privacy notice, on its own page rather than in an overlay, because it has
   to be linkable and crawlable. It deliberately does not pull in the home
   page's nav, terrain or work section: a legal page should load instantly and
   its links should not be hash targets that only exist on another route. */

export function Privacy() {
  const sections = analyticsEnabled ? [...LEGAL.sections, LEGAL.analytics] : LEGAL.sections;

  return (
    <div className="s-light min-h-[100dvh]">
      <header className="u-line-b">
        <div className="u-mid flex h-[74px] items-center justify-between">
          <a href="/" aria-label={`${SITE.name}, back to the site`} className="leading-none">
            <Logo height={26} />
          </a>
          <a
            href="/"
            className="group inline-flex items-center gap-2 text-[0.9rem] text-[var(--fg-2)] transition-colors duration-300 hover:text-[var(--fg)]"
          >
            <ArrowLeft
              size={15}
              weight="regular"
              aria-hidden
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            Back to the site
          </a>
        </div>
      </header>

      <main className="u-mid py-[clamp(3rem,8vh,5rem)]">
        <p className="u-label">Updated {LEGAL.updated}</p>
        <h1 className="u-h2 mt-4">{LEGAL.heading}</h1>
        <p className="u-lede mt-6">{LEGAL.intro}</p>

        <div className="mt-[clamp(2.5rem,6vh,4rem)]">
          {sections.map((s) => (
            <section key={s.k} className="u-line-t grid gap-4 py-8 md:grid-cols-12 md:gap-10">
              <h2 className="u-display text-[clamp(1.15rem,1.7vw,1.4rem)] md:col-span-4">{s.k}</h2>
              <div className="md:col-span-7 md:col-start-6">
                {s.v.map((p) => (
                  <p key={p.slice(0, 24)} className="u-body mb-4 text-[0.98rem] last:mb-0">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="s-dark">
        <div className="u-mid flex flex-wrap items-center justify-between gap-5 py-9">
          <p className="u-fg2 text-[0.85rem]">
            {SITE.name}, {SITE.place}
          </p>
          <a
            href={`mailto:${SITE.email}`}
            className="text-[0.88rem] text-[var(--fg-2)] transition-colors duration-300 hover:text-[var(--fg)]"
          >
            {SITE.email}
          </a>
        </div>
      </footer>
    </div>
  );
}
