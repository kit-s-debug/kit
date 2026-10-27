// Renders the abstract "plates" used as art direction until the salon's own
// photography is supplied. Everything is procedural (no stock imagery):
// satin height-fields lit like a studio still life.
//
//   node tools/render-plates.mjs        (needs ffmpeg on PATH)
//
// Writes assets/img/plates/<name>-<width>.{webp,jpg}

import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "img", "plates");
mkdirSync(OUT, { recursive: true });

// ---------- small maths helpers ----------
const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const hex = (h) => [1, 3, 5].map((i) => (parseInt(h.slice(i, i + 2), 16) / 255) ** 2.2);
const mix3 = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function makeNoise(seed) {
  const r = rng(seed);
  const p = new Uint8Array(512);
  const g = new Float32Array(512);
  for (let i = 0; i < 256; i++) { p[i] = i; g[i] = r() * 2 - 1; }
  for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 256; i++) { p[i + 256] = p[i]; g[i + 256] = g[i]; }
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const v = (a, b) => g[p[p[a] + b]];
    const u = smooth(xf), w = smooth(yf);
    return mix(mix(v(X, Y), v(X + 1, Y), u), mix(v(X, Y + 1), v(X + 1, Y + 1), u), w);
  };
}

function encode(name, w, h, rgb, widths) {
  for (const tw of widths) {
    const th = Math.round((h * tw) / w);
    for (const [ext, args] of [
      ["webp", ["-c:v", "libwebp", "-quality", "80", "-compression_level", "6"]],
      ["jpg", ["-q:v", "4"]],
    ]) {
      const res = spawnSync("ffmpeg", [
        "-loglevel", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${w}x${h}`, "-i", "-",
        "-vf", `scale=${tw}:${th}:flags=lanczos`, "-frames:v", "1", ...args,
        join(OUT, `${name}-${tw}.${ext}`),
      ], { input: rgb, maxBuffer: 1 << 30 });
      if (res.status !== 0) throw new Error(res.stderr.toString());
    }
  }
  console.log("rendered", name);
}

function toBytes(w, h, shade, grainAmt = 0.035, seed = 1) {
  const out = Buffer.alloc(w * h * 3);
  const r = rng(seed * 7919);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = shade(x / w, y / h);
      const n = (r() - 0.5) * grainAmt;
      const i = (y * w + x) * 3;
      for (let k = 0; k < 3; k++) out[i + k] = Math.round(clamp(c[k] ** (1 / 2.2) + n) * 255);
    }
  }
  return out;
}

// ---------- satin ----------
// A height field made of a few broad folds, warped by low-frequency noise,
// lit with a soft key light and an anisotropic sheen.
function satin({ w, h, seed, folds, palette, light = [-0.55, -0.75, 0.5], sheen = 0.9, vignette = 0.35, warp = 0.5, depth = 0.32 }) {
  const n1 = makeNoise(seed), n2 = makeNoise(seed + 11);
  const aspect = w / h;
  const height = (u, v) => {
    const x = u * aspect, y = v;
    const wx = x + warp * n1(x * 1.3, y * 1.3) + 0.15 * n2(x * 4, y * 4);
    const wy = y + warp * n2(x * 1.1 + 5, y * 1.1);
    let z = 0;
    for (const f of folds) {
      const c = Math.cos(f.angle), s = Math.sin(f.angle);
      const t = wx * c + wy * s;
      // sharpened sine gives the crisp crest of a fold
      const sv = Math.sin(t * f.freq + f.phase);
      // skewed sine: soft valleys, rounder crests, like fabric under its own weight
      z += f.amp * (sv + 0.28 * Math.sin(2 * (t * f.freq + f.phase))) / f.freq;
    }
    return z;
  };
  const L = (() => { const m = Math.hypot(...light); return light.map((v) => v / m); })();
  const H = (() => { const v = [L[0], L[1], L[2] + 1]; const m = Math.hypot(...v); return v.map((q) => q / m); })();
  const e = 1 / Math.max(w, h);
  const [shadow, base, mid, high] = palette.map(hex);
  return (u, v) => {
    const hz = height(u, v);
    const dx = (height(u + e, v) - hz) / e;
    const dy = (height(u, v + e) - hz) / e;
    const k = depth;
    let nx = -dx * k, ny = -dy * k, nz = 1;
    const m = Math.hypot(nx, ny, nz); nx /= m; ny /= m; nz /= m;
    const diff = clamp(nx * L[0] + ny * L[1] + nz * L[2]);
    const spec = clamp(nx * H[0] + ny * H[1] + nz * H[2]) ** 24;
    const broad = clamp(nx * H[0] + ny * H[1] + nz * H[2]) ** 5;
    const dd = clamp((diff - 0.35) / 0.65);
    let c = dd < 0.5 ? mix3(shadow, base, smooth(dd / 0.5)) : mix3(base, mid, smooth((dd - 0.5) / 0.5));
    c = mix3(c, high, clamp(spec * sheen + broad * 0.18 * sheen));
    const d = Math.hypot(u - 0.5, (v - 0.5) * 1.1);
    const vg = 1 - vignette * smooth(clamp((d - 0.25) / 0.6));
    return c.map((q) => q * vg);
  };
}

// ---------- render list ----------
const plates = [
  {
    name: "satin-jade", w: 1800, h: 2250, widths: [1800, 1200, 720],
    fn: (w, h) => satin({ w, h, seed: 3, warp: 0.55, sheen: 0.7,
      palette: ["#0a1712", "#1f4536", "#4d806a", "#cfe3d3"],
      folds: [
        { angle: 1.05, freq: 7, amp: 1, phase: 0.2, sharp: 0.7 },
        { angle: 1.4, freq: 13, amp: 0.35, phase: 1.3 },
        { angle: 0.2, freq: 4, amp: 0.6, phase: 2.1 },
      ] }),
  },
  {
    name: "satin-clay", w: 1600, h: 1200, widths: [1600, 1000, 640],
    fn: (w, h) => satin({ w, h, seed: 8, warp: 0.4, light: [0.6, -0.6, 0.5],
      palette: ["#4a2620", "#9b5a4a", "#c98f7e", "#fbe9df"],
      folds: [
        { angle: -0.6, freq: 6, amp: 1, phase: 0.4, sharp: 0.75 },
        { angle: -0.3, freq: 11, amp: 0.4, phase: 2.2 },
        { angle: 1.2, freq: 3, amp: 0.5, phase: 0.1 },
      ] }),
  },
  {
    name: "satin-ivory", w: 1600, h: 2000, widths: [1600, 1000, 640],
    fn: (w, h) => satin({ w, h, seed: 21, warp: 0.6, sheen: 0.6, vignette: 0.2,
      palette: ["#8f8572", "#d8cfbd", "#efe9dd", "#ffffff"],
      folds: [
        { angle: 0.5, freq: 5, amp: 1, phase: 1.1, sharp: 0.8 },
        { angle: 0.9, freq: 10, amp: 0.3, phase: 0.2 },
        { angle: -1.0, freq: 3, amp: 0.45, phase: 2.6 },
      ] }),
  },
  {
    name: "satin-ink", w: 2000, h: 1250, widths: [2000, 1280, 720],
    fn: (w, h) => satin({ w, h, seed: 34, warp: 0.5, light: [0.3, -0.8, 0.7], sheen: 1,
      palette: ["#050807", "#0f1d18", "#24453a", "#c9d9c9"],
      folds: [
        { angle: 0.15, freq: 5, amp: 1, phase: 0.9, sharp: 0.65 },
        { angle: 0.35, freq: 12, amp: 0.3, phase: 2.0 },
      ] }),
  },
  {
    name: "satin-gilt", w: 1400, h: 1750, widths: [1400, 900, 600],
    fn: (w, h) => satin({ w, h, seed: 55, warp: 0.45, light: [-0.4, -0.5, 0.9],
      palette: ["#2e2310", "#7c6131", "#c9a24a", "#fff3cf"],
      folds: [
        { angle: 1.3, freq: 8, amp: 1, phase: 0.1, sharp: 0.7 },
        { angle: 0.8, freq: 15, amp: 0.25, phase: 1.7 },
        { angle: -0.2, freq: 3.5, amp: 0.6, phase: 0.3 },
      ] }),
  },
];

const only = process.argv.slice(2);
for (const p of plates) {
  if (only.length && !only.includes(p.name)) continue;
  const shade = p.fn(p.w, p.h);
  encode(p.name, p.w, p.h, toBytes(p.w, p.h, shade, p.grain ?? 0.035, p.name.length), p.widths);
}
