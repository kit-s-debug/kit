/*
  Snippers: page behaviour.

  The tour: a sticky stage behind a column of "stops". Scrolling through
  the stops moves the 3D camera (js/salon3d.js) from the street, through
  the door and round the salon. Without WebGL, or with reduced motion,
  the stage shows a still of each stop instead and crossfades between them.
*/
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const root = document.documentElement;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const tall = matchMedia("(max-aspect-ratio: 1/1)");
const debug = new URLSearchParams(location.search).has("debug"); // tests: no camera easing

/* ---------------------------------------------------------------------
   Navigation
   ------------------------------------------------------------------- */
const nav = $(".nav");
const toggle = $(".nav__toggle");
const menu = $("#menu");
let lastY = scrollY;

function setMenu(open) {
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Menu";
  [$("main"), $(".foot")].forEach(el => { if (el) el.inert = open; });
  root.style.overflow = open ? "hidden" : "";
  if (open) {
    menu.hidden = false;
    void menu.offsetWidth;
    menu.classList.add("is-open");
    setTimeout(() => menu.querySelector("a")?.focus({ preventScroll: true }), 60);
  } else {
    menu.classList.remove("is-open");
    setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, reduced ? 0 : 450);
  }
}
toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
$$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); } });
matchMedia("(min-width: 901px)").addEventListener("change", m => { if (m.matches) setMenu(false); });

/* ---------------------------------------------------------------------
   Tour
   ------------------------------------------------------------------- */
const tour = $(".tour");
const stage = $(".tour__stage");
const canvas = $(".tour__canvas");
const stops = $$(".stop");
const indexLinks = $$(".tour__index a");
const navLinks = $$(".nav__links a");
let salon = null;
let stopP = [];
let activeStop = 0;

function measure() {
  const vh = innerHeight;
  const top = tour.offsetTop, len = tour.offsetHeight - vh;
  stopP = stops.map(s => clamp((s.offsetTop + (s.offsetHeight - vh) / 2) / len, 0, 1));
  stopP[0] = 0;
  return { top, len };
}
let geo = measure();

function progress() {
  return clamp((scrollY - geo.top) / geo.len, 0, 1);
}

function setActive(i) {
  activeStop = i;
  stops.forEach((s, n) => s.classList.toggle("is-active", n === i));
  indexLinks.forEach((a, n) => a.classList.toggle("is-current", n === i));
  const id = stops[i].id;
  navLinks.forEach(a => a.classList.toggle("is-current", a.getAttribute("href") === "#" + id));
  showStill(i);
}

// which stop is in the middle of the screen
const stopIO = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) setActive(stops.indexOf(e.target)); });
}, { rootMargin: "-45% 0px -45% 0px" });
stops.forEach(s => stopIO.observe(s));

let ticking = false;
function onScroll() {
  ticking = false;
  const y = scrollY;
  nav.dataset.state = y > 30 ? "scrolled" : "top";
  const p = progress();
  tour.classList.toggle("is-touring", p > .03 && p < .995 && y < geo.top + geo.len);
  if (salon) { salon.setProgress(p, stopP); if (debug) salon.jump(p); }
  lastY = y;
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener("resize", () => { geo = measure(); salon?.resize(); onScroll(); });

/* ---- Stills (fallback, and the first paint while 3D loads) ---- */
const stillsBox = $(".tour__stills");
const stills = [];
function stillSrc(i) { return `assets/img/stills/stop-${i}-${tall.matches ? "tall" : "wide"}.webp`; }
function showStill(i) {
  if (!tour.classList.contains("tour--static")) return;
  if (!stills[i]) {
    const img = new Image();
    img.alt = ""; img.decoding = "async"; img.src = stillSrc(i);
    stillsBox.appendChild(img); stills[i] = img;
    // preload the next one
    if (i + 1 < stops.length && !stills[i + 1]) setTimeout(() => { const n = new Image(); n.src = stillSrc(i + 1); }, 400);
  }
  stills.forEach((img, n) => img && img.classList.toggle("is-on", n === i));
}

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGL2RenderingContext && c.getContext("webgl2"));
  } catch { return false; }
}

async function startTour() {
  if (reduced || !webglOK()) {
    tour.classList.add("tour--static");
    showStill(activeStop);
    return;
  }
  try {
    await Promise.all([
      document.fonts.load('500 40px "Cormorant Garamond"'),
      document.fonts.load('italic 500 40px "Cormorant Garamond"'),
      document.fonts.load('500 20px "Jost"'),
    ]);
    const { createSalon } = await import("./salon3d.js");
    const hi = matchMedia("(min-width: 901px) and (pointer: fine)").matches;
    salon = createSalon(canvas, { quality: hi ? "high" : "low" });
    geo = measure();
    salon.jump(progress());
    salon.setProgress(progress(), stopP);
    requestAnimationFrame(() => requestAnimationFrame(() => tour.classList.add("is-live")));
    if (finePointer) {
      addEventListener("pointermove", e => salon.setPointer(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)), { passive: true });
    }
    // pause rendering when the tour is off screen
    new IntersectionObserver(([e]) => { if (e.isIntersecting) salon.renderNow(); }).observe(stage);
  } catch (err) {
    console.warn("3D salon unavailable, showing stills", err);
    tour.classList.add("tour--static");
    showStill(activeStop);
  }
}

// index links: jump to the middle of a stop
indexLinks.forEach((a, i) => a.addEventListener("click", e => {
  e.preventDefault();
  const s = stops[i];
  scrollTo({ top: s.offsetTop + tour.offsetTop + (s.offsetHeight - innerHeight) / 2, behavior: reduced ? "auto" : "smooth" });
}));
// in-page links to a stop land where its card is centred
$$('a[href^="#"]').forEach(a => {
  if (a.closest(".tour__index")) return;
  const s = stops.find(st => "#" + st.id === a.getAttribute("href"));
  if (!s) return;
  a.addEventListener("click", e => {
    e.preventDefault();
    const i = stops.indexOf(s);
    const y = i === 0 ? 0 : s.offsetTop + tour.offsetTop + (s.offsetHeight - innerHeight) / 2;
    scrollTo({ top: y, behavior: reduced ? "auto" : "smooth" });
  });
});

/* ---------------------------------------------------------------------
   Map, hours, year
   ------------------------------------------------------------------- */
const mapBtn = $("[data-map-load]");
mapBtn?.addEventListener("click", () => {
  const holder = mapBtn.closest(".map");
  const f = document.createElement("iframe");
  f.src = window.SNIPPERS?.mapEmbed || "";
  f.title = "Map showing Snippers at 57 Portfield, Haverfordwest";
  f.loading = "lazy";
  f.referrerPolicy = "no-referrer-when-downgrade";
  holder.replaceChildren(f);
  f.focus();
});

const cfg = window.SNIPPERS || {};
const hoursBox = $("[data-hours]");
if (hoursBox && Array.isArray(cfg.hours) && cfg.hours.length) {
  const dl = document.createElement("dl");
  cfg.hours.forEach(([d, t]) => {
    const dt = document.createElement("dt"); dt.textContent = d;
    const dd = document.createElement("dd"); dd.textContent = t;
    dl.append(dt, dd);
  });
  hoursBox.replaceChildren(dl);
  if (cfg.hoursNote) { const s = document.createElement("small"); s.textContent = cfg.hoursNote; hoursBox.append(s); }
}
const year = $("[data-year]");
if (year) year.textContent = new Date().getFullYear();

/* ---------------------------------------------------------------------
   Go
   ------------------------------------------------------------------- */
setActive(0);
onScroll();
document.fonts.ready.then(() => { root.classList.add("is-ready"); geo = measure(); });
setTimeout(() => root.classList.add("is-ready"), 1200);
startTour();
