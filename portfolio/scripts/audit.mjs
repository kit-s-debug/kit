/* Functionality audit. Walks the built site in a real browser and checks that
   every link, button, media element, fallback and breakpoint actually works.
   Run it against a preview build:

     npm run build && npx vite preview --port 4173 &
     npm run audit

   If Playwright has no browser downloaded, either run `npx playwright
   install chromium` or point CHROME_PATH at a Chromium you already have.

   Exits non-zero if anything fails, so it can gate a deploy. */
import { chromium } from "playwright";
const OUT = [];
const say = (ok, msg) => OUT.push(`  ${ok ? "ok  " : "FAIL"} ${msg}`);
const H = (t) => OUT.push(`\n== ${t} ==`);
const BASE = process.env.AUDIT_URL || "http://localhost:4173";
/* Left unset, Playwright finds its own Chromium. Override with CHROME_PATH
   if you are pointing it at a browser somewhere else. */
const EXE = process.env.CHROME_PATH || undefined;
const ARGS = ["--no-sandbox", "--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"];
const b = await chromium.launch({ executablePath: EXE, args: ARGS });
const errs = [];
const newPage = async (opts = {}) => {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ...opts });
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  p.on("pageerror", (e) => errs.push(String(e)));
  return p;
};
const land = async (p, url = BASE + "/") => {
  await p.goto(url, { waitUntil: "networkidle" });
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(600);
};
// walk the page slowly so lazy images and in-view reveals actually fire
const walk = async (p) => {
  const h = p.viewportSize().height;
  const total = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < total; y += Math.round(h * 0.6)) { await p.evaluate((v) => scrollTo(0, v), y); await p.waitForTimeout(420); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
};

// The overlay unmounts behind an exit animation, so poll rather than guessing a delay.
const waitFor = async (p, fn, ms = 2500) => {
  for (let t = 0; t < ms; t += 100) {
    if (await p.evaluate(fn)) return true;
    await p.waitForTimeout(100);
  }
  return false;
};

let page = await newPage();
await land(page);
await walk(page);

H("LINKS");
const links = await page.$$eval("a[href]", (as) => as.map((a) => ({ href: a.getAttribute("href"), text: a.textContent.trim().replace(/\s+/g, " ").slice(0, 34) })));
for (const l of links) {
  if (l.href.startsWith("#")) {
    const found = await page.evaluate((h) => h === "#top" ? Boolean(document.querySelector("#top") || document.body) : Boolean(document.querySelector(h)), l.href);
    say(found, `${l.href.padEnd(10)} "${l.text}"`);
  } else if (l.href.startsWith("mailto:") || l.href.startsWith("tel:")) {
    say(l.href.length > 8, l.href);
  } else if (l.href.startsWith("/")) {
    const r = await page.request.get(BASE + l.href);
    say(r.status() === 200, `${l.href} -> ${r.status()} "${l.text}"`);
  } else {
    say(/^https?:\/\//.test(l.href), `external ${l.href}`);
  }
}

H("MEDIA");
const media = await page.evaluate(() => ({
  imgs: [...document.images].map((i) => ({ src: i.currentSrc.split("/").pop(), ok: i.complete && i.naturalWidth > 0 })),
  vids: [...document.querySelectorAll("video")].map((v) => ({ src: (v.currentSrc || "").split("/").pop(), ready: v.readyState, loop: v.loop, muted: v.muted })),
  previews: document.querySelectorAll("[data-preview]").length,
}));
for (const i of media.imgs) say(i.ok, `image ${i.src}`);
for (const v of media.vids) say(v.ready >= 3 && v.loop && v.muted, `video ${v.src} ready=${v.ready} loop=${v.loop} muted=${v.muted}`);
say(media.vids.length >= 2, `${media.vids.length} self-scrolling previews`);

H("AUTOPLAY / IN VIEW");
await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(1600);
say(await page.evaluate(() => { const v = document.querySelector("video"); return v && !v.paused && v.currentTime > 0; }), "hero preview plays by itself");
await page.evaluate(() => scrollTo(0, innerHeight * 3)); await page.waitForTimeout(1400);
say(await page.evaluate(() => document.querySelector("video").paused), "hero preview pauses when off screen");
const played = await page.evaluate(async () => {
  const vs = [...document.querySelectorAll("video")];
  const v = vs[vs.length - 1];
  v.scrollIntoView({ block: "center" });
  await new Promise((r) => setTimeout(r, 1800));
  return !v.paused && v.currentTime > 0;
});
say(played, "featured preview plays when scrolled to");

H("ONE WORK SECTION");
const order = await page.$$eval("section[id]", (s) => s.map((x) => x.id).join(", "));
OUT.push(`  sections: ${order}`);
const workHeads = await page.evaluate(() => [...document.querySelectorAll("section")].filter((s) => [...s.querySelectorAll("h2")].some((h) => /selectedwork/i.test(h.textContent.replace(/\s+/g, "")))).map((s) => s.id || "(unnamed)"));
say(workHeads.length === 1, `exactly one work section (${workHeads.join(" | ") || "none"})`);

H("HONESTY");
const tags = await page.evaluate(() => ({
  concepts: [...document.querySelectorAll("#work article")].filter((a) => /concept/i.test(a.textContent)).length,
  cards: document.querySelectorAll("#work article").length,
  overclaim: /real businesses, real problems/i.test(document.querySelector("#work").textContent),
}));
say(tags.concepts === tags.cards, `${tags.concepts}/${tags.cards} non-live cards labelled Concept`);
say(!tags.overclaim, "no blanket \"real businesses\" claim over concept work");

H("PRIVACY NOTICE");
{
  const r = await page.request.get(BASE + "/privacy/");
  say(r.status() === 200, `/privacy/ -> ${r.status()}`);
  const pv = await newPage();
  await land(pv, BASE + "/privacy/");
  const info = await pv.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent?.trim() ?? "",
    sections: document.querySelectorAll("main section").length,
    back: [...document.querySelectorAll('a[href="/"]')].length,
    mail: [...document.querySelectorAll('a[href^="mailto:"]')].length,
    logo: document.querySelectorAll("header svg").length,
    words: (document.querySelector("main")?.textContent ?? "").split(/\s+/).length,
  }));
  say(info.h1.length > 0, `heading "${info.h1}"`);
  say(info.sections >= 6, `${info.sections} sections, ${info.words} words`);
  say(info.back >= 2, `${info.back} links back to the site`);
  say(info.mail >= 1, "contact address on the page");
  say(info.logo >= 1, "logo renders on the notice");
  const over = await pv.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
  say(over === 0, `no sideways overflow (${over}px)`);
  await pv.close();
}

H("CONTACT DETAILS");
{
  const tel = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="tel:"]')].map((a) => ({
      href: a.getAttribute("href").replace("tel:", ""),
      text: a.textContent.trim(),
    })),
  );
  say(tel.length >= 2, `${tel.length} phone links (contact and footer)`);
  for (const t of tel) {
    const digits = t.text.replace(/[^\d+]/g, "");
    say(/^\+?\d{7,}$/.test(t.href) && t.href === digits, `tel:${t.href} dials what it shows ("${t.text}")`);
  }
  const schema = await page.evaluate(() => {
    const el = document.querySelector('script[type="application/ld+json"]');
    return el ? JSON.parse(el.textContent) : null;
  });
  say(Boolean(schema?.telephone), `schema carries a telephone (${schema?.telephone ?? "none"})`);
  say(Boolean(schema?.email), `schema carries an email (${schema?.email ?? "none"})`);
}

H("NO DEAD PLACEHOLDER LINKS");
{
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll("a[href]")]
      .map((a) => a.getAttribute("href"))
      .filter((h) => /^https?:\/\/(www\.)?ryderdesigns\.co\.uk\/?$|^https?:\/\/(www\.)?(instagram\.com\/ryderdesigns|linkedin\.com\/company\/ryderdesigns|github\.com\/ryderdesigns)\/?$|^#$|^$/.test(h)),
  );
  say(bad.length === 0, bad.length ? `placeholder links rendered: ${bad.join(", ")}` : "no unset placeholder is rendered as a link");
}

H("EDDIE ROCKS ROUTE");
for (const r of ["/eddie-rocks/", "/eddie-rocks/css/styles.css", "/eddie-rocks/js/main.js", "/work/eddies-scroll.webm"]) {
  const res = await page.request.get(BASE + r);
  say(res.status() === 200, `${r} -> ${res.status()}`);
}

H("INTERACTIONS");
await page.evaluate(() => document.querySelector("#work").scrollIntoView()); await page.waitForTimeout(700);
const opener = await page.$('#work button[type="button"]');
await opener.click();
say(await waitFor(page, () => Boolean(document.querySelector('[role="dialog"]'))), "case study overlay opens");
await page.keyboard.press("Escape");
say(await waitFor(page, () => !document.querySelector('[role="dialog"]')), "overlay closes on Escape");
await page.evaluate(() => document.querySelector("#services").scrollIntoView()); await page.waitForTimeout(700);
const accBtns = await page.$$("#services button[aria-expanded]");
await accBtns[accBtns.length - 1].click(); await page.waitForTimeout(600);
say(await page.evaluate(() => { const b = [...document.querySelectorAll("#services button[aria-expanded]")].pop(); return b.getAttribute("aria-expanded") === "true"; }), "services accordion opens on click");
await page.evaluate(() => document.querySelector("#contact").scrollIntoView()); await page.waitForTimeout(700);
await page.click('#contact button[type="submit"]'); await page.waitForTimeout(700);
const nErr = await page.evaluate(() => document.querySelectorAll('#contact [aria-invalid="true"]').length);
say(nErr >= 3, `form validates (${nErr} errors)`);

H("SCROLL SPY + NAV SURFACE");
page = await newPage(); await land(page); await walk(page);
for (const id of ["work", "services", "about", "contact"]) {
  await page.evaluate((i) => { const el = document.querySelector("#" + i); scrollTo(0, el.getBoundingClientRect().top + scrollY + 8); }, id);
  await page.waitForTimeout(800);
  const cur = await page.evaluate(() => { const a = document.querySelector('header a[aria-current="true"]'); return a ? a.getAttribute("href") : "none"; });
  say(cur === "#" + id, `at #${id} nav marks ${cur}`);
}
for (const pct of [0, 0.25, 0.5, 0.75, 1]) {
  await page.evaluate((f) => scrollTo(0, (document.body.scrollHeight - innerHeight) * f), pct);
  /* The bar reads its ground from an IntersectionObserver and then cross-fades
     its colours over 500ms. Neither has a completion signal, and timing either
     by a fixed wait fails a correct bar under software rendering: a colour that
     has not started changing yet looks exactly as settled as one that has
     finished. So poll for the end state instead. Contrast is stable once
     reached and a mid-transition blend is low contrast, not high, so this
     cannot pass on a transient. A bar that is genuinely wrong never contrasts
     and the check fails on the timeout. */
  const read = () =>
    page.evaluate(() => {
      const lum = (c) => {
        const [r, g, b] = c
          .match(/\d+\.?\d*/g)
          .map(Number)
          .slice(0, 3)
          .map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      const bar = document.querySelector("header");
      let node = document.elementFromPoint(innerWidth / 2, 78);
      let bg = "rgb(255,255,255)";
      while (node) {
        const c = getComputedStyle(node).backgroundColor;
        if (c && !/rgba\(0, 0, 0, 0\)/.test(c)) {
          bg = c;
          break;
        }
        node = node.parentElement;
      }
      const t = lum(getComputedStyle(bar).color);
      const g = lum(bg);
      return { text: t < 0.2 ? "dark" : "light", ground: g < 0.2 ? "dark" : "light", gap: Math.abs(t - g) };
    });

  let r = await read();
  for (let t = 0; t < 3000 && r.text === r.ground; t += 100) {
    await page.waitForTimeout(100);
    r = await read();
  }
  say(r.text !== r.ground, `at ${Math.round(pct * 100)}% bar ${r.text} over ${r.ground}`);
}

H("MOBILE");
const m = await newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await land(m); await m.waitForTimeout(1400);
say(await m.evaluate(() => { const v = document.querySelector("video"); return !v || (!v.paused && v.currentTime > 0); }), "hero preview autoplays on mobile");
await m.click('button[aria-label="Open menu"]');
say(await waitFor(m, () => Boolean(document.querySelector('[data-menu="mobile"]'))), "mobile menu opens");
await m.click('button[aria-label="Close menu"]');
say(await waitFor(m, () => !document.querySelector('[data-menu="mobile"]')), "mobile menu closes");
await m.close();
for (const w of [320, 390, 768, 1024, 1440, 1920]) {
  const q = await newPage({ viewport: { width: w, height: 900 } });
  await land(q); await walk(q);
  const over = await q.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
  say(over === 0, `${w}px overflow ${over}px`);
  await q.close();
}

H("FALLBACKS");
const rm = await b.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
const rp = await rm.newPage(); await land(rp); await walk(rp);
const rmS = await rp.evaluate(() => ({ v: document.querySelectorAll("video").length, img: [...document.images].filter((i) => /eddies-poster/.test(i.currentSrc)).length, hidden: [...document.querySelectorAll("main *")].filter((e) => getComputedStyle(e).opacity === "0" && getComputedStyle(e).pointerEvents !== "none").length }));
say(rmS.v === 0 && rmS.img >= 2, `reduced motion: ${rmS.v} videos, ${rmS.img} still frames`);
say(rmS.hidden === 0, `reduced motion: ${rmS.hidden} elements stuck hidden`);
await rm.close();
const nw = await newPage();
await nw.addInitScript(() => { HTMLMediaElement.prototype.canPlayType = () => ""; });
await land(nw); await walk(nw);
const nwS = await nw.evaluate(() => ({ v: document.querySelectorAll("video").length, img: [...document.images].filter((i) => /eddies-poster/.test(i.currentSrc)).length }));
say(nwS.v === 0 && nwS.img >= 2, `no WebM: ${nwS.v} videos, ${nwS.img} still frames`);
await nw.close();
const ng = await newPage();
const gErr = [];
ng.on("pageerror", (e) => gErr.push(String(e)));
await ng.addInitScript(() => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, ...a) { return t === "webgl2" ? null : g.call(this, t, ...a); }; });
await land(ng); await walk(ng);
say(gErr.length === 0, `no WebGL2: ${gErr.length ? gErr.join("; ") : "no errors"}`);
await ng.close();

H("CONSOLE");
const real = errs.filter((e) => !/favicon|ERR_INTERNET_DISCONNECTED/.test(e));
say(real.length === 0, real.length ? real.join("\n       ") : "clean");

const fails = OUT.filter((l) => l.startsWith("  FAIL"));
OUT.push("\n== RESULT ==");
OUT.push(fails.length ? `${fails.length} check(s) failed` : "all checks passed");
console.log(OUT.join("\n"));
await b.close();
process.exit(fails.length ? 1 : 0);
