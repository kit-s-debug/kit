import { crisis } from "@/content/site";

/**
 * Not decorated, not softened, not hidden behind a disclosure. It appears in
 * the footer and again on the booking confirmation.
 */
export function Crisis({ className = "" }: { className?: string }) {
  return (
    <section className={`crisis ${className}`} aria-labelledby="crisis-heading">
      <h2 id="crisis-heading" className="crisis-heading">
        {crisis.heading}
      </h2>
      <p className="crisis-body">{crisis.body}</p>
      <ul className="crisis-list">
        {crisis.lines.map((line) => (
          <li key={line.name}>
            <a href={line.href} className="crisis-name link-plain">
              {line.name}
            </a>
            <span className="crisis-detail">{line.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
