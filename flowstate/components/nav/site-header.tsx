'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wordmark } from '@/components/nav/wordmark';

const LINKS = [
  { href: '/beats', label: 'Beats' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/history', label: 'History' },
  { href: '/settings', label: 'Settings' },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line-soft/80 bg-void/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="FLOWSTATE home">
          <Wordmark />
        </Link>

        <nav aria-label="Main" className="min-w-0">
          <ul className="-mx-1 flex items-center gap-0.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
                      active ? 'text-text' : 'text-faint hover:text-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/freestyle"
          className="hidden shrink-0 rounded-xl bg-accent px-4 py-2.5 text-[13px] font-bold text-[#180700] transition-colors hover:bg-accent-soft sm:block"
        >
          Start
        </Link>
      </div>
    </header>
  );
}
