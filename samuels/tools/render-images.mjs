// Renders the favicon PNGs and the social-sharing image with Playwright.
//   python3 -m http.server 8123   (from the repo root, in another terminal)
//   node samuels/tools/render-images.mjs
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

// Use a local Playwright if installed, otherwise the global one.
let chromium;
try { ({ chromium } = await import("playwright")); }
catch { ({ chromium } = createRequire(join(execSync("npm root -g").toString().trim(), "/"))("playwright")); }

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.BASE || "http://localhost:8123/samuels";
const browser = await chromium.launch();

for (const [size, name] of [[32, "favicon-32.png"], [180, "apple-touch-icon.png"], [512, "icon-512.png"]]) {
  const p = await browser.newPage({ viewport: { width: size, height: size } });
  await p.setContent(`<style>html,body{margin:0}</style><img src="${base}/assets/img/favicon.svg" width="${size}" height="${size}">`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: join(root, "assets/img", name), omitBackground: true });
  await p.close();
}

const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.goto(`${base}/tools/og.html`, { waitUntil: "networkidle" });
await og.evaluate(() => document.fonts.ready);
await og.screenshot({ path: join(root, "assets/img/og-image.jpg"), type: "jpeg", quality: 86 });
await browser.close();
console.log("images rendered");
