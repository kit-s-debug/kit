import { NAV, SITE } from "../content";
import { Logo } from "./primitives/Logo";

export function Footer() {
  return (
    <footer data-surface="dark" className="s-dark">
      <div className="u-wide u-line-t flex flex-col gap-8 py-11 md:flex-row md:items-center md:justify-between">
        {/* Same lockup as the bar, a size up. The stacked version the logo ships
           with is taller than this row allows. */}
        <div>
          <a href="#top" className="inline-flex items-center" aria-label={`${SITE.name}, back to top`}>
            <Logo height={38} />
          </a>
          <p className="u-fg2 mt-3 text-[0.85rem]">
            {SITE.role}, {SITE.place}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-2">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-[0.88rem] text-[var(--fg-2)] transition-colors duration-300 hover:text-[var(--fg)]">
              {n.label}
            </a>
          ))}
          <a
            href={`mailto:${SITE.email}`}
            className="text-[0.88rem] text-[var(--fg-2)] transition-colors duration-300 hover:text-[var(--fg)]"
          >
            Email
          </a>
          {SITE.phone && (
            <a
              href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
              className="text-[0.88rem] text-[var(--fg-2)] transition-colors duration-300 hover:text-[var(--fg)]"
            >
              {SITE.phone}
            </a>
          )}
          <a
            href="/privacy/"
            className="text-[0.88rem] text-[var(--fg-2)] transition-colors duration-300 hover:text-[var(--fg)]"
          >
            Privacy
          </a>
        </nav>

        <p className="u-fg2 text-[0.8rem]">&copy; {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  );
}
