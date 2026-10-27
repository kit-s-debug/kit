"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { nav, practice, cta } from "@/content/site";
import { Wordmark } from "./leaf";
import { Preferences } from "./preferences";
import { QuickExitButton } from "./quick-exit";
import { SocialLinks } from "./social-links";

/**
 * Sits over the hero rather than sticking to the top: after the hero the
 * booking bar takes over and there is never more than one bar on screen.
 * The mobile menu is a native <details>, so it opens with JavaScript off.
 *
 * The section links are written absolute — `/#sessions`, not `#sessions`.
 * The header renders on every page, and a bare fragment resolves against the
 * current document: on /about, /privacy and /thanks all five nav items used to
 * point at anchors that do not exist on those pages and silently did nothing.
 */
export function Header({ overHero = false }: { overHero?: boolean }) {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);

  /* A native <details> stays open when a link inside it is followed, so on a
     phone the panel sat over the section it had just jumped to. Close it on
     any click that resolves to a link, and on Escape. */
  useEffect(() => {
    const element = menu.current;
    if (!element) return;
    const close = (event: Event) => {
      if ((event.target as HTMLElement | null)?.closest("a")) element.open = false;
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && element.open) element.open = false;
    };
    element.addEventListener("click", close);
    element.addEventListener("keydown", onKey);
    return () => {
      element.removeEventListener("click", close);
      element.removeEventListener("keydown", onKey);
    };
  }, []);

  /* On the home page the section is on this document, so a plain fragment
     keeps the smooth in-page scroll and adds no history entry for the path. */
  const onHome = pathname === "/";
  const sectionHref = (hash: string) => (onHome ? hash : `/${hash}`);

  const items = nav.map((item) => ({ ...item, href: sectionHref(item.href) }));

  return (
    <header className="site-header" data-over-hero={overHero || undefined}>
      <div className="shell-wide site-header-inner">
        <Link href="/" className="site-header-brand" aria-label={`${practice.name} — home`}>
          <Wordmark />
        </Link>

        <nav className="site-nav" aria-label="Sections of this page">
          <ul>
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header-tools">
          <Preferences />
          <SocialLinks tone={overHero ? "dark" : "light"} />
          <QuickExitButton />
        </div>

        <details className="site-menu" ref={menu}>
          <summary aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </summary>
          <div className="site-menu-panel">
            <ul>
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined}>
                  About Lyndsay
                </Link>
              </li>
              <li>
                <Link href={sectionHref("#book")} className="site-menu-cta">
                  {cta.primary}
                </Link>
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
