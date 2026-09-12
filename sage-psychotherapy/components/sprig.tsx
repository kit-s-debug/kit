/**
 * Her olive sprigs, drawn six ways.
 *
 * The wreath in her logo is the practice's mark, so the site carries small
 * sprigs of it — in a corner, on a hairline, beside a quiet heading. They are
 * deliberately not one shape repeated: each variant has its own stem curve,
 * its own number of leaves and its own scattering of olives, so they read as
 * cuttings from the same plant rather than a pasted icon.
 *
 * Every sprig is decoration and nothing else: no text, no interaction, hidden
 * from assistive technology, and never in the way of a pointer.
 */

type Point = [number, number];

type Curve = { from: Point; via: Point; to: Point };

/** A leaf: where along the stem, which side, how long and how wide. */
type LeafSpec = { t: number; side: 1 | -1; length: number; width: number; spread?: number };

/** An olive: where along the stem, which side, how far off it, how big. */
type OliveSpec = { t: number; side: 1 | -1; away: number; r: number };

type Variant = {
  box: [number, number];
  stem: Curve;
  /** A second stem, for the sprigs that fork. */
  stem2?: Curve;
  strokeWidth: number;
  leaves: LeafSpec[];
  leaves2?: LeafSpec[];
  olives?: OliveSpec[];
};

function pointAt(c: Curve, t: number): Point {
  const u = 1 - t;
  return [
    u * u * c.from[0] + 2 * u * t * c.via[0] + t * t * c.to[0],
    u * u * c.from[1] + 2 * u * t * c.via[1] + t * t * c.to[1],
  ];
}

/** Direction of travel along the stem at t, in degrees. */
function angleAt(c: Curve, t: number): number {
  const u = 1 - t;
  const dx = 2 * u * (c.via[0] - c.from[0]) + 2 * t * (c.to[0] - c.via[0]);
  const dy = 2 * u * (c.via[1] - c.from[1]) + 2 * t * (c.to[1] - c.via[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

const RAD = Math.PI / 180;

/**
 * The six cuttings. Leaf counts run 3, 5, 6, 7, 7 and 9; two of them fork, one
 * arcs sideways, and the olives never sit where a leaf already is.
 */
const VARIANTS: Record<string, Variant> = {
  /** Three leaves and a single olive — small enough for a corner or a rule. */
  three: {
    box: [32, 44],
    stem: { from: [17, 42], via: [23, 26], to: [12, 4] },
    strokeWidth: 1.5,
    leaves: [
      { t: 0.42, side: 1, length: 8, width: 3.4 },
      { t: 0.66, side: -1, length: 8.6, width: 3.6 },
      { t: 0.9, side: 1, length: 7.4, width: 3.2 },
    ],
    olives: [{ t: 0.24, side: -1, away: 3.4, r: 2.3 }],
  },

  /** Five, alternating up a leaning stem. No fruit on this one. */
  five: {
    box: [40, 56],
    stem: { from: [21, 54], via: [11, 32], to: [25, 4] },
    strokeWidth: 1.6,
    leaves: [
      { t: 0.3, side: -1, length: 9.5, width: 4 },
      { t: 0.46, side: 1, length: 10, width: 4.2 },
      { t: 0.62, side: -1, length: 9.5, width: 4 },
      { t: 0.78, side: 1, length: 8.8, width: 3.7 },
      { t: 0.94, side: -1, length: 7.8, width: 3.3 },
    ],
  },

  /** The one that lies down: a shallow bow with six leaves along it. */
  arc: {
    box: [88, 46],
    stem: { from: [4, 28], via: [44, 2], to: [84, 26] },
    strokeWidth: 1.6,
    leaves: [
      { t: 0.12, side: -1, length: 9, width: 3.8 },
      { t: 0.26, side: 1, length: 9.6, width: 4 },
      { t: 0.42, side: -1, length: 10.5, width: 4.3 },
      { t: 0.58, side: 1, length: 10.5, width: 4.3 },
      { t: 0.74, side: -1, length: 9.6, width: 4 },
      { t: 0.9, side: 1, length: 8.6, width: 3.6 },
    ],
    olives: [
      { t: 0.34, side: -1, away: 4, r: 2.6 },
      { t: 0.66, side: -1, away: 4, r: 2.3 },
    ],
  },

  /** Seven leaves on a long bow, two olives low down. The watermark shape. */
  seven: {
    box: [56, 80],
    stem: { from: [34, 78], via: [6, 44], to: [32, 3] },
    strokeWidth: 1.7,
    leaves: [
      { t: 0.2, side: 1, length: 10, width: 4.2 },
      { t: 0.33, side: -1, length: 11, width: 4.6 },
      { t: 0.46, side: 1, length: 11.5, width: 4.8 },
      { t: 0.58, side: -1, length: 11.5, width: 4.8 },
      { t: 0.7, side: 1, length: 10.8, width: 4.5 },
      { t: 0.82, side: -1, length: 9.6, width: 4 },
      { t: 0.94, side: 1, length: 8.4, width: 3.5 },
    ],
    olives: [
      { t: 0.11, side: -1, away: 4.2, r: 3 },
      { t: 0.26, side: 1, away: 4, r: 2.4 },
    ],
  },

  /** Two cuttings crossed at the base: four leaves one way, three the other. */
  pair: {
    box: [60, 54],
    stem: { from: [30, 52], via: [17, 33], to: [6, 9] },
    stem2: { from: [30, 52], via: [44, 37], to: [54, 15] },
    strokeWidth: 1.5,
    leaves: [
      { t: 0.34, side: 1, length: 8.4, width: 3.6 },
      { t: 0.54, side: -1, length: 9, width: 3.8 },
      { t: 0.74, side: 1, length: 8.6, width: 3.6 },
      { t: 0.93, side: -1, length: 7.6, width: 3.2 },
    ],
    leaves2: [
      { t: 0.4, side: -1, length: 8, width: 3.4 },
      { t: 0.66, side: 1, length: 8.4, width: 3.5 },
      { t: 0.92, side: -1, length: 7.2, width: 3 },
    ],
    olives: [{ t: 0.16, side: -1, away: 3.6, r: 2.5 }],
  },

  /** The fullest cutting: nine leaves and three olives on a long stem. */
  nine: {
    box: [68, 112],
    stem: { from: [44, 110], via: [2, 60], to: [42, 4] },
    strokeWidth: 1.8,
    leaves: [
      { t: 0.14, side: 1, length: 10.5, width: 4.4 },
      { t: 0.24, side: -1, length: 11.5, width: 4.8 },
      { t: 0.34, side: 1, length: 12.5, width: 5.2 },
      { t: 0.45, side: -1, length: 13, width: 5.4 },
      { t: 0.56, side: 1, length: 13, width: 5.4 },
      { t: 0.67, side: -1, length: 12.5, width: 5.2 },
      { t: 0.78, side: 1, length: 11.5, width: 4.8 },
      { t: 0.88, side: -1, length: 10.2, width: 4.3 },
      { t: 0.97, side: 1, length: 8.6, width: 3.6 },
    ],
    olives: [
      { t: 0.07, side: -1, away: 4.6, r: 3.2 },
      { t: 0.19, side: 1, away: 4.4, r: 2.7 },
      { t: 0.93, side: 1, away: 4, r: 2.3 },
    ],
  },
};

export type SprigVariant = keyof typeof VARIANTS;

function leafShapes(curve: Curve, leaves: LeafSpec[], key: string) {
  return leaves.map((leaf, i) => {
    const [sx, sy] = pointAt(curve, leaf.t);
    const angle = angleAt(curve, leaf.t) + leaf.side * (leaf.spread ?? 52);
    // The leaf grows out of the stem, so its centre sits one half-length along
    // its own direction rather than on the stem itself.
    const cx = sx + Math.cos(angle * RAD) * leaf.length;
    const cy = sy + Math.sin(angle * RAD) * leaf.length;
    return (
      <ellipse
        key={`${key}-${i}`}
        cx={cx}
        cy={cy}
        rx={leaf.length}
        ry={leaf.width}
        fill="currentColor"
        transform={`rotate(${angle} ${cx} ${cy})`}
      />
    );
  });
}

export function Sprig({
  variant = "three",
  size = 32,
  className = "",
  flip = false,
}: {
  variant?: SprigVariant;
  /** Width in pixels; the height follows the cutting's own proportions. */
  size?: number;
  className?: string;
  /** Mirror it, so the same cutting can sit in either corner. */
  flip?: boolean;
}) {
  const v = VARIANTS[variant];
  const [w, h] = v.box;

  return (
    <svg
      width={size}
      height={Math.round((size * h) / w)}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`sprig ${className}`}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <path
        d={`M${v.stem.from[0]} ${v.stem.from[1]} Q${v.stem.via[0]} ${v.stem.via[1]} ${v.stem.to[0]} ${v.stem.to[1]}`}
        stroke="currentColor"
        strokeWidth={v.strokeWidth}
        strokeLinecap="round"
      />
      {v.stem2 && (
        <path
          d={`M${v.stem2.from[0]} ${v.stem2.from[1]} Q${v.stem2.via[0]} ${v.stem2.via[1]} ${v.stem2.to[0]} ${v.stem2.to[1]}`}
          stroke="currentColor"
          strokeWidth={v.strokeWidth}
          strokeLinecap="round"
        />
      )}

      {leafShapes(v.stem, v.leaves, "a")}
      {v.stem2 && v.leaves2 && leafShapes(v.stem2, v.leaves2, "b")}

      {v.olives?.map((olive, i) => {
        const [sx, sy] = pointAt(v.stem, olive.t);
        const angle = angleAt(v.stem, olive.t) + olive.side * 90;
        return (
          <circle
            key={`o-${i}`}
            cx={sx + Math.cos(angle * RAD) * olive.away}
            cy={sy + Math.sin(angle * RAD) * olive.away}
            r={olive.r}
            fill="currentColor"
            opacity="0.6"
          />
        );
      })}
    </svg>
  );
}

/**
 * The wreath from her logo, drawn open at the top the way hers is.
 *
 * Two branches rise from the base and curve round, leaves turned outward, with
 * a gap left at the crown. Used large and very faint as a background — the
 * mark at the scale of a room rather than a badge.
 */
export function Wreath({
  size = 240,
  className = "",
  /** Leaves per branch. */
  leaves = 13,
  /** Degrees of sky left open at the crown. */
  crown = 54,
}: {
  size?: number;
  className?: string;
  leaves?: number;
  crown?: number;
}) {
  const cx = 50;
  const cy = 50;
  const r = 33;

  // Sweep from the base (90°, straight down in SVG terms) round each way,
  // stopping short of the crown.
  const span = 180 - crown / 2;
  const branches = [1, -1].map((dir) => {
    const arc: { a: number; scale: number }[] = [];
    for (let i = 0; i < leaves; i += 1) {
      const t = i / (leaves - 1);
      arc.push({
        a: 90 + dir * (t * span),
        // leaves thin out towards the open crown, as they do on a real branch
        scale: 1 - t * 0.42,
      });
    }
    return { dir, arc };
  });

  const path = (dir: number) => {
    const a0 = (90 * Math.PI) / 180;
    const a1 = ((90 + dir * span) * Math.PI) / 180;
    return [
      `M${(cx + Math.cos(a0) * r).toFixed(2)} ${(cy + Math.sin(a0) * r).toFixed(2)}`,
      `A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${(cx + Math.cos(a1) * r).toFixed(2)} ${(cy + Math.sin(a1) * r).toFixed(2)}`,
    ].join(" ");
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={`sprig wreath ${className}`}
    >
      {branches.map(({ dir }) => (
        <path
          key={dir}
          d={path(dir)}
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      ))}

      {branches.flatMap(({ dir, arc }) =>
        arc.map(({ a, scale }, i) => {
          const rad = (a * Math.PI) / 180;
          const sx = cx + Math.cos(rad) * r;
          const sy = cy + Math.sin(rad) * r;
          // outward, with a lean along the branch so they overlap like real leaves
          const out = a + dir * 26;
          const len = 8.6 * scale;
          const lx = sx + Math.cos((out * Math.PI) / 180) * len;
          const ly = sy + Math.sin((out * Math.PI) / 180) * len;
          return (
            <ellipse
              key={`${dir}-${i}`}
              cx={lx}
              cy={ly}
              rx={len}
              ry={3.4 * scale}
              fill="currentColor"
              transform={`rotate(${out} ${lx} ${ly})`}
            />
          );
        }),
      )}

      {[0.28, 0.56, 0.84].flatMap((t) =>
        [1, -1].map((dir) => {
          const a = ((90 + dir * (t * span)) * Math.PI) / 180;
          const inward = r - 5.2;
          return (
            <circle
              key={`${dir}-${t}`}
              cx={cx + Math.cos(a) * inward}
              cy={cy + Math.sin(a) * inward}
              r={1.9}
              fill="currentColor"
              opacity="0.65"
            />
          );
        }),
      )}
    </svg>
  );
}
