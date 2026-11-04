// Renders the 3D salon at each tour stop into assets/img/stills/
//   stop-N-wide.webp (1600x900) and stop-N-tall.webp (750x1334)
// These are the first paint while the 3D loads, and the whole tour for
// visitors without WebGL or with reduced motion. Also writes og.jpg.
//
//   python3 -m http.server 8077   (from snippers/)
//   node tools/stills/shoot.mjs [stopIndex,...]
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const { chromium } = createRequire(import.meta.url)("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "..", "..", "assets", "img", "stills");
const tmp = join(here, "..", "..", "photos", "stills");
mkdirSync(out, { recursive: true }); mkdirSync(tmp, { recursive: true });
const only = process.argv[2] ? process.argv[2].split(",").map(Number) : null;

const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const [kind, w, h] of [["wide", 1600, 900], ["tall", 750, 1334]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.setDefaultTimeout(240000);
  await p.goto("http://localhost:8077/tools/stills/view.html?q=high");
  await p.waitForFunction(() => window.ready);
  const n = await p.evaluate(() => window.salon.stations);
  for (let i = 0; i < n; i++) {
    if (only && !only.includes(i)) continue;
    await p.evaluate(i => window.show(i), i);
    const png = join(tmp, `stop-${i}-${kind}.png`);
    await p.screenshot({ path: png });
    execFileSync("python3", ["-I", "-c", `from PIL import Image; Image.open(r"${png}").convert("RGB").save(r"${join(out, `stop-${i}-${kind}.webp`)}", "WEBP", quality=76, method=6)`]);
    console.log(kind, i);
  }
  await p.close();
}
await b.close();
