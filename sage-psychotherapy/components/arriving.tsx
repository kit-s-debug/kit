import { arriving, chapters, practice } from "@/content/site";
import { Chapter } from "./chapter";
import { Sprig } from "./sprig";
import { Placeholder } from "./placeholder";

/**
 * Three beats of the walk from the car to the chair, threaded on a hairline —
 * enough to make the first visit predictable without narrating the whole thing.
 * No third-party map embed: it would be the only script the site loads from
 * someone else, and it would put a cookie banner back on a site that needs none.
 */
export function Arriving() {
  const query = encodeURIComponent(
    `${practice.street.value}, ${practice.locality}, ${practice.town}, ${practice.fullPostcode.value}`,
  );

  return (
    <section id="arriving" className="room arriving" aria-labelledby="arriving-heading">
      <div className="shell-editorial arriving-shell">
        <Chapter {...chapters.arriving} />
        <div className="arriving-grid">
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
            <Sprig variant="three" size={40} className="sprig-set arriving-sprig" />
            <h3 className="kicker">{arriving.addressHeading}</h3>
            <address className="arriving-address">
              <Placeholder {...practice.street} />
              <span>{practice.locality}</span>
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

            <p className="arriving-hours">
              <Placeholder {...arriving.hoursLine} />
            </p>
            <p className="arriving-coverage-body">{arriving.coverageLine}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
