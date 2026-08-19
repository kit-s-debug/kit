"use client";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { PROJECTS, type Project } from "../content";
import { EASE } from "../lib/motion";
import { ProjectOverlay } from "./ProjectOverlay";
import { Reveal } from "./primitives/Reveal";
import { Tilt } from "./primitives/Tilt";
import { WordReveal } from "./primitives/WordReveal";

function TechList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li key={t} className="border border-[var(--color-slate-line)] px-2.5 py-1 text-[0.72rem] text-mist">
          {t}
        </li>
      ))}
    </ul>
  );
}

function Featured({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  /* The frame drifts, the image does not. Panning inside the frame would crop
     the sides off a screenshot, which is the one thing a work preview cannot
     afford. */
  const frameY = useTransform(scrollYProgress, [0, 1], [26, -26]);

  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const spotlight = useMotionTemplate`radial-gradient(460px circle at ${mx}px ${my}px, rgba(210,85,43,0.18), transparent 72%)`;

  return (
    <div ref={ref} className="mt-16">
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label={`Open the ${project.name} case study`}
        style={reduce ? undefined : { y: frameY }}
        className="group relative block w-full cursor-pointer overflow-hidden text-left"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set(e.clientX - r.left);
          my.set(e.clientY - r.top);
        }}
      >
        <div className="relative w-full overflow-hidden bg-ink-2" style={{ aspectRatio: project.aspect ?? "3 / 2" }}>
          <img
            src={project.image}
            alt={`The ${project.name} website`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.025]"
          />
          <motion.span
            aria-hidden
            style={{ background: spotlight }}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </div>
      </motion.button>

      <div className="grid gap-8 pt-10 md:grid-cols-12">
        <div className="md:col-span-5">
          <h3 className="u-display text-[clamp(1.9rem,3.4vw,3rem)] text-chalk">{project.name}</h3>
          <p className="mt-2 text-[0.92rem] text-mist">
            {project.sector}, {project.town}
          </p>
        </div>
        <div className="md:col-span-4">
          <p className="text-[1rem] leading-[1.68] text-chalk/85">{project.summary}</p>
          <div className="mt-6">
            <TechList items={project.tech} />
          </div>
        </div>
        <div className="md:col-span-3">
          <p className="text-[0.92rem] leading-[1.6] text-mist">{project.outcome}</p>
          <button
            type="button"
            onClick={onOpen}
            className="group mt-6 inline-flex items-center gap-2 text-[0.95rem] text-chalk"
          >
            <span className="relative">
              View project
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-rust transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
            </span>
            <ArrowRight size={15} weight="regular" aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Card({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  return (
    <Reveal delay={(index % 2) * 0.08} className={index % 2 === 1 ? "md:mt-24" : ""}>
      <Tilt className="w-full">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open the ${project.name} case study`}
          className="group block w-full cursor-pointer text-left"
        >
          <div className="relative w-full overflow-hidden bg-ink-2" style={{ aspectRatio: project.aspect ?? "3 / 2" }}>
            <img
              src={project.image}
              alt={`The ${project.name} website`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-ink/12 transition-opacity duration-500 group-hover:opacity-0"
            />
          </div>

          <div className="flex items-baseline justify-between gap-4 pt-6">
            <h3 className="u-display text-[clamp(1.4rem,2.1vw,1.9rem)] text-chalk">{project.name}</h3>
            <ArrowRight
              size={17}
              weight="regular"
              aria-hidden
              className="shrink-0 translate-y-[-2px] text-mist transition-all duration-400 group-hover:translate-x-1 group-hover:text-ember"
            />
          </div>
          <p className="mt-1.5 text-[0.88rem] text-mist">
            {project.sector}, {project.town}
          </p>
          <p className="mt-4 max-w-[42ch] text-[0.95rem] leading-[1.65] text-chalk/80">{project.summary}</p>
          <div className="mt-5">
            <TechList items={project.tech} />
          </div>
          <p className="mt-5 border-t border-[var(--color-slate-line)] pt-4 text-[0.88rem] leading-[1.55] text-mist">
            {project.outcome}
          </p>
        </button>
      </Tilt>
    </Reveal>
  );
}

export function Work() {
  const [open, setOpen] = useState<Project | null>(null);
  const [featured, ...rest] = PROJECTS;
  const reduce = useReducedMotion();

  return (
    <section id="work" className="u-container py-[clamp(4rem,9vh,7rem)]">
      <div>
        <WordReveal text="Selected work" className="u-h2 text-chalk" />
        <motion.p
          className="mt-5 max-w-[44ch] text-[1rem] leading-[1.65] text-mist"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
        >
          Every one designed from a blank page, and handed over so the owner can run it themselves.
        </motion.p>
      </div>

      <Featured project={featured} onOpen={() => setOpen(featured)} />

      <div className="mt-24 grid gap-x-10 gap-y-20 md:mt-32 md:grid-cols-2 md:gap-x-14">
        {rest.map((p, i) => (
          <Card key={p.slug} project={p} index={i} onOpen={() => setOpen(p)} />
        ))}
      </div>

      <ProjectOverlay project={open} onClose={() => setOpen(null)} />
    </section>
  );
}
