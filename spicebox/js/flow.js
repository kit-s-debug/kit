/* The Spice Box: the bits that tie the page together and make it fun.
   - spiceBurst(x, y, opts): a pinch of spice confetti (canvas, physics, auto-stops when idle)
   - the spice trail: a dotted line of seeds that draws itself down the page, a star anise riding its tip
   - "pop" entrances: stickers and cards that bounce onto the screen
   Loaded before main.js so main.js can call window.spiceBurst. Does nothing under reduced motion. */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.spiceBurst = () => {};
  if (reduce) return;

  /* ---------- Spice confetti ---------- */
  const SPICES = [
    ["#E7B52F", "dust"], ["#F4D16B", "dust"],          // haldi
    ["#C0391F", "dust"], ["#D9472B", "chilli"],        // lal mirch
    ["#7b5a36", "seed"], ["#9b7a4f", "seed"],          // jeera
    ["#2a211b", "round"],                               // rai
    ["#c29a5e", "round"],                               // dhania
    ["#8a9a55", "pod"],                                 // elaichi
    ["#8a4b2a", "star"],                                // star anise
    ["#4f6a35", "leaf"],                                // curry leaf
  ];
  const canvas = document.createElement("canvas");
  canvas.className = "spice-canvas";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  const size = () => {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener("resize", size);

  const parts = [];
  let running = false;
  const rand = (a, b) => a + Math.random() * (b - a);

  const draw = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.globalAlpha = Math.min(1, p.life * 2);
    ctx.fillStyle = p.c;
    const s = p.s;
    switch (p.k) {
      case "seed": ctx.beginPath(); ctx.ellipse(0, 0, s * 1.3, s * 0.45, 0, 0, Math.PI * 2); ctx.fill(); break;
      case "pod": ctx.beginPath(); ctx.ellipse(0, 0, s * 1.4, s * 0.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.stroke(); break;
      case "chilli": ctx.beginPath(); ctx.ellipse(0, 0, s * 2.2, s * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#3f6b2c"; ctx.fillRect(-s * 2.6, -s * 0.3, s * 0.7, s * 0.6); break;
      case "leaf": ctx.beginPath(); ctx.moveTo(-s * 1.8, 0); ctx.quadraticCurveTo(0, -s * 1.3, s * 1.8, 0); ctx.quadraticCurveTo(0, s * 1.3, -s * 1.8, 0); ctx.fill(); break;
      case "star":
        for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.ellipse(s * 0.9, 0, s * 0.9, s * 0.38, 0, 0, Math.PI * 2); ctx.fill(); }
        break;
      case "round": ctx.beginPath(); ctx.arc(0, 0, s * 0.7, 0, Math.PI * 2); ctx.fill(); break;
      default: ctx.beginPath(); ctx.arc(0, 0, s * 0.45, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  };

  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      p.life -= p.decay;
      if (p.life <= 0 || p.y > H + 40) { parts.splice(i, 1); continue; }
      draw(p);
    }
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  };

  /* x, y in viewport px. opts: { count, spread (deg), angle (deg, -90 = up), power, palette: [[colour, kind]] } */
  window.spiceBurst = (x, y, opts = {}) => {
    const count = Math.min(opts.count ?? 36, 160 - parts.length);
    const palette = opts.palette || SPICES;
    const angle = ((opts.angle ?? -90) * Math.PI) / 180;
    const spread = ((opts.spread ?? 120) * Math.PI) / 180;
    const power = opts.power ?? 9;
    for (let i = 0; i < count; i++) {
      const [c, k] = palette[(Math.random() * palette.length) | 0];
      const a = angle + rand(-spread / 2, spread / 2);
      const v = rand(power * 0.45, power);
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: rand(0.22, 0.34), drag: 0.985,
        r: rand(0, Math.PI * 2), vr: rand(-0.25, 0.25), s: k === "dust" ? rand(3, 6) : rand(3.5, 7),
        c, k, life: 1, decay: rand(0.008, 0.016),
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  };
  window.SPICE_PALETTES = {
    haldi: [["#E7B52F", "dust"], ["#F4D16B", "dust"], ["#c9921a", "dust"]],
    chilli: [["#C0391F", "dust"], ["#D9472B", "chilli"], ["#8f2414", "dust"]],
    jeera: [["#7b5a36", "seed"], ["#9b7a4f", "seed"], ["#5a3d22", "seed"]],
    rai: [["#2a211b", "round"], ["#3a2c24", "round"]],
    dhania: [["#c29a5e", "round"], ["#b38b52", "round"]],
    elaichi: [["#8a9a55", "pod"], ["#6d7d3e", "pod"]],
    laung: [["#5a3322", "seed"], ["#6b3d27", "round"]],
  };

  // A pinch of spice wherever you click (but not when you're clicking a control)
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const control = e.target.closest("a, button, input, label, dialog, .finder-list");
    window.spiceBurst(e.clientX, e.clientY, { count: control ? 14 : 22, power: control ? 6 : 8, spread: 160 });
  });

  /* Everything below needs GSAP */
  const gsap = window.gsap, ST = window.ScrollTrigger;
  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);

  const ready = (fn) => (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn());
  ready(() => {
    /* ---------- The spice trail ---------- */
    // Each listed section gets a segment: it enters at the top at x% and leaves at the bottom at y%,
    // so segment ends line up and the trail reads as one line down the page.
    const ROUTE = [
      [".manifesto", 50, 86], [".story", 86, 10], [".shelf", 12, 90],
      [".why", 90, 8], [".reviews", 8, 92], [".find", 92, 50],
    ];
    const NS = "http://www.w3.org/2000/svg";
    const mk = (tag, attrs) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); return el; };
    const segs = ROUTE.map(([sel, x0, x1], i) => {
      const sec = document.querySelector(sel);
      if (!sec) return null;
      const svg = mk("svg", { class: "trail", "aria-hidden": "true" });
      const mask = mk("mask", { id: "trail-m" + i, maskUnits: "userSpaceOnUse" });
      const reveal = mk("path", { class: "trail-reveal" });
      mask.appendChild(reveal);
      const dots = mk("path", { class: "trail-dots", mask: `url(#trail-m${i})` });
      const head = mk("use", { href: "#s-anise", class: "trail-head", width: 38, height: 38 });
      svg.append(mask, dots, head);
      sec.prepend(svg);
      return { sec, svg, reveal, dots, head, x0, x1, len: 0, i };
    }).filter(Boolean);

    const build = (s) => {
      const w = s.sec.offsetWidth, h = s.sec.offsetHeight;
      s.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const X = (pc) => (pc / 100) * w;
      const a = X(s.x0), b = X(s.x1);
      // A lazy S-curve with a little loop-the-loop in the middle, like a trail of spilled seeds
      const midY = h * 0.5, sway = Math.min(w * 0.18, 220) * (s.i % 2 ? -1 : 1);
      const d = `M ${a} -10
        C ${a} ${h * 0.18}, ${a + sway} ${h * 0.26}, ${(a + b) / 2 + sway * 0.6} ${midY - 60}
        S ${(a + b) / 2 - sway * 0.9} ${midY + 70}, ${(a + b) / 2} ${midY + 10}
        S ${b - sway * 0.5} ${h * 0.82}, ${b} ${h + 10}`;
      s.dots.setAttribute("d", d);
      s.reveal.setAttribute("d", d);
      s.len = s.dots.getTotalLength();
      s.reveal.style.strokeDasharray = s.len;
      s.reveal.style.strokeDashoffset = s.len * (1 - (s.p || 0));
    };
    const place = (s, p) => {
      s.p = p;
      s.reveal.style.strokeDashoffset = s.len * (1 - p);
      const L = Math.max(1, s.len * p);
      const pt = s.dots.getPointAtLength(L);
      s.head.setAttribute("x", pt.x - 19);
      s.head.setAttribute("y", pt.y - 19);
      s.head.style.transform = `rotate(${(L * 0.9) % 360}deg)`;
      s.head.style.transformOrigin = `${pt.x}px ${pt.y}px`;
      s.head.style.opacity = p > 0.01 && p < 0.995 ? 1 : 0;
    };
    segs.forEach((s) => {
      build(s);
      ST.create({
        trigger: s.sec, start: "top 85%", end: "bottom 55%", scrub: 0.6,
        onUpdate: (self) => place(s, self.progress),
        onRefresh: (self) => { build(s); place(s, self.progress); },
      });
    });

    /* ---------- Pop entrances: things bounce onto the screen ---------- */
    const pop = (sel, vars = {}) => ST.batch(sel, {
      start: "top 92%",
      once: true,
      onEnter: (els) => gsap.fromTo(els,
        { opacity: 0, scale: vars.scale ?? 0.4, y: vars.y ?? 60, rotation: () => gsap.utils.random(-14, 14) },
        { opacity: 1, scale: 1, y: 0, rotation: (i, el) => parseFloat(el.dataset.rot || 0), duration: vars.duration ?? 1, ease: vars.ease ?? "elastic.out(1, 0.55)", stagger: 0.07, overwrite: "auto" }),
    });
    // On desktop the aisle stickers and chips ride the sideways shelf, so main.js times them to that instead
    const sideways = matchMedia("(min-width: 901px)").matches;
    gsap.set(".filter, .next, .sign-quote, .g-cap, .find-facts dt", { opacity: 0 });
    if (!sideways) {
      gsap.set(".sticker, .aisle-chips li", { opacity: 0 });
      pop(".sticker", { scale: 2.4, y: -30, ease: "back.out(2.6)", duration: 0.7 });
      pop(".aisle-chips li", { scale: 0.2, y: 30 });
    }
    pop(".filter", { scale: 0.3, y: 30 });
    pop(".next", { scale: 0.3, y: 40 });
    pop(".sign-quote", { scale: 1.6, y: -20, ease: "back.out(2.2)", duration: 0.8 });
    pop(".g-cap", { scale: 0.5, y: 20 });
    pop(".find-facts dt", { scale: 0.4, y: 10 });

    /* ---------- Headings land with a puff of spice ---------- */
    document.querySelectorAll("[data-split]").forEach((el) => {
      ST.create({
        trigger: el, start: "top 80%", once: true,
        onEnter: () => {
          const r = el.getBoundingClientRect();
          setTimeout(() => window.spiceBurst(r.left + Math.min(r.width, 400) * 0.5, r.top + 10, { count: 18, power: 7, spread: 140 }), 450);
        },
      });
    });

    /* ---------- The sticker rail wobbles stickers as they pass ---------- */
    document.querySelectorAll(".rail span, .sticker, .why-list li, .score, .g button").forEach((el) => {
      el.addEventListener("pointerenter", () => gsap.fromTo(el, { rotation: "-=6" }, { rotation: "+=6", duration: 0.9, ease: "elastic.out(1.4, 0.3)" }));
    });

    /* ---------- "Next" notes: a joyful hop when they come into view, then a nudge every few seconds ---------- */
    document.querySelectorAll(".next svg").forEach((svg) => {
      gsap.to(svg, { y: 8, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    });
  });
})();
