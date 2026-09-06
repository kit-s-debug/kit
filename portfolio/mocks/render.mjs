/* Renders the placeholder work previews and the social card.
   Requires playwright: npm i -D playwright && npx playwright install chromium
   Then: node mocks/render.mjs */
import { chromium } from "playwright";

const CHROME = process.env.CHROME_PATH;
const here = new URL(".", import.meta.url).pathname;
const b = await chromium.launch(CHROME ? { executablePath: CHROME, args: ["--no-sandbox"] } : {});

const page = await b.newPage({ viewport: { width: 1700, height: 1100 }, deviceScaleFactor: 1 });
await page.goto(`file://${here}mocks.html`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
for (const id of ["ninth-wave", "penrhos", "ivor-and-sons", "carreg", "elin-vaughan"]) {
  await page.locator(`#${id}`).screenshot({ path: `${here}../public/work/${id}.jpg`, type: "jpeg", quality: 84 });
  console.log("rendered", id);
}

const og = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await og.goto(`file://${here}og.html`, { waitUntil: "networkidle" });
await og.evaluate(() => document.fonts.ready);
await og.waitForTimeout(400);
await og.screenshot({ path: `${here}../public/og.png` });
console.log("rendered og");

await b.close();
