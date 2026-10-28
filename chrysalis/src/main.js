// The Chrysalis Beautique: entry point.
// Reads scroll position, tells the 3D world which "scene" each section is,
// and wires up the page interactions.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createScene } from "./scene.js";
import {
  $, $$, initCursor, initMagnetic, initScramble, initNav, initMenu,
  initStatus, initFilters, initMedals, initTilt, initGallery,
} from "./ui.js";

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobileQuery = matchMedia("(max-width: 760px)");

$$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* =======================================================
   SCENE STATES: what the world looks like in each section.
   x/y move the formation clear of the text; bg tints the atmosphere.
   ======================================================= */
const STATES = {
  hero:   { explode: 0, morph: 0, x: 0,     y: -0.05, scale: 0.8,    dim: 1,    glow: 0,    bg: ["#1d3a2f", "#0b1511"] },
  unfold: { explode: 1, morph: 1, x: 0,     y: 0,    scale: 1,    dim: 0.5,  glow: 0.8,  bg: ["#2a3a26", "#0b1310"] },
  brows:  { explode: 1, morph: 2, x: 1.5,   y: 0.1,  scale: 1,    dim: 1,    glow: 0.1,  bg: ["#38361f", "#0e130f"] },
  lashes: { explode: 1, morph: 3, x: -1.45, y: 0,    scale: 1,    dim: 1,    glow: 0.1,  bg: ["#3b2925", "#110d0c"] },
  skin:   { explode: 1, morph: 4, x: 1.55,  y: 0,    scale: 1,    dim: 1,    glow: 0.25, bg: ["#244038", "#0a1412"] },
  menu:   { explode: 1, morph: 1, x: 0,     y: 0,    scale: 1,    dim: 0.35, glow: 0,    bg: ["#15271f", "#0a120e"] },
  room:   { explode: 1, morph: 1, x: 0,     y: 0,    scale: 1.1,  dim: 0.45, glow: 0,    bg: ["#1b3029", "#0b1411"] },
  book:   { explode: 1, morph: 5, x: 0,     y: 0,    scale: 1,    dim: 1,    glow: 0.4,  bg: ["#2c3b25", "#0b1410"] },
  visit:  { explode: 1, morph: 5, x: 0,     y: 2.2,  scale: 0.9,  dim: 0.5,  glow: 0,    bg: ["#16281f", "#0a120e"] },
};
const MOBILE = {
  hero:   { y: 0.85, scale: 0.62 },
  brows:  { x: 0, y: 1.15, scale: 0.6 },
  lashes: { x: 0, y: 1.3, scale: 0.47 },
  skin:   { x: 0, y: 1.15, scale: 0.55 },
  book:   {},
  visit:  { y: 3, scale: 0.6 },
};
const stateFor = (name) => ({ ...STATES[name], ...(mobileQuery.matches ? MOBILE[name] : {}) });

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mixHex = (a, b, t) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`; };
const smooth = (a, b, t) => { t = Math.min(1, Math.max(0, (t - a) / (b - a))); return t * t * (3 - 2 * t); };

/* =======================================================
   WORLD
   ======================================================= */
const canvas = $("[data-world]");
let scene = null;
try { scene = createScene(canvas, { mobile: mobileQuery.matches || matchMedia("(pointer: coarse)").matches, reduced }); } catch (e) { scene = null; }
if (!scene) root.classList.add("no-webgl");

// section anchors, measured on load/resize
let anchors = [];
// world units -> CSS px at the formations' depth (matches the camera in scene.js)
const pxPerUnit = () => innerHeight / (2 * Math.tan((35 / 2) * Math.PI / 180) * (innerWidth / innerHeight < 0.8 ? 9.6 : 7.5));
function measure() {
  // centre the crown on the booking orb and size it to ring the button
  const orb = $(".orb"), book = $("#book");
  if (orb && book) {
    // offset* ignores the orb's entrance transform; both are relative to <main>
    const k = pxPerUnit();
    STATES.book.y = -((orb.offsetTop + orb.offsetHeight / 2) - (book.offsetTop + book.offsetHeight / 2)) / k;
    STATES.book.scale = (orb.offsetWidth / 2 + 46) / k;
    MOBILE.book = { y: STATES.book.y, scale: STATES.book.scale };
  }
  anchors = $$("[data-scene]").map((el) => {
    const r = el.getBoundingClientRect();
    return { name: el.dataset.scene, el, mid: r.top + scrollY + r.height / 2 };
  });
}

function blendAt(y) {
  const c = y + innerHeight / 2;
  if (!anchors.length) return { a: stateFor("hero"), b: stateFor("hero"), t: 0, i: 0 };
  if (c <= anchors[0].mid) return { a: stateFor(anchors[0].name), b: stateFor(anchors[0].name), t: 0, i: 0 };
  for (let i = 0; i < anchors.length - 1; i++) {
    if (c < anchors[i + 1].mid) {
      const raw = (c - anchors[i].mid) / (anchors[i + 1].mid - anchors[i].mid);
      // hold each formation while its words are on screen; the hero -> unfold
      // shatter runs the whole way so it can be scrubbed
      const t = anchors[i].name === "hero" ? smooth(0.05, 0.95, raw) : smooth(0.28, 0.72, raw);
      return { a: stateFor(anchors[i].name), b: stateFor(anchors[i + 1].name), t, i: raw < 0.5 ? i : i + 1 };
    }
  }
  const last = anchors[anchors.length - 1];
  return { a: stateFor(last.name), b: stateFor(last.name), t: 0, i: anchors.length - 1 };
}

let lastBg = "";
function updateWorld() {
  const { a, b, t } = blendAt(scrollY);
  const s = {};
  for (const k of ["explode", "morph", "x", "y", "scale", "dim", "glow"]) s[k] = a[k] + (b[k] - a[k]) * t;
  if (scene && !reduced) scene.setState(s);
  const bgA = mixHex(a.bg[0], b.bg[0], t), bgB = mixHex(a.bg[1], b.bg[1], t);
  if (bgA + bgB !== lastBg) { root.style.setProperty("--bg-a", bgA); root.style.setProperty("--bg-b", bgB); lastBg = bgA + bgB; }
  if (reduced && scene) canvas.style.opacity = String(1 - smooth(0.1, 0.8, scrollY / innerHeight));
}

/* =======================================================
   SMOOTH SCROLL
   ======================================================= */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
// in-page links glide (and move focus for keyboard users)
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a || a.hash.length < 2) return;
  const target = document.querySelector(a.hash);
  if (!target) return;
  e.preventDefault();
  const done = () => { target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true }); history.replaceState(null, "", a.hash); };
  if (lenis) lenis.scrollTo(target, { offset: a.hash === "#top" ? 0 : -70, duration: 1.6, onComplete: done });
  else { target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); done(); }
});

/* =======================================================
   PAGE PIECES
   ======================================================= */
const cursor = initCursor({ reduced, scene });
initMagnetic({ reduced });
initScramble({ reduced });
initNav();
initMenu({ reduced, lenis });
initStatus();
initMedals();
initTilt({ reduced });
initGallery();
const filters = initFilters({ reduced, onLayout: () => { ScrollTrigger.refresh(); measure(); } });
$$("[data-filter-link]").forEach((a) => a.addEventListener("click", () => filters.setCategory(a.dataset.filterLink)));

/* ---------- the silk thread ---------- */
const threadFill = $("[data-thread-fill]");
const threadLinks = $$("[data-thread-link]");
function updateThread() {
  const max = document.documentElement.scrollHeight - innerHeight;
  threadFill.style.transform = `scaleY(${max > 0 ? scrollY / max : 0})`;
  const c = scrollY + innerHeight * 0.5;
  let active = "top";
  threadLinks.forEach((l) => { const el = document.getElementById(l.dataset.threadLink); if (el && el.offsetTop <= c) active = l.dataset.threadLink; });
  threadLinks.forEach((l) => { const on = l.dataset.threadLink === active; l.classList.toggle("is-active", on); on ? l.setAttribute("aria-current", "true") : l.removeAttribute("aria-current"); });
}

/* ---------- pointer → world (parallax, parting the dust, drag to spin) ---------- */
if (scene) {
  let down = null, moved = false;
  const overChrysalis = (e) => !(e.target.closest && e.target.closest("a, button, input, .carte__glass")) && scene.overChrysalis(e.clientX, e.clientY);
  addEventListener("pointermove", (e) => {
    scene.setPointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
    if (down) { scene.dragMove(e.clientX); if (Math.abs(e.clientX - down.x) > 4) moved = true; }
    cursor.setLabel(down ? "Turn" : overChrysalis(e) ? "Drag" : "");
  }, { passive: true });
  addEventListener("pointerdown", (e) => {
    if (!overChrysalis(e)) return;
    moved = false;
    if (e.pointerType === "mouse") { down = { x: e.clientX }; scene.dragStart(e.clientX); document.body.style.userSelect = "none"; }
    else down = null;
    e.pointerType !== "mouse" && scene.pulse();
  });
  addEventListener("pointerup", (e) => {
    if (down && !moved) scene.pulse();
    if (down) { scene.dragEnd(); document.body.style.userSelect = ""; }
    down = null;
  });
  document.addEventListener("pointerleave", () => scene.clearPointer());
}

/* =======================================================
   MOTION: reveals tied to scroll (skipped for reduced motion)
   ======================================================= */
function splitWords(el) {
  // keep inline markup (the <em>) while wrapping each word
  const walk = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.append(part);
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.append(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  return $$(".w", el);
}
function splitChars(el) {
  const text = el.textContent;
  el.setAttribute("aria-label", text);
  el.textContent = "";
  return text.split("").map((c) => { const s = document.createElement("span"); s.className = "ch"; s.setAttribute("aria-hidden", "true"); s.textContent = c; el.append(s); return s; });
}

function motion() {
  // the giant word behind the chrysalis: letters rise in, then drift apart on scroll
  const word = $("[data-backword]");
  const chars = splitChars(word);
  word.removeAttribute("aria-label");
  gsap.from(chars, { yPercent: 110, opacity: 0, duration: 1.6, stagger: 0.06, ease: "expo.out", delay: 0.15 });
  gsap.to(word, { yPercent: -35, letterSpacing: "0.04em", opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  $$("[data-words]").forEach((el) => {
    const words = splitWords(el);
    gsap.to(words, { opacity: 1, stagger: 0.08, ease: "none", scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 50%", scrub: true } });
  });
  $$("[data-chars]").forEach((el) => {
    const chars = splitChars(el);
    gsap.from(chars, { yPercent: 90, opacity: 0, rotate: 8, duration: 1.2, stagger: 0.05, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 80%" } });
  });
  $$(".chapter__card").forEach((card) => {
    gsap.from($$(".chapter__no, .chapter__lede, .chapter__card > p, .prices li, .chapter__card > .link", card), {
      y: 26, opacity: 0, duration: 1, stagger: 0.07, ease: "power3.out", scrollTrigger: { trigger: card, start: "top 75%" },
    });
  });
  $$("[data-rise]").forEach((el, i) => gsap.from(el, { y: 34, opacity: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
  $$("[data-count]").forEach((el) => {
    const o = { v: 0 }, n = +el.dataset.count;
    gsap.to(o, { v: n, duration: 1.8, ease: "power2.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: () => (el.textContent = Math.round(o.v)) });
  });
  gsap.from(".carte__glass", { y: 80, opacity: 0, scale: 0.97, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".carte", start: "top 80%" } });
  gsap.from(".medal", { rotateY: -180, opacity: 0, duration: 1.4, stagger: 0.15, ease: "expo.out", scrollTrigger: { trigger: ".awards", start: "top 80%" } });
  gsap.from(".person__portrait", { clipPath: "inset(100% 0 0 0 round 999px 999px 18px 18px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: ".person", start: "top 75%" } });
  gsap.from(".orb", { scale: 0.4, opacity: 0, duration: 1.6, ease: "elastic.out(1, 0.6)", scrollTrigger: { trigger: ".orb", start: "top 85%" } });
  gsap.from(".steps li", { y: 24, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".steps", start: "top 90%" } });
  gsap.from(".visit__title > *", { yPercent: 50, opacity: 0, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".visit", start: "top 75%" } });
  gsap.fromTo(".foot__word", { yPercent: 40, letterSpacing: "0.06em" }, { yPercent: 0, letterSpacing: "-0.05em", ease: "none", scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true } });
}

/* =======================================================
   START
   ======================================================= */
function tick() { updateWorld(); updateThread(); }
measure();
if (!reduced) motion();
addEventListener("scroll", tick, { passive: true });
addEventListener("resize", () => { measure(); tick(); });
addEventListener("load", () => { measure(); ScrollTrigger.refresh(); tick(); });
if (document.fonts) document.fonts.ready.then(() => { measure(); ScrollTrigger.refresh(); tick(); });

if (scene) {
  tick();
  if (reduced) { scene.setState(stateFor("hero")); scene.snap(); requestAnimationFrame(() => scene.renderOnce()); }
  else {
    // arrival: the chrysalis grows in on its thread with a slow turn
    scene.snap();
    scene.setCurrent({ scale: 0.001, y: 1.5 });
    scene.pulse();
    scene.start();
  }
} else tick();

requestAnimationFrame(() => root.classList.add("is-ready"));
