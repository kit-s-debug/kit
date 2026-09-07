/* Bundles the site into one self-contained HTML file with the CSS, JS, fonts
   and work previews inlined, for sharing a preview without a host.
   Run: node scripts/build-standalone.mjs  (npm run standalone does the build)
   Output: dist-standalone/ryder-designs.html

   It runs its own single-entry Vite build rather than reading dist/. The real
   build has two entries, the site and the privacy notice, so Rollup splits the
   shared code into its own chunk and there is no one file to inline. Forcing a
   single chunk here keeps this script to "read two files and swap some URLs"
   instead of resolving module graphs by hand.

   The file is written as a document fragment (no <html>/<head>/<body>) so it
   works both opened directly in a browser and pasted into a host that supplies
   its own document skeleton. */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "vite";

const root = new URL("..", import.meta.url).pathname;
const out = join(root, "dist-standalone");
const tmp = join(out, ".single");

await build({
  configFile: join(root, "vite.config.ts"),
  logLevel: "warn",
  build: {
    outDir: tmp,
    emptyOutDir: true,
    rollupOptions: {
      input: join(root, "index.html"),
      output: { codeSplitting: false, manualChunks: undefined },
    },
  },
});

const assets = join(tmp, "assets");
const MIME = { woff2: "font/woff2", jpg: "image/jpeg", png: "image/png", svg: "image/svg+xml", webm: "video/webm" };
const dataUri = (path) => `data:${MIME[path.split(".").pop()]};base64,${readFileSync(path).toString("base64")}`;

const only = (ext) => {
  const found = readdirSync(assets).filter((f) => f.endsWith(ext));
  if (found.length !== 1) throw new Error(`expected exactly one ${ext} in the single-entry build, got ${found.length}`);
  return readFileSync(join(assets, found[0]), "utf8");
};

let css = only(".css");
for (const font of readdirSync(join(tmp, "fonts"))) {
  css = css.replaceAll(`/fonts/${font}`, dataUri(join(tmp, "fonts", font)));
}

let js = only(".js");
/* Images and the case study recording both live in /work. */
for (const asset of readdirSync(join(tmp, "work"))) {
  js = js.replaceAll(`/work/${asset}`, dataUri(join(tmp, "work", asset)));
}
/* Neither the Eddie Rocks site nor the privacy notice is a single file, so
   neither can travel inside one. Say so rather than pretending. */
const external = ["/eddie-rocks/", "/privacy/"].filter((p) => js.includes(p));
if (external.length) {
  console.warn(`note: ${external.join(" and ")} need the deployed build, not this single file`);
}
/* A literal </script> anywhere in the bundle would end the tag early. */
js = js.replaceAll("</script", "<\\/script");

const html = `<title>Ryder Designs</title>
<style>${css}</style>
<div id="root"></div>
<script type="module">${js}</script>
`;

mkdirSync(out, { recursive: true });
const file = join(out, "ryder-designs.html");
writeFileSync(file, html);
console.log(`${file}  ${(html.length / 1e6).toFixed(2)} MB`);
