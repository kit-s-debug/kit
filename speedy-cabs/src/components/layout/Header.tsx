"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { business, telHref } from "@/lib/business";
import { CloseIcon, MenuIcon, PhoneIcon } from "../ui/Icons";
import { Logo } from "./Logo";

const nav = [
  { href: "#services", label: "Services" },
  { href: "#journeys", label: "Journeys" },
  { href: "#how", label: "How it works" },
  { href: "#local", label: "About us" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled || open ? "border-b border-white/[0.06] bg-midnight/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[4.5rem] max-w-[88rem] items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" className="rounded-lg" aria-label={`${business.fullName}, back to top`}>
          <Logo />
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="rounded-full px-4 py-2 text-[0.92rem] text-mist transition-colors hover:bg-white/[0.05] hover:text-ivory"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telHref(business.phones.primary.e164)}
            className="hidden items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-ivory transition-colors hover:text-gold-soft md:flex"
          >
            <PhoneIcon width={16} height={16} className="text-gold" />
            {business.phones.primary.display}
          </a>
          <a
            href="#book"
            className="hidden rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-midnight transition-[background-color,transform] hover:bg-gold-soft active:scale-[0.98] sm:inline-flex"
          >
            Book a journey
          </a>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-ivory lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/[0.06] bg-midnight lg:hidden"
          >
            <ul className="px-5 py-4">
              {nav.map((n) => (
                <li key={n.href}>
                  <a
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="display flex items-center justify-between border-b border-white/[0.06] py-4 text-2xl text-ivory"
                  >
                    {n.label}
                    <span className="text-gold" aria-hidden>
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="grid gap-2 px-5 pb-6 text-sm text-mist">
              <a href={telHref(business.phones.primary.e164)} className="text-ivory">
                Call {business.phones.primary.display}
              </a>
              <a href={telHref(business.phones.alternative.e164)}>or {business.phones.alternative.display}</a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
