import { Reveal } from "./Reveal";

export function SectionHeading({
  index,
  eyebrow,
  title,
  accent,
  intro,
  tone = "dark",
  id,
}: {
  index: string;
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: string;
  tone?: "dark" | "light";
  id?: string;
}) {
  const light = tone === "light";
  return (
    <Reveal className="max-w-3xl">
      <p className={`eyebrow flex items-center gap-3 ${light ? "text-gold-deep" : "text-gold"}`}>
        <span className={`tabular-nums ${light ? "text-ink-soft" : "text-fog"}`}>{index}</span>
        <span className={`h-px w-8 ${light ? "bg-gold-deep/50" : "bg-gold/50"}`} aria-hidden />
        {eyebrow}
      </p>
      <h2 id={id} className={`display mt-5 text-[2.5rem] sm:text-6xl lg:text-[4.25rem] ${light ? "text-ink" : "text-ivory"}`}>
        {title}
        {accent && (
          <>
            {" "}
            <span className={`serif-accent font-normal ${light ? "text-gold-deep" : "text-gold-soft"}`}>{accent}</span>
          </>
        )}
      </h2>
      {intro && <p className={`mt-6 max-w-xl text-lg leading-relaxed ${light ? "text-ink-soft" : "text-mist"}`}>{intro}</p>}
    </Reveal>
  );
}
