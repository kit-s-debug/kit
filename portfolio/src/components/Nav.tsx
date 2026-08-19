"use client";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { NAV, SITE } from "../content";
import { EASE } from "../lib/motion";
import { Cta } from "./primitives/Cta";

const SECTION_IDS = ["work", "about", "services", "contact"];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  /* Reads the scroll position off a motion value rather than a scroll
     listener, and only re-renders when the threshold is actually crossed. */
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 24;
    setScrolled((prev) => (prev === next ? prev : next));
  });

  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.6] },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
    <>
      <motion.header
        className={`fixed inset-x-0 top-0 z-50 ${scrolled ? "u-glass u-hairline-b" : ""}`}
        initial={reduce ? false : { y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
      >
        <div
          className="u-container flex items-center justify-between transition-[height] duration-500 ease-[var(--ease-out-expo)]"
          style={{ height: scrolled ? 60 : 72 }}
        >
          <a href="#top" className="u-wordmark text-[0.95rem] leading-none text-chalk" aria-label={`${SITE.name}, back to top`}>
            Kit Ryder
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
            {NAV.map((item) => {
              const id = item.href.slice(1);
              const on = active === id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "true" : undefined}
                  className={`relative text-[0.92rem] transition-colors duration-300 ${on ? "text-chalk" : "text-mist hover:text-chalk"}`}
                >
                  {item.label}
                  {on && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-1.5 left-0 h-px w-full bg-rust"
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="hidden md:block">
            <Cta href="#contact" variant="ghost" icon={false} className="px-5 py-2.5 text-[0.88rem]">
              Start a project
            </Cta>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="-mr-2 p-2 text-chalk md:hidden"
          >
            <List size={22} weight="regular" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] bg-ink md:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="u-container flex h-[72px] items-center justify-between">
              <span className="u-wordmark text-[0.95rem] leading-none">Kit Ryder</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="-mr-2 p-2">
                <X size={22} weight="regular" />
              </button>
            </div>
            <nav aria-label="Primary" className="u-container mt-10 flex flex-col">
              {NAV.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="u-display u-hairline-b py-5 text-[2.6rem] text-chalk"
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.06 * i, ease: EASE }}
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.div
                className="mt-10"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Cta href="#contact" onClick={() => setOpen(false)} magnetic={false} icon={false}>
                  Start a project
                </Cta>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
