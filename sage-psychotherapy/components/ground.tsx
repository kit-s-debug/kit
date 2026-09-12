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
  near: [
    { base: 146, bumps: [[330, 200, 88], [700, 165, 104], [1080, 240, 80]] },
    { base: 174, bumps: [[110, 195, 78], [480, 230, 66], [840, 180, 88], [1170, 165, 60]] },
    { base: 198, bumps: [[10, 170, 62], [360, 210, 78], [720, 190, 56], [1060, 225, 70]] },
    { base: 220, bumps: [[240, 215, 50], [620, 175, 58], [960, 205, 44], [1190, 180, 52]] },
  ],
  long: [
    { base: 154, bumps: [[90, 230, 84], [520, 205, 96], [900, 175, 74], [1190, 210, 88]] },
    { base: 180, bumps: [[280, 190, 70], [640, 235, 80], [1010, 200, 64]] },
    { base: 202, bumps: [[130, 215, 60], [470, 180, 72], [810, 225, 54], [1150, 170, 66]] },
    { base: 223, bumps: [[30, 200, 48], [420, 210, 54], [780, 190, 46], [1120, 220, 56]] },
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

/* -------------------------------------------------------------------------- */
/* Three more grounds, each doing something the others do not.                 */
/* -------------------------------------------------------------------------- */

/**
 * Growth rings.
 *
 * Everything else on the back plane is a mass — a mound, a wash, a leaf. This
 * is a line, and an off-centre one: rings that widen unevenly the way they do
 * in a cut olive trunk, or in water after something has touched it. Both
 * readings suit a room where people come to talk about years of something.
 */
export function Rings({
  count = 9,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const rings = Array.from({ length: count }, (_, i) => {
    const r = 26 + i * 19;
    // the wobble is what stops it reading as a target
    const skew = Math.sin(i * 1.7) * 0.055;
    return {
      cx: 200 + Math.sin(i * 0.9) * 8,
      cy: 200 + Math.cos(i * 1.3) * 7,
      rx: r * (1 + skew),
      ry: r * (1 - skew * 0.7),
      w: Math.max(0.9, 1.7 - i * 0.05),
    };
  });

  return (
    <svg
      className={`rings ${className}`}
      viewBox="0 0 400 400"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {rings.map((ring, i) => (
        <ellipse
          key={i}
          cx={ring.cx}
          cy={ring.cy}
          rx={ring.rx}
          ry={ring.ry}
          stroke="currentColor"
          strokeWidth={ring.w}
        />
      ))}
    </svg>
  );
}

/**
 * Dappled light.
 *
 * The one piece of background that is not a plant. Pools of light of the kind
 * that come through a tree onto a floor — which is what the ink rooms are
 * short of, since the cursor lamp only exists for people using a mouse.
 */
const DAPPLES: [x: number, y: number, r: number, a: number][] = [
  [64, 78, 62, 0.9], [166, 34, 38, 0.6], [232, 120, 74, 1], [318, 58, 44, 0.7],
  [96, 196, 50, 0.75], [206, 236, 34, 0.5], [300, 190, 58, 0.85], [376, 142, 40, 0.55],
  [22, 140, 30, 0.45], [140, 128, 26, 0.4],
];

export function Dapple({
  /** Two of these can share a page, and a gradient needs an id of its own. */
  id,
  className = "",
}: {
  id: string;
  className?: string;
}) {
  const fade = `dapple-${id}`;
  return (
    <svg
      className={`dapple ${className}`}
      viewBox="0 0 400 280"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={fade}>
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      {DAPPLES.map(([x, y, r, a], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={`url(#${fade})`} opacity={a} />
      ))}
    </svg>
  );
}

/**
 * A canopy.
 *
 * Everything else hangs off the bottom of a room or sits in a corner. This one
 * comes down from the top: a branch across the ceiling with the leaves hanging
 * off it, so the room has something overhead as well as underfoot.
 *
 * The viewBox starts sixteen units above the branch. It is drawn `slice`, so a
 * narrow screen crops from the bottom — without that headroom a phone shows
 * the leaf tips and not the branch they are hanging from.
 */
const RAD = Math.PI / 180;

export function Canopy({ className = "" }: { className?: string }) {
  const from: [number, number] = [-20, 26];
  const via: [number, number] = [600, -34];
  const to: [number, number] = [1220, 30];

  const at = (t: number): [number, number] => {
    const u = 1 - t;
    return [
      u * u * from[0] + 2 * u * t * via[0] + t * t * to[0],
      u * u * from[1] + 2 * u * t * via[1] + t * t * to[1],
    ];
  };
  const slope = (t: number) => {
    const u = 1 - t;
    const dx = 2 * u * (via[0] - from[0]) + 2 * t * (to[0] - via[0]);
    const dy = 2 * u * (via[1] - from[1]) + 2 * t * (to[1] - via[1]);
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };

  // leaves hang, so they all lean downward off the branch rather than alternating
  const leaves = Array.from({ length: 17 }, (_, i) => {
    const t = 0.03 + (i / 16) * 0.94;
    const [sx, sy] = at(t);
    const lean = slope(t) + 68 + Math.sin(i * 2.1) * 22;
    const len = 20 + Math.sin(i * 1.4) * 7;
    return { sx, sy, lean, len, wide: 7 + Math.cos(i * 1.9) * 2 };
  });

  return (
    <svg
      className={`canopy ${className}`}
      viewBox="0 -16 1200 78"
      preserveAspectRatio="xMidYMin slice"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={`M${from[0]} ${from[1]} Q${via[0]} ${via[1]} ${to[0]} ${to[1]}`}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {leaves.map((leaf, i) => {
        const cx = leaf.sx + Math.cos(leaf.lean * RAD) * leaf.len;
        const cy = leaf.sy + Math.sin(leaf.lean * RAD) * leaf.len;
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx={leaf.len}
            ry={leaf.wide}
            fill="currentColor"
            transform={`rotate(${leaf.lean} ${cx} ${cy})`}
          />
        );
      })}
    </svg>
  );
}
