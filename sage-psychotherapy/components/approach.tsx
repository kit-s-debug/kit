import { approach, chapters, clients } from "@/content/site";
import { Chapter } from "./chapter";
import { Leaf } from "./leaf";

/**
 * Adlerian therapy is her real differentiator, so this chapter leads with the
 * idea as a large statement, not a heading over paragraphs. The explanation
 * sits beneath in a narrow editorial column; the other modalities stay quiet,
 * behind disclosure. A single large olive leaf watermarks the spread.
 */
export function Approach() {
  return (
    <section id="approach" className="room approach" aria-labelledby="approach-heading">
      <div className="shell-editorial">
        <Chapter {...chapters.approach} />

        <div className="approach-lead">
          <Leaf size="large" className="approach-watermark" />
          <p className="pull approach-pull">
            {approach.pull.before}
            <em>{approach.pull.em}</em>
            {approach.pull.after}
          </p>
        </div>

        <div className="approach-columns">
          <h2 id="approach-heading" className="approach-heading">
            {approach.heading}
          </h2>
          <div className="approach-prose">
            {approach.body.map((paragraph) => (
              <p key={paragraph} className="approach-paragraph">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <details className="disclosure approach-more">
          <summary>
            <span>{approach.moreLabel}</span>
          </summary>
          <div className="disclosure-body">
            <p className="approach-more-help">{approach.moreHelp}</p>
            <ul className="modalities">
              {approach.modalities.map((modality) => (
                <li key={modality.name}>
                  <h3 className="modality-name">{modality.name}</h3>
                  <p className="modality-line">{modality.line}</p>
                </li>
              ))}
            </ul>
            <p className="approach-cpd">{approach.cpdNote}</p>
          </div>
        </details>

        <div className="approach-clients">
          <span className="kicker">Who she works with</span>
          <ul className="clients">
            {clients.map((group) => (
              <li key={group}>{group}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
