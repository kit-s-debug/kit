import { approach, clients } from "@/content/site";
import { Leaf } from "./leaf";

/**
 * Adlerian therapy in plain words, because it is her genuine differentiator and
 * almost nobody arriving here will have heard of it. Two short paragraphs, then
 * the other seven modalities behind a disclosure so they stay supporting detail.
 */
export function Approach() {
  return (
    <section id="approach" className="room approach" aria-labelledby="approach-heading">
      <div className="shell approach-grid">
        <div className="approach-mark" aria-hidden="true">
          <Leaf size="large" />
        </div>

        <div className="approach-body">
          <h2 id="approach-heading" className="approach-heading">
            {approach.heading}
          </h2>
          {approach.body.map((paragraph) => (
            <p key={paragraph} className="approach-paragraph">
              {paragraph}
            </p>
          ))}

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

          <hr className="sill approach-sill" />
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
