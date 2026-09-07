/* Bundles the built site into one self-contained HTML file with the CSS, JS,
   fonts and work previews inlined, for sharing a preview link without a host.
   Run `npm run build` first, then `node scripts/build-standalone.mjs`.
   Output: dist-standalone/ryder-designs.html

   The file is written as a document fragment (no <html>/<head>/<body>) so it
   works both opened directly in a browser and pasted into a host that supplies
   its own document skeleton. */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
const assets = join(dist, "assets");

const MIME = { woff2: "font/woff2", jpg: "image/jpeg", png: "image/png", svg: "image/svg+xml", webm: "video/webm" };
const dataUri = (path) => {
  const ext = path.split(".").pop();
  return `data:${MIME[ext]};base64,${readFileSync(path).toString("base64")}`;
};

const pick = (ext) => {
  const name = readdirSync(assets).find((f) => f.endsWith(ext));
  if (!name) throw new Error(`no ${ext} in dist/assets. Run npm run build first.`);
  return readFileSync(join(assets, name), "utf8");
};

let css = pick(".css");
for (const font of readdirSync(join(dist, "fonts"))) {
  css = css.replaceAll(`/fonts/${font}`, dataUri(join(dist, "fonts", font)));
}

let js = pick(".js");
/* Images and the case study recording both live in /work. */
for (const asset of readdirSync(join(dist, "work"))) {
  js = js.replaceAll(`/work/${asset}`, dataUri(join(dist, "work", asset)));
}
/* The Eddie Rocks site is a whole directory, so it cannot travel inside a
   single file. Say so rather than shipping a link that 404s. */
if (js.includes("/eddie-rocks/")) {
  console.warn("note: the 'View the live site' link needs the deployed build, not this single file");
}
/* A literal </script> anywhere in the bundle would end the tag early. */
js = js.replaceAll("</script", "<\\/script");

const html = `<title>Ryder Designs</title>
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;

mkdirSync(join(root, "dist-standalone"), { recursive: true });
const out = join(root, "dist-standalone", "ryder-designs.html");
writeFileSync(out, html);
console.log(`${out}  ${(html.length / 1e6).toFixed(2)} MB`);
