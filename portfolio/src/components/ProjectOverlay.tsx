"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, X } from "@phosphor-icons/react";
import { useEffect, useRef } from "react";
import type { Project } from "../content";
import { EASE } from "../lib/motion";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* The case study, opened in place. Keeps the work section on one page and gives
   the "View project" button something real to do before there are live links. */
export function ProjectOverlay({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!project) return;
    restoreTo.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus(), 60);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      document.body.style.overflow = "";
      restoreTo.current?.focus?.();
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="s-dark fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-[rgb(12_13_16/0.93)] backdrop-blur-md"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} case study`}
            className="s-dark mx-auto min-h-full w-full max-w-[1120px] bg-[var(--color-ink-2)] px-[clamp(1.25rem,4vw,3.5rem)] pt-6 pb-24"
            initial={reduce ? false : { y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 py-2 text-[0.85rem] text-[var(--fg-2)] transition-colors hover:text-[var(--fg)]"
              >
                Close <X size={16} weight="regular" aria-hidden />
              </button>
            </div>

            <h2 className="u-h2 mt-6">{project.name}</h2>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.95rem] text-[var(--fg-2)]">
              <span>
                {project.sector}, {project.town}
              </span>
              {project.status && (
                <span className="border border-[var(--line)] px-2 py-0.5 text-[0.68rem] tracking-[0.14em] uppercase">
                  {project.status}
                </span>
              )}
            </p>
            {project.status && (
              <p className="mt-4 max-w-[54ch] text-[0.9rem] leading-[1.6] text-[var(--fg-2)]">
                A build I designed to a brief of my own, not a client engagement. The thinking below is
                how I would approach the real one.
              </p>
            )}

            <img
              src={project.image}
              alt={`The ${project.name} website`}
              style={{ aspectRatio: project.aspect ?? "16 / 9" }}
              className="mt-9 w-full object-cover"
            />

            <div className="mt-14 grid gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                {[
                  ["The problem", project.challenge],
                  ["What I built", project.approach],
                ].map(([k, v]) => (
                  <div key={k} className="mb-9">
                    <h3 className="text-[0.8rem] font-medium tracking-[0.14em] text-[var(--fg-2)] uppercase">{k}</h3>
                    <p className="mt-3 text-[1rem] leading-[1.72] text-[var(--fg)]/90">{v}</p>
                  </div>
                ))}
              </div>

              <div className="md:col-span-4 md:col-start-9">
                <div className="u-line-t py-6">
                  <h3 className="text-[0.8rem] font-medium tracking-[0.14em] text-[var(--fg-2)] uppercase">Outcome</h3>
                  <p className="mt-3 text-[1rem] leading-[1.6]">{project.outcome}</p>
                </div>
                <div className="u-line-t py-6">
                  <h3 className="text-[0.8rem] font-medium tracking-[0.14em] text-[var(--fg-2)] uppercase">Built with</h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.tech.map((t) => (
                      <li
                        key={t}
                        className="border border-[var(--line)] px-2.5 py-1 text-[0.75rem] text-[var(--fg-2)]"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group u-line-t flex items-center gap-2 py-6 text-[0.95rem]"
                  >
                    Visit live site
                    <ArrowUpRight
                      size={16}
                      weight="regular"
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
