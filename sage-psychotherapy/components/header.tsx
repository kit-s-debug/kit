import Link from "next/link";
import { nav, practice, cta } from "@/content/site";
import { Wordmark } from "./leaf";
import { Preferences } from "./preferences";
import { QuickExitButton } from "./quick-exit";
import { SocialLinks } from "./social-links";

/**
 * Sits over the hero rather than sticking to the top: after the hero the
 * booking bar takes over and there is never more than one bar on screen.
 * The mobile menu is a native <details>, so it opens with JavaScript off.
 */
export function Header({ overHero = false }: { overHero?: boolean }) {
  return (
    <header className="site-header" data-over-hero={overHero || undefined}>
      <div className="shell-wide site-header-inner">
        <Link href="/" className="site-header-brand" aria-label={`${practice.name} — home`}>
          <Wordmark />
        </Link>

        <nav className="site-nav" aria-label="Sections of this page">
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header-tools">
          <Preferences />
          <SocialLinks tone={overHero ? "dark" : "light"} />
          <QuickExitButton />
        </div>

        <details className="site-menu">
          <summary aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="site-menu-panel">
            <ul>
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
              <li>
                <a href="/about">About Lyndsay</a>
              </li>
              <li>
                <a href="#book">{cta.primary}</a>
              </li>
            </ul>
            <Preferences compact />
            <SocialLinks />
          </div>
        </details>
      </div>
    </header>
  );
}
