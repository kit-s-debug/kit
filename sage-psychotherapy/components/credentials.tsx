import { chapters, credentials } from "@/content/site";
import { Chapter } from "./chapter";

/**
 * A register, not a badge row — stated plainly. The no-testimonials position is
 * a fact about how she practises, so it reads as a fact rather than a slogan.
 */
export function Credentials() {
  return (
    <section id="credentials" className="room credentials" aria-labelledby="credentials-heading">
      <div className="shell-editorial">
        <Chapter {...chapters.credentials} />

        <div className="credentials-spread">
          <div className="credentials-statement">
            <h3 className="credentials-display">{credentials.noTestimonialsHeading}</h3>
            <p className="credentials-aside-body">{credentials.noTestimonialsBody}</p>
          </div>

          <div className="credentials-register">
            <h2 id="credentials-heading" className="kicker credentials-label">
              {credentials.heading}
            </h2>
            <ul className="credentials-list">
              {credentials.rows.map((row) => (
                <li key={row.fact}>
                  <span className="credentials-fact">{row.fact}</span>
                  {row.note && <span className="credentials-note">{row.note}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
