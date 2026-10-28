// Renders, from the live 3D scene:
//   assets/img/og.jpg        social share card (1200x630)
//   assets/img/poster.webp   still of the chrysalis, shown when WebGL is unavailable
//   assets/img/apple-touch-icon.png
// Serve the site first (npm run serve), then: node tools/render-og.mjs [url]
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const { chromium } = createRequire(import.meta.url)("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const img = join(here, "..", "assets", "img");
const url = process.argv[2] || "http://localhost:8000/";

const browser = await chromium.launch();

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(url, { waitUntil: "networkidle" });
await og.addStyleTag({ content: ".nav,.thread,.hero__copy,.hero__hint,.hero__award,.cursor{display:none!important}" });
await og.waitForTimeout(4500);
await og.screenshot({ path: join(img, "og.jpg"), type: "jpeg", quality: 86 });
await og.close();

// the chrysalis alone on black (the page blends it in with mix-blend-mode: screen)
const poster = await browser.newPage({ viewport: { width: 900, height: 1100 }, deviceScaleFactor: 1 });
await poster.goto(url, { waitUntil: "networkidle" });
await poster.addStyleTag({ content: "html,body{background:#000!important}.atmos,.backword,.grain,.nav,.thread,.cursor{display:none!important}main,.foot{visibility:hidden!important}" });
await poster.waitForTimeout(4500);
const png = join(img, "poster.png");
await poster.screenshot({ path: png });
await poster.close();
execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", png, "-c:v", "libwebp", "-quality", "82", "-lossless", "0", join(img, "poster.webp")]);
execFileSync("rm", [png]);

const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
await icon.goto("file://" + join(img, "favicon.svg"));
await icon.screenshot({ path: join(img, "apple-touch-icon.png") });

await browser.close();
console.log("rendered og.jpg, poster.webp, apple-touch-icon.png");
