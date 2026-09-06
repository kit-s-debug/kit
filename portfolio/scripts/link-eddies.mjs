/* Copies the Eddie Rocks site from the repo root into public/eddie-rocks so the
   case study's "View the live site" link goes to the real thing rather than a
   dead button. Runs before dev and before build; the copy is gitignored, so the
   site is never duplicated in version control. */
import { cpSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../..", import.meta.url).pathname;
const out = new URL("../public/eddie-rocks/", import.meta.url).pathname;

const parts = ["index.html", "labrinth.html", "css", "js", "assets"];
const missing = parts.filter((p) => !existsSync(join(root, p)));
if (missing.length) {
  console.warn(`skipping eddie-rocks copy, not found: ${missing.join(", ")}`);
  process.exit(0);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const p of parts) cpSync(join(root, p), join(out, p), { recursive: true });
console.log("eddie-rocks copied to public/");
