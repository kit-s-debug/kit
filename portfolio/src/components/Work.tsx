"use client";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { useRef, useState, type ReactNode } from "react";
import { FEATURED, PROJECTS, type Project } from "../content";
import { EASE, viewportOnce } from "../lib/motion";
import { ProjectOverlay } from "./ProjectOverlay";
import { Cta } from "./primitives/Cta";
import { Reveal } from "./primitives/Reveal";
import { SitePreview } from "./primitives/SitePreview";
import { WordReveal } from "./primitives/WordReveal";

function Block({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportOnce}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Preview({ project, onOpen, className = "" }: { project: Project; onOpen: () => void; className?: string }) {
  const mx = useMotionValue(-500);
  const my = useMotionValue(-500);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${mx}px ${my}px, rgba(255,255,255,0.28), transparent 65%)`;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open the ${project.name} case study`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      className={`group relative block w-full cursor-pointer overflow-hidden border border-[var(--line)] text-left ${className}`}
    >
      <img
        src={project.image}
        alt={`The ${project.name} website`}
        loading="lazy"
        decoding="async"
        className="block aspect-[16/9] w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.025]"
      />
      <motion.span
        aria-hidden
        style={{ background: glare }}
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100"
      />
      <span className="pointer-events-none absolute right-4 bottom-4 flex items-center gap-2 rounded-pill bg-[var(--btn-bg)] px-4 py-2 text-[0.8rem] text-[var(--btn-fg)] opacity-0 transition-all duration-400 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100 md:translate-y-2">
        Case study
        <ArrowUpRight size={14} weight="regular" aria-hidden />
      </span>
    </button>
  );
}

function Meta({ project, size = "lg" }: { project: Project; size?: "lg" | "sm" }) {
  return (
    <div>
      <h3 className={`u-display ${size === "lg" ? "text-[clamp(1.6rem,2.4vw,2.1rem)]" : "text-[clamp(1.35rem,1.8vw,1.6rem)]"}`}>
        {project.name}
      </h3>
      <p className="u-fg2 mt-1.5 text-[0.86rem]">
        {project.sector}, {project.town}
      </p>
      <p className="mt-3.5 max-w-[38ch] text-[0.95rem] leading-[1.6]">{project.outcome}</p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.map((t) => (
          <li key={t} className="border border-[var(--line)] px-2.5 py-1 text-[0.72rem] text-[var(--fg-2)]">
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* One work section. Eddie Rocks leads it at full width because it is the real
   build and the strongest thing here; the rest follow in three different
   shapes so the composition keeps changing as you read down. */
function Lead() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <div ref={ref}>
      <div className="grid items-end gap-6 md:grid-cols-12">
        <div className="md:col-span-7">
          <h3 className="u-display text-[clamp(1.9rem,3.4vw,2.9rem)]">{FEATURED.headline}</h3>
          <p className="u-fg2 mt-3 text-[0.92rem]">
            <span className="text-[var(--fg)]">{FEATURED.name}</span>, {FEATURED.sector.toLowerCase()} in{" "}
            {FEATURED.town}
          </p>
        </div>
        <div className="md:col-span-4 md:col-start-9">
          <p className="u-body text-[0.96rem]">{FEATURED.summary}</p>
        </div>
      </div>

      <motion.div style={reduce ? undefined : { y }} className="mt-[clamp(1.75rem,4vh,2.75rem)]">
        <SitePreview
          url="eddierocks.co.uk"
          src={FEATURED.video}
          poster={FEATURED.poster}
          alt={`A scroll through the ${FEATURED.name} website`}
          frameClassName="shadow-[0_50px_120px_-45px_rgba(12,13,16,0.45)]"
        />
      </motion.div>

      <div className="mt-[clamp(1.75rem,4vh,2.75rem)] grid gap-9 md:grid-cols-12">
        <dl className="md:col-span-4">
          {FEATURED.facts.map((f) => (
            <div key={f.k} className="u-line-t flex items-baseline justify-between gap-6 py-3">
              <dt className="text-[0.76rem] tracking-[0.14em] text-[var(--fg-2)] uppercase">{f.k}</dt>
              <dd className="text-right text-[0.9rem]">{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className="md:col-span-6 md:col-start-7">
          {FEATURED.body.map((p, i) => (
            <Reveal key={p.slice(0, 20)} delay={0.06 * i} className="mb-4 last:mb-0">
              <p className="u-body max-w-[58ch] text-[0.98rem]">{p}</p>
            </Reveal>
          ))}
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-[46ch] text-[1.05rem] leading-[1.5]">{FEATURED.outcome}</p>
          </Reveal>
          <Reveal delay={0.22}>
            <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-4">
              <Cta href={FEATURED.cta.href}>{FEATURED.cta.label}</Cta>
              <a
                href={FEATURED.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 text-[0.95rem]"
              >
                <span className="relative">
                  View the live site
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent-graphic)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </span>
                <ArrowUpRight
                  size={16}
                  weight="regular"
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

export function Work() {
  const [open, setOpen] = useState<Project | null>(null);

  return (
    <section id="work" data-surface="light" className="s-tint py-[clamp(3.25rem,8vh,5.5rem)]">
      <div className="u-wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="u-label">The work</p>
            <WordReveal text="Selected work" className="u-h2 mt-4" />
          </div>
          <p className="u-fg2 max-w-[34ch] text-[0.95rem] leading-[1.6]">
Real businesses, real problems. What each site had to fix is in its case study.
          </p>
        </div>

        <div className="mt-[clamp(2.25rem,5vh,3.5rem)]">
          <Lead />
        </div>

        <div className="u-line-t mt-[clamp(3rem,7vh,4.5rem)] pt-[clamp(2.25rem,5vh,3.5rem)]">
          <div className="flex flex-col gap-[clamp(2.25rem,5vh,3.5rem)]">
            <div className="grid gap-x-10 gap-y-[clamp(2.25rem,5vh,3.5rem)] md:grid-cols-2">
              {[PROJECTS[0], PROJECTS[1]].map((p, i) => (
                <Block key={p.slug} delay={i * 0.08}>
                  <article className={i === 1 ? "md:mt-14" : ""}>
                    <Preview project={p} onOpen={() => setOpen(p)} />
                    <div className="mt-6">
                      <Meta project={p} size="sm" />
                    </div>
                  </article>
                </Block>
              ))}
            </div>

            <Block>
              <article className="grid items-center gap-7 md:grid-cols-12 md:gap-10">
                <div className="md:col-span-4 md:row-start-1">
                  <Meta project={PROJECTS[2]} />
                </div>
                <Preview
                  project={PROJECTS[2]}
                  onOpen={() => setOpen(PROJECTS[2])}
                  className="md:col-span-7 md:col-start-6 md:row-start-1"
                />
              </article>
            </Block>

            <Block>
              <article className="grid items-center gap-7 md:grid-cols-12 md:gap-10">
                <Preview project={PROJECTS[3]} onOpen={() => setOpen(PROJECTS[3])} className="md:col-span-7" />
                <div className="md:col-span-4 md:col-start-9">
                  <Meta project={PROJECTS[3]} />
                </div>
              </article>
            </Block>
          </div>

          <Reveal>
            <div className="u-line-t mt-[clamp(2.5rem,5vh,3.5rem)] flex flex-wrap items-center justify-between gap-4 pt-6">
              <p className="u-fg2 text-[0.95rem]">
                {PROJECTS[4].name}, {PROJECTS[4].sector.toLowerCase()} in {PROJECTS[4].town}.
              </p>
              <button
                type="button"
                onClick={() => setOpen(PROJECTS[4])}
                className="group inline-flex items-center gap-2 text-[0.95rem]"
              >
                <span className="relative">
                  Read that case study
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent-graphic)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100" />
                </span>
                <ArrowUpRight
                  size={15}
                  weight="regular"
                  aria-hidden
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <ProjectOverlay project={open} onClose={() => setOpen(null)} />
    </section>
  );
}
