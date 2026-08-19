import { STATEMENT } from "../content";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";

/* The credibility beat between the hero and the work. No logo wall, because
   borrowed logos are the first thing a local business owner checks. */
export function Statement() {
  return (
    <section className="u-container py-[clamp(5.5rem,13vh,9rem)]">
      <div className="grid gap-14 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <WordReveal
            text={STATEMENT.line}
            stagger={0.022}
            className="u-h2 text-[clamp(1.55rem,2.9vw,2.5rem)] leading-[1.18] text-mist"
          />
          <Reveal delay={0.15}>
            <p className="u-h2 mt-3 text-[clamp(1.55rem,2.9vw,2.5rem)] leading-[1.18] text-chalk">
              {STATEMENT.emphasis}
            </p>
          </Reveal>
        </div>

        <ul className="md:col-span-4 md:col-start-9">
          {STATEMENT.facts.map((f, i) => (
            <li key={f.k} className="u-hairline-t py-6 last:pb-0">
              <Reveal delay={0.08 * i}>
                <h3 className="text-[0.95rem] font-medium text-chalk">{f.k}</h3>
                <p className="mt-2 text-[0.92rem] leading-[1.6] text-mist">{f.v}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
