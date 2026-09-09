import { chapters, formats, sessionsSection } from "@/content/site";
import { Chapter } from "./chapter";
import { Sprig } from "./sprig";

/**
 * Four formats as a selector rather than four paragraphs — and with no
 * JavaScript at all. It is a real radiogroup: arrow keys work, the labels are
 * proper labels, and every panel is in the DOM whether it is showing or not.
 *
 * Home visits and phone sessions are listed as equals, not as a footnote.
 * In a county this rural they are often the only way the work happens.
 */
export function Sessions() {
  return (
    <section id="sessions" className="room sessions" aria-labelledby="sessions-heading">
      <Sprig variant="nine" size={300} className="greenery sessions-greenery" />
      <Sprig variant="five" size={54} className="sprig-set sessions-sprig" />
      <div className="shell-editorial">
        <Chapter {...chapters.sessions} />
        <div className="sessions-head">
          <h2 id="sessions-heading" className="sessions-heading">
            {sessionsSection.heading}
          </h2>
          <p className="sessions-intro">{sessionsSection.intro}</p>
        </div>

        <fieldset className="formats">
          <legend className="visually-hidden">Choose a kind of session to read about</legend>

          {formats.map((format, index) => (
            <input
              key={format.id}
              type="radio"
              name="session-format"
              id={`format-${format.id}`}
              className="format-radio visually-hidden"
              defaultChecked={index === 0}
            />
          ))}

          <div className="format-rail">
            {formats.map((format) => (
              <label key={format.id} htmlFor={`format-${format.id}`} className="format-tab">
                <span className="format-tab-name">{format.name}</span>
                <span className="format-tab-where">{format.where}</span>
              </label>
            ))}
          </div>

          <div className="format-panels">
            {formats.map((format) => (
              <div key={format.id} className="format-panel">
                <h3 className="format-panel-heading">{format.name}</h3>
                <p className="format-panel-where">{format.where}</p>
                <dl className="format-detail">
                  <dt className="label">{sessionsSection.suitsLabel}</dt>
                  <dd>{format.suits}</dd>
                  <dt className="label">{sessionsSection.happensLabel}</dt>
                  <dd>{format.happens}</dd>
                  <dt className="label">{sessionsSection.neededLabel}</dt>
                  <dd>{format.needed}</dd>
                </dl>
              </div>
            ))}
          </div>
        </fieldset>
      </div>
    </section>
  );
}
