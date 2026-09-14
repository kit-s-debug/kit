import { crisis } from "@/content/site";

/**
 * Not decorated, not softened, not hidden behind a disclosure. It appears in
 * the footer and again on the booking confirmation.
 */
export function Crisis({ className = "" }: { className?: string }) {
  return (
    /* Named with aria-label rather than aria-labelledby: this renders twice on
       /thanks (here and in the footer), and a repeated id is invalid HTML that
       points both landmarks at the same heading. */
    <section className={`crisis ${className}`} aria-label={crisis.heading}>
      <h2 className="crisis-heading">{crisis.heading}</h2>
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
