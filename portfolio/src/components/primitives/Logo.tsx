import { useId } from "react";
import { MARK, WORD } from "./logoArt";

/* The Ryder Designs logo. The artwork lives in logoArt.ts; this file only
   decides how it is coloured and composed.

   Everything is currentColor, so one artwork is right on the bone sections and
   on the ink ones. The silver falloff of the original is a gradient between
   currentColor at full strength and currentColor at 76%, which reads as
   white-to-silver on ink and ink-to-graphite on bone. */

type Art = { w: number; h: number; paths: { d: string; t: string }[] };

function Art({ art, height, className = "" }: { art: Art; height: number; className?: string }) {
  const id = useId();
  const width = Math.round((art.w / art.h) * height);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${art.w} ${art.h}`}
      aria-hidden
      focusable="false"
      className={className}
      style={{ display: "block" }}
    >
      <linearGradient id={id} x1="0" y1="0" x2="0.65" y2="1">
        <stop offset="0" stopColor="currentColor" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0.76" />
      </linearGradient>
      <g fill={`url(#${id})`}>
        {art.paths.map((p) => (
          <path key={p.t + p.d.length} d={p.d} transform={`translate(${p.t})`} />
        ))}
      </g>
    </svg>
  );
}

export function LogoMark({ height = 30, className = "" }: { height?: number; className?: string }) {
  return <Art art={MARK} height={height} className={className} />;
}

export function LogoWord({ height = 26, className = "" }: { height?: number; className?: string }) {
  return <Art art={WORD} height={height} className={className} />;
}

/* Horizontal lockup for the bar. The supplied logo stacks the mark over the
   name, which is too tall for a 62px bar, so the two sit side by side at the
   proportions the original uses between them. */
export function Logo({ className = "", height = 30 }: { className?: string; height?: number }) {
  return (
    <span className={`inline-flex items-center gap-3.5 ${className}`}>
      <LogoMark height={height} />
      <LogoWord height={Math.round(height * 1.24)} />
    </span>
  );
}

/* The lockup as supplied, mark above the name. Used where there is room. */
export function LogoStack({ className = "", height = 46 }: { className?: string; height?: number }) {
  return (
    <span className={`inline-flex flex-col items-center gap-3 ${className}`}>
      <LogoMark height={height} />
      <LogoWord height={Math.round(height * 0.86)} />
    </span>
  );
}
