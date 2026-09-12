/**
 * The running chapter index that threads the whole page like a chapbook:
 * a numeral, a short label, and a hairline drawing off to the margin. Because
 * the page really is a sequence of rooms read in order, the numbering carries
 * meaning rather than decoration. Roman numerals, not "01 / 02" — literary, and
 * a deliberate step away from the SaaS feature-card cliché.
 */
export function Chapter({ n, label }: { n: string; label: string }) {
  return (
    <div className="chapter-open">
      <span className="chapter-num" aria-hidden="true">
        {n}
      </span>
      <span className="chapter-label">{label}</span>
      <span className="chapter-rule" aria-hidden="true" />
    </div>
  );
}
