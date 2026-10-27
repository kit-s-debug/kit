// Renders the Snippers hair studies into assets/img/.
//
//   node tools/render-strands.mjs            # every image
//   node tools/render-strands.mjs hero cut   # only the named ones
//
// Each spec is drawn at 2x in Chromium (tools/strands.html), saved as PNG,
// then resized and encoded to WebP by tools/encode.py.

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";

const { chromium } = createRequire(import.meta.url)("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const raw = join(here, "..", "photos", "rendered");
mkdirSync(raw, { recursive: true });

const INK = ["#0d0a08", "#1a1310"];
const BONE = ["#efe8dc", "#e2d8c8"];

// Palettes run dark (roots/lowlights) to light (ends/highlights).
const P = {
  copper: ["#140a06", "#4a1a0b", "#8f3514", "#c45a22", "#eb9a55"],
  auburn: ["#160806", "#3d0f09", "#7a2312", "#a8391c", "#d4683a"],
  balayage: ["#1d130d", "#4a3020", "#8b5e34", "#c99a5c", "#ecd4a0"],
  lift: ["#0b0a0a", "#2a130c", "#7a2d10", "#c46a1e", "#e3b25a", "#efdcae"],
  brunette: ["#0e0907", "#2a1912", "#4f3122", "#7a5236", "#a8794e"],
  black: ["#050505", "#111113", "#1e1e22", "#2f3036", "#4a4c55"],
  ash: ["#3b3733", "#6b655d", "#9a9284", "#c4bcaa", "#e6dfd0"],
  champagne: ["#3a2a1c", "#7d6142", "#b8996a", "#dcc497", "#f4e8cc"],
};

export const SPECS = {
  // Hero: a long S-wave of copper falling diagonally, a softbox band across it.
  hero: {
    w: 1200, h: 1500, seed: 11, bg: INK, palette: P.copper, sheen: "#ffd9b0",
    angle: 1.12, waves: [[0.13, 1.6, 0.4, 0.5], [0.018, 0.5, 1.2, 0.8]], lockAmp: 0.006,
    lockSpread: 0.01, count: 5200, locks: 70, along: 0.35, lightSlope: 0.18, sheenWidth: 0.2, sheenAmount: 0.6,
    sheenBand: { y: 0.42, tilt: -0.35, w: 0.09, amt: 0.35 }, vignette: 0.55,
  },
  // Cutting: sleek, straight brunette with a clean blunt line. The snip.
  cut: {
    w: 1000, h: 1250, seed: 4, bg: BONE, palette: P.brunette, sheen: "#d9b48a",
    angle: Math.PI / 2 + 0.06, waves: [[0.012, 1.4, 0, 0.6]], lockAmp: 0.003, count: 3800, locks: 90,
    span: 0.62, cx: 0.5, cy: 0.5, lightSlope: 2, sheenWidth: 0.02, sheenAmount: 0,
    sheenBand: { y: 0.3, tilt: 0.05, w: 0.06, amt: 0.45 },
    cut: { x: 0.5, y: 0.72, angle: Math.PI / 2 - 0.12, jitter: 0.002 }, startJitter: 0.0, endJitter: 0.0,
    vignette: 0.12, blur: 2,
  },
  // Colour: balayage, dark root melting to soft blonde ends, loose waves.
  colour: {
    w: 1000, h: 1250, seed: 23, bg: INK, palette: P.balayage, sheen: "#fff0d0",
    angle: Math.PI / 2 - 0.08, waves: [[0.05, 0.95, 0, 0.7], [0.012, 0.37, 2, 1.2]], lockAmp: 0.007,
    lockSpread: 0.011, count: 5200, locks: 60, along: 0.9, highlightLocks: 0.3, lightSlope: 0.2, sheenWidth: 0.18,
    sheenAmount: 0.45, vignette: 0.5,
  },
  // Correction: the lift from black box dye to soft blonde, side by side.
  lift: {
    w: 1000, h: 1250, seed: 31, bg: INK, palette: P.lift, sheen: "#ffe8c4",
    angle: -Math.PI / 2, waves: [[0.03, 1.1, 0, 0.5]], lockAmp: 0.006, count: 4600, locks: 80,
    span: 0.8, lockSpread: 0.008, across: 1.25, strandTone: 0.12, lockTone: 0.08, lightSlope: 0.05, sheenWidth: 0.05, sheenAmount: 0.3,
    sheenBand: { y: 0.4, tilt: 0.0, w: 0.07, amt: 0.3 }, vignette: 0.35,
  },
  // The colour-story swatch: the same lift, wide, for the pinned section.
  liftwide: {
    w: 1800, h: 800, seed: 37, bg: INK, palette: P.lift, sheen: "#ffe8c4",
    angle: -Math.PI / 2, waves: [[0.012, 0.9, 0, 0.5]], lockAmp: 0.004, count: 6400, locks: 120,
    span: 1.0, lockSpread: 0.005, across: 1.15, strandTone: 0.1, lockTone: 0.06, lightSlope: 2,
    sheenAmount: 0, sheenBand: { y: 0.38, tilt: 0.0, w: 0.08, amt: 0.32 }, vignette: 0.3,
  },
  // Blow-dry: big glossy curves with volume.
  blowdry: {
    w: 1000, h: 1250, seed: 7, bg: INK, palette: P.brunette, sheen: "#f2cfa4",
    angle: 0.55, waves: [[0.2, 1.7, 0.3, 0.35]], lockAmp: 0.005, lockSpread: 0.012, count: 5600, locks: 60,
    lightSlope: 0.3, sheenWidth: 0.3, sheenAmount: 0.55, vignette: 0.55,
  },
  // Occasion: curls in champagne.
  occasion: {
    w: 1000, h: 1250, seed: 41, bg: INK, palette: P.champagne, sheen: "#fff6e0",
    angle: Math.PI / 2 + 0.2, waves: [[0.055, 0.85, 0, 0.12]], lockAmp: 0.003, lockSpread: 0.012,
    count: 5600, locks: 50, along: 0.25, lightSlope: 0.55, sheenWidth: 0.25, sheenAmount: 0.6, vignette: 0.5,
  },
  // Men's and children's cuts: short, ash, textured.
  short: {
    w: 1000, h: 1250, seed: 13, bg: ["#d9d1c3", "#cfc5b4"], palette: P.ash, sheen: "#ffffff",
    angle: -0.45, waves: [[0.015, 0.4, 0, 6]], lockAmp: 0.025, lockSpread: 0.004, count: 9000, locks: 220,
    span: 1.4, len: 0.16, scatter: 1.1, startJitter: 0.5, endJitter: 0.3, cx: 0.5, lightSlope: 0.1, sheenWidth: 0.25,
    sheenAmount: 0.3, strandTone: 0.6, vignette: 0.15, blur: 2.5, widthMul: 1.3,
  },
  // Experience: wide, black hair with a cool blue sheen.
  inkwave: {
    w: 1600, h: 1000, seed: 3, bg: ["#070707", "#121214"], palette: P.black, sheen: "#b8c4d6",
    angle: 0.12, waves: [[0.05, 0.62, 0, 0.6], [0.012, 0.21, 1, 1]], lockAmp: 0.005, lockSpread: 0.012, count: 6000, locks: 70,
    lightSlope: 0.25, sheenWidth: 0.1, sheenAmount: 0.8, vignette: 0.5,
  },
  auburnfall: {
    w: 1000, h: 1400, seed: 19, bg: INK, palette: P.auburn, sheen: "#ffc9a0",
    angle: Math.PI / 2 - 0.3, waves: [[0.09, 1.2, 0.2, 1.1], [0.02, 0.35, 0, 2.2]], lockAmp: 0.006, lockSpread: 0.012, count: 5400, locks: 60,
    along: 0.3, lightSlope: 0.12, sheenWidth: 0.16, sheenAmount: 0.55, vignette: 0.5,
  },
  // Gallery extras
  g_copperwide: {
    w: 1600, h: 1000, seed: 61, bg: INK, palette: P.copper, sheen: "#ffdcb8",
    angle: -0.08, waves: [[0.04, 0.5, 0, 0.6]], lockAmp: 0.005, lockSpread: 0.012, count: 6000, locks: 80, along: 0.5,
    lightSlope: 0.3, sheenWidth: 0.25, sheenAmount: 0.45, vignette: 0.5,
  },
  g_blondecut: {
    w: 1000, h: 1300, seed: 71, bg: INK, palette: P.champagne, sheen: "#fffaf0",
    angle: Math.PI / 2 - 0.04, waves: [[0.008, 1.2, 0, 0.3]], lockAmp: 0.002, count: 3800, locks: 100,
    span: 0.7, lightSlope: 2, sheenWidth: 0.02, sheenAmount: 0,
    sheenBand: { y: 0.36, tilt: -0.04, w: 0.05, amt: 0.5 },
    cut: { x: 0.5, y: 0.78, angle: Math.PI / 2 + 0.16, jitter: 0.0025 }, startJitter: 0, endJitter: 0,
    vignette: 0.35, blur: 2,
  },
  g_curlsdark: {
    w: 1000, h: 1250, seed: 83, bg: INK, palette: P.auburn, sheen: "#ffcfae",
    angle: Math.PI / 2 - 0.5, waves: [[0.06, 0.32, 0, 0.4], [0.02, 0.9, 1, 0.5]], lockAmp: 0.004, lockSpread: 0.012,
    count: 5600, locks: 50, along: 0.2, lightSlope: 0.7, sheenWidth: 0.3, sheenAmount: 0.55, vignette: 0.55,
  },
};

const only = process.argv.slice(2);
const names = only.length ? only : Object.keys(SPECS);

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("file://" + join(here, "strands.html"));
for (const name of names) {
  const spec = { ...SPECS[name] };
  spec.w *= 2; spec.h *= 2;
  const t = Date.now();
  await page.evaluate((s) => window.render(s), spec);
  const dataUrl = await page.evaluate(() => document.getElementById("out").toDataURL("image/png"));
  const file = join(raw, name + ".png");
  const { writeFileSync } = await import("node:fs");
  writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
  console.log(`${name}: ${Date.now() - t}ms`);
}
await browser.close();

execFileSync("python3", ["-I", join(here, "encode.py"), ...names], { stdio: "inherit" });
