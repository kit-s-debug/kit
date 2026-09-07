import { NAV, SITE } from "../content";
import { LogoMark, LogoStack } from "./primitives/Logo";

export function Footer() {
  return (
    <footer data-surface="dark" className="s-dark">
      <div className="u-wide u-line-t flex flex-col gap-8 py-11 md:flex-row md:items-center md:justify-between">
        {/* The footer gets the stacked mark rather than the bar's lockup. It is
           the last thing on the page, so the name is allowed to sit at size. */}
        <div>
          <a href="#top" className="inline-flex items-end gap-3.5" aria-label={`${SITE.name}, back to top`}>
            <LogoMark size={40} />
            <LogoStack size="1.35rem" />
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
        </nav>

        <p className="u-fg2 text-[0.8rem]">&copy; {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </footer>
  );
}
