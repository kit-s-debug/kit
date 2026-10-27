/**
 * Every colour pair the site actually renders, checked against WCAG 2.1 AA in
 * both day and evening, in normal and calm mode. Run by `npm run check` — a
 * failure is a build failure, not a warning.
 */
const hex = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lum = (h) =>
  hex(h)
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    .reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

// [label, foreground, background, minimum]
// 4.5 = body text · 3.0 = large text (>=24px) and non-text UI
const pairs = [
  ["day  body on paper", "#2b2b28", "#f5f1e8", 4.5],
  ["day  muted on paper", "#55534d", "#f5f1e8", 4.5],
  ["day  muted on sunk paper", "#55534d", "#ece7db", 4.5],
  ["day  heading on paper", "#1f3d47", "#f5f1e8", 4.5],
  ["day  sage text on paper", "#4d6840", "#f5f1e8", 4.5],
  ["day  ochre text on paper", "#7d5710", "#f5f1e8", 4.5],
  ["day  focus ring on paper", "#a9761f", "#f5f1e8", 3.0],
  ["day  action edge on paper", "#8a6118", "#f5f1e8", 3.0],
  ["day  focus ring on ink field", "#d9a44e", "#1f3d47", 3.0],
  ["day  body on ink field", "#f1ead9", "#1f3d47", 4.5],
  ["day  muted on ink field", "#b4c3c7", "#1f3d47", 4.5],
  ["day  ochre link on ink", "#d9a44e", "#1f3d47", 4.5],
  ["day  action label on ochre", "#241703", "#c08a2e", 4.5],
  ["calm body on paper", "#3a3833", "#f5f1e8", 4.5],
  ["calm muted on paper", "#5d5b54", "#f5f1e8", 4.5],

  ["eve  body on ground", "#d2c9b9", "#1b1815", 4.5],
  ["eve  muted on ground", "#9c9384", "#1b1815", 4.5],
  ["eve  muted on sunk ground", "#9c9384", "#211d19", 4.5],
  ["eve  heading on ground", "#dfd6c5", "#1b1815", 4.5],
  ["eve  sage text on ground", "#a3bc96", "#1b1815", 4.5],
  ["eve  ochre text on ground", "#dca84f", "#1b1815", 4.5],
  ["eve  focus ring on ground", "#dca84f", "#1b1815", 3.0],
  ["eve  action edge on ground", "#b0822f", "#1b1815", 3.0],
  ["eve  body on ink field", "#d6cdbd", "#16262c", 4.5],
  ["eve  muted on ink field", "#9aa8ab", "#16262c", 4.5],
  ["eve  ochre link on ink field", "#dca84f", "#16262c", 4.5],
  ["eve  action label on ochre", "#241703", "#dca84f", 4.5],
  ["calm eve body on ground", "#c4bba9", "#1b1815", 4.5],
  ["calm eve muted on ground", "#948b7d", "#1b1815", 4.5],

  /* The green ground: hills and the washes behind text are tints of sage mixed
     into the field. These are the deepest layer as actually painted, sampled
     off the rendered page — the only one text ever has to sit on. */
  ["day  body on deep green", "#2b2b28", "#dddfcf", 4.5],
  ["day  muted on deep green", "#55534d", "#dddfcf", 4.5],
  ["day  heading on deep green", "#1f3d47", "#dddfcf", 4.5],
  ["day  sage text on deep green", "#4d6840", "#dddfcf", 4.5],
  ["calm body on deep green", "#3a3833", "#dddfcf", 4.5],
  ["calm muted on deep green", "#5d5b54", "#dddfcf", 4.5],
  ["eve  body on deep green", "#d2c9b9", "#272620", 4.5],
  ["eve  muted on deep green", "#9c9384", "#272620", 4.5],
  ["eve  heading on deep green", "#dfd6c5", "#272620", 4.5],
  ["eve  sage text on deep green", "#a3bc96", "#272620", 4.5],
  ["calm eve body on deep green", "#c4bba9", "#272620", 4.5],
  ["calm eve muted on deep green", "#948b7d", "#272620", 4.5],

  /* The horizon in the ink rooms lifts the field rather than darkening it, so
     the pairs to watch there are the light type over the topmost layer. Again
     sampled off the rendered page. */
  ["day  body on ink green", "#f1ead9", "#27454b", 4.5],
  ["day  muted on ink green", "#b4c3c7", "#27454b", 4.5],
  ["day  ochre link on ink green", "#d9a44e", "#27454b", 4.5],
  ["eve  body on ink green", "#d6cdbd", "#1f2f34", 4.5],
  ["eve  muted on ink green", "#9aa8ab", "#1f2f34", 4.5],
  ["eve  ochre link on ink green", "#dca84f", "#1f2f34", 4.5],

  /* The three later grounds. The rings are a stroke and the canopy a fill, so
     both can end up directly behind a glyph; the dappled light only ever sits
     in an ink room and lifts it by five per cent, which is inside the ink-green
     pairs above. Sampled as painted. */
  ["day  body on rings", "#2b2b28", "#dbdfce", 4.5],
  ["day  muted on rings", "#55534d", "#dbdfce", 4.5],
  ["day  sage label on rings", "#4d6840", "#dbdfce", 4.5],
  ["calm body on rings", "#3a3833", "#dbdfce", 4.5],
  ["calm muted on rings", "#5d5b54", "#dbdfce", 4.5],
  ["eve  body on rings", "#d2c9b9", "#24231d", 4.5],
  ["eve  muted on rings", "#9c9384", "#24231d", 4.5],
  ["calm eve muted on rings", "#948b7d", "#24231d", 4.5],
  ["day  body on canopy", "#2b2b28", "#ddddcc", 4.5],
  ["day  muted on canopy", "#55534d", "#ddddcc", 4.5],
  ["day  sage label on canopy", "#4d6840", "#ddddcc", 4.5],
  ["calm body on canopy", "#3a3833", "#ddddcc", 4.5],
  ["calm muted on canopy", "#5d5b54", "#ddddcc", 4.5],
  ["eve  body on canopy", "#d2c9b9", "#26241e", 4.5],
  ["eve  muted on canopy", "#9c9384", "#26241e", 4.5],
  ["calm eve muted on canopy", "#948b7d", "#26241e", 4.5],
];

// Comfortable, not maximal: flag body pairs that are pushing 14:1+ glare.
const GLARE = 14;

let failed = 0;
let glary = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  const hot = min === 4.5 && r > GLARE;
  if (hot) glary++;
  console.log(
    `${ok ? (hot ? "!" : "✓") : "✗"} ${label.padEnd(30)} ${r.toFixed(2).padStart(6)}:1  (min ${min})${hot ? "  — glary" : ""}`,
  );
}

console.log(
  `\n${pairs.length - failed}/${pairs.length} pass AA` +
    (glary ? `, ${glary} above ${GLARE}:1` : ", none glary"),
);
if (failed) process.exit(1);
