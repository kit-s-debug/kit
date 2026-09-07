import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/* One place to change the domain. Set VITE_SITE_URL on the host and the
   canonical link, the Open Graph tags, the schema record, robots.txt and the
   sitemap all follow. They used to be five hardcoded copies, which is five
   chances to hand a crawler the wrong host. */
function siteUrl(url: string): Plugin {
  const base = url.replace(/\/+$/, "");
  const pages = ["/", "/privacy/"];
  return {
    name: "site-url",
    transformIndexHtml: (html) => html.replaceAll("%SITE_URL%", base),
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`,
      });
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          pages.map((p) => `  <url><loc>${base}${p}</loc><changefreq>monthly</changefreq></url>`).join("\n") +
          "\n</urlset>\n",
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), siteUrl(process.env.VITE_SITE_URL || "https://ryder-designs.co.uk")],
  build: {
    target: "es2020",
    cssMinify: "lightningcss",
    /* Two entries: the site, and the privacy notice. The notice lives at
       privacy/index.html rather than privacy.html so the built path is
       /privacy/, which every static host serves without a rewrite rule. */
    rollupOptions: { input: { main: "index.html", privacy: "privacy/index.html" } },
  },
});
