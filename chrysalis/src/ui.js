// Page interactions that don't depend on the 3D scene.

export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ---------- custom cursor (fine pointers only) ---------- */
export function initCursor({ reduced, scene }) {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!fine || reduced) return { setLabel() {} };
  const el = $("[data-cursor-el]");
  const ring = $(".cursor__ring", el), dot = $(".cursor__dot", el), label = $("[data-cursor-label]", el);
  document.documentElement.classList.add("has-cursor");
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  let forced = "";
  window.addEventListener("pointermove", (e) => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    const t = e.target.closest && e.target.closest("a, button, [data-cursor]");
    const text = (t && t.getAttribute("data-cursor")) || forced;
    el.classList.toggle("is-link", !!t && !text);
    el.classList.toggle("is-label", !!text);
    if (text) label.textContent = text;
  }, { passive: true });
  window.addEventListener("pointerdown", () => el.classList.add("is-down"));
  window.addEventListener("pointerup", () => el.classList.remove("is-down"));
  document.addEventListener("mouseleave", () => (el.style.opacity = "0"));
  document.addEventListener("mouseenter", () => (el.style.opacity = "1"));
  (function loop() {
    rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    label.style.left = rx + "px"; label.style.top = ry + "px";
    requestAnimationFrame(loop);
  })();
  return { setLabel(text) { forced = text; if (!text) el.classList.remove("is-label"); else { el.classList.add("is-label"); label.textContent = text; } } };
}

/* ---------- magnetic buttons ---------- */
export function initMagnetic({ reduced }) {
  if (reduced || !window.matchMedia("(hover: hover)").matches) return;
  $$("[data-magnetic]").forEach((el) => {
    const strength = parseFloat(el.getAttribute("data-magnetic")) || 0.3;
    let raf = 0;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`; });
    });
    el.addEventListener("pointerleave", () => {
      cancelAnimationFrame(raf);
      el.style.transition = "transform .7s cubic-bezier(.22,1,.36,1)";
      el.style.transform = "";
      setTimeout(() => (el.style.transition = ""), 700);
    });
  });
}

/* ---------- letters shuffle briefly on hover ---------- */
export function initScramble({ reduced }) {
  if (reduced) return;
  const glyphs = "abcdefghijklmnopqrstuvwxyz·•";
  $$("[data-scramble]").forEach((el) => {
    const text = el.textContent;
    let frame = 0, raf = 0;
    el.setAttribute("aria-label", text);
    el.addEventListener("pointerenter", () => {
      cancelAnimationFrame(raf); frame = 0;
      const step = () => {
        el.textContent = text.split("").map((c, i) => (i < frame / 2 || c === " " ? c : glyphs[(Math.random() * glyphs.length) | 0])).join("");
        frame++;
        if (frame / 2 <= text.length) raf = requestAnimationFrame(step); else el.textContent = text;
      };
      step();
    });
  });
}

/* ---------- nav: solid on scroll, hides going down ---------- */
export function initNav() {
  const nav = $("[data-nav]");
  let last = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle("is-solid", y > 40);
    if (!document.body.classList.contains("menu-open")) nav.classList.toggle("is-hidden", y > 600 && y > last + 2);
    if (y < last - 2) nav.classList.remove("is-hidden");
    last = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  nav.addEventListener("focusin", () => nav.classList.remove("is-hidden"));
  onScroll();
}

/* ---------- mobile menu ---------- */
export function initMenu({ reduced, lenis }) {
  const toggle = $("[data-menu-toggle]"), menu = $("[data-menu]"), label = $("[data-menu-label]");
  let open = false;
  const items = () => [toggle, ...$$("a, button", menu)];
  function show() {
    open = true; menu.hidden = false;
    document.body.classList.add("menu-open");
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
    toggle.setAttribute("aria-expanded", "true"); label.textContent = "Close menu";
    lenis ? lenis.stop() : (document.body.style.overflow = "hidden");
    setTimeout(() => $("a", menu).focus({ preventScroll: true }), 60);
  }
  function hide(returnFocus) {
    open = false; menu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false"); label.textContent = "Open menu";
    lenis ? lenis.start() : (document.body.style.overflow = "");
    setTimeout(() => { if (!open) menu.hidden = true; }, reduced ? 0 : 800);
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener("click", () => (open ? hide(false) : show()));
  $$("[data-menu-link]", menu).forEach((a) => a.addEventListener("click", () => hide(false)));
  document.addEventListener("keydown", (e) => {
    if (!open) return;
    if (e.key === "Escape") return hide(true);
    if (e.key === "Tab") {
      const f = items(), i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  addEventListener("resize", () => { if (open && innerWidth > 960) hide(false); });
}

/* ---------- open / closed right now (UK time), from the hours table ---------- */
export function initStatus() {
  const rows = $$(".hours__table tr[data-day]");
  const hours = {};
  rows.forEach((r) => {
    const m = r.querySelector("td").textContent.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
    hours[r.dataset.day] = m ? [ +m[1] * 60 + +m[2], +m[3] * 60 + +m[4] ] : null;
  });
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const fmt = (mins) => { const h = Math.floor(mins / 60), m = mins % 60, h12 = ((h + 11) % 12) + 1; return h12 + (m ? ":" + String(m).padStart(2, "0") : "") + (h < 12 ? "am" : "pm"); };
  const el = $("[data-status]"), text = $("[data-status-text]");
  function update() {
    let day, mins;
    try {
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      const get = (t) => parts.find((p) => p.type === t).value;
      day = names.indexOf(get("weekday")); mins = +get("hour") * 60 + +get("minute");
    } catch (e) { return; }
    const today = hours[day];
    const row = $(`.hours__table tr[data-day="${day}"]`);
    rows.forEach((r) => { r.classList.toggle("is-today", r === row); r.toggleAttribute("aria-current", r === row); });
    if (today && mins >= today[0] && mins < today[1]) {
      el.classList.add("is-open"); text.textContent = `Open now · until ${fmt(today[1])}`;
      return;
    }
    el.classList.remove("is-open");
    if (today && mins < today[0]) { text.textContent = `Opens today at ${fmt(today[0])}`; return; }
    for (let i = 1; i <= 7; i++) {
      const d = (day + i) % 7;
      if (hours[d]) { text.textContent = `Closed · opens ${i === 1 ? "tomorrow" : names[d]} ${fmt(hours[d][0])}`; return; }
    }
  }
  update();
  setInterval(update, 60000);
}

/* ---------- treatment filters (category + time) with a FLIP glide ---------- */
export function initFilters({ reduced, onLayout }) {
  const root = $("[data-filters]");
  const treats = $$(".treat");
  const groups = $$("[data-group]");
  const out = $("[data-count-out]");
  const empty = $("[data-empty]");
  let cat = "all", time = "any";

  function apply() {
    const first = new Map(treats.map((t) => [t, t.getBoundingClientRect()]));
    let shown = 0;
    treats.forEach((t) => {
      const okCat = cat === "all" || t.dataset.cat === cat;
      const m = parseInt(t.dataset.min, 10);
      const okTime = time === "any" || (!isNaN(m) && (time === "999" ? m > 60 : m <= +time));
      t.hidden = !(okCat && okTime);
      if (!t.hidden) shown++;
    });
    groups.forEach((g) => (g.hidden = !$$(".treat", g).some((t) => !t.hidden)));
    empty.hidden = shown > 0;
    out.textContent = shown + (shown === 1 ? " treatment" : " treatments") + (time !== "any" ? " with a listed time that fits" : "");
    if (!reduced) {
      treats.forEach((t) => {
        if (t.hidden) return;
        const a = first.get(t), b = t.getBoundingClientRect();
        if (!a.height) { t.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 500, easing: "cubic-bezier(.22,1,.36,1)" }); return; }
        const dy = a.top - b.top;
        if (dy) t.animate([{ transform: `translateY(${dy}px)` }, { transform: "none" }], { duration: 600, easing: "cubic-bezier(.22,1,.36,1)" });
      });
    }
    onLayout && onLayout();
  }
  function press(attr, val) {
    $$(`[data-${attr}]`, root).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset[attr] === val)));
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.cat) { cat = b.dataset.cat; press("cat", cat); }
    if (b.dataset.time) { time = b.dataset.time; press("time", time); }
    apply();
  });
  apply();
  return { setCategory(c) { cat = c; time = "any"; press("cat", c); press("time", "any"); apply(); } };
}

/* ---------- award medals flip ---------- */
export function initMedals() {
  $$("[data-medal]").forEach((m) => m.addEventListener("click", () => m.setAttribute("aria-pressed", String(m.getAttribute("aria-pressed") !== "true"))));
}

/* ---------- tilt card ---------- */
export function initTilt({ reduced }) {
  if (reduced || !matchMedia("(hover: hover)").matches) return;
  $$("[data-tilt]").forEach((card) => {
    const p = $(".person__portrait", card);
    card.addEventListener("pointermove", (e) => {
      const r = p.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      p.style.setProperty("--ry", nx * 16 + "deg"); p.style.setProperty("--rx", -ny * 12 + "deg");
      p.style.setProperty("--gx", (nx + 0.5) * 100 + "%"); p.style.setProperty("--gy", (ny + 0.5) * 100 + "%");
    });
    card.addEventListener("pointerleave", () => { p.style.setProperty("--ry", "0deg"); p.style.setProperty("--rx", "0deg"); });
  });
}

/* ---------- gallery + lightbox (fed by js/gallery.js) ---------- */
export function initGallery() {
  const photos = (window.CHRYSALIS_GALLERY || []).filter((p) => p && p.src);
  const gallery = $("[data-gallery]"), empty = $("[data-gallery-empty]");
  const lb = $("[data-lightbox]"), img = $("[data-lightbox-img]"), cap = $("[data-lightbox-cap]");
  let cur = 0, opener = null;
  const show = (i) => { cur = (i + photos.length) % photos.length; const p = photos[cur]; img.src = p.src; img.alt = p.alt || ""; cap.textContent = [p.category, p.alt].filter(Boolean).join(" · "); };
  if (photos.length) {
    photos.forEach((p, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "gallery__item"; b.setAttribute("aria-label", "Enlarge photo: " + (p.alt || "salon work")); b.dataset.cursor = "View";
      const im = document.createElement("img");
      im.src = p.src; im.alt = p.alt || ""; im.loading = "lazy"; im.decoding = "async";
      if (p.width) im.width = p.width; if (p.height) im.height = p.height;
      b.append(im);
      if (p.category) { const c = document.createElement("span"); c.className = "gallery__cap"; c.textContent = p.category; c.setAttribute("aria-hidden", "true"); b.append(c); }
      b.addEventListener("click", () => { opener = b; show(i); lb.showModal ? lb.showModal() : lb.setAttribute("open", ""); });
      gallery.append(b);
    });
    gallery.hidden = false; empty.hidden = true;
  }
  const single = photos.length < 2;
  $("[data-lightbox-prev]").hidden = single; $("[data-lightbox-next]").hidden = single;
  $("[data-lightbox-close]").addEventListener("click", () => lb.open && lb.close());
  $("[data-lightbox-prev]").addEventListener("click", () => show(cur - 1));
  $("[data-lightbox-next]").addEventListener("click", () => show(cur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener("keydown", (e) => { if (single) return; if (e.key === "ArrowRight") show(cur + 1); if (e.key === "ArrowLeft") show(cur - 1); });
  lb.addEventListener("close", () => opener && opener.focus());
}

