import { useId } from "react";

/* The identity. An R knocked out of a solid block, plus the name set as a
   justified two-line type block.

   The mark is a mask rather than two coloured shapes, so the letterform is a
   hole and whatever ground the logo sits on shows through it. That is what
   lets one component work on bone and on ink without a second artwork: the
   block takes currentColor, the R takes the page. */

const R_PATH =
  "M12 6 H58 C76 6 88 18 88 33 C88 45.5 80.5 54.5 69.5 58 L92 94 H62 L44 62 H34 V94 H12 Z " +
  "M34 24 V44 H55 C62.5 44 66.5 39.5 66.5 34 C66.5 28.5 62.5 24 55 24 Z";

export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden
      focusable="false"
      className={className}
      style={{ display: "block" }}
    >
      <mask id={id}>
        {/* white keeps, black cuts, so the R becomes a hole in the block */}
        <rect width="100" height="100" fill="#fff" />
        <path d={R_PATH} fill="#000" fillRule="evenodd" transform="translate(14.5 15.9) scale(0.682)" />
      </mask>
      <rect width="100" height="100" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  );
}

/* The horizontal lockup, for the bar at the top of the page. */
export function Logo({ className = "", markSize = 26 }: { className?: string; markSize?: number }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={markSize} />
      <span className="u-wordmark text-[0.95rem] leading-none">Ryder Design</span>
    </span>
  );
}

/* The stacked wordmark. RYDER and DESIGN are set to the same measured width,
   which is why DESIGN carries a narrower stretch: at these values the two
   lines end on the same vertical, so the pair reads as one block of type. */
export function LogoStack({ className = "", size = "1.6rem" }: { className?: string; size?: string }) {
  return (
    <span className={`inline-block leading-[0.8] ${className}`} style={{ fontSize: size }}>
      <span className="u-wordmark-stack block" style={{ fontStretch: "100%", letterSpacing: "-0.005em" }}>
        Ryder
      </span>
      <span className="u-wordmark-stack block" style={{ fontStretch: "87%", letterSpacing: "0.005em" }}>
        Design
      </span>
    </span>
  );
}
