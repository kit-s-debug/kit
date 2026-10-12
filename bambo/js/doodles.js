/* Background doodles: small line drawings of vapes, pods, hookahs, snus tins
   and vapour puffs, floating in the empty margins of homepage sections.
   Purely decorative (aria-hidden), and they stay still for reduced motion. */
(() => {
  const S = {
    pod: '<rect x="14" y="16" width="20" height="30" rx="7"/><path d="M19 16v-6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v6"/><rect class="f" x="21.5" y="22" width="5" height="10" rx="2.5"/><path d="M20 40h8"/>',
    pen: '<rect x="20" y="10" width="8" height="34" rx="4"/><path d="M21.5 10l1-5h3l1 5"/><path class="f-line" d="M20 33h8"/><circle cx="24" cy="24" r="1.4"/>',
    bar: '<rect x="18" y="12" width="12" height="32" rx="3"/><path d="M20.5 12V8.5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V12"/><rect class="f" x="21" y="17" width="6" height="12" rx="1.5"/>',
    hookah: '<path d="M20 8h8l-1.5 5h-5z"/><path d="M16 15h16"/><path d="M24 15v12"/><path d="M21 27h6"/><path d="M20.5 27c-6 4-7 13 3.5 15 10.5-2 9.5-11 3.5-15"/><path class="f-line" d="M18.5 36h11"/><path d="M27 20c6 0 10 4 9 10s-6 8-8 11"/>',
    snus: '<ellipse cx="24" cy="18" rx="14" ry="5"/><path d="M10 18v8c0 2.8 6.3 5 14 5s14-2.2 14-5v-8"/><path class="f-line" d="M10 22c0 2.8 6.3 5 14 5s14-2.2 14-5"/><ellipse cx="24" cy="18" rx="7" ry="2.2"/>',
    pouch: '<rect x="15" y="17" width="18" height="12" rx="6"/><path d="M19 23h10" stroke-dasharray="1.5 2.5"/>',
    puff: '<circle cx="18" cy="28" r="5"/><circle cx="26" cy="24" r="7"/><circle cx="33" cy="30" r="4"/><circle cx="14" cy="18" r="2"/>',
    bottle: '<path d="M20 10h8v4l3 4v22a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3V18l3-4z"/><path d="M22 6h4v4h-4z"/><rect class="f" x="19" y="24" width="10" height="9" rx="1"/>',
  };
  // x/y in % of the section, size in px, r = rotation, c = colour, d = drift depth
  const LAYOUT = {
    ".hero": [
      { t: "bottle", x: 4, y: 52, s: 40, r: 10, c: "ink" },
      { t: "hookah", x: 98, y: 34, s: 50, r: 6, c: "ink" },
      { t: "pod", x: 2, y: 8, s: 46, r: -14, c: "red" },
      { t: "puff", x: 44, y: 4, s: 56, r: 0, c: "ink" },
      { t: "snus", x: 47, y: 84, s: 52, r: 10, c: "ink" },
      { t: "pen", x: 96, y: 88, s: 46, r: 22, c: "red" },
      { t: "pouch", x: 37, y: 92, s: 40, r: -18, c: "red" },
    ],
    ".has-watermark:not(.drinks)": [
      { t: "snus", x: 97, y: 86, s: 46, r: 10, c: "red" },
      { t: "pod", x: 30, y: 4, s: 38, r: -12, c: "ink" },
      { t: "hookah", x: 1, y: 12, s: 64, r: -6, c: "red" },
      { t: "bar", x: 97, y: 40, s: 48, r: 18, c: "ink" },
      { t: "puff", x: 2, y: 78, s: 50, r: 0, c: "ink" },
      { t: "bottle", x: 50, y: 6, s: 40, r: 12, c: "red" },
    ],
    ".deals": [
      { t: "snus", x: 92, y: 10, s: 60, r: -12, c: "white" },
      { t: "pod", x: 3, y: 18, s: 46, r: 16, c: "red" },
      { t: "pouch", x: 70, y: 22, s: 42, r: 24, c: "white" },
      { t: "puff", x: 50, y: 90, s: 64, r: 0, c: "white" },
      { t: "pen", x: 97, y: 82, s: 46, r: -20, c: "red" },
    ],
    ".section--grey": [
      { t: "pod", x: 34, y: 14, s: 36, r: 18, c: "red" },
      { t: "pouch", x: 98, y: 52, s: 34, r: -10, c: "ink" },
      { t: "bottle", x: 1.5, y: 30, s: 46, r: -10, c: "red" },
      { t: "hookah", x: 97, y: 18, s: 60, r: 8, c: "ink" },
      { t: "snus", x: 96, y: 86, s: 48, r: -8, c: "red" },
      { t: "bar", x: 2, y: 84, s: 44, r: 14, c: "ink" },
      { t: "puff", x: 60, y: 7, s: 52, r: 0, c: "ink" },
    ],
    ".drinks": [
      { t: "bar", x: 46, y: 8, s: 40, r: -16, c: "red" },
      { t: "hookah", x: 2, y: 38, s: 50, r: 6, c: "ink" },
      { t: "pod", x: 3, y: 10, s: 44, r: 12, c: "ink" },
      { t: "pouch", x: 40, y: 80, s: 40, r: -14, c: "red" },
      { t: "puff", x: 30, y: 30, s: 54, r: 0, c: "ink" },
      { t: "snus", x: 6, y: 66, s: 50, r: 8, c: "red" },
    ],
    "#visit": [
      { t: "snus", x: 3, y: 24, s: 46, r: 14, c: "red" },
      { t: "bar", x: 97, y: 18, s: 40, r: 16, c: "ink" },
      { t: "hookah", x: 96, y: 62, s: 62, r: -8, c: "red" },
      { t: "pen", x: 2, y: 70, s: 44, r: -24, c: "ink" },
      { t: "puff", x: 46, y: 92, s: 50, r: 0, c: "ink" },
    ],
  };
  let n = 0;
  Object.entries(LAYOUT).forEach(([sel, items]) => {
    document.querySelectorAll(sel).forEach((sec) => {
      if (getComputedStyle(sec).position === "static") sec.style.position = "relative";
      sec.classList.add("has-doodles");
      const layer = document.createElement("div");
      layer.className = "doodles";
      layer.setAttribute("aria-hidden", "true");
      layer.innerHTML = items.map((it, i) => {
        n++;
        const depth = ((n % 5) - 2) * 0.03 || 0.04;
        const emits = ["pod", "pen", "bar", "hookah"].includes(it.t) ? ` data-emit="${it.t}"` : "";
        return `<span class="doodle doodle--${it.c}${i > 2 ? " doodle--wide" : ""}"${emits} data-parallax="${depth.toFixed(2)}" style="left:${it.x}%;top:${it.y}%;--s:${Math.round(it.s * 1.5)}px">
          <svg viewBox="0 0 48 48" style="--r:${it.r}deg;--dur:${7 + (n % 5) * 1.3}s;--delay:${-(n % 7)}s">${S[it.t]}</svg></span>`;
      }).join("");
      sec.prepend(layer);
      const front = document.createElement("div");
      front.className = "vapour-front";
      front.setAttribute("aria-hidden", "true");
      sec.append(front);
    });
  });

  /* ---------- vapour clouds on scroll ---------- */
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const MAX = 34;
  let live = 0;
  const puff = (layer, x, y, size, opts = {}) => {
    if (live >= MAX) return;
    live++;
    const p = document.createElement("i");
    p.className = "vapour" + (opts.big ? " vapour--big" : "");
    // three blobs that billow independently make each cloud swirl as it rises
    p.innerHTML = "<b></b><b></b><b></b>";
    const dx = (Math.random() - 0.5) * (opts.big ? 220 : 110);
    const rise = opts.big ? 70 + Math.random() * 70 : 170 + Math.random() * 110;
    p.style.cssText = `left:${x}px;top:${y}px;--sz:${size}px;--dx:${dx.toFixed(0)}px;--rise:${rise.toFixed(0)}px;--t:${(opts.big ? 5.5 : 3.2) + Math.random() * 1.2}s;--spin:${(Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 40)}deg`;
    layer.appendChild(p);
    p.addEventListener("animationend", () => { p.remove(); live--; }, { once: true });
  };
  // a mouthpiece sits at the top of each drawing; the hookah smokes from its bowl
  const fromDoodle = (d) => {
    const layer = d.parentElement, lr = layer.getBoundingClientRect(), r = d.getBoundingClientRect();
    const x = r.left - lr.left + r.width * 0.5;
    const y = r.top - lr.top + r.height * (d.dataset.emit === "hookah" ? 0.12 : 0.08);
    if (y < 190) return; // too close to the section's top edge: the cloud would be cut off
    const n = 2 + Math.round(Math.random());
    const front = layer.parentElement.querySelector(":scope > .vapour-front") || layer;
    for (let i = 0; i < n; i++) setTimeout(() => puff(front, x + (Math.random() - 0.5) * 14, y, 48 + Math.random() * 46), i * 140);
  };
  const emitters = [...document.querySelectorAll(".doodle[data-emit]")];
  const onScreen = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0 && getComputedStyle(el).display !== "none"; };
  let last = 0, lastY = scrollY;
  addEventListener("scroll", () => {
    const now = performance.now();
    const speed = Math.abs(scrollY - lastY);
    if (now - last < 130 || speed < 6) return;
    last = now; lastY = scrollY;
    const vis = emitters.filter((d) => onScreen(d) && d.getBoundingClientRect().top - d.parentElement.getBoundingClientRect().top > 190);
    if (!vis.length) return;
    const bursts = Math.min(vis.length, speed > 120 ? 3 : speed > 40 ? 2 : 1);
    for (let i = 0; i < bursts; i++) fromDoodle(vis[Math.floor(Math.random() * vis.length)]);
  }, { passive: true });

  // a slow bank of vapour rolls through each section the first time it scrolls into view
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      const layer = e.target.querySelector(":scope > .doodles"); if (!layer) return;
      const w = layer.clientWidth, h = layer.clientHeight;
      const left = Math.random() < 0.5;
      for (let i = 0; i < 5; i++) setTimeout(() => puff(layer, (left ? 0.04 : 0.8) * w + Math.random() * w * 0.16, h * (0.4 + Math.random() * 0.3), 150 + Math.random() * 120, { big: true }), i * 180);
    }), { threshold: 0.25 });
    document.querySelectorAll(".has-doodles").forEach((s) => io.observe(s));
  }
})();
