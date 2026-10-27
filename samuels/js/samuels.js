/* Samuel's Quality Sandwiches — interactions and scroll choreography.
   Everything is readable without this file; GSAP only adds motion on top. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- nav: solid background once the hero is scrolled past ---------- */
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("is-scrolled", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile drawer ---------- */
  var toggle = $(".nav-toggle");
  var drawer = $("#drawer");
  var lastFocus = null;

  // DOM order: the toggle sits in the header just before the drawer.
  function focusables() { return [toggle].concat($$("a, button", drawer)); }
  function openDrawer() {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    // next frame so the clip-path transition runs
    requestAnimationFrame(function () { drawer.classList.add("is-open"); });
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close menu");
    doc.style.overflow = "hidden";
    var first = $("a", drawer);
    if (first) setTimeout(function () { first.focus(); }, 80);
  }
  function closeDrawer(returnFocus) {
    drawer.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    doc.style.overflow = "";
    setTimeout(function () { if (!drawer.classList.contains("is-open")) drawer.hidden = true; }, reduceMotion.matches ? 0 : 600);
    if (returnFocus !== false && lastFocus) lastFocus.focus();
  }
  toggle.addEventListener("click", function () {
    toggle.getAttribute("aria-expanded") === "true" ? closeDrawer() : openDrawer();
  });
  drawer.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeDrawer(false);
  });
  document.addEventListener("keydown", function (e) {
    if (toggle.getAttribute("aria-expanded") !== "true") return;
    if (e.key === "Escape") { closeDrawer(); return; }
    if (e.key === "Tab") {
      var items = focusables();
      var i = items.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && (i === -1 || i === items.length - 1)) { e.preventDefault(); items[0].focus(); }
    }
  });
  window.matchMedia("(min-width: 901px)").addEventListener("change", function (m) {
    if (m.matches && toggle.getAttribute("aria-expanded") === "true") closeDrawer(false);
  });

  /* ---------- scroll-spy for the nav and the menu tabs ---------- */
  if ("IntersectionObserver" in window) {
    var navLinks = $$(".nav-links a");
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.setAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id ? "true" : "false");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["about", "food", "menu", "visit"].forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });

    var tabs = $(".menu-tabs");
    var tabLinks = $$("a", tabs);
    var catSpy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        tabLinks.forEach(function (a) {
          var on = a.getAttribute("href") === "#" + en.target.id;
          a.setAttribute("aria-current", on ? "true" : "false");
          if (on) tabs.scrollTo({ left: a.offsetLeft - 16, behavior: reduceMotion.matches ? "auto" : "smooth" });
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    $$(".menu-cat").forEach(function (c) { catSpy.observe(c); });
  }

  /* ---------- map: only load Google Maps when asked ---------- */
  var mapBtn = $(".map-load");
  if (mapBtn) {
    mapBtn.addEventListener("click", function () {
      var frame = document.createElement("iframe");
      frame.src = mapBtn.getAttribute("data-src");
      frame.title = "Map showing Samuel's Quality Sandwiches, 42 Bridge Street, Haverfordwest";
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      frame.setAttribute("allowfullscreen", "");
      mapBtn.replaceWith(frame);
      frame.focus();
    });
  }

  /* ---------- lightbox for the photo wall ---------- */
  var box = $("#lightbox");
  if (box) {
    var boxImg = $("img", box), boxClose = $(".lightbox-close", box), opener = null;
    var closeBox = function () { box.hidden = true; doc.style.overflow = ""; if (opener) opener.focus(); };
    document.addEventListener("click", function (e) {
      var a = e.target.closest("[data-lightbox]");
      if (!a) return;
      e.preventDefault();
      opener = a;
      var img = $("img", a);
      boxImg.src = a.getAttribute("href");
      boxImg.alt = img ? img.alt : "";
      box.hidden = false;
      doc.style.overflow = "hidden";
      boxClose.focus();
    });
    boxClose.addEventListener("click", closeBox);
    box.addEventListener("click", function (e) { if (e.target === box) closeBox(); });
    document.addEventListener("keydown", function (e) { if (!box.hidden && (e.key === "Escape" || e.key === "Tab")) { if (e.key === "Escape") closeBox(); else e.preventDefault(); } });
  }

  /* ---------- split headings into words ---------- */
  $$("[data-split]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map(function (w) {
      return '<span class="split-word" aria-hidden="true"><span>' + w.replace(/</g, "&lt;") + "</span></span>";
    }).join(" ");
  });

  /* ---------- motion ---------- */
  var build = $("#build");
  function staticFallback() { if (build) build.classList.add("no-pin"); }

  if (reduceMotion.matches || !window.gsap || !window.ScrollTrigger) { staticFallback(); return; }
  reduceMotion.addEventListener("change", function () { window.location.reload(); });

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  gsap.defaults({ ease: "power3.out" });

  var mm = gsap.matchMedia();

  /* Hero: letters rise, the baguette slides in and assembles itself. */
  (function hero() {
    var art = $(".hero-art .art");
    var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.from(".wm-line > span", { yPercent: 110, duration: 1, stagger: 0.045 }, 0)
      .from(".hero-ticket span", { y: -16, opacity: 0, duration: 0.6, stagger: 0.06 }, 0.1)
      .from(".hero-kicker", { y: 24, opacity: 0, duration: 0.8 }, 0.35)
      .from(".hero-art-inner", { xPercent: 40, rotation: 6, opacity: 0, duration: 1.1, ease: "expo.out" }, 0.15);
    if (art) {
      tl.from($$(".layer-leaf, .layer-meat, .layer-cheese, .layer-tomato, .layer-leaf-top", art), { y: -90, opacity: 0, duration: 0.55, stagger: 0.07, ease: "back.out(1.6)" }, 0.55)
        .from($(".layer-bread-top", art), { y: -200, opacity: 0, duration: 0.7, ease: "bounce.out" }, 0.85);
    }
    tl.from(".hero-foot > *", { y: 30, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.6)
      .from(".stamp", { scale: 0, rotation: -120, duration: 0.9, ease: "back.out(1.8)" }, 0.9);

    // Scroll depth: food moves faster than the type behind it.
    var hs = { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 };
    gsap.to(".wordmark", { yPercent: 22, ease: "none", scrollTrigger: hs });
    gsap.to(".hero-art", { yPercent: -14, ease: "none", scrollTrigger: hs });
    gsap.to(".stamp svg", { rotation: 200, ease: "none", scrollTrigger: hs });
    if (art) gsap.to($(".layer-bread-top", art), { y: -70, rotation: -2, svgOrigin: "300 260", ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.8 } });
  })();

  /* Split headings: words rise in sequence. */
  $$("[data-split]").forEach(function (el) {
    gsap.from($$(".split-word > span", el), {
      yPercent: 105, duration: 0.9, stagger: 0.07, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });

  /* About: the year fills with tomato as you scroll; the sandwich drifts. */
  gsap.to(".about-year", {
    "--fill": "100%", ease: "none",
    scrollTrigger: { trigger: ".about", start: "top 75%", end: "center 40%", scrub: true }
  });
  gsap.from(".about-copy > p", { y: 30, opacity: 0, duration: 0.8, stagger: 0.12, scrollTrigger: { trigger: ".about-copy", start: "top 80%" } });
  gsap.fromTo(".about-art", { y: 80, rotation: -10 }, { y: -60, rotation: 6, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });

  /* Build: pinned, scroll-scrubbed assembly of a baguette. */
  (function buildSeq() {
    if (!build) return;
    var art = $(".build-stage .art", build);
    var steps = $$(".build-step", build);
    var heat = $(".build-heat", build);
    if (!art) { staticFallback(); return; }
    var fills = $$(".layer-leaf, .layer-meat, .layer-cheese, .layer-tomato, .layer-leaf-top", art);
    var top = $(".layer-bread-top", art);

    mm.add({ desktop: "(min-width: 901px)", mobile: "(max-width: 900px)" }, function (ctx) {
      var tl = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: build, pin: ".build-pin", start: "top top",
          end: ctx.conditions.desktop ? "+=220%" : "+=160%",
          scrub: 0.6,
          onUpdate: function (self) {
            var i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length * 0.999));
            steps.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
          }
        }
      });
      tl.set(fills, { opacity: 0, y: -160 })
        .set(top, { y: -230, rotation: -4, svgOrigin: "600 260" })
        .set(heat, { opacity: 0 })
        .to(top, { y: -200, duration: 1 })                          // 01: the open bread
        .to(heat, { opacity: 1, duration: 0.6 }, 1.1)                 // 02: heat
        .fromTo($$("path", heat), { y: 30 }, { y: -30, duration: 1.2, stagger: 0.1 }, 1.1)
        .to(heat, { opacity: 0, duration: 0.5 }, 2.2)
        .to(fills, { opacity: 1, y: 0, duration: 0.6, stagger: 0.18, ease: "back.out(1.4)" }, 2.3) // 03: fill
        .to(top, { y: 0, rotation: 0, duration: 0.7, ease: "bounce.out" }, 3.2)
        .to({}, { duration: 0.4 });
      return function () { gsap.set(fills.concat([top, heat]), { clearProps: "all" }); };
    });
  })();

  /* Hot baguettes: giant type slides past, the baguette tilts through. */
  gsap.to(".feature-giant", { xPercent: -38, ease: "none", scrollTrigger: { trigger: ".feature-baguette", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".feature-baguette .feature-art", { y: 120, rotation: 6 }, { y: -80, rotation: -2, ease: "none", scrollTrigger: { trigger: ".feature-baguette", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.from(".feature-baguette .feature-copy", {
    clipPath: "inset(100% 0 0 0)", y: 40, duration: 1, ease: "expo.out",
    scrollTrigger: { trigger: ".feature-baguette .feature-copy", start: "top 90%" }
  });

  /* BBQ chicken sub: tomato disc swells, the sub swings in. */
  var subTl = gsap.timeline({ scrollTrigger: { trigger: ".feature-sub", start: "top 70%" } });
  subTl.from(".sub-disc", { scale: 0, duration: 1, ease: "expo.out" })
    .from(".feature-sub .art", { xPercent: 50, rotation: 14, opacity: 0, duration: 1.1, ease: "expo.out" }, 0.1)
    .from(".feature-sub .display span", { yPercent: 100, opacity: 0, duration: 0.7, stagger: 0.09 }, 0.15)
    .from(".feature-sub .feature-copy > :not(h3)", { y: 24, opacity: 0, duration: 0.6, stagger: 0.08 }, 0.4);
  var subTop = $(".feature-sub .layer-bread-top");
  if (subTop) gsap.fromTo(subTop, { y: -40 }, { y: 10, ease: "none", scrollTrigger: { trigger: ".feature-sub", start: "top bottom", end: "bottom top", scrub: true } });

  /* Soup: the mug rises, the vegetables bob. */
  gsap.from(".feature-soup .art", { y: 100, rotation: -8, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".feature-soup", start: "top 70%" } });
  gsap.from(".feature-soup .feature-copy > *", { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, scrollTrigger: { trigger: ".feature-soup", start: "top 65%" } });
  var veg = $(".feature-soup .layer-veg");
  if (veg) gsap.to(veg, { y: -4, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" });

  /* Menu: rules draw across, illustrations pop, items follow. */
  $$(".menu-cat").forEach(function (cat) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: cat, start: "top 82%" } });
    tl.fromTo(cat, { "--rule": 0 }, { "--rule": 1, duration: 1, ease: "expo.inOut" })
      .from($(".menu-cat-art", cat), { scale: 0.6, rotation: cat.matches(":nth-child(even)") ? 14 : -14, opacity: 0, duration: 0.9, ease: "back.out(1.7)" }, 0.15)
      .from($$(".menu-cat-text > *", cat), { y: 26, opacity: 0, duration: 0.6, stagger: 0.06 }, 0.2);
  });

  /* Why: rows draw in, titles wipe up. */
  $$(".why-row").forEach(function (row) {
    var tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 88%" } });
    tl.fromTo(row, { "--rule": 0 }, { "--rule": 1, duration: 0.9, ease: "expo.inOut" })
      .from($("h3", row), { clipPath: "inset(0 0 100% 0)", yPercent: 40, duration: 0.8, ease: "power4.out" }, 0.2)
      .from($("p", row), { opacity: 0, y: 16, duration: 0.6 }, 0.35);
    var badge = $(".hb-score", row);
    if (badge) tl.from(badge, { scale: 0, rotation: -200, duration: 0.9, ease: "back.out(2)" }, 0.4);
  });

  /* Lunch: tickets drop onto the counter. */
  gsap.from(".ticket", {
    y: -120, rotation: function (i) { return i ? 12 : -12; }, opacity: 0, duration: 1, stagger: 0.15, ease: "back.out(1.5)",
    scrollTrigger: { trigger: ".lunch-tickets", start: "top 80%" }
  });

  /* Visit: the street sign swings into place; the map unrolls. */
  gsap.from(".street-sign", { rotation: -28, y: -40, opacity: 0, transformOrigin: "0% 0%", duration: 1.2, ease: "elastic.out(1, 0.55)", scrollTrigger: { trigger: ".visit-map", start: "top 80%" } });
  gsap.from(".map-frame", { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut", scrollTrigger: { trigger: ".visit-map", start: "top 75%" } });
  gsap.from(".visit-address span", { x: -30, opacity: 0, duration: 0.7, stagger: 0.08, scrollTrigger: { trigger: ".visit-address", start: "top 85%" } });

  /* Footer: the sub closes as the page ends. */
  var footTop = $(".foot .layer-bread-top");
  if (footTop) {
    gsap.fromTo(footTop, { y: -150, rotation: -20, svgOrigin: "120 180" }, {
      y: 22, rotation: 0, ease: "power2.in",
      scrollTrigger: { trigger: ".foot", start: "top 85%", end: "top 25%", scrub: 0.5 }
    });
  }
  gsap.from(".foot-title span", { yPercent: 60, opacity: 0, duration: 1, stagger: 0.12, ease: "power4.out", scrollTrigger: { trigger: ".foot-title", start: "top 90%" } });

  // Fonts change line lengths; re-measure once they're in.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
