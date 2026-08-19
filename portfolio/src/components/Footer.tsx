import { NAV, SITE } from "../content";

export function Footer() {
  return (
    <footer className="u-hairline-t">
      <div className="u-container flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <a href="#top" className="u-wordmark text-[0.95rem] text-chalk">
            Kit Ryder
          </a>
          <p className="mt-2 text-[0.85rem] text-mist">
            {SITE.role}, {SITE.place}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-7 gap-y-2">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-[0.88rem] text-mist transition-colors duration-300 hover:text-chalk">
              {n.label}
            </a>
          ))}
          <a href={`mailto:${SITE.email}`} className="text-[0.88rem] text-mist transition-colors duration-300 hover:text-chalk">
            Email
          </a>
        </nav>

        <p className="text-[0.8rem] text-mist">&copy; {new Date().getFullYear()} Kit Ryder</p>
      </div>
    </footer>
  );
}
