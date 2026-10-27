// Generates the illustrated food artwork used on the site.
//
//   node tools/art.mjs
//
// Writes standalone SVGs to assets/img/art/ and injects the layered hero and
// signature pieces into index.html between <!-- art:NAME --> markers, so the
// scroll animations can move each layer (bread, fillings, steam) separately.
// The art is seeded, so re-running produces identical output.
//
// These illustrations stand in until real photography of Samuel's food is
// supplied — see README.md "Photography".

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => Math.round(n * 10) / 10;
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
const between = (r, a, b) => a + r() * (b - a);

// ---------- palette ----------
const C = {
  crustHi: "#F3BE6E", crust: "#D98939", crustLo: "#A4531B", crustDeep: "#6E3410",
  crumb: "#F8E4B6", crumbLo: "#E8C68A", hole: "#DDB271",
  leafHi: "#B9DB5C", leaf: "#7FAE34", leafLo: "#4E7A1E",
  tomHi: "#F2603F", tom: "#D9361F", tomLo: "#A52012", tomFlesh: "#F58A62", seed: "#FBD9A8",
  cheeseHi: "#FFE07A", cheese: "#F6B82C", cheeseLo: "#D98E12",
  meat: ["#8E3F1A", "#A44E22", "#B8632E", "#7A3214", "#C47439", "#963F17"],
  sauce: "#5B1F0B", gloss: "#FFF3DA",
  ink: "#3A1A0A",
};
const INK = `stroke="${C.ink}" stroke-width="3.2" stroke-linejoin="round"`;

// A filling ruffle: wavy top edge from x0..x1 around y, dropping to yBottom.
function ruffle(r, x0, x1, y, yBottom, { amp = 10, step = 34, droop = 0 } = {}) {
  let d = `M${x0 + 8} ${yBottom} Q${x0 - 16} ${f((y + yBottom) / 2)} ${x0} ${f(y + between(r, -amp * 0.5, amp * 0.5))}`;
  let x = x0;
  while (x < x1) {
    const nx = Math.min(x1, x + step * between(r, 0.7, 1.3));
    const cy = y - amp * between(r, 0.4, 1.4);
    const ey = y + between(r, -amp * 0.5, amp * 0.9);
    d += ` Q${f((x + nx) / 2)} ${f(cy)} ${f(nx)} ${f(ey)}`;
    x = nx;
  }
  // underside scallops (droop over the bread)
  x = x1;
  d += ` Q${x1 + 16} ${f((y + yBottom) / 2)} ${x1 - 8} ${yBottom}`;
  while (x > x0) {
    const nx = Math.max(x0, x - step * between(r, 1, 1.8));
    d += ` Q${f((x + nx) / 2)} ${f(yBottom + droop * between(r, 0.2, 1.2))} ${f(nx)} ${f(yBottom + between(r, -3, 3))}`;
    x = nx;
  }
  return d + " Z";
}

function defs(id) {
  return `<defs>
  <linearGradient id="${id}-crustTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.crustHi}"/><stop offset=".45" stop-color="${C.crust}"/><stop offset="1" stop-color="${C.crustLo}"/></linearGradient>
  <linearGradient id="${id}-crustBot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.crust}"/><stop offset=".6" stop-color="${C.crustLo}"/><stop offset="1" stop-color="${C.crustDeep}"/></linearGradient>
  <linearGradient id="${id}-crumb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.crumb}"/><stop offset="1" stop-color="${C.crumbLo}"/></linearGradient>
  <linearGradient id="${id}-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.leafHi}"/><stop offset=".5" stop-color="${C.leaf}"/><stop offset="1" stop-color="${C.leafLo}"/></linearGradient>
  <linearGradient id="${id}-cheese" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.cheeseHi}"/><stop offset=".55" stop-color="${C.cheese}"/><stop offset="1" stop-color="${C.cheeseLo}"/></linearGradient>
  <linearGradient id="${id}-tom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.tomHi}"/><stop offset=".6" stop-color="${C.tom}"/><stop offset="1" stop-color="${C.tomLo}"/></linearGradient>
  <radialGradient id="${id}-shadow"><stop offset="0" stop-color="#3B1A08" stop-opacity=".42"/><stop offset=".6" stop-color="#3B1A08" stop-opacity=".16"/><stop offset="1" stop-color="#3B1A08" stop-opacity="0"/></radialGradient>
  <linearGradient id="${id}-sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF6E2" stop-opacity=".55"/><stop offset="1" stop-color="#FFF6E2" stop-opacity="0"/></linearGradient>
</defs>`;
}

// ---------- bread ----------
function breadBottom(r, id, x0, x1, top, bottom) {
  const w = x1 - x0;
  const crust = `M${x0} ${top - 10} C${x0 + 14} ${top - 16} ${x0 + 50} ${top - 14} ${x0 + 90} ${top - 12} L${x1 - 90} ${top - 14} C${x1 - 50} ${top - 16} ${x1 - 12} ${top - 18} ${x1} ${top - 12} C${x1 - 6} ${top + 34} ${x1 - 90} ${bottom} ${x1 - 230} ${bottom + 2} L${x0 + 220} ${bottom + 4} C${x0 + 90} ${bottom + 2} ${x0 + 8} ${top + 36} ${x0} ${top - 10} Z`;
  const face = `M${x0 + 14} ${top} C${x0 + 20} ${top - 10} ${x0 + 50} ${top - 14} ${x0 + 90} ${top - 14} L${x1 - 90} ${top - 16} C${x1 - 40} ${top - 16} ${x1 - 12} ${top - 8} ${x1 - 10} ${top + 4} C${x1 - 50} ${top + 16} ${x1 - 120} ${top + 18} ${x1 - 200} ${top + 18} L${x0 + 160} ${top + 22} C${x0 + 90} ${top + 22} ${x0 + 40} ${top + 16} ${x0 + 14} ${top} Z`;
  let holes = "";
  for (let i = 0; i < w / 22; i++) {
    const x = between(r, x0 + 40, x1 - 40);
    holes += `<ellipse cx="${f(x)}" cy="${f(between(r, top - 8, top + 12))}" rx="${f(between(r, 2, 7))}" ry="${f(between(r, 1.2, 3))}" fill="${C.hole}" opacity=".7"/>`;
  }
  let speck = "";
  for (let i = 0; i < w / 14; i++) {
    speck += `<circle cx="${f(between(r, x0 + 30, x1 - 30))}" cy="${f(between(r, top + 34, bottom - 10))}" r="${f(between(r, 0.8, 2.2))}" fill="${C.crustDeep}" opacity="${f(between(r, 0.15, 0.4))}"/>`;
  }
  return `<path d="${crust}" fill="url(#${id}-crustBot)" ${INK}/>
  <path d="M${x0 + 60} ${bottom - 22} C${x0 + 300} ${bottom - 6} ${x1 - 300} ${bottom - 8} ${x1 - 60} ${bottom - 26}" stroke="${C.crustDeep}" stroke-width="6" fill="none" opacity=".25" stroke-linecap="round"/>
  ${speck}
  <path d="${face}" fill="url(#${id}-crumb)"/>${holes}`;
}

function breadTop(r, id, x0, x1, top, base, { slashes = 5, dome = 1 } = {}) {
  const w = x1 - x0;
  const crust = `M${x0 - 6} ${base + 2} C${x0 + 20} ${base - 60 * dome} ${x0 + 130} ${top + 6} ${x0 + 300} ${top} L${x1 - 300} ${top - 6} C${x1 - 130} ${top} ${x1 - 16} ${base - 64 * dome} ${x1 + 6} ${base - 2} C${x1 - 20} ${base + 8} ${x1 - 50} ${base + 12} ${x1 - 90} ${base + 12} L${x0 + 90} ${base + 16} C${x0 + 50} ${base + 16} ${x0 + 14} ${base + 10} ${x0 - 6} ${base + 2} Z`;
  const face = `M${x0 + 20} ${base - 2} C${x0 + 60} ${base - 12} ${x0 + 120} ${base - 12} ${x0 + 200} ${base - 12} L${x1 - 200} ${base - 16} C${x1 - 110} ${base - 16} ${x1 - 50} ${base - 12} ${x1 - 16} ${base - 6} C${x1 - 30} ${base + 8} ${x1 - 60} ${base + 10} ${x1 - 90} ${base + 10} L${x0 + 70} ${base + 14} C${x0 + 44} ${base + 14} ${x0 + 26} ${base + 8} ${x0 + 20} ${base - 2} Z`;
  // Diagonal scoring with lifted "ears"
  let cuts = "";
  for (let i = 0; i < slashes; i++) {
    const t = (i + 0.5) / slashes;
    const cx = x0 + 120 + t * (w - 240);
    const edge = Math.abs(t - 0.5) * 2; // 0 middle → 1 ends
    const cy = top + 22 + edge * edge * 52 * dome;
    const len = between(r, 120, 150) * (1 - edge * 0.25), hw = 16;
    const rot = -14 + (t - 0.5) * 18;
    cuts += `<g transform="translate(${f(cx)} ${f(cy)}) rotate(${f(rot)})">
      <path d="M${-len / 2} 2 Q0 ${-hw * 1.6} ${len / 2} -2 Q0 ${hw * 0.9} ${-len / 2} 2Z" fill="#F7D293"/>
      <path d="M${-len / 2} 2 Q0 ${hw * 0.9} ${len / 2} -2 Q0 ${hw * 0.25} ${-len / 2} 2Z" fill="#E7A95C"/>
      <path d="M${-len / 2 + 4} 0 Q0 ${-hw * 1.55} ${len / 2 - 2} -3" stroke="${C.crustDeep}" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".55"/>
    </g>`;
  }
  let flour = "";
  for (let i = 0; i < w / 6; i++) {
    const x = between(r, x0 + 60, x1 - 60);
    const t = (x - x0) / w, edge = Math.abs(t - 0.5) * 2;
    const y = top + 10 + edge * edge * 60 * dome + between(r, 0, 40);
    flour += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(between(r, 0.6, 2.1))}" fill="#FFF4DD" opacity="${f(between(r, 0.25, 0.7))}"/>`;
  }
  const sheen = `M${x0 + 120} ${top + 26 + 30 * dome} C${x0 + 240} ${top + 6} ${x1 - 260} ${top + 2} ${x1 - 120} ${top + 22 + 30 * dome} C${x1 - 260} ${top + 18} ${x0 + 260} ${top + 22} ${x0 + 120} ${top + 26 + 30 * dome}Z`;
  return `<path d="${face}" fill="url(#${id}-crumb)"/>
  <path d="${crust}" fill="url(#${id}-crustTop)" ${INK}/>
  <path d="${sheen}" fill="url(#${id}-sheen)"/>
  ${cuts}${flour}`;
}

// ---------- fillings ----------
function lettuce(r, id, x0, x1, y, yb, opts) {
  const back = ruffle(r, x0, x1, y - 6, yb, { ...opts, amp: (opts?.amp ?? 10) * 1.2 });
  const front = ruffle(r, x0 + 12, x1 - 12, y + 4, yb + 2, opts);
  let veins = "";
  for (let x = x0 + 30; x < x1 - 20; x += between(r, 40, 70)) {
    veins += `<path d="M${f(x)} ${f(yb)} q${f(between(r, -6, 6))} ${f(-(yb - y) * 0.5)} ${f(between(r, -14, 14))} ${f(-(yb - y) * 0.9)}" stroke="#D8F08A" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>`;
  }
  return `<path d="${back}" fill="${C.leafLo}" ${INK}/><path d="${front}" fill="url(#${id}-leaf)" ${INK}/>${veins}`;
}

function tomatoes(r, id, x0, x1, y, { every = 150, rx = 62, ry = 15 } = {}) {
  let s = "";
  for (let x = x0 + rx * 0.7; x < x1 - rx * 0.5; x += every * between(r, 0.85, 1.1)) {
    const cy = y + between(r, -3, 3);
    s += `<g transform="rotate(${f(between(r, -4, 4))} ${f(x)} ${f(cy)})">
      <ellipse cx="${f(x)}" cy="${f(cy)}" rx="${rx}" ry="${ry}" fill="url(#${id}-tom)" ${INK}/>
      <ellipse cx="${f(x)}" cy="${f(cy - 2)}" rx="${rx - 9}" ry="${ry - 6}" fill="${C.tomFlesh}" opacity=".85"/>
      <ellipse cx="${f(x - rx * 0.35)}" cy="${f(cy - 2)}" rx="9" ry="3.2" fill="${C.seed}"/>
      <ellipse cx="${f(x + rx * 0.35)}" cy="${f(cy - 2)}" rx="9" ry="3.2" fill="${C.seed}"/>
      <ellipse cx="${f(x)}" cy="${f(cy - 6)}" rx="${rx * 0.5}" ry="2.2" fill="#FFE3D2" opacity=".55"/>
    </g>`;
  }
  return s;
}

function cheese(r, id, x0, x1, y, h, drips = 7) {
  let d = `M${x0 + 6} ${y + h} Q${x0 - 8} ${y + h / 2} ${x0 + 6} ${y}`;
  for (let x = x0; x < x1; x += 60) d += ` L${f(Math.min(x + 60, x1 - 6))} ${f(y + between(r, -3, 3))}`;
  d += ` Q${x1 + 8} ${y + h / 2} ${x1 - 6} ${y + h}`;
  const gap = (x1 - x0 - 80) / drips;
  const dripXs = Array.from({ length: drips }, (_, i) => x0 + 40 + gap * (i + 0.5) + between(r, -gap * 0.3, gap * 0.3)).sort((a, b) => b - a);
  let x = x1;
  for (const dx of dripXs) {
    const len = between(r, 14, 46), dw = between(r, 9, Math.min(17, gap * 0.3));
    d += ` L${f(dx + dw)} ${y + h} C${f(dx + dw)} ${f(y + h + len)} ${f(dx - dw)} ${f(y + h + len)} ${f(dx - dw)} ${y + h}`;
    x = dx - dw;
  }
  d += ` L${x0} ${y + h} Z`;
  return `<path d="${d}" fill="url(#${id}-cheese)" ${INK}/>
  <path d="M${x0 + 20} ${y + 4} L${x1 - 20} ${y + 3}" stroke="${C.cheeseHi}" stroke-width="3" opacity=".8" stroke-linecap="round"/>`;
}

// Pulled / shredded meat in a sticky glaze: a dark sauce bed, then strands.
function meat(r, x0, x1, y, h, { colors = C.meat, glossy = true } = {}) {
  let s = `<path d="${ruffle(r, x0, x1, y + 2, y + h, { amp: 8, step: 22, droop: 8 })}" fill="${C.sauce}" ${INK}/>`;
  const n = Math.round((x1 - x0) / 4.2);
  for (let i = 0; i < n; i++) {
    const x = between(r, x0 + 8, x1 - 30);
    const cy = y + between(r, 8, h - 4);
    const dx = between(r, 18, 46) * (r() < 0.5 ? -1 : 1), dy = between(r, -10, 10);
    s += `<path d="M${f(x)} ${f(cy)} q${f(dx / 2)} ${f(dy - between(r, -8, 8))} ${f(dx)} ${f(dy)}" stroke="${pick(r, colors)}" stroke-width="${f(between(r, 4.5, 10))}" stroke-linecap="round" fill="none"/>`;
  }
  if (glossy) {
    for (let i = 0; i < (x1 - x0) / 22; i++) {
      const x = between(r, x0 + 14, x1 - 30), cy = y + between(r, 10, h - 8);
      s += `<path d="M${f(x)} ${f(cy)} q${f(between(r, 5, 9))} ${f(between(r, -3, -1))} ${f(between(r, 10, 18))} ${f(between(r, -1, 1))}" stroke="${C.gloss}" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/>`;
    }
  }
  return s;
}

function shadow(id, cx, cy, rx, ry) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id}-shadow)"/>`;
}

// ---------- compositions ----------

// Long, overstuffed baguette in separable layers (hero + anatomy section).
function baguette(id = "bg", seed = 7, cls = "") {
  const r = rng(seed);
  const x0 = 70, x1 = 1130;
  return `<svg class="art art-baguette ${cls}" viewBox="0 0 1200 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a generously filled baguette">
${defs(id)}
<g class="layer layer-shadow">${shadow(id, 600, 500, 600, 36)}</g>
<g class="layer layer-bread-bottom">${breadBottom(r, id, x0 + 20, x1 - 20, 420, 486)}</g>
<g class="layer layer-leaf">${lettuce(r, id, x0 - 30, x1 + 30, 392, 420, { amp: 13, step: 34, droop: 26 })}</g>
<g class="layer layer-meat">${meat(r, x0 - 14, x1 + 12, 334, 70)}</g>
<g class="layer layer-cheese">${cheese(r, id, x0 + 6, x1 - 2, 322, 16, 10)}</g>
<g class="layer layer-tomato">${tomatoes(r, id, x0 - 6, x1 + 6, 312, { every: 136, rx: 60, ry: 18 })}</g>
<g class="layer layer-leaf-top">${lettuce(r, id, x0 - 8, x1 + 10, 286, 306, { amp: 10, step: 28, droop: 6 })}</g>
<g class="layer layer-bread-top">${breadTop(r, id, x0 + 10, x1 - 10, 146, 290, { dome: 0.85 })}</g>
</svg>`;
}


// Smooth irregular blob through jittered radial points.
function blob(r, cx, cy, rx, ry, n = 8, jit = 0.22) {
  const pts = [];
  const rot = between(r, 0, Math.PI * 2);
  for (let i = 0; i < n; i++) {
    const a = rot + (i / n) * Math.PI * 2;
    const k = 1 + between(r, -jit, jit);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  let m = mid(pts[n - 1], pts[0]);
  let d = `M${f(m[0])} ${f(m[1])}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = mid(pts[i], pts[(i + 1) % n]);
    d += ` Q${f(p[0])} ${f(p[1])} ${f(q[0])} ${f(q[1])}`;
  }
  return d + "Z";
}

function steam(paths) {
  return `<g class="steam" fill="none" stroke="#FFF7E8" stroke-width="7" stroke-linecap="round" opacity=".9">${paths
    .map((d, i) => `<path class="steam-${i + 1}" d="${d}" pathLength="1"/>`)
    .join("")}</g>`;
}

// BBQ chicken sub: soft roll, chunks of chicken, BBQ glaze. Nothing else is
// drawn in it, because nothing else is confirmed.
function sub(id = "sb", seed = 21, cls = "") {
  const r = rng(seed);
  let chunks = "";
  for (let i = 0; i < 64; i++) {
    const cx = between(r, 118, 782), arch = Math.sin(((cx - 110) / 680) * Math.PI);
    const cy = between(r, 232, 304) - arch * 30;
    const rx = between(r, 30, 52), ry = between(r, 13, 22);
    const tone = pick(r, ["#E2A869", "#D4914F", "#EDBE84", "#C77F40", "#B9692F"]);
    chunks += `<path d="${blob(r, cx, cy, rx, ry, 9, 0.32)}" fill="${tone}" ${INK} transform="rotate(${f(between(r, -18, 18))} ${f(cx)} ${f(cy)})"/>`;
    chunks += `<path d="M${f(cx - rx * 0.55)} ${f(cy + between(r, -4, 4))} q${f(rx * 0.5)} ${f(-4)} ${f(rx * 1.05)} ${f(between(r, -3, 3))}" stroke="#8C4A1C" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".5"/>`;
    if (r() < 0.5) chunks += `<path d="M${f(cx - rx * 0.6)} ${f(cy - ry * 0.4)} q${f(rx * 0.6)} ${f(-ry * 0.5)} ${f(rx * 1.2)} 0" stroke="#7A1F0C" stroke-width="${f(between(r, 5, 9))}" stroke-linecap="round" fill="none" opacity=".85"/>`;
  }
  // glaze drizzle
  let d = "M118 236";
  for (let x = 118; x < 782; x += 58) {
    const arch = Math.sin(((x + 29 - 110) / 680) * Math.PI) * 30;
    d += ` Q${x + 29} ${f(between(r, 206, 222) - arch)} ${x + 58} ${f(between(r, 236, 252) - arch)}`;
  }
  let drips = "";
  for (let i = 0; i < 9; i++) {
    const x = 150 + i * 72 + between(r, -10, 10), y = between(r, 296, 310), len = between(r, 18, 40);
    drips += `<path d="M${f(x - 7)} ${f(y)} C${f(x - 7)} ${f(y + len)} ${f(x + 7)} ${f(y + len)} ${f(x + 7)} ${f(y)}Z" fill="#7A1F0C" ${INK}/>`;
  }
  return `<svg class="art art-sub ${cls}" viewBox="0 0 900 520" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a BBQ chicken sub">
${defs(id)}
<g class="layer layer-shadow">${shadow(id, 450, 452, 400, 30)}</g>
<g class="layer layer-bread-bottom">${breadBottom(r, id, 90, 810, 330, 430)}</g>
<g class="layer layer-sauce-bed"><path d="${ruffle(r, 96, 804, 300, 336, { amp: 6, step: 30, droop: 14 })}" fill="#7A1F0C" ${INK}/>${drips}</g>
<g class="layer layer-meat">${chunks}</g>
<g class="layer layer-glaze"><path d="${d}" stroke="${C.ink}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#8E2711" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" stroke="#E0674A" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".8" transform="translate(-1 -2)"/></g>
<g class="layer layer-bread-top" transform="rotate(-7 450 180)">${breadTop(r, id, 96, 804, 40, 172, { slashes: 0, dome: 1.25 })}</g>
</svg>`;
}

function soup(id = "sp", seed = 33) {
  const r = rng(seed);
  let veg = "";
  const vegTones = ["#F08A24", "#F6A33A", "#7FAE34", "#F3E1B0", "#E35B2C"];
  for (let i = 0; i < 26; i++) {
    const a = between(r, 0, Math.PI * 2), k = Math.sqrt(r());
    const cx = 300 + Math.cos(a) * 150 * k, cy = 214 + Math.sin(a) * 34 * k;
    veg += `<path d="${blob(r, cx, cy, between(r, 9, 17), between(r, 5, 9), 6, 0.3)}" fill="${pick(r, vegTones)}" stroke="${C.ink}" stroke-width="2"/>`;
  }
  return `<svg class="art art-soup" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a mug of vegetable soup">
${defs(id)}
<linearGradient id="${id}-mug" x1="0" x2="1"><stop offset="0" stop-color="#E9DCC0"/><stop offset=".35" stop-color="#FBF4E4"/><stop offset="1" stop-color="#D9C7A2"/></linearGradient>
<radialGradient id="${id}-soup" cx=".45" cy=".4"><stop offset="0" stop-color="#F29A3C"/><stop offset="1" stop-color="#C9541C"/></radialGradient>
${shadow(id, 300, 540, 250, 26)}
<path d="M488 270 C590 266 600 420 470 430" stroke="${C.ink}" stroke-width="44" fill="none" stroke-linecap="round"/>
<path d="M488 270 C590 266 600 420 470 430" stroke="#F4EAD5" stroke-width="36" fill="none" stroke-linecap="round"/>
<path d="M110 214 L128 480 C132 520 180 540 300 540 C420 540 468 520 472 480 L490 214 Z" fill="url(#${id}-mug)" ${INK}/>
<path d="M128 480 C132 520 180 540 300 540 C420 540 468 520 472 480 L474 452 C440 478 380 486 300 486 C220 486 160 478 126 452Z" fill="#D7381E" opacity=".95"/>
<ellipse cx="300" cy="214" rx="190" ry="48" fill="#D7381E" ${INK}/>
<ellipse cx="300" cy="216" rx="172" ry="40" fill="url(#${id}-soup)" stroke="${C.ink}" stroke-width="2.4"/>
<g class="layer layer-veg">${veg}</g>
<path d="M180 300 C176 360 182 420 196 470" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".5" fill="none"/>
<text x="300" y="380" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="92" fill="#D7381E">S</text>
${steam(["M240 160 C210 120 270 100 240 60 C220 34 250 14 244 -4", "M300 150 C330 110 270 90 300 46 C320 18 290 0 300 -20", "M360 160 C390 124 330 104 360 64 C380 38 350 18 358 0"])}
</svg>`;
}

function jacket(id = "jk", seed = 44) {
  const r = rng(seed);
  let fluff = "";
  for (let i = 0; i < 70; i++) {
    const a = between(r, 0, Math.PI * 2), k = Math.sqrt(r());
    const cx = 300 + Math.cos(a) * 130 * k, cy = 300 + Math.sin(a) * 46 * k;
    fluff += `<path d="M${f(cx)} ${f(cy)} q${f(between(r, -8, 8))} ${f(between(r, -8, -2))} ${f(between(r, 4, 12))} ${f(between(r, -2, 3))}" stroke="#E9C77F" stroke-width="3" stroke-linecap="round" fill="none"/>`;
  }
  let pores = "";
  for (let i = 0; i < 40; i++) pores += `<circle cx="${f(between(r, 90, 510))}" cy="${f(between(r, 360, 450))}" r="${f(between(r, 1.4, 3.4))}" fill="#4F2A10" opacity=".4"/>`;
  return `<svg class="art art-jacket" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a jacket potato">
${defs(id)}
<linearGradient id="${id}-skin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C58A4E"/><stop offset="1" stop-color="#7A4419"/></linearGradient>
<radialGradient id="${id}-in" cx=".5" cy=".45"><stop offset="0" stop-color="#FFF4CC"/><stop offset="1" stop-color="#F3D687"/></radialGradient>
${shadow(id, 300, 500, 260, 30)}
<path d="M70 330 C60 240 170 230 300 236 C440 230 548 246 536 330 C528 430 440 486 300 486 C160 486 78 430 70 330Z" fill="url(#${id}-skin)" ${INK}/>
${pores}
<path d="M140 300 C150 220 230 200 300 230 C370 200 452 220 462 300 C440 360 380 370 300 360 C220 370 160 360 140 300Z" fill="url(#${id}-in)" ${INK}/>
${fluff}
<path d="M300 236 L300 352 M220 268 L380 330" stroke="#D9B266" stroke-width="5" stroke-linecap="round"/>
${steam(["M250 210 C220 170 280 150 250 110 C230 84 260 64 254 44", "M310 200 C340 160 280 140 310 96 C330 68 300 50 310 30", "M370 214 C400 178 340 158 370 118"])}
</svg>`;
}

// Cut sandwich standing on its edge, filling facing out.
function sandwich(id = "sw", seed = 55) {
  const r = rng(seed);
  const tri = (dy, fill) => `<path d="M90 ${430 + dy} L300 ${110 + dy} L510 ${430 + dy}Z" fill="${fill}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`;
  return `<svg class="art art-sandwich" viewBox="0 0 600 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a cut sandwich">
${defs(id)}
${shadow(id, 300, 500, 260, 26)}
<path d="M84 262 L330 112 L516 262Z" fill="#F7E6BE" stroke="#C9853F" stroke-width="16" stroke-linejoin="round"/>
<path d="M76 266 L330 104 L524 266Z" fill="none" ${INK}/>
<g fill="#E3C48C" opacity=".8"><circle cx="300" cy="200" r="3"/><circle cx="350" cy="180" r="2.4"/><circle cx="250" cy="236" r="2.6"/><circle cx="400" cy="232" r="2"/></g>
<g>
  <path d="M84 470 L84 404 L516 404 L516 470 C516 480 508 486 498 486 L102 486 C92 486 84 480 84 470Z" fill="#C9853F" ${INK}/>
  <path d="M96 414 L504 414 L504 474 L96 474Z" fill="#FBEFD2"/>
  <path d="${ruffle(r, 70, 530, 392, 410, { amp: 10, step: 30, droop: 10 })}" fill="url(#${id}-leaf)" ${INK}/>
  ${tomatoes(r, id, 80, 520, 384, { every: 120, rx: 54, ry: 14 })}
  <path d="${ruffle(r, 76, 524, 350, 380, { amp: 6, step: 40, droop: 6 })}" fill="#F2A7A0" ${INK}/>
  <path d="M90 352 C160 346 240 356 300 350 C370 344 440 352 510 348" stroke="#FFD4CF" stroke-width="4" fill="none" opacity=".8"/>
  ${cheese(r, id, 86, 514, 334, 14, 6)}
  <path d="M84 330 L84 268 C84 258 92 252 102 252 L498 252 C508 252 516 258 516 268 L516 330Z" fill="#C9853F" ${INK}/>
  <path d="M96 326 L96 264 L504 264 L504 326Z" fill="#FBEFD2"/>
</g>
</svg>`;
}

function salad(id = "sl", seed = 66) {
  const r = rng(seed);
  let leaves = "";
  for (let i = 0; i < 70; i++) {
    const cx = between(r, 130, 470), cy = 210 + (i / 70) * 300 + between(r, -20, 20);
    leaves += `<path d="${blob(r, cx, cy, between(r, 30, 52), between(r, 16, 28), 9, 0.35)}" fill="${pick(r, ["#7FAE34", "#9BC845", "#5E8D25", "#B9DB5C"])}" stroke="${C.ink}" stroke-width="2.4"/>`;
    if (r() < 0.3) leaves += `<circle cx="${f(cx + 12)}" cy="${f(cy - 6)}" r="${f(between(r, 14, 20))}" fill="${C.tom}" stroke="${C.ink}" stroke-width="2.4"/><circle cx="${f(cx + 8)}" cy="${f(cy - 11)}" r="4" fill="#FFB49E"/>`;
    if (r() < 0.25) leaves += `<ellipse cx="${f(cx - 10)}" cy="${f(cy + 6)}" rx="18" ry="16" fill="#D8EBA0" stroke="${C.ink}" stroke-width="2.4"/><ellipse cx="${f(cx - 10)}" cy="${f(cy + 6)}" rx="10" ry="8" fill="#EEF6CC"/>`;
  }
  return `<svg class="art art-salad" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a salad pot">
${defs(id)}
<clipPath id="${id}-tub"><path d="M120 200 L148 500 C150 520 170 530 190 530 L410 530 C430 530 450 520 452 500 L480 200Z"/></clipPath>
${shadow(id, 300, 540, 220, 24)}
<g clip-path="url(#${id}-tub)">${leaves}</g>
<path d="M120 200 L148 500 C150 520 170 530 190 530 L410 530 C430 530 450 520 452 500 L480 200Z" fill="#EAF4F6" fill-opacity=".22" ${INK}/>
<path d="M150 230 L170 490" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".6"/>
<rect x="104" y="170" width="392" height="38" rx="10" fill="#F4EAD5" ${INK}/>
<rect x="132" y="152" width="336" height="24" rx="8" fill="#E8DABA" ${INK}/>
</svg>`;
}

function cake(id = "ck", seed = 77) {
  const r = rng(seed);
  let crumbs = "";
  for (let i = 0; i < 40; i++) crumbs += `<circle cx="${f(between(r, 120, 480))}" cy="${f(between(r, 300, 470))}" r="${f(between(r, 1.5, 3.5))}" fill="#B9763A" opacity=".45"/>`;
  return `<svg class="art art-cake" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a slice of cake">
${defs(id)}
${shadow(id, 300, 520, 240, 24)}
<path d="M90 300 L470 220 L510 300 L510 480 L90 480Z" fill="#F0C27A" ${INK}/>
<path d="M90 300 L510 300 L510 480 L90 480Z" fill="#F5CF8C" ${INK}/>
${crumbs}
<path d="M90 372 L510 372 L510 398 L90 398Z" fill="#D7381E" ${INK}/>
<path d="M90 398 L510 398 L510 412 L90 412Z" fill="#FFF6E4"/>
<path d="M80 300 L470 212 L520 296 C520 330 506 330 500 312 C494 340 470 340 466 316 C460 346 430 344 428 318 C420 340 396 340 392 316 L80 316Z" fill="#FFF6E4" ${INK}/>
</svg>`;
}

function drink(id = "dr", seed = 88) {
  return `<svg class="art art-drink" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a cold drink">
${defs(id)}
<linearGradient id="${id}-can" x1="0" x2="1"><stop offset="0" stop-color="#A8240F"/><stop offset=".35" stop-color="#E34A2A"/><stop offset=".6" stop-color="#D7381E"/><stop offset="1" stop-color="#8E1C0B"/></linearGradient>
<linearGradient id="${id}-metal" x1="0" x2="1"><stop offset="0" stop-color="#9A9A92"/><stop offset=".4" stop-color="#EDEDE6"/><stop offset="1" stop-color="#8A8A82"/></linearGradient>
${shadow(id, 300, 540, 170, 22)}
<path d="M196 120 L404 120 L420 160 L420 470 L404 510 L196 510 L180 470 L180 160Z" fill="url(#${id}-can)" ${INK}/>
<path d="M196 120 L404 120 L420 160 L180 160Z" fill="url(#${id}-metal)" ${INK}/>
<path d="M180 470 L420 470 L404 510 L196 510Z" fill="url(#${id}-metal)" ${INK}/>
<ellipse cx="300" cy="120" rx="104" ry="14" fill="#D6D6CE" ${INK}/>
<rect x="180" y="250" width="240" height="110" fill="#F6ECD8"/>
<text x="300" y="330" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="84" fill="#D7381E">S</text>
<path d="M226 180 L230 450" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".45"/>
<g fill="#fff" opacity=".7"><circle cx="360" cy="200" r="5"/><circle cx="380" cy="420" r="4"/><circle cx="250" cy="400" r="3"/><circle cx="394" cy="232" r="3"/></g>
</svg>`;
}

const out = { baguette: baguette(), "baguette-build": baguette("bb", 7, "art-build"), sub: sub(), "sub-foot": sub("sf", 21, "art-foot"), soup: soup(), jacket: jacket(), sandwich: sandwich(), salad: salad(), cake: cake(), drink: drink() };

mkdirSync(join(root, "assets/img/art"), { recursive: true });
// Layered copies that only exist inline in index.html
const inlineOnly = new Set(["baguette-build", "sub-foot"]);
for (const [name, svg] of Object.entries(out)) {
  if (inlineOnly.has(name)) continue;
  const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  writeFileSync(join(root, `assets/img/art/${name}.svg`), svg.replace("<svg ", `<svg width="${w}" height="${h}" `));
}

const indexPath = join(root, "index.html");
let html;
try { html = readFileSync(indexPath, "utf8"); } catch { html = null; }
if (html) {
  for (const [name, svg] of Object.entries(out)) {
    const re = new RegExp(`(<!-- art:${name} -->)[\\s\\S]*?(<!-- /art:${name} -->)`, "g");
    html = html.replace(re, `$1${svg}$2`);
  }
  writeFileSync(indexPath, html);
}
console.log("art written:", Object.keys(out).join(", "));
