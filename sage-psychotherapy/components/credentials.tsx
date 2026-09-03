import { credentials } from "@/content/site";

/**
 * A register, not a badge row. Small grotesque, hairline rules, quiet facts.
 * Trust on a therapy site is carried by tone and by verifiable membership —
 * and deliberately not by testimonials, which is stated rather than implied.
 */
export function Credentials() {
  return (
    <section className="room-tight credentials" aria-labelledby="credentials-heading">
      <div className="shell credentials-grid">
        <h2 id="credentials-heading" className="label credentials-label">
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

        <div className="credentials-aside">
          <h3 className="credentials-aside-heading">{credentials.noTestimonialsHeading}</h3>
          <p className="credentials-aside-body">{credentials.noTestimonialsBody}</p>
        </div>
      </div>
    </section>
  );
}
