// Builds /index.html from src/index.html + src/site.config.json.
//   node tools/build.mjs
// No dependencies. Re-run after changing the brand name, contact details,
// photos or any copy in the template.
import { readFileSync, writeFileSync, readdirSync, existsSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(readFileSync(join(root, "src/site.config.json"), "utf8"));
let html = readFileSync(join(root, "src/index.html"), "utf8");
const photoDir = join(root, "assets/img/photos");
const photoFiles = existsSync(photoDir) ? readdirSync(photoDir) : [];

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const get = path => path.split(".").reduce((o, k) => (o == null ? o : o[k]), cfg);
const fail = msg => { console.error("build: " + msg); process.exit(1); };

// ---------- image helpers ----------
function webpSize(file) {
  const b = readFileSync(file);
  const chunk = b.toString("ascii", 12, 16);
  if (chunk === "VP8 ") return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (chunk === "VP8L") { const n = b.readUInt32LE(21); return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1]; }
  if (chunk === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  fail("unrecognised webp " + file);
}
function set(name) {
  const re = new RegExp("^" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "-(\\d+)\\.webp$");
  const list = photoFiles.map(f => [f, re.exec(f)]).filter(([, m]) => m).map(([f, m]) => [f, +m[1]]).sort((a, b) => a[1] - b[1]);
  if (!list.length) fail(`no files for photo set "${name}" in assets/img/photos (expected ${name}-<width>.webp)`);
  const [w, h] = webpSize(join(photoDir, list[list.length - 1][0]));
  return { srcset: list.map(([f, w]) => `assets/img/photos/${f} ${w}w`).join(", "), src: `assets/img/photos/${list.find(([, w]) => w >= 1440)?.[0] || list[list.length - 1][0]}`, w, h };
}
function picture(slot, sizes, eager) {
  const p = cfg.photos[slot]; if (!p) fail(`unknown photo slot "${slot}"`);
  const main = set(p.file), tall = p.tall ? set(p.tall) : null;
  const style = `--focus:${p.focus || "50% 50%"}${tall ? `;--focus-tall:${p.tallFocus || p.focus || "50% 50%"}` : ""}`;
  const load = eager ? `fetchpriority="high" decoding="async"` : `loading="lazy" decoding="async"`;
  return `<picture class="pic${tall ? " pic--tall" : ""}" style="${style}">` +
    (tall ? `<source media="(orientation: portrait) and (max-width: 820px)" srcset="${tall.srcset}" sizes="${sizes}" width="${tall.w}" height="${tall.h}">` : "") +
    `<source srcset="${main.srcset}" sizes="${sizes}" width="${main.w}" height="${main.h}">` +
    `<img src="${main.src}" alt="${esc(p.alt)}" width="${main.w}" height="${main.h}" ${load}></picture>`;
}

// ---------- deterministic random for generated chart art ----------
let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const f1 = n => Math.round(n * 10) / 10;

// a closed, organic contour: r(θ) = R + Σ a·sin(kθ + φ)
function blob(cx, cy, R, harm, offset = 0, sx = 1, sy = 1) {
  const pts = [];
  for (let i = 0; i < 72; i++) {
    const t = (i / 72) * Math.PI * 2;
    let r = R + offset; for (const [k, a, ph] of harm) r += a * Math.sin(k * t + ph) * (1 + offset / R * .3);
    pts.push([cx + Math.cos(t) * r * sx, cy + Math.sin(t) * r * sy]);
  }
  // Catmull-Rom → cubic Bézier
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[(i - 1 + pts.length) % pts.length], p1 = pts[i], p2 = pts[(i + 1) % pts.length], p3 = pts[(i + 2) % pts.length];
    d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d + "Z";
}
const harmonics = n => Array.from({ length: n }, (_, i) => [i + 2, (rnd() * 18) / (i + 1), rnd() * 6.28]);

function compassRose(cx, cy, r) {
  let s = `<g class="rose" transform="translate(${cx} ${cy})"><circle r="${r}"/><circle r="${r * .82}"/>`;
  for (let i = 0; i < 72; i++) {
    const a = (i / 72) * Math.PI * 2, l = i % 18 === 0 ? r * .3 : i % 6 === 0 ? r * .14 : r * .07;
    s += `<line x1="${f1(Math.sin(a) * r)}" y1="${f1(-Math.cos(a) * r)}" x2="${f1(Math.sin(a) * (r - l))}" y2="${f1(-Math.cos(a) * (r - l))}"/>`;
  }
  const k = r * .62, w = r * .09;
  s += `<path class="rose__star" d="M0 ${-k}L${w} ${-w}L${k} 0L${w} ${w}L0 ${k}L${-w} ${w}L${-k} 0L${-w} ${-w}Z"/>`;
  s += `<path class="rose__n" d="M0 ${-k}L${w} ${-w}L0 0Z"/><text y="${-r - 8}" text-anchor="middle">N</text></g>`;
  return s;
}

function chart() {
  seed = 23;
  const W = 600, H = 750, h = harmonics(5);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustrated sea chart with a plotted course between waypoints">`;
  s += `<rect width="${W}" height="${H}" class="chart__sea"/>`;
  // graticule
  s += `<g class="chart__grid">`;
  for (let x = 60; x < W; x += 80) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 55; y < H; y += 80) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
  s += `</g>`;
  // land and depth contours
  s += `<g class="chart__depth">`;
  for (const off of [150, 110, 76, 46, 22]) s += `<path d="${blob(470, 150, 150, h, off, 1.1, .9)}" ${off > 100 ? 'class="dashed"' : ""}/>`;
  s += `</g><path class="chart__land" d="${blob(470, 150, 150, h, 0, 1.1, .9)}"/>`;
  s += `<g class="chart__depth">`;
  for (const off of [70, 40, 16]) s += `<path d="${blob(90, 640, 70, harmonics(4), off)}"/>`;
  s += `</g><path class="chart__land" d="${blob(90, 640, 70, harmonics(4), 0)}"/>`;
  // soundings
  s += `<g class="chart__soundings">`;
  for (let i = 0; i < 44; i++) {
    const x = 30 + rnd() * (W - 60), y = 30 + rnd() * (H - 60);
    if (Math.hypot((x - 470) / 1.1, (y - 150) / .9) < 260 && rnd() < .7) continue;
    const d = Math.floor(4 + rnd() * 38), sub = rnd() < .35 ? `<tspan dy="3" font-size="7">${Math.floor(rnd() * 9) + 1}</tspan>` : "";
    s += `<text x="${f1(x)}" y="${f1(y)}">${d}${sub}</text>`;
  }
  s += `</g>`;
  s += compassRose(150, 300, 62);
  // the plotted course
  const route = "M120 690 C 170 610 240 560 260 500 S 300 390 360 360 S 420 330 330 250 S 260 120 140 70";
  s += `<path class="chart__route-ghost" d="${route}"/><path class="chart__route" d="${route}" pathLength="1"/>`;
  for (const [x, y] of [[120, 690], [260, 500], [360, 360], [330, 250]]) s += `<g class="chart__wp" transform="translate(${x} ${y})"><circle r="6"/><circle r="2"/></g>`;
  s += `<g class="chart__vessel" transform="translate(140 70) rotate(-62)"><path d="M0 -11 L5 6 L0 3 L-5 6 Z"/></g>`;
  s += `<text class="chart__note" x="${W - 30}" y="${H - 30}" text-anchor="end">Course plotted · Illustrative</text>`;
  // neatline: the alternating border scale on a printed chart
  s += `<g class="chart__neat"><rect x="12" y="12" width="${W - 24}" height="${H - 24}"/>`;
  for (let x = 12, i = 0; x < W - 12; x += 24, i++) if (i % 2) s += `<rect class="f" x="${x}" y="12" width="24" height="5"/><rect class="f" x="${x}" y="${H - 17}" width="24" height="5"/>`;
  for (let y = 12, i = 0; y < H - 12; y += 24, i++) if (i % 2) s += `<rect class="f" x="12" y="${y}" width="5" height="24"/><rect class="f" x="${W - 17}" y="${y}" width="5" height="24"/>`;
  s += `</g></svg>`;
  return s;
}

function contours() {
  seed = 5;
  const h = harmonics(6), h2 = harmonics(5);
  let s = `<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">`;
  for (let i = 0; i < 14; i++) s += `<path d="${blob(1350, 820, 60, h, i * 46, 1.3, 1)}"/>`;
  for (let i = 0; i < 8; i++) s += `<path d="${blob(160, 120, 40, h2, i * 40, 1.2, 1)}"/>`;
  return s + `</svg>`;
}

function soundings() {
  seed = 41;
  let s = "";
  for (let i = 0; i < 46; i++) {
    const d = Math.floor(6 + rnd() * 60), sub = rnd() < .3 ? `<sub>${Math.floor(rnd() * 9) + 1}</sub>` : "";
    s += `<span style="left:${f1(rnd() * 100)}%;top:${f1(rnd() * 100)}%">${d}${sub}</span>`;
  }
  return s;
}

const ICONS = {
  wa: `<svg viewBox="0 0 24 24"><path d="M4.2 19.8l1.1-3.9A8.3 8.3 0 1 1 8.4 19l-4.2.8z"/><path d="M9.1 8.2c.2-.4.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c-.1.1-.1.3 0 .5.6 1 1.4 1.8 2.4 2.4.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.6v.5c0 .4-.2.7-.5.9-.6.4-1.4.6-2.2.4-2.6-.7-4.7-2.8-5.4-5.4-.2-.8 0-1.6.5-2.2z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24"><path d="M6.6 3.5h2.6l1.3 4.2-1.9 1.3a10.6 10.6 0 0 0 6.4 6.4l1.3-1.9 4.2 1.3v2.6c0 1.2-1 2.1-2.2 2.1A15.9 15.9 0 0 1 4.5 5.7c0-1.2.9-2.2 2.1-2.2z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M3.6 6.6l8.4 6.6 8.4-6.6"/></svg>`,
  loupe: `<svg viewBox="0 0 48 48"><circle cx="21" cy="21" r="12" pathLength="1"/><path d="M30 30l11 11" pathLength="1"/><path d="M21 15v12M15 21h12" pathLength="1"/></svg>`,
  compass: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" pathLength="1"/><path d="M24 11l3.5 13L24 37l-3.5-13z" pathLength="1"/><path d="M24 3v4M24 41v4M3 24h4M41 24h4" pathLength="1"/></svg>`,
  grain: `<svg viewBox="0 0 48 48"><rect x="6" y="9" width="36" height="30" rx="2" pathLength="1"/><path d="M6 18c8 0 10-4 18-4s10 4 18 4M6 27c8 0 12 4 18 0s10-4 18 0M12 39c4-5 8-6 14-6s10 2 14 6" pathLength="1"/></svg>`,
  helm: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="12" pathLength="1"/><circle cx="24" cy="24" r="3.5" pathLength="1"/><path d="M24 4v16.5M24 27.5V44M4 24h16.5M27.5 24H44M9.9 9.9l11.6 11.6M26.5 26.5l11.6 11.6M38.1 9.9L26.5 21.5M21.5 26.5L9.9 38.1" pathLength="1"/></svg>`,
};

// ---------- wordmark: each letter rises from behind a waterline ----------
const wordmark = `<span class="wordmark"><span class="wordmark__name" aria-hidden="true">${[...cfg.brand.name].map((c, i) => `<span style="--i:${i}">${esc(c)}</span>`).join("")}</span>` +
  `<span class="wordmark__line" aria-hidden="true"></span><span class="wordmark__desc" aria-hidden="true">${esc(cfg.brand.descriptor)}</span>` +
  `<span class="sr-only">${esc(cfg.brand.legalName)}</span></span>`;

// ---------- metadata ----------
const url = (cfg.site.url || "").replace(/\/$/, "");
const abs = p => (url ? `${url}/${p}` : p);
const title = `${cfg.brand.legalName} | Premium Marine Care, Detailing & Specialist Services`;
const desc = `${cfg.brand.tagline} Exterior care, marine woodworking, interior finishing, captain services and help buying or selling a boat.`;
const meta = [
  url && `<link rel="canonical" href="${url}/">`,
  `<meta property="og:type" content="website">`,
  `<meta property="og:site_name" content="${esc(cfg.brand.legalName)}">`,
  `<meta property="og:title" content="${esc(title)}">`,
  `<meta property="og:description" content="${esc(desc)}">`,
  url && `<meta property="og:url" content="${url}/">`,
  `<meta property="og:image" content="${abs("assets/img/og.jpg")}">`,
  `<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">`,
  `<meta property="og:image:alt" content="${esc(cfg.brand.legalName)}: Exceptional care for exceptional vessels">`,
  `<meta property="og:locale" content="${cfg.site.locale}">`,
  `<meta name="twitter:card" content="summary_large_image">`,
].filter(Boolean).join("\n");

const services = ["Professional Boat Washing", "Antifouling", "Hull Polishing", "Deck Polishing", "Marine Woodworking", "Wood Restoration", "Marine Varnishing", "Interior Cleaning", "Stainless Steel Polishing", "Professional Captain Services", "Boat Buying & Selling Assistance"];
const jsonld = JSON.stringify({
  "@context": "https://schema.org", "@type": "ProfessionalService",
  name: cfg.brand.legalName, description: desc, ...(url && { url: url + "/", image: abs("assets/img/og.jpg") }),
  telephone: cfg.contact.phoneE164, email: cfg.contact.email,
  ...(cfg.brand.areas && { areaServed: cfg.brand.areas.map(name => ({ "@type": "Country", name })) }),
  hasOfferCatalog: { "@type": "OfferCatalog", name: "Marine services", itemListElement: services.map(n => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })) },
}).replace(/</g, "\\u003c");

const hero = cfg.photos.hero, heroSet = set(hero.file), heroTall = hero.tall && set(hero.tall);
const preloadHero = [
  `<link rel="preload" as="image" imagesrcset="${heroSet.srcset}" imagesizes="100vw" fetchpriority="high"${heroTall ? ` media="not ((orientation: portrait) and (max-width: 820px))"` : ""}>`,
  heroTall && `<link rel="preload" as="image" imagesrcset="${heroTall.srcset}" imagesizes="100vw" fetchpriority="high" media="(orientation: portrait) and (max-width: 820px)">`,
].filter(Boolean).join("\n");

const clientConfig = JSON.stringify({ brand: cfg.brand.legalName, contact: cfg.contact, form: cfg.form }).replace(/</g, "\\u003c");
const version = createHash("sha1").update(readFileSync(join(root, "css/marine.css"))).update(readFileSync(join(root, "js/main.js"))).digest("hex").slice(0, 8);

// ---------- fill tokens (simple values first, so they can nest inside {{wa:...}}) ----------
const emblem = cfg.brand.emblem ? (() => {
  const [w, h] = webpSize(join(root, cfg.brand.emblem));
  return `<img class="emblem" src="${cfg.brand.emblem}" alt="" width="${w}" height="${h}" decoding="async">`;
})() : "";
const brandImg = (key, cls, alt = "") => cfg.brand[key] ? (() => {
  const [w, h] = webpSize(join(root, cfg.brand[key]));
  return `<img class="${cls}" src="${cfg.brand[key]}" alt="${esc(alt)}" width="${w}" height="${h}" decoding="async">`;
})() : "";
const seal = brandImg("seal", "seal");
const lockup = brandImg("lockup", "lockup", `${cfg.brand.legalName}, ${(cfg.brand.areas || []).join(" and ")}`);
const simple = { meta, jsonld, preloadHero, clientConfig, version, wordmark, emblem, seal, lockup, year: String(new Date().getFullYear()),
  chart: chart(), contours: contours(), soundings: soundings(), mailSubject: encodeURIComponent(`Enquiry for ${cfg.brand.legalName}`) };
html = html.replace(/<!--\s*SOURCE TEMPLATE[\s\S]*?-->\n/, "<!-- Built from src/index.html by tools/build.mjs. Edit the source, not this file. -->\n");
html = html.replace(/\{\{([a-zA-Z][\w.]*)\}\}/g, (m, k) => {
  if (k in simple) return simple[k];
  const v = get(k); if (v == null) fail(`unknown token ${m}`); return esc(v);
});
html = html.replace(/\{\{wa:(.*?)\}\}/g, (m, text) => `https://wa.me/${cfg.contact.whatsapp}?text=${encodeURIComponent(text.replace(/&amp;/g, "&"))}`);
html = html.replace(/\{\{icon:(\w+)\}\}/g, (m, k) => ICONS[k] || fail(`unknown icon ${k}`));
html = html.replace(/\{\{picture:(\w+):(.+?)(:eager)?\}\}/g, (m, slot, sizes, eager) => picture(slot, sizes, !!eager));
const left = html.match(/\{\{[^}]*\}\}/); if (left) fail(`unfilled token ${left[0]}`);
writeFileSync(join(root, "index.html"), html);

// ---------- robots & sitemap ----------
writeFileSync(join(root, "robots.txt"), `User-agent: *\nAllow: /\n${url ? `Sitemap: ${url}/sitemap.xml\n` : ""}`);
if (url) writeFileSync(join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}/</loc></url></urlset>\n`);
else if (existsSync(join(root, "sitemap.xml"))) rmSync(join(root, "sitemap.xml"));
console.log(`built index.html (${(html.length / 1024).toFixed(1)} kB) for ${cfg.brand.legalName}`);
