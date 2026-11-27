// node tools/og/shoot.mjs → assets/img/og.jpg and assets/img/icons/*.png
import { createRequire } from "node:module"; import { createServer } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs"; import { join, dirname, extname } from "node:path"; import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
const { chromium } = createRequire(import.meta.url)("playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const T = { ".html": "text/html", ".css": "text/css", ".json": "application/json", ".webp": "image/webp", ".woff2": "font/woff2" };
const srv = createServer((q, r) => { const p = join(root, decodeURIComponent(q.url.split("?")[0])); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": T[extname(p)] || "application/octet-stream" }); r.end(readFileSync(p)); }).listen(0);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 1200 } });
await p.goto(`http://localhost:${srv.address().port}/tools/og/card.html`); await p.waitForFunction(() => window.ready);
const icons = join(root, "assets/img/icons"); mkdirSync(icons, { recursive: true });
const tmp = join(root, "tools/og/out"); mkdirSync(tmp, { recursive: true });
await (await p.$("#card")).screenshot({ path: join(tmp, "og.png") });
await (await p.$("#icon")).screenshot({ path: join(tmp, "icon.png") });
await b.close(); srv.close();
execFileSync("python3", ["-I", "-c", `
from PIL import Image
Image.open(r"${join(tmp, "og.png")}").convert("RGB").save(r"${join(root, "assets/img/og.jpg")}", "JPEG", quality=86, optimize=True, progressive=True)
i = Image.open(r"${join(tmp, "icon.png")}").convert("RGB")
for s, n in [(180, "apple-touch-icon.png"), (32, "favicon-32.png"), (192, "icon-192.png"), (512, "icon-512.png")]:
    i.resize((s, s), Image.LANCZOS).save(r"${icons}/" + n, optimize=True)
i.resize((48, 48), Image.LANCZOS).save(r"${root}/favicon.ico", sizes=[(48, 48), (32, 32), (16, 16)])
`]);
console.log("og.jpg + icons written");
