import { approach, chapters, clients } from "@/content/site";
import { Chapter } from "./chapter";
import { Leaf } from "./leaf";

/**
 * Adlerian therapy is her real differentiator, so the chapter leads on the name
 * of the thing and then explains it plainly — no manufactured aphorism. A
 * single large olive leaf watermarks the spread.
 */
export function Approach() {
  return (
    <section id="approach" className="room approach" aria-labelledby="approach-heading">
      <div className="shell-editorial">
        <Chapter {...chapters.approach} />

        <div className="approach-lead">
          <Leaf size="large" className="approach-watermark" />
          <h2 id="approach-heading" className="approach-display">
            {approach.heading}
          </h2>
        </div>

        <div className="approach-prose">
          {approach.body.map((paragraph) => (
            <p key={paragraph} className="approach-paragraph">
              {paragraph}
            </p>
          ))}
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
