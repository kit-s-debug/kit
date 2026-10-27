// Renders assets/img/og.jpg (social share card) and the apple touch icon.
//   node tools/render-og.mjs
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto("file://" + join(here, "og.html"));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(here, "..", "assets", "img", "og.jpg"), type: "jpeg", quality: 85 });
const icon = await browser.newPage({ viewport: { width: 180, height: 180 } });
await icon.goto("file://" + join(here, "..", "assets", "img", "favicon.svg"));
await icon.screenshot({ path: join(here, "..", "assets", "img", "apple-touch-icon.png") });
await browser.close();
console.log("rendered og.jpg + apple-touch-icon.png");
