/**
 * Does every page fit the phone?
 *
 * This exists because of a real bug. The decorative greenery is positioned
 * absolutely and deliberately runs off the edge of the section it sits in,
 * which is fine as long as that section is `position: relative` and clips.
 * Three sections were only relative above 68rem, so on a phone their greenery
 * escaped to the page instead — invisible, but it made the document wider than
 * the screen and the whole site could be dragged sideways.
 *
 * Nothing in the visual review catches that: it looks perfect in a screenshot.
 * So this measures the one number that matters, on the narrowest screens we
 * care about, for every page.
 *
 *   npm run check:fit                  (expects the site on :3000)
 *   BASE=http://localhost:4000 npm run check:fit
 */
import { chromium, devices } from "playwright-core";

const BASE = process.env.BASE ?? "http://localhost:3000";
const PAGES = ["/", "/about", "/privacy", "/thanks"];
const PHONES = ["iPhone SE", "iPhone 13", "Pixel 5"];

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? undefined,
});

let failures = 0;

for (const phone of PHONES) {
  const device = devices[phone];
  if (!device) {
    console.log(`?  ${phone}: no such device profile, skipped`);
    continue;
  }

  for (const path of PAGES) {
    const context = await browser.newContext({ ...device });
    const page = await context.newPage();
    await page.goto(BASE + path, { waitUntil: "networkidle" });

    // Scroll the whole page first: the scroll-driven drifts move things, and a
    // piece that only escapes once it has drifted still escapes.
    await page.evaluate(async () => {
      const end = document.documentElement.scrollHeight;
      for (let y = 0; y < end; y += 600) {
        window.scrollTo(0, y);
        await new Promise((done) => setTimeout(done, 16));
      }
      window.scrollTo(0, 0);
    });

    const result = await page.evaluate(() => {
      void document.body.offsetWidth; // settle layout before measuring
      const root = document.documentElement;
      const width = root.clientWidth;
      const over = [...document.querySelectorAll("body *")]
        .map((el) => ({
          // SVG className is an SVGAnimatedString, so read the attribute
          name: el.tagName.toLowerCase() + (el.getAttribute("class") ? "." + el.getAttribute("class").split(" ")[0] : ""),
          right: Math.round(el.getBoundingClientRect().right),
        }))
        .filter((box) => box.right > width + 0.5)
        .sort((a, b) => b.right - a.right)
        .slice(0, 5);
      return { width, scrollWidth: root.scrollWidth, over };
    });

    const fits = result.scrollWidth <= result.width;
    if (!fits) failures += 1;
    console.log(
      `${fits ? "✓" : "✗"} ${phone.padEnd(10)} ${path.padEnd(9)} ` +
        `viewport ${result.width}, document ${result.scrollWidth}` +
        (fits ? "" : `\n    widest boxes: ${result.over.map((b) => `${b.name} → ${b.right}`).join(", ")}`),
    );
    await context.close();
  }
}

await browser.close();

if (failures) {
  console.error(`\n${failures} page${failures === 1 ? "" : "s"} wider than the screen.`);
  process.exit(1);
}
console.log("\nevery page fits every phone");
