import { STATEMENT } from "../content";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";

/* The credibility beat between the hero and the work. No logo wall, because
   borrowed logos are the first thing a local business owner checks. */
export function Statement() {
  return (
    <section className="u-container py-[clamp(3.5rem,9vh,6rem)]">
      <div className="grid gap-10 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6">
          <WordReveal
            text={STATEMENT.line}
            stagger={0.022}
            className="u-h2 text-[clamp(1.4rem,2.5vw,2.1rem)] leading-[1.2] text-mist"
          />
          <Reveal delay={0.15}>
            <p className="u-h2 mt-2 text-[clamp(1.4rem,2.5vw,2.1rem)] leading-[1.2] text-chalk">
              {STATEMENT.emphasis}
            </p>
          </Reveal>
        </div>

        <ul className="md:col-span-5 md:col-start-8">
          {STATEMENT.facts.map((f, i) => (
            <li key={f.k} className="u-hairline-t py-4 last:pb-0">
              <Reveal delay={0.08 * i}>
                <h3 className="text-[0.92rem] font-medium text-chalk">{f.k}</h3>
                <p className="mt-1 text-[0.88rem] leading-[1.55] text-mist">{f.v}</p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
