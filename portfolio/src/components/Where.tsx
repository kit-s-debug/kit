"use client";
import { MAP_SECTION } from "../content";
import { TOWNS } from "../data/pembrokeshire";
import { Reveal } from "./primitives/Reveal";
import { WordReveal } from "./primitives/WordReveal";

/* The Pembrokeshire beat. There is no illustrated map here on purpose: this is
   the point in the scroll where the landscape behind the page stops being
   abstract and resolves into the real coastline, so the section gets out of
   its way and holds one column of text against the reveal. */
export function Where() {
  return (
    <section id="where" className="u-container py-[clamp(3.5rem,9vh,5.5rem)]">
      <div className="max-w-[34rem] bg-[radial-gradient(120%_140%_at_0%_50%,rgba(8,9,11,0.92),rgba(8,9,11,0.4)_70%,transparent)] py-6">
        <WordReveal text={MAP_SECTION.heading} className="u-h2 max-w-[13ch] text-chalk" />
        <Reveal delay={0.12}>
          <p className="u-lede mt-6 max-w-[42ch]">{MAP_SECTION.body}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <ul className="mt-7 flex max-w-[30rem] flex-wrap gap-x-5 gap-y-1.5 text-[0.9rem] text-mist">
            {TOWNS.map((t) => (
              <li key={t.name}>{t.name}</li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
