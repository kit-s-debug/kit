/* The Spice Box: page behaviour.
   Motion uses GSAP + ScrollTrigger, vendored in js/vendor/. Scrolling is the browser's own: no smoothing
   or momentum is added, and scroll-linked scenes track the scroll position directly. If they fail to load, or the visitor
   prefers reduced motion, the page is fully usable without them: nothing is hidden by CSS alone. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  const motion = !!(gsap && ST) && !reduceMotion;
  if (motion) {
    root.classList.add("motion");
    gsap.registerPlugin(ST);
    ST.config({ ignoreMobileResize: true }); // the phone address bar showing/hiding must not re-lay-out the scenes mid-scroll
    gsap.globalTimeline.timeScale(0.8); // a touch slower and calmer across the board
  }

  /* ---------- Smooth scroll ---------- */
  /* Calmer wheel scrolling: each notch moves about 40% as far, with a short ease (no long glide).
     Touch scrolling stays native. */
  let lenis = null;
  if (motion && window.Lenis) {
    lenis = new window.Lenis({ smoothWheel: true, wheelMultiplier: 0.4, lerp: 0.2, syncTouch: false });
    lenis.on("scroll", ST.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollToEl = (el) => {
    if (!el) return;
    if (lenis) { lenis.scrollTo(el, { duration: 1.2 }); return; }
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const el = document.getElementById(id.slice(1));
    if (!el) return;
    e.preventDefault();
    scrollToEl(el);
    history.replaceState(null, "", id === "#top" ? location.pathname : id);
  });

  /* ---------- Split headings into masked words ---------- */
  const splitWords = (el, cls = "w") => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(" "); return; }
            const w = document.createElement("span");
            w.className = cls;
            w.setAttribute("aria-hidden", "true");
            const inner = document.createElement("span");
            inner.textContent = part;
            inner.style.setProperty("--i", i++);
            w.append(inner);
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) walk(child);
      });
    };
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walk(el);
  };
  if (motion) {
    $$("[data-split]").forEach((el) => splitWords(el));
    $$(".ht-line").forEach((el) => splitWords(el));
    $(".hero-title").setAttribute("aria-label", $(".hero-title").textContent.replace(/\s+/g, " ").trim());
    $$("[data-words]").forEach((el) => splitWords(el, "mw"));
  }

  /* ---------- Navigation ---------- */
  const nav = $("#nav");
  const burger = $(".burger");
  const menu = $("#menu");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("locked", open);
    if (open) {
      
      lenis?.stop();
      menu.hidden = false;
      nav.classList.add("is-solid");
      nav.classList.remove("is-hidden");
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
      $("a", menu).focus({ preventScroll: true });
    } else {
      
      lenis?.start();
      menu.classList.remove("is-open");
      const done = () => { if (!menu.classList.contains("is-open")) menu.hidden = true; };
      reduceMotion ? done() : setTimeout(done, 700);
    }
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") { setMenu(false); burger.focus(); }
  });
  menu.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const items = $$("a", menu);
    if (e.shiftKey && document.activeElement === items[0]) { e.preventDefault(); burger.focus(); }
    if (!e.shiftKey && document.activeElement === items[items.length - 1]) { e.preventDefault(); burger.focus(); }
  });
  burger.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.shiftKey && burger.getAttribute("aria-expanded") === "true") { e.preventDefault(); $("a", menu).focus(); }
  });
  matchMedia("(min-width: 1081px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  // Which section is in view
  const navLinks = $$(".nav-links a");
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((a) => { const s = $(a.getAttribute("href")); if (s) sectionIO.observe(s); });

  // Solid / hide-on-scroll-down nav, spinning lid logo, progress line
  const lidLogo = $(".wordmark-lid");
  const progress = $(".progress");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
    lidLogo.style.setProperty("--spin", `${(y * 0.25).toFixed(1)}deg`);
    const menuOpen = document.body.classList.contains("locked");
    nav.classList.toggle("is-solid", y > 24 || menuOpen);
    if (!menuOpen) nav.classList.toggle("is-hidden", y > innerHeight * 1.2 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove("is-hidden");
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Data ---------- */
  const STOCK = Array.isArray(window.SPICEBOX_STOCK) ? window.SPICEBOX_STOCK : [];
  const CATS = $$(".aisle").map((a) => ({ id: a.dataset.cat, name: $("h3", a).textContent.trim() }));
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ");
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Aisle panels: counts and a sample of what's on the shelf ---------- */
  const sample = (cat, n = 8) => {
    const items = STOCK.filter((r) => r[1] === cat);
    const step = Math.max(1, Math.floor(items.length / n));
    return items.filter((_, i) => i % step === 0).slice(0, n).map((r) => r[0]);
  };
  $$(".aisle").forEach((a) => {
    const cat = a.dataset.cat;
    $("[data-count]", a).textContent = STOCK.filter((r) => r[1] === cat).length;
    $("[data-chips]", a).innerHTML = sample(cat).map((n) => `<li>${esc(n)}</li>`).join("");
  });

  /* ---------- Shelf search ---------- */
  const q = $("#q"), list = $("#list"), count = $("#count"), empty = $("#empty"), filters = $("#filters");
  let activeCat = "all";
  filters.innerHTML = [{ id: "all", name: "Everything" }, ...CATS]
    .map((c) => `<button type="button" class="filter" data-cat="${c.id}" aria-pressed="${c.id === "all"}">${esc(c.name)}</button>`).join("");
  const setFilter = (cat) => {
    activeCat = cat;
    $$(".filter", filters).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.cat === cat)));
    render();
  };
  filters.addEventListener("click", (e) => { const b = e.target.closest(".filter"); if (b) setFilter(b.dataset.cat); });
  const highlight = (name, words) => {
    let out = esc(name);
    words.forEach((w) => {
      if (w.length < 2) return;
      out = out.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig"), "<mark>$1</mark>");
    });
    return out;
  };
  function render() {
    const words = norm(q.value).split(" ").filter(Boolean);
    const hits = STOCK.filter(([name, cat, shelf, alt]) => {
      if (activeCat !== "all" && cat !== activeCat) return false;
      const hay = norm(`${name} ${shelf} ${alt}`);
      return words.every((w) => hay.includes(w));
    }).sort((a, b) => a[0].localeCompare(b[0]));
    list.innerHTML = hits.map(([name, , shelf]) => `<li><span>${highlight(name, words)}</span><small>${esc(shelf)}</small></li>`).join("");
    list.scrollTop = 0;
    count.textContent = `${hits.length} item${hits.length === 1 ? "" : "s"} on the list`;
    empty.hidden = hits.length > 0;
    list.hidden = hits.length === 0;
  }
  let qt;
  q.addEventListener("input", () => { clearTimeout(qt); qt = setTimeout(render, 80); });
  $$("[data-try]").forEach((b) => b.addEventListener("click", () => { q.value = b.dataset.try; setFilter("all"); q.focus({ preventScroll: true }); }));
  $$("[data-browse]").forEach((a) => a.addEventListener("click", () => { q.value = ""; setFilter(a.dataset.browse); }));
  render();

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox");
  const lbImg = $("#lb-img"), lbCap = $("#lb-cap");
  const shots = $$("[data-lightbox]").map((b) => {
    const img = $("img", b);
    const big = (img.getAttribute("srcset") || "").split(",").pop().trim().split(" ")[0] || img.getAttribute("src");
    return { src: big, alt: img.alt, cap: b.parentElement.querySelector(".g-cap")?.textContent || "" };
  });
  let current = 0, opener = null;
  const show = (i) => {
    current = (i + shots.length) % shots.length;
    const s = shots[current];
    lbImg.src = s.src; lbImg.alt = s.alt; lbCap.textContent = `${s.cap} · ${current + 1} / ${shots.length}`;
  };
  const supportsDialog = typeof lb.showModal === "function";
  $$("[data-lightbox]").forEach((b) => b.addEventListener("click", () => {
    if (!supportsDialog) { window.open(shots[+b.dataset.lightbox].src, "_blank", "noopener"); return; }
    opener = b; show(+b.dataset.lightbox); lb.showModal(); document.body.classList.add("locked"); lenis?.stop(); 
  }));
  lb.addEventListener("close", () => { document.body.classList.remove("locked"); lenis?.start();  lbImg.removeAttribute("src"); opener?.focus({ preventScroll: true }); });
  lb.addEventListener("click", (e) => {
    const action = e.target.closest("[data-lb]")?.dataset.lb;
    if (action === "close" || e.target === lb) lb.close();
    if (action === "prev") show(current - 1);
    if (action === "next") show(current + 1);
  });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Map (loads only on request) ---------- */
  $("#map-load").addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.title = "Map showing The Spice Box, 27 Dew Street, Haverfordwest";
    frame.loading = "lazy";
    frame.referrerPolicy = "no-referrer-when-downgrade";
    frame.src = "https://www.google.com/maps?q=" + encodeURIComponent("The Spice Box, 27 Dew Street, Haverfordwest SA61 1ST") + "&z=17&output=embed";
    $("#map-ph").replaceWith(frame);
  });

  $("#year").textContent = new Date().getFullYear();

  if (!motion) return; /* ======== Everything below is enhancement ======== */

  /* ---------- Cursor ---------- */
  if (finePointer) {
    root.classList.add("has-cursor");
    const cursor = $(".cursor"), label = $(".cursor-label");
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }, tgt = { ...pos };
    addEventListener("pointermove", (e) => { tgt.x = e.clientX; tgt.y = e.clientY; }, { passive: true });
    gsap.ticker.add(() => {
      pos.x += (tgt.x - pos.x) * 0.22; pos.y += (tgt.y - pos.y) * 0.22;
      cursor.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    });
    document.addEventListener("pointerover", (e) => {
      const view = e.target.closest("[data-lightbox], .aisle-photo");
      const link = e.target.closest("a, button, input, .filter");
      cursor.classList.toggle("is-view", !!view);
      cursor.classList.toggle("is-link", !view && !!link);
      label.textContent = view ? (view.matches("[data-lightbox]") ? "View" : "Look") : "";
    });
  }

  /* ---------- Magnetic buttons ---------- */
  if (finePointer) {
    $$(".magnetic").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.3);
        yTo((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener("pointerleave", () => { xTo(0); yTo(0); });
    });
    // 3D tilt on cards
    $$(".tilt").forEach((el) => {
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 10);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 10);
      });
      el.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
  }

  /* ---------- Hero: intro, then scroll lifts the lid and dives into the turmeric ---------- */
  const hero = $(".hero");
  const dabba = $(".dabba"), lid = $(".dabba-lid"), base = $(".dabba-base");
  gsap.timeline({ defaults: { ease: "power4.out" } })
    .from(base, { scale: 0.55, rotation: -80, opacity: 0, duration: 1.8 })
    .from(lid, { scale: 1.35, rotation: 90, opacity: 0, duration: 1.6 }, 0.15)
    .from(".ht-line .w > span", { yPercent: 110, duration: 1.2, stagger: 0.06 }, 0.35)
    .from(".hero-locator", { opacity: 0, y: -12, duration: 1 }, 0.6)
    .from(".hero-foot > *, .hero-hint", { opacity: 0, y: 24, duration: 1, stagger: 0.1 }, 0.9)
    .from(".hero .fl", { opacity: 0, scale: 0.4, duration: 1.4, stagger: 0.08 }, 0.6);

  const bowls = $$(".bowls li");
  const mm = gsap.matchMedia();
  const puff = (self, at) => {
    // The lid pops off with a puff of every spice in the box
    if (self.progress > at && !hero.dataset.puffed && self.direction > 0) {
      hero.dataset.puffed = "1";
      const r = dabba.getBoundingClientRect();
      window.spiceBurst?.(r.left + r.width / 2, r.top + r.height / 2, { count: 90, power: 16, spread: 300 });
    }
    if (self.progress < 0.05) delete hero.dataset.puffed;
  };
  mm.add("(min-width: 901px)", () => {
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero, start: "top top", end: () => "+=" + innerHeight * 1.8,
        pin: true, scrub: 0.4, anticipatePin: 1,
        onUpdate: (self) => {
          hero.classList.toggle("is-open", self.progress > 0.25 && self.progress < 0.62);
          puff(self, 0.12);
        },
      },
    })
      .to(lid, { xPercent: 70, yPercent: -95, rotation: 160, ease: "power2.in", duration: 1 }, 0)
      .to(".hero-hint, .hero-foot", { opacity: 0, y: 30, duration: 0.4 }, 0)
      .to(".ht-1", { xPercent: -14, duration: 1.4 }, 0)
      .to(".ht-2", { xPercent: 14, duration: 1.4 }, 0)
      .to(base, { rotation: -24, duration: 2.4 }, 0)
      .to(bowls, { opacity: 1, scale: 1, duration: 0.35, stagger: 0.1, ease: "back.out(1.5)" }, 0.75)
      .to(".hero-title, .hero-locator", { opacity: 0, duration: 0.4 }, 1.8)
      .to(bowls, { opacity: 0, duration: 0.25 }, 1.9)
      .to(dabba, { scale: 9, duration: 1.3, ease: "power2.in", force3D: false }, 2) // 2D so the browser repaints sharp
      .to(".dabba-zoom", { opacity: 1, duration: 0.5, ease: "none" }, 2.1) // swap in the hi-res turmeric bowl as we dive
      .to(".hero .fl", { scale: 2.4, opacity: 0, duration: 1, stagger: 0.04 }, 2)
      .to(".hero-flood", { opacity: 1, duration: 0.35 }, 2.95);
  });
  // Phones: no pinning and no zoom dive (both fight the browser's address bar and stutter on touch).
  // The lid lifts and the bowls appear as the hero scrolls away, at your pace.
  mm.add("(max-width: 900px)", () => {
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero, start: "top top", end: "bottom top", scrub: 0.4,
        onUpdate: (self) => { hero.classList.toggle("is-open", self.progress > 0.2); puff(self, 0.1); },
      },
    })
      .to(lid, { xPercent: 60, yPercent: -80, rotation: 140, ease: "power2.in", duration: 0.5 }, 0)
      .to(".hero-foot", { opacity: 0, y: 30, duration: 0.3 }, 0)
      .to(base, { rotation: -24, duration: 1 }, 0)
      .to(bowls, { opacity: 1, scale: 1, duration: 0.2, stagger: 0.04, ease: "back.out(1.5)" }, 0.25);
  });
  gsap.set(bowls, { scale: 0.6 });
  // Tap a bowl for a pinch of that spice
  const bowlSpice = ["haldi", "chilli", "jeera", "rai", "dhania", "elaichi", "laung"];
  bowls.forEach((li, i) => li.addEventListener("pointerdown", (e) => {
    window.spiceBurst?.(e.clientX, e.clientY, { count: 40, power: 11, palette: window.SPICE_PALETTES?.[bowlSpice[i]] });
    gsap.fromTo($("span", li), { scale: 1.5, rotation: -14 }, { scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(0.9, 0.6)" });
  }));

  /* ---------- Floating spice bits drift with scroll ---------- */
  $$(".fl").forEach((el) => {
    if (el.closest(".hero")) return;
    const speed = parseFloat(el.dataset.speed || "-1");
    gsap.to(el, {
      y: speed * 120, rotation: speed * 40, ease: "none",
      scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: 0.4 },
    });
  });

  /* ---------- Manifesto words light up as you read ---------- */
  gsap.fromTo(".manifesto .mw > span", { opacity: 0.14 }, {
    opacity: 1, stagger: 0.08, ease: "none",
    scrollTrigger: {
      trigger: ".manifesto", start: "top 65%", end: "bottom 70%", scrub: 0.4,
    },
  });
  gsap.from(".manifesto-tag", { opacity: 0, x: -40, rotation: -8, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".manifesto", start: "top 70%" } });

  /* ---------- Shelf rail: speeds up and reverses with scroll ---------- */
  const railTrack = $(".rail-track");
  let railX = 0, railDir = 1, railLastY = window.scrollY;
  gsap.ticker.add(() => {
    const y = window.scrollY, v = (y - railLastY) * 0.5; railLastY = y;
    if (v) railDir = v > 0 ? 1 : -1;
    railX -= (0.6 + Math.min(Math.abs(v) * 0.5, 18)) * railDir;
    const half = railTrack.scrollWidth / 2;
    if (railX <= -half) railX += half;
    if (railX > 0) railX -= half;
    railTrack.style.transform = `translate3d(${railX}px,0,0) skewX(${gsap.utils.clamp(-8, 8, -v * 0.35)}deg)`;
  });

  /* ---------- Split headings rise when they enter ---------- */
  $$("[data-split]").forEach((el) => {
    gsap.from($$(".w > span", el), {
      yPercent: 110, rotation: 4, duration: 1.1, stagger: 0.05, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
  // General entrances
  const rise = (targets, trigger, extra = {}) => gsap.from(targets, {
    opacity: 0, y: 50, duration: 1.1, stagger: 0.1, ease: "power4.out", ...extra,
    scrollTrigger: { trigger: trigger || targets, start: "top 85%" },
  });
  rise(".story-text p", ".story-text"); // .sign-quote pops in via flow.js
  $$(".eyebrow").forEach((el) => {
    if (el.closest(".aisles, .gallery")) return; // those enter with their pinned scenes
    gsap.from(el, { opacity: 0, x: -30, duration: 1, ease: "power4.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  /* ---------- Story: photo parallax and hand-drawn notes ---------- */
  gsap.fromTo(".story-photo img", { scale: 1.25, yPercent: -6 }, {
    scale: 1.02, yPercent: 6, ease: "none",
    scrollTrigger: { trigger: ".story-media", start: "top bottom", end: "bottom top", scrub: 0.4 },
  });
  gsap.from(".story-photo", { clipPath: "inset(100% 0 0 0 round 200px 200px 18px 18px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: ".story-media", start: "top 80%" } });
  $$(".note").forEach((n, i) => {
    const path = $(".draw", n);
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.timeline({ scrollTrigger: { trigger: ".story-media", start: "top 55%" }, delay: 0.6 + i * 0.4 })
      .from(n, { opacity: 0, scale: 0.6, rotation: i ? -14 : 14, duration: 0.8, ease: "back.out(1.5)" })
      .to(path, { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }, 0.2);
  });

  /* ---------- Aisles: horizontal shelf on desktop, stacked on mobile ---------- */
  const track = $("#aisles-track");
  const tag = $(".aisles-tag b"), rail = $(".aisles-rail");
  mm.add("(min-width: 901px)", () => {
    const dist = () => track.scrollWidth - innerWidth;
    const slide = gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: {
        trigger: ".aisles", start: "top top", end: () => "+=" + dist() * 0.65 /* shelf moves ~1.5x your scroll, so it never feels stuck */, pin: true, scrub: 0.4, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => {
          rail.style.setProperty("--ap", self.progress.toFixed(4));
          tag.textContent = String(Math.min(7, Math.floor(self.progress * 7) + 1)).padStart(2, "0");
        },
      },
    });
    $$(".aisle").forEach((a) => {
      gsap.fromTo($(".aisle-photo img", a), { scale: 1.3, xPercent: -8 }, {
        scale: 1.05, xPercent: 8, ease: "none",
        scrollTrigger: { trigger: a, containerAnimation: slide, start: "left right", end: "right left", scrub: 0.4 },
      });
      const tl = gsap.timeline({ scrollTrigger: { trigger: a, containerAnimation: slide, start: "left 72%" } });
      tl.from($$(".aisle-num, h3", a), { opacity: 0, y: 40, rotation: 3, stagger: 0.08, duration: 0.8, ease: "power4.out" })
        .from($(".sticker", a), { opacity: 0, scale: 2.6, rotation: -24, duration: 0.6, ease: "back.out(1.7)" }, 0.25)
        .from($$(".aisle-chips li", a), { opacity: 0, scale: 0.2, y: 20, rotation: () => gsap.utils.random(-20, 20), stagger: 0.04, duration: 0.8, ease: "elastic.out(0.8, 0.75)" }, 0.4);
    });
    gsap.from(".aisles-head > *", { opacity: 0, y: 40, stagger: 0.1, duration: 1, ease: "power4.out", scrollTrigger: { trigger: ".aisles", start: "top 70%" } });
  });
  // Phones: the aisles are a swipeable row of cards; they slide in together once
  mm.add("(max-width: 900px)", () => {
    gsap.from(".aisle", { opacity: 0, x: 80, duration: 1, stagger: 0.08, ease: "power4.out", scrollTrigger: { trigger: track, start: "top 85%" } });
  });

  /* ---------- Shelf search entrance ---------- */
  gsap.from(".finder", { y: 80, rotation: 1.5, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: ".finder", start: "top 85%" } });
  rise(".shelf-head p:not(.eyebrow)", ".shelf-head"); // the eyebrow has its own entrance

  /* ---------- Gallery: the centre photo starts full screen and zooms out into the grid ---------- */
  const gallery = $(".gallery");
  const centre = $(".g-c button");
  const offsetIn = (el, anc) => { let x = 0, y = 0; while (el && el !== anc) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return { x, y }; };
  mm.add("(min-width: 901px)", () => {
    const zoom = $(".g-zoom"), zoomImg = $("img", zoom);
    // Start: as large as the photo's real pixels allow (full screen on most displays), centred.
    // End: exactly over the centre grid tile. Only the frame's size changes, so the photo is always drawn sharp.
    const startBox = () => {
      const cap = ((zoomImg.naturalWidth || 1170) * 1.3) / (window.devicePixelRatio || 1);
      const w = Math.min(innerWidth, cap), h = Math.min(innerHeight, (cap * innerHeight) / innerWidth);
      return { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h };
    };
    const endBox = () => { const o = offsetIn(centre, gallery); return { left: o.x, top: o.y, width: centre.offsetWidth, height: centre.offsetHeight }; };
    gsap.set(centre, { opacity: 0 });
    gsap.timeline({
      scrollTrigger: {
        trigger: gallery, start: "top top", end: () => "+=" + innerHeight * 1.0, pin: true, scrub: 0.4, invalidateOnRefresh: true, anticipatePin: 1,
        // hand over to the real tile once the frame has landed, so its hover and click work
        onLeave: () => { gsap.set(centre, { opacity: 1 }); gsap.set(zoom, { autoAlpha: 0 }); },
        onEnterBack: () => { gsap.set(centre, { opacity: 0 }); gsap.set(zoom, { autoAlpha: 1 }); },
      },
    })
      .fromTo(zoom,
        { left: () => startBox().left, top: () => startBox().top, width: () => startBox().width, height: () => startBox().height, borderRadius: 0 },
        { left: () => endBox().left, top: () => endBox().top, width: () => endBox().width, height: () => endBox().height, borderRadius: 14, ease: "power2.inOut", duration: 1 }, 0)
      .fromTo(zoomImg, { scale: 1.06 }, { scale: 1, duration: 1, ease: "none", force3D: false }, 0)
      // fromTo, not from: this timeline is invalidated on refresh, and a from() would re-read its hidden state as the end state
      .fromTo(".g-1, .g-2", { xPercent: -40, opacity: 0 }, { xPercent: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }, 0.45)
      .fromTo(".g-3, .g-4", { xPercent: 40, opacity: 0 }, { xPercent: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power3.out" }, 0.45)
      .fromTo(".gallery-head, .g-cap", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4 }, 0.7);
    return () => gsap.set(centre, { opacity: 1 });
  });
  mm.add("(max-width: 900px)", () => {
    $$(".g").forEach((g, i) => gsap.from(g, { opacity: 0, y: 60, scale: 0.9, duration: 1, delay: (i % 2) * 0.1, ease: "power4.out", scrollTrigger: { trigger: g, start: "top 90%" } }));
  });

  /* ---------- Why visit: cards fall into place like shelf tags ---------- */
  gsap.from(".why-list li", {
    y: 140, rotation: (i) => [-8, 6, -4, 9][i % 4], opacity: 0, duration: 1.3, stagger: 0.12, ease: "power4.out",
    scrollTrigger: { trigger: ".why-list", start: "top 85%" },
  });

  /* ---------- Reviews: numbers count up, cards rise ---------- */
  gsap.from(".reviews-grid > *", { y: 90, opacity: 0, duration: 1.2, stagger: 0.12, ease: "power4.out", scrollTrigger: { trigger: ".reviews-grid", start: "top 85%" } });
  const stars = $(".stars span");
  $$("[data-countup]").forEach((el) => {
    const end = parseFloat(el.dataset.countup), dec = parseInt(el.dataset.decimals || "0", 10);
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onComplete: () => { if (dec) { const r = el.getBoundingClientRect(); window.spiceBurst?.(r.left + r.width / 2, r.top, { count: 60, power: 12, palette: window.SPICE_PALETTES?.haldi }); } },
      onUpdate: () => {
        el.textContent = o.v.toFixed(dec);
        if (dec) stars.style.setProperty("--fill", `${(o.v / 5) * 100}%`); // stars fill in step with the rating
      },
    });
  });
  gsap.from(".stamp", { scale: 2.2, rotation: -40, opacity: 0, duration: 0.9, ease: "back.out(1.4)", scrollTrigger: { trigger: ".stamp", start: "top 85%" } });
  gsap.from(".themes li", { x: 40, opacity: 0, stagger: 0.1, duration: 0.9, ease: "power4.out", scrollTrigger: { trigger: ".themes", start: "top 85%" } });

  /* ---------- Find us ---------- */
  rise(".find-address, .find-facts > div, .find-actions", ".find-copy");
  gsap.from(".map", { scale: 0.8, rotation: -4, opacity: 0, duration: 1.4, ease: "power4.out", scrollTrigger: { trigger: ".map", start: "top 85%" } });
  gsap.fromTo(".map-lines", { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".map", start: "top bottom", end: "bottom top", scrub: 0.4 } });

  /* ---------- Closing: the lid goes back on ---------- */
  const cta = $(".cta");
  gsap.timeline({ scrollTrigger: {
    trigger: cta, start: "top bottom", end: "center center", scrub: 0.4,
    onLeave: () => { const r = $(".cta-dabba").getBoundingClientRect(); window.spiceBurst?.(r.left + r.width / 2, r.top + r.height * 0.2, { count: 80, power: 15, spread: 220 }); },
  } })
    .fromTo(".cta-lid", { xPercent: 60, yPercent: -80, rotation: -160, opacity: 0 }, { xPercent: 0, yPercent: 0, rotation: 0, opacity: 1, ease: "power2.out" }, 0)
    .fromTo(".cta-base", { rotation: 40, scale: 0.85 }, { rotation: 0, scale: 1, ease: "power2.out" }, 0);
  rise(".cta-inner > p, .cta-actions", ".cta-inner");

  /* ---------- Footer: giant wordmark slides up from behind the rail ---------- */
  gsap.from(".foot-giant span", { yPercent: 100, ease: "none", scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: 0.4 } });

  // Recalculate pinned scenes once fonts and images have settled
  const refresh = () => ST.refresh();
  document.fonts?.ready.then(refresh);
  addEventListener("load", refresh);
})();
