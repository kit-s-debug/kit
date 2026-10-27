/*
  Snippers: page behaviour.

  Plain JS for everything that must work everywhere (menu, reveals,
  services, lightbox, map). GSAP + ScrollTrigger only for the scrubbed
  scroll moments; if they fail to load, the page is complete without them.
*/
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;
  var hero = $(".hero");
  var heroMark = $(".wordmark--hero");

  /* ---------------------------------------------------------------------
     Opening curtain, then the hero entrance and the wordmark "snip"
     ------------------------------------------------------------------- */
  function startHero() {
    hero.classList.add("is-in");
    if (reduced) { hero.classList.add("is-snipped", "is-settled"); return; }
    setTimeout(function () {
      hero.classList.add("is-snipping");
      setTimeout(function () { hero.classList.add("is-snipped"); }, 560);
      setTimeout(function () { hero.classList.add("is-settled"); }, 1700);
    }, 1350);
  }

  (function curtain() {
    var el = $(".curtain");
    var seen = false;
    try { seen = sessionStorage.getItem("snippers-intro") === "1"; } catch (e) { /* storage blocked */ }
    if (reduced || seen || !el) { startHero(); return; }
    try { sessionStorage.setItem("snippers-intro", "1"); } catch (e) { /* ignore */ }

    var timers = [], done = false;
    el.classList.add("is-playing");
    root.style.overflow = "hidden";

    function open() {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      el.classList.add("is-mark", "is-line", "is-open");
      root.style.overflow = "";
      startHero();
      setTimeout(function () { el.classList.remove("is-playing"); el.remove(); }, 1100);
      window.removeEventListener("keydown", open);
      window.removeEventListener("wheel", open);
      window.removeEventListener("touchstart", open);
    }
    requestAnimationFrame(function () { el.classList.add("is-mark"); });
    timers.push(setTimeout(function () { el.classList.add("is-line"); }, 550));
    timers.push(setTimeout(open, 1250));
    el.addEventListener("click", open);
    window.addEventListener("keydown", open);
    window.addEventListener("wheel", open, { passive: true });
    window.addEventListener("touchstart", open, { passive: true });
  })();

  /* ---------------------------------------------------------------------
     Navigation: scroll state, hide on the way down, progress strand
     ------------------------------------------------------------------- */
  var nav = $(".nav");
  var menu = $("#menu");
  var toggle = $(".nav__toggle");
  var lastY = window.scrollY, ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    nav.dataset.state = y > 40 ? "scrolled" : "top";
    nav.style.setProperty("--progress", max > 0 ? (y / max).toFixed(4) : 0);
    var menuOpen = toggle.getAttribute("aria-expanded") === "true";
    if (!menuOpen && y > window.innerHeight * .9 && y > lastY + 4) nav.classList.add("is-hidden");
    else if (y < lastY - 4 || y < window.innerHeight * .9) nav.classList.remove("is-hidden");
    lastY = y;
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  // keyboard users tabbing into a hidden nav should see it
  nav.addEventListener("focusin", function () { nav.classList.remove("is-hidden"); });

  // current section underline
  var navLinks = $$(".nav__links a");
  if ("IntersectionObserver" in window) {
    var sectionIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["salon", "services", "colour", "work", "book"].forEach(function (id) { var s = document.getElementById(id); if (s) sectionIO.observe(s); });
  }

  /* ---------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------- */
  var outside = [$("main"), $(".foot")];
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Menu";
    outside.forEach(function (el) { if (el) el.inert = open; });
    root.style.overflow = open ? "hidden" : "";
    if (open) {
      menu.hidden = false;
      void menu.offsetWidth;
      menu.classList.add("is-open");
      nav.classList.remove("is-hidden");
      var first = menu.querySelector("a");
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 50);
    } else {
      menu.classList.remove("is-open");
      setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, reduced ? 0 : 700);
    }
  }
  toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  /* ---------------------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------------------- */
  var revealEls = $$("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduced) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    // A clipped-shut element has no visible area, and Chrome counts its own
    // clip-path, so it would never "intersect". Watch its parent instead.
    var watched = new Map();
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        watched.get(e.target).forEach(function (el) { el.classList.add("is-in"); });
        revealIO.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: .12 });
    revealEls.forEach(function (el) {
      var target = el.dataset.reveal === "clip" ? el.parentElement : el;
      if (!watched.has(target)) { watched.set(target, []); revealIO.observe(target); }
      watched.get(target).push(el);
    });
  }

  /* ---------------------------------------------------------------------
     The salon statement fills in word by word as it scrolls past
     ------------------------------------------------------------------- */
  var fill = $("[data-fill]");
  var fillWords = [];
  if (fill && !reduced) {
    var words = fill.textContent.trim().split(/\s+/);
    fill.setAttribute("aria-label", fill.textContent.trim().replace(/\s+/g, " "));
    fill.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w + "</span>"; }).join(" ");
    fill.setAttribute("data-fill-ready", "");
    fillWords = $$(".w", fill);
    var fillTick = false;
    var updateFill = function () {
      var r = fill.getBoundingClientRect(), vh = window.innerHeight;
      var p = clamp((vh * .82 - r.top) / (r.height + vh * .3), 0, 1);
      var lit = Math.round(p * fillWords.length);
      fillWords.forEach(function (w, i) { w.classList.toggle("is-lit", i < lit); });
      fillTick = false;
    };
    window.addEventListener("scroll", function () { if (!fillTick) { fillTick = true; requestAnimationFrame(updateFill); } }, { passive: true });
    window.addEventListener("resize", updateFill);
    updateFill();
  }

  /* ---------------------------------------------------------------------
     Hero: the photo shifts a touch with the pointer
     ------------------------------------------------------------------- */
  var heroImg = $(".hero__img");
  if (finePointer && !reduced && heroImg) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    var step = function () {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      heroImg.style.setProperty("--px", cx.toFixed(2) + "px");
      heroImg.style.setProperty("--py", cy.toFixed(2) + "px");
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > .05 ? requestAnimationFrame(step) : null;
    };
    hero.addEventListener("pointermove", function (e) {
      tx = (e.clientX / window.innerWidth - .5) * -22;
      ty = (e.clientY / window.innerHeight - .5) * -16;
      if (!raf) raf = requestAnimationFrame(step);
    });
  }

  /* ---------------------------------------------------------------------
     Services: the sticky frame follows whichever service is in view
     ------------------------------------------------------------------- */
  var svcs = $$(".svc");
  var svcImgs = $$("[data-svc-img]");
  var svcCount = $(".services__count-n");
  var currentSvc = 0;
  function setService(i) {
    svcs.forEach(function (s, n) { s.classList.toggle("is-active", n === i); });
    if (i === currentSvc) return;
    svcImgs.forEach(function (img) { img.classList.remove("was-active"); });
    if (svcImgs[currentSvc]) { svcImgs[currentSvc].classList.remove("is-active"); svcImgs[currentSvc].classList.add("was-active"); }
    if (svcImgs[i]) svcImgs[i].classList.add("is-active");
    if (svcCount) svcCount.textContent = String(i + 1).padStart(2, "0");
    currentSvc = i;
  }
  if ("IntersectionObserver" in window) {
    var svcIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setService(Number(e.target.dataset.svc)); });
    }, { rootMargin: "-48% 0px -48% 0px" });
    svcs.forEach(function (s) { svcIO.observe(s); });
  }
  setService(0);

  /* ---------------------------------------------------------------------
     Gallery: pointer-led crop, "View" cursor, lightbox
     ------------------------------------------------------------------- */
  var tiles = $$(".tile__btn");
  if (finePointer && !reduced) {
    var cursor = document.createElement("div");
    cursor.className = "view-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.textContent = "View";
    document.body.appendChild(cursor);
    tiles.forEach(function (t) {
      var img = $("img", t);
      t.addEventListener("pointerenter", function () { cursor.classList.add("is-on"); });
      t.addEventListener("pointerleave", function () {
        cursor.classList.remove("is-on");
        img.style.setProperty("--tx", "0px"); img.style.setProperty("--ty", "0px");
      });
      t.addEventListener("pointermove", function (e) {
        cursor.style.setProperty("--cx", e.clientX + "px");
        cursor.style.setProperty("--cy", e.clientY + "px");
        var r = t.getBoundingClientRect();
        img.style.setProperty("--tx", (((e.clientX - r.left) / r.width - .5) * -14).toFixed(1) + "px");
        img.style.setProperty("--ty", (((e.clientY - r.top) / r.height - .5) * -14).toFixed(1) + "px");
      });
    });
  }

  var lb = $(".lightbox");
  if (lb && typeof lb.showModal === "function") {
    var lbImg = $(".lightbox__img", lb), lbCap = $(".lightbox__cap", lb), lbCount = $(".lightbox__count", lb);
    var lbIndex = 0;
    var show = function (i) {
      lbIndex = (i + tiles.length) % tiles.length;
      var t = tiles[lbIndex], thumb = $("img", t);
      lbImg.src = t.dataset.full;
      lbImg.width = Number(t.dataset.w); lbImg.height = Number(t.dataset.h);
      lbImg.alt = thumb.alt;
      lbCap.textContent = $(".tile__cap", t).lastChild.textContent.trim();
      lbCount.textContent = String(lbIndex + 1).padStart(2, "0") + " / " + String(tiles.length).padStart(2, "0");
      // replay the reveal
      lbImg.style.animation = "none"; void lbImg.offsetWidth; lbImg.style.animation = "";
    };
    tiles.forEach(function (t, i) {
      t.addEventListener("click", function () { show(i); lb.showModal(); root.style.overflow = "hidden"; });
    });
    lb.addEventListener("close", function () { root.style.overflow = ""; });
    lb.addEventListener("click", function (e) {
      var b = e.target.closest("[data-lb]");
      if (b) {
        if (b.dataset.lb === "prev") show(lbIndex - 1);
        else if (b.dataset.lb === "next") show(lbIndex + 1);
        else lb.close();
      } else if (e.target === lb || e.target.classList.contains("lightbox__fig")) {
        lb.close();
      }
    });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(lbIndex - 1);
      if (e.key === "ArrowRight") show(lbIndex + 1);
    });
    var sx = null;
    lb.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    lb.addEventListener("pointerup", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50 && e.pointerType !== "mouse") show(lbIndex + (dx < 0 ? 1 : -1));
    });
  }

  /* ---------------------------------------------------------------------
     Map: only load Google's embed when asked (speed and privacy)
     ------------------------------------------------------------------- */
  var mapBtn = $("[data-map-load]");
  if (mapBtn) {
    mapBtn.addEventListener("click", function () {
      var holder = mapBtn.closest(".map");
      var f = document.createElement("iframe");
      f.src = (window.SNIPPERS && window.SNIPPERS.mapEmbed) || "";
      f.title = "Map showing Snippers at 57 Portfield, Haverfordwest";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.allowFullscreen = true;
      holder.innerHTML = "";
      holder.appendChild(f);
      f.focus();
    });
  }

  /* ---------------------------------------------------------------------
     Opening hours from js/config.js (only once confirmed)
     ------------------------------------------------------------------- */
  var cfg = window.SNIPPERS || {};
  var hoursBox = $("[data-hours]");
  if (hoursBox && Array.isArray(cfg.hours) && cfg.hours.length) {
    var dl = document.createElement("dl");
    cfg.hours.forEach(function (row) {
      var dt = document.createElement("dt"); dt.textContent = row[0];
      var dd = document.createElement("dd"); dd.textContent = row[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });
    hoursBox.innerHTML = "";
    hoursBox.appendChild(dl);
    if (cfg.hoursNote) { var sm = document.createElement("small"); sm.textContent = cfg.hoursNote; hoursBox.appendChild(sm); }
  }

  var year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Scroll choreography (GSAP + ScrollTrigger)
     ------------------------------------------------------------------- */
  function initMotion() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    var stages = $$(".lift__stages li");
    if (!gsap || !ST || reduced) {
      stages.forEach(function (s) { s.classList.add("is-active"); });
      return;
    }
    gsap.registerPlugin(ST);
    var mm = gsap.matchMedia();

    // Hero: the wordmark keeps separating along its cut as you leave
    ST.create({
      trigger: hero, start: "top top", end: "bottom top", scrub: true,
      onUpdate: function (self) {
        if (!hero.classList.contains("is-settled")) return;
        var base = Math.min(9, Math.max(4, window.innerWidth * .0055));
        heroMark.style.setProperty("--snip", (base + self.progress * Math.min(46, window.innerWidth * .035)).toFixed(1) + "px");
      }
    });
    gsap.to(".hero__figure", { yPercent: -10, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__copy", { yPercent: -18, opacity: .2, ease: "none", scrollTrigger: { trigger: hero, start: "40% top", end: "bottom top", scrub: true } });

    // Depth: images drift at their own speeds
    mm.add("(min-width: 861px)", function () {
      $$("[data-speed]").forEach(function (el) {
        var s = parseFloat(el.dataset.speed) || 0;
        gsap.fromTo(el, { y: function () { return s * window.innerHeight; } }, {
          y: function () { return -s * window.innerHeight; }, ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true }
        });
      });
    });
    mm.add("(max-width: 860px)", function () {
      $$(".salon__img, .expect__img").forEach(function (el) {
        var s = parseFloat(el.dataset.speed) || 0;
        gsap.fromTo(el, { y: s * 220 }, { y: -s * 220, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });

    // The strand behind "Your visit" draws itself
    var strand = $(".expect__strand path");
    if (strand) {
      var sl = strand.getTotalLength();
      gsap.fromTo(strand, { strokeDasharray: sl, strokeDashoffset: sl }, {
        strokeDashoffset: 0, ease: "none",
        scrollTrigger: { trigger: ".expect", start: "top 70%", end: "center 40%", scrub: true }
      });
    }

    // Colour story: pinned on wide screens, the marker walks the lift
    var lift = $(".lift"), track = $(".lift__track");
    var tones = ["#0b0908", "#170b07", "#1d0f07", "#1a140c"];
    var setTrackW = function () { track.style.setProperty("--track-w", track.offsetWidth + "px"); };
    mm.add("(min-width: 861px)", function () {
      setTrackW();
      window.addEventListener("resize", setTrackW);
      var st = ST.create({
        trigger: lift, pin: ".lift__pin", start: "top top", end: "+=160%", scrub: true, anticipatePin: 1,
        onUpdate: function (self) {
          var p = self.progress;
          track.style.setProperty("--lift", (.06 + p * .88).toFixed(4));
          var idx = Math.min(3, Math.floor(p * 4));
          stages.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
          lift.style.setProperty("--stage-bg", tones[idx]);
        }
      });
      return function () { window.removeEventListener("resize", setTrackW); st.kill(); };
    });
    mm.add("(max-width: 860px)", function () {
      stages.forEach(function (s) { s.classList.add("is-active"); });
    });

    // Why: the big words drift against each other; scissors run the rules
    $$(".why__row").forEach(function (row) {
      var word = $(".why__word", row), dir = Number(word.dataset.drift) || 1, snip = $(".why__snip", row);
      gsap.fromTo(word, { xPercent: -6 * dir }, { xPercent: 6 * dir, ease: "none", scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true } });
      if (snip) {
        ST.create({
          trigger: row, start: "top 85%", end: "bottom 35%", scrub: true,
          onUpdate: function (self) { snip.style.setProperty("--run", self.progress.toFixed(4)); }
        });
      }
    });

    // Book: a single strand runs down, the shears close, the end falls away
    var top = $(".book__strand-top"), end = $(".book__strand-end");
    if (top && end) {
      var lt = top.getTotalLength(), le = end.getTotalLength();
      gsap.set(top, { strokeDasharray: lt, strokeDashoffset: lt });
      gsap.set(end, { strokeDasharray: le, strokeDashoffset: le });
      var tl = gsap.timeline({ scrollTrigger: { trigger: ".book", start: "top 85%", end: "top 15%", scrub: .6 } });
      tl.to(top, { strokeDashoffset: 0, duration: 1, ease: "none" })
        .to(end, { strokeDashoffset: 0, duration: .5, ease: "none" }, .55)
        .fromTo(".book__blade--l", { rotate: -22 }, { rotate: 0, duration: .25, ease: "power3.in" }, 1)
        .fromTo(".book__blade--r", { rotate: 22 }, { rotate: 0, duration: .25, ease: "power3.in" }, 1)
        .to(end, { y: 70, rotate: 10, opacity: 0, duration: .6, ease: "power2.in" }, 1.25)
        .to(".book__shears", { x: 24, opacity: 0, duration: .35 }, 1.5);
    }

    // Footer: the wordmark comes apart as the page ends
    ST.create({
      trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true,
      onUpdate: function (self) {
        $(".foot").style.setProperty("--foot-snip", (self.progress * Math.min(22, window.innerWidth * .016)).toFixed(1) + "px");
      }
    });

    // fonts and lazy images change heights; keep triggers honest
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
    window.addEventListener("load", function () { ST.refresh(); });
  }

  // scripts are deferred in order, so GSAP (if it loaded) is ready here
  initMotion();
})();
