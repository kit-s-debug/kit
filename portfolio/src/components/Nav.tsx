"use client";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { CTA, NAV, SITE } from "../content";
import { EASE } from "../lib/motion";
import { Cta } from "./primitives/Cta";
import { Logo } from "./primitives/Logo";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [surface, setSurface] = useState<"s-dark" | "s-light">("s-dark");
  const [active, setActive] = useState("");
  const [atEnd, setAtEnd] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 24;
    setScrolled((prev) => (prev === next ? prev : next));

    /* The last section is shorter than the viewport, so its top never reaches
       the nav line and the observer below can never see it. At the foot of the
       page, mark the last item regardless of what is passing the bar. */
    const end = y + window.innerHeight >= document.documentElement.scrollHeight - 2;
    setAtEnd((prev) => (prev === end ? prev : end));
  });

  const current = atEnd ? NAV[NAV.length - 1].href.slice(1) : active;

  /* The bar takes the colour of whatever is passing under it. The zero height
     band at the nav line means exactly one section can intersect at a time. */
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-surface]")];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          setSurface(el.dataset.surface === "light" ? "s-light" : "s-dark");
          if (el.id) setActive(el.id);
        }
      },
      { rootMargin: "-76px 0px -100% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
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
        className={`${surface} fixed inset-x-0 top-0 z-50 !bg-transparent transition-colors duration-500`}
        initial={reduce ? false : { y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
      >
        <div
          className={`absolute inset-0 -z-10 transition-opacity duration-500 ${scrolled ? "opacity-100" : "opacity-0"}`}
          style={{ background: "color-mix(in srgb, var(--btn-fg) 86%, transparent)", backdropFilter: "blur(14px)" }}
        />
        <div
          className={`u-wide flex items-center justify-between transition-[height] duration-500 ease-[var(--ease-out-expo)] ${
            scrolled ? "u-line-b" : ""
          }`}
          style={{ height: scrolled ? 62 : 74 }}
        >
          <a href="#top" aria-label={`${SITE.name}, back to top`} className="leading-none">
            <Logo />
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => {
              const on = current === item.href.slice(1);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={on ? "true" : undefined}
                  className="relative py-1 text-[0.9rem] transition-opacity duration-300 hover:opacity-100"
                  style={{ opacity: on ? 1 : 0.62 }}
                >
                  {item.label}
                  {on && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute -bottom-0.5 left-0 h-px w-full bg-[var(--accent-graphic)]"
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="hidden md:block">
            <Cta href={CTA.href} variant="solid" icon={false} className="px-5 py-2.5 text-[0.88rem]">
              {CTA.label}
            </Cta>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="-mr-2 p-2 md:hidden"
          >
            <List size={22} weight="regular" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="s-dark fixed inset-0 z-[70] md:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="u-wide flex h-[74px] items-center justify-between">
              <Logo />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="-mr-2 p-2">
                <X size={22} weight="regular" />
              </button>
            </div>
            <nav aria-label="Primary" data-menu="mobile" className="u-wide mt-8 flex flex-col">
              {NAV.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="u-display u-line-b py-5 text-[2.4rem]"
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.06 * i, ease: EASE }}
                >
                  {item.label}
                </motion.a>
              ))}
              <motion.div
                className="mt-9 flex flex-col items-start gap-5"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Cta href={CTA.href} onClick={() => setOpen(false)} magnetic={false} icon={false}>
                  {CTA.label}
                </Cta>
                <a href={`mailto:${SITE.email}`} className="u-fg2 text-[0.92rem]">
                  {SITE.email}
                </a>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
