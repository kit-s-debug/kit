import { STRIP } from "../content";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";

/* The first breath of light on the page, and the argument in two sentences. */
export function Strip() {
  return (
    <section data-surface="light" className="s-light py-[clamp(3.25rem,8vh,5.5rem)]">
      <div className="u-wide grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <WordReveal
            text={STRIP.line}
            stagger={0.02}
            className="u-h2 text-[clamp(1.5rem,2.9vw,2.35rem)] leading-[1.15] text-[var(--fg-2)]"
          />
          <Reveal delay={0.12}>
            <p className="u-h2 mt-2 text-[clamp(1.5rem,2.9vw,2.35rem)] leading-[1.15]">{STRIP.emphasis}</p>
          </Reveal>
        </div>

        <ul className="md:col-span-4 md:col-start-9">
          {STRIP.facts.map((f, i) => (
            <li key={f.k} className="u-line-t py-4 last:pb-0">
              <Reveal delay={0.07 * i}>
                <h3 className="text-[0.92rem] font-medium">{f.k}</h3>
                <p className="u-fg2 mt-1 text-[0.88rem] leading-[1.55]">{f.v}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
