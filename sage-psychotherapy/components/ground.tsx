/**
 * The green ground behind the page.
 *
 * Two shapes, both drawn from the same sage the leaves are drawn in, mixed
 * into whichever field they sit on so they stay a tint of the room rather
 * than a colour of their own — which means they follow the evening palette
 * without a second set of values.
 *
 * `Hills` is a horizon: four layers of mounds, palest and highest at the back,
 * deepest and lowest at the front, each drifting a different amount as the
 * section passes. That difference is the depth; a single layer would just be
 * a shape.
 *
 * `Field` is the quiet one — an arch, a band or an orb set behind a block of
 * text so the words have something to sit on. Kept pale enough that the
 * reading is never on it, only over it.
 */

type Bump = [cx: number, rx: number, ry: number];
type Layer = { base: number; bumps: Bump[] };

/** Three horizons, so no two rooms end on the same skyline. */
const HORIZONS: Record<string, Layer[]> = {
  far: [
    { base: 150, bumps: [[140, 190, 95], [420, 160, 78], [720, 220, 108], [1050, 175, 88]] },
    { base: 176, bumps: [[60, 150, 74], [340, 200, 92], [640, 150, 68], [900, 210, 100], [1160, 140, 66]] },
    { base: 200, bumps: [[220, 175, 66], [520, 230, 84], [820, 160, 60], [1090, 200, 76]] },
    { base: 222, bumps: [[110, 210, 54], [480, 180, 46], [760, 240, 62], [1080, 170, 44]] },
  ],
  low: [
    { base: 168, bumps: [[80, 210, 82], [430, 185, 66], [790, 165, 90], [1120, 205, 70]] },
    { base: 190, bumps: [[250, 170, 72], [600, 225, 60], [960, 180, 82]] },
    { base: 208, bumps: [[40, 160, 56], [390, 195, 70], [700, 150, 48], [1010, 215, 64]] },
    { base: 226, bumps: [[180, 230, 44], [560, 165, 52], [880, 200, 40], [1170, 150, 50]] },
  ],
  wide: [
    { base: 158, bumps: [[200, 250, 100], [620, 190, 72], [980, 230, 92]] },
    { base: 182, bumps: [[20, 180, 64], [400, 215, 86], [760, 175, 62], [1130, 195, 78]] },
    { base: 204, bumps: [[300, 205, 58], [660, 240, 74], [1000, 165, 52]] },
    { base: 224, bumps: [[90, 190, 46], [520, 220, 56], [900, 180, 42], [1180, 160, 48]] },
  ],
};

const DRIFT = [11, 7, 4, 2];

export function Hills({
  horizon = "far",
  className = "",
}: {
  horizon?: keyof typeof HORIZONS;
  className?: string;
}) {
  const layers = HORIZONS[horizon];
  return (
    <svg
      className={`hills ${className}`}
      viewBox="0 0 1200 240"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      {layers.map((layer, i) => (
        <g
          key={i}
          fill={`var(--green-${i + 1})`}
          style={{ "--drift": DRIFT[i] } as React.CSSProperties}
        >
          <rect x="-40" y={layer.base} width="1280" height={240 - layer.base + 60} />
          {layer.bumps.map(([cx, rx, ry], b) => (
            <ellipse key={b} cx={cx} cy={layer.base} rx={rx} ry={ry} />
          ))}
        </g>
      ))}
    </svg>
  );
}

export function Field({
  shape,
  className = "",
}: {
  shape: "arch" | "band" | "orb";
  className?: string;
}) {
  return <div className={`field-shape field-${shape} ${className}`} aria-hidden="true" />;
}
