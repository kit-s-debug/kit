import { arriving, practice } from "@/content/site";
import { Placeholder } from "./placeholder";

/**
 * The walk from the car to the chair, in six beats, threaded on a hairline that
 * draws itself as you come down the page. No third-party map embed: it would be
 * the only thing on the site loading someone else's script, and it would put a
 * cookie banner back on a site that does not need one.
 */
export function Arriving() {
  const query = encodeURIComponent(
    `${practice.name}, ${practice.town}, ${practice.county} ${practice.postcode}`,
  );

  return (
    <section id="arriving" className="room arriving" aria-labelledby="arriving-heading">
      <div className="shell arriving-grid">
        <div className="arriving-intro">
          <h2 id="arriving-heading" className="arriving-heading">
            {arriving.heading}
          </h2>
          <p className="arriving-lede">{arriving.intro}</p>
        </div>

        <ol className="thread">
          {arriving.steps.map((step) => (
            <li key={step.at} className="thread-step">
              <span className="thread-dot" aria-hidden="true" />
              <span className="thread-at">{step.at}</span>
              <span className="thread-text">
                <Placeholder {...step.text} />
              </span>
            </li>
          ))}
        </ol>

        <aside className="arriving-where">
          <h3 className="label">{arriving.addressHeading}</h3>
          <address className="arriving-address">
            <Placeholder {...practice.street} />
            <span>{practice.town}</span>
            <span>
              {practice.county}{" "}
              <span lang="cy" className="welsh">
                Sir Benfro
              </span>
            </span>
            <span>
              <Placeholder {...practice.fullPostcode} />
            </span>
          </address>
          <a
            className="action-quiet"
            href={`https://www.openstreetmap.org/search?query=${query}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {arriving.directionsLabel}
          </a>

          <h3 className="label arriving-coverage-label">{arriving.coverageHeading}</h3>
          <p className="arriving-coverage-body">{arriving.coverageBody}</p>
          <ul className="coverage">
            {practice.coverage.map((place) => (
              <li key={place}>{place}</li>
            ))}
          </ul>

          <ul className="hours">
            {practice.hours.map((slot) => (
              <li key={slot.days}>
                <span>{slot.days}</span>
                <span>{slot.time}</span>
              </li>
            ))}
          </ul>
          <p className="hours-note">
            <Placeholder {...practice.hoursNote} />
          </p>
        </aside>
      </div>
    </section>
  );
}
