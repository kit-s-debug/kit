/**
 * Fails the build while the stand-in artwork is still in place.
 *
 * Each generated placeholder records its own hash in PLACEHOLDERS.json. When
 * Lyndsay's real photograph replaces a file, its hash changes and its entry
 * stops matching — so the check passes automatically once real files land,
 * with no code edit needed. Delete the whole file once every image is real.
 */
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "images");
const manifestPath = path.join(dir, "PLACEHOLDERS.json");

let manifest;
try {
  manifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch {
  console.log("✓ assets: no placeholder manifest — all images are real.");
  process.exit(0);
}

const strict = process.argv.includes("--strict");
const stillPlaceholder = [];

for (const [rel, expected] of Object.entries(manifest.files)) {
  try {
    const buf = await readFile(path.join(process.cwd(), "public", rel));
    const hash = createHash("sha256").update(buf).digest("hex").slice(0, 16);
    if (hash === expected) stillPlaceholder.push(rel);
  } catch {
    stillPlaceholder.push(`${rel} (missing)`);
  }
}

if (stillPlaceholder.length === 0) {
  console.log("✓ assets: every image has been replaced with a real file.");
  process.exit(0);
}

console.log("⚠ assets: still using stand-in artwork, not photographs:");
for (const rel of stillPlaceholder) console.log(`    ${rel}`);
console.log("  Replace these with Lyndsay's real files before launch (see README).");
console.log("  Then delete public/images/PLACEHOLDERS.json.");
// Advisory by default so the site can be developed; --strict for a release gate.
process.exit(strict ? 1 : 0);
