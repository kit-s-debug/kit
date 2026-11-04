// Renders the stand-in stills into ../../assets/img/photos/
//   node tools/render/shoot.mjs [scene,...] [--preview]
// Serves this folder itself, so no separate server is needed.
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join, extname } from "node:path";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";

const { chromium } = createRequire(import.meta.url)("playwright");
const here = dirname(fileURLToPath(import.meta.url));
const raw = join(here, "out");
mkdirSync(raw, { recursive: true });
const args = process.argv.slice(2), preview = args.includes("--preview");
const only = args.find(a => !a.startsWith("--"))?.split(",");

// scene → [ [suffix, w, h], ... ]
const JOBS = {
  hero: [["wide", 2560, 1440], ["tall", 1080, 1800]],
  break: [["wide", 2560, 1280], ["tall", 1080, 1600]],
  hull: [["wide", 2000, 1400]],
  teak: [["wide", 1800, 2200]],
  cleat: [["wide", 2000, 1400]],
  planks: [["wide", 2000, 1400]],
};
const types = { ".html": "text/html", ".js": "text/javascript" };
const srv = createServer((q, r) => {
  const p = join(here, decodeURIComponent(q.url.split("?")[0]));
  if (!existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { "content-type": types[extname(p)] || "application/octet-stream" }); r.end(readFileSync(p));
}).listen(0);
const port = srv.address().port;
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
for (const [scene, sizes] of Object.entries(JOBS)) {
  if (only && !only.includes(scene)) continue;
  for (const [kind, w0, h0] of sizes) {
    const s = preview ? .4 : 1, w = Math.round(w0 * s), h = Math.round(h0 * s);
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on("console", m => m.type() === "error" && console.log(scene, m.text()));
    p.on("pageerror", e => console.log(scene, e.message));
    p.setDefaultTimeout(600000);
    await p.goto(`http://localhost:${port}/scenes.html?scene=${scene}&w=${w}&h=${h}`);
    await p.waitForFunction(() => window.ready);
    const png = join(raw, `${scene}-${kind}.png`);
    await (await p.$("#out")).screenshot({ path: png });
    console.log("rendered", scene, kind, w, h);
    await p.close();
  }
}
await b.close(); srv.close();
if (!preview) execFileSync("python3", ["-I", join(here, "..", "photos.py"), raw, join(here, "..", "..", "assets", "img", "photos")], { stdio: "inherit" });
