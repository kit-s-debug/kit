// Turns js/products.js into a Shopify product import CSV, for when Bambo moves
// from click & collect to delivery. Run from the bambo/ folder:
//
//   node tools/shopify-export.mjs https://your-live-site.example > shopify-products.csv
//
// The URL is where the site is hosted, so Shopify can fetch the product photos.
// Each flavour (and strength, for nic salts) becomes a variant. Products with
// no shelf price are exported as drafts so nothing goes live at £0.
import { readFileSync } from "node:fs";
import vm from "node:vm";

const base = (process.argv[2] || "").replace(/\/$/, "");
const ctx = { window: {} };
vm.runInNewContext(readFileSync(new URL("../js/products.js", import.meta.url), "utf8"), ctx);
const { BAMBO_PRODUCTS: products, BAMBO_CATEGORIES: cats } = ctx.window;
const catLabel = (id) => (cats.find((c) => c.id === id) || {}).label || "";

const cols = ["Handle", "Title", "Body (HTML)", "Vendor", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value",
  "Variant SKU", "Variant Price", "Variant Requires Shipping", "Variant Taxable",
  "Variant Inventory Policy", "Image Src", "Image Alt Text", "Status"];
const q = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const rows = [cols.map(q).join(",")];

for (const p of products) {
  const flavours = p.flavours?.length ? p.flavours : [""];
  const strengths = p.strengths?.length ? p.strengths : [""];
  const body = `<p>${p.desc}</p><ul>${p.specs.map((s) => `<li>${s}</li>`).join("")}</ul>` +
    (p.nicotine ? "<p><strong>This product contains nicotine which is a highly addictive substance.</strong></p>" : "");
  const live = p.price != null;
  let first = true;
  for (const f of flavours) for (const s of strengths) {
    rows.push([
      p.id,
      first ? p.name : "", first ? body : "", first ? (p.brand || "") : "", first ? catLabel(p.cat) : "",
      first ? [catLabel(p.cat), p.nicotine ? "18+" : "", p.badge || ""].filter(Boolean).join(", ") : "",
      first ? String(live) : "",
      first ? (f ? "Flavour" : (s ? "Strength" : "Title")) : "", f || s || "Default Title",
      first && f && s ? "Strength" : "", f && s ? s : "",
      [p.id, f, s].filter(Boolean).join("-").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      live ? p.price.toFixed(2) : "",
      "TRUE", "TRUE", "deny",
      first && base ? `${base}/${p.img}` : "", first ? `${p.name} at Bambo` : "",
      first ? (live ? "active" : "draft") : "",
    ].map(q).join(","));
    first = false;
  }
}
process.stdout.write(rows.join("\n") + "\n");
