"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const stops = [
  { id: "services", label: "Services" },
  { id: "journeys", label: "Journeys" },
  { id: "book", label: "Book" },
  { id: "local", label: "Local" },
];

/**
 * A thin route line on the left edge of large screens. It fills as you travel
 * down the page and marks each section as a stop on the journey.
 */
export function RouteSpine() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const height = useTransform(reduce ? scrollYProgress : fill, [0, 1], ["0%", "100%"]);
  const [current, setCurrent] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    stops.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <nav
      aria-label="Page sections"
      className={`fixed top-1/2 left-5 z-30 hidden -translate-y-1/2 transition-opacity duration-500 2xl:block ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <div className="relative flex h-[46vh] flex-col justify-between py-1">
        <span className="absolute top-0 bottom-0 left-[5px] w-px bg-white/10" aria-hidden />
        <motion.span className="absolute top-0 left-[5px] w-px bg-gold" style={{ height }} aria-hidden />
        {stops.map((s, i) => {
          const on = current === s.id;
          return (
            <a key={s.id} href={`#${s.id}`} className="group relative flex items-center gap-3" aria-current={on ? "true" : undefined}>
              <span
                className={`relative z-10 h-[11px] w-[11px] rounded-full border transition-all duration-300 ${
                  on ? "scale-110 border-gold bg-gold" : "border-white/30 bg-midnight group-hover:border-gold"
                }`}
              />
              <span
                className={`text-[0.65rem] font-semibold uppercase tracking-[0.22em] transition-all duration-300 ${
                  on ? "text-ivory opacity-100" : "text-fog opacity-0 group-hover:opacity-100"
                }`}
              >
                0{i + 1} {s.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
