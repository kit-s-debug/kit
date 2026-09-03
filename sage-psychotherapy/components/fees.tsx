import { cta, fees } from "@/content/site";

/**
 * One wide flat field, the number set at display size, and concessions given
 * equal weight inside the same panel rather than as an apologetic footnote.
 * No card, no border, no "most popular".
 */
export function Fees() {
  return (
    <section id="fees" className="fees on-dark" aria-labelledby="fees-heading">
      <div className="shell fees-shell">
        <h2 id="fees-heading" className="label fees-label">
          {fees.heading}
        </h2>

        <div className="fees-grid">
          <p className="fees-amount">
            <span className="fees-number">{fees.amount}</span>
            <span className="fees-unit">{fees.unit}</span>
            <span className="fees-duration">{fees.duration}</span>
          </p>

          <div className="fees-free">
            <h3 className="fees-free-heading">{fees.freeHeading}</h3>
            <p className="fees-free-body">{fees.freeBody}</p>
            <a href="#book" className="action fees-action">
              {cta.primary}
            </a>
          </div>
        </div>

        <hr className="sill fees-sill" />

        <div className="fees-concession">
          <h3 className="fees-concession-heading">{fees.concessionHeading}</h3>
          <p className="fees-concession-body">{fees.concessionBody}</p>
        </div>

        <ul className="fees-small">
          <li>{fees.payment}</li>
          <li>{fees.cancellation}</li>
        </ul>
      </div>
    </section>
  );
}
