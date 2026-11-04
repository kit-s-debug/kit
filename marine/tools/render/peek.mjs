// quick look: node peek.mjs "scene=hero&e=-2&r=3" out.png
import { createRequire } from "node:module"; import { createServer } from "node:http"; import { readFileSync, existsSync } from "node:fs"; import { join, dirname, extname } from "node:path"; import { fileURLToPath } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright"); const here = dirname(fileURLToPath(import.meta.url));
const srv = createServer((q, r) => { const p = join(here, decodeURIComponent(q.url.split("?")[0])); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": extname(p) === ".html" ? "text/html" : "text/javascript" }); r.end(readFileSync(p)); }).listen(0);
const b = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 640, height: 360 } }); p.setDefaultTimeout(300000);
await p.goto(`http://localhost:${srv.address().port}/scenes.html?w=640&h=360&${process.argv[2]}`); await p.waitForFunction(() => window.ready);
await (await p.$("#out")).screenshot({ path: process.argv[3] }); await b.close(); srv.close();
