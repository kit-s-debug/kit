// Smoke test + screenshots:  node tools/check/check.mjs [outDir]
// Serves the site, loads it at desktop and phone sizes, fails on console
// errors, broken images, missing anchors or horizontal overflow.
import { createRequire } from "node:module";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = process.argv[2] || join(root, "tools", "check", "shots"); mkdirSync(out, { recursive: true });
const T = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".webp": "image/webp", ".woff2": "font/woff2", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json", ".txt": "text/plain" };
const srv = createServer((q, r) => {
  let p = join(root, decodeURIComponent(q.url.split("?")[0])); if (existsSync(p) && statSync(p).isDirectory()) p = join(p, "index.html");
  if (!existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": T[extname(p)] || "application/octet-stream" }); r.end(readFileSync(p));
}).listen(0);
const base = `http://localhost:${srv.address().port}/`;
const b = await chromium.launch();
let problems = 0;
for (const [name, opts] of [["desktop", { viewport: { width: 1440, height: 900 } }], ["laptop", { viewport: { width: 1180, height: 760 } }], ["tablet", { viewport: { width: 820, height: 1180 } }], ["phone", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }]]) {
  const ctx = await b.newContext(opts), p = await ctx.newPage();
  const errs = [];
  p.on("console", m => m.type() === "error" && errs.push(m.text()));
  p.on("pageerror", e => errs.push(e.message));
  p.on("requestfailed", r => errs.push("failed " + r.url()));
  p.on("response", r => r.status() >= 400 && errs.push(r.status() + " " + r.url()));
  await p.goto(base, { waitUntil: "load" });
  await p.waitForTimeout(4200);
  await p.screenshot({ path: join(out, `${name}-0-hero.png`) });
  const H = await p.evaluate(() => document.documentElement.scrollHeight), vh = opts.viewport.height;
  let i = 1;
  for (let y = vh * .9; y < H; y += vh * .9) {
    await p.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), y);
    await p.waitForTimeout(1300);
    await p.screenshot({ path: join(out, `${name}-${String(i++).padStart(2, "0")}.png`) });
  }
  const audit = await p.evaluate(vw => {
    const r = {};
    // innerWidth grows past the device width when a phone has to zoom out to fit something too wide
    r.overflow = Math.max(document.documentElement.scrollWidth, innerWidth) - vw;
    r.wide = [...document.querySelectorAll("body *")].filter(e => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 && getComputedStyle(e).position !== "fixed" && !e.closest(".contact__chart,.approach__soundings,.menu,.intro"); }).slice(0, 5).map(e => e.className || e.tagName);
    r.brokenImgs = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.loading !== "lazy").map(i => i.currentSrc || i.src);
    r.badAnchors = [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute("href")).filter(h => h.length > 1 && !document.querySelector(h));
    r.emptyLinks = [...document.querySelectorAll("a")].filter(a => !a.getAttribute("href")).length;
    return r;
  }, opts.viewport.width);
  console.log(name, JSON.stringify(audit), errs.length ? "\n  ERRORS: " + errs.join("\n  ") : "");
  if (audit.overflow > 0 || audit.brokenImgs.length || audit.badAnchors.length || errs.length) problems++;
  await ctx.close();
}
await b.close(); srv.close();
process.exit(problems ? 1 : 0);
