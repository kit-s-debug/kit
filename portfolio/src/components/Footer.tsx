import { NAV, SITE } from "../content";

export function Footer() {
  return (
    <footer data-surface="dark" className="s-dark">
      <div className="u-wide u-line-t flex flex-col gap-8 py-11 md:flex-row md:items-center md:justify-between">
        <div>
          <a href="#top" className="u-wordmark text-[0.95rem]">
            Kit Ryder
          </a>
          <p className="u-fg2 mt-2 text-[0.85rem]">
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

        <p className="u-fg2 text-[0.8rem]">&copy; {new Date().getFullYear()} Kit Ryder</p>
      </div>
    </footer>
  );
}
