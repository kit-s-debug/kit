/**
 * The olive leaves from her logo, redrawn as a reusable mark.
 *
 * Three sizes only: `mark` before a quiet label, `seam` in the lockup and on
 * the sill line between two rooms, and `large` as the single piece of
 * decoration in the approach section. Drawn with the leaves big relative to the
 * stem so it still reads as an olive sprig at 16px rather than as a squiggle.
 */
const LEAVES = [
  { x: 24, y: 12, angle: 34 },
  { x: 24, y: 21, angle: -34 },
  { x: 24, y: 30, angle: 34 },
  { x: 24, y: 39, angle: -34 },
];

export function Leaf({
  size = "mark",
  className = "",
}: {
  size?: "mark" | "seam" | "large";
  className?: string;
}) {
  const px = size === "mark" ? 18 : size === "seam" ? 34 : 168;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        d="M24 46C24 38 22.5 22 24 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {LEAVES.map(({ x, y, angle }) => (
        <ellipse
          key={y}
          cx={x + (angle > 0 ? 7.5 : -7.5)}
          cy={y - 2}
          rx="4.4"
          ry="8.2"
          fill="currentColor"
          opacity="0.92"
          transform={`rotate(${angle} ${x + (angle > 0 ? 7.5 : -7.5)} ${y - 2})`}
        />
      ))}
      <circle cx="17.5" cy="9" r="3.1" fill="currentColor" opacity="0.55" />
      <circle cx="30.5" cy="35" r="2.6" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

/**
 * The wreath-and-wordmark lockup. Drawn here so the site has a usable mark
 * before her watercolour original is supplied — see README for how to swap it.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`}>
      <Leaf size="seam" className="wordmark-leaf" />
      <span className="wordmark-text">
        <span className="wordmark-name">Sage</span>
        <span className="wordmark-sub">Psychotherapy &amp; Counselling</span>
      </span>
    </span>
  );
}
