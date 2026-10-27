/* The Chrysalis Beautique: interactions and scroll choreography.
 * Plain JS + GSAP/ScrollTrigger. Everything works without the animation
 * layer; motion is only added when the visitor hasn't asked for less of it. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var animate = hasGsap && !reduced;
  if (!animate) root.classList.remove("js-anim");

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- today in the opening hours (UK time) ---------- */
  try {
    var day = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "Europe/London" }).format(new Date());
    var idx = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(day);
    var row = $('.hours__table tr[data-day="' + idx + '"]');
    if (row) { row.classList.add("is-today"); row.setAttribute("aria-current", "date"); }
  } catch (e) { /* Intl unavailable: skip the highlight */ }

  /* =======================================================
     NAV: solid after the hero starts to scroll, hides on the
     way down and returns on the way up
     ======================================================= */
  var nav = $("[data-nav]");
  var lastY = window.scrollY;
  var menuOpen = false;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle("is-solid", y > 40);
    if (!menuOpen) nav.classList.toggle("is-hidden", y > 480 && y > lastY + 2);
    if (y < lastY - 2 || y < 480) nav.classList.remove("is-hidden");
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  // keyboard users tabbing into a hidden nav should see it
  nav.addEventListener("focusin", function () { nav.classList.remove("is-hidden"); });

  // current section marker
  if ("IntersectionObserver" in window) {
    var links = $$(".nav__links a");
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = byId[en.target.id];
        if (a && en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove("is-current"); l.removeAttribute("aria-current"); });
          a.classList.add("is-current");
          a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  // After an in-page jump, nudge the section into place if a long smooth
  // scroll finished short (seen occasionally in mobile Chromium).
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.hash.length < 2 || !("onscrollend" in window)) return;
    var target = document.querySelector(a.hash);
    if (!target) return;
    window.addEventListener("scrollend", function () {
      var pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      var off = target.getBoundingClientRect().top - pad;
      var atEnd = window.innerHeight + window.scrollY >= root.scrollHeight - 2;
      if (Math.abs(off) > 4 && !atEnd) window.scrollBy({ top: off, behavior: "auto" });
    }, { once: true });
  });

  /* =======================================================
     MOBILE MENU
     ======================================================= */
  var toggle = $("[data-menu-toggle]");
  var menu = $("[data-menu]");
  var toggleLabel = toggle.querySelector(".visually-hidden");

  function focusables() {
    return [toggle].concat($$("a, button", menu));
  }
  function openMenu() {
    menuOpen = true;
    menu.hidden = false;
    nav.classList.remove("is-hidden");
    // next frame so the clip-path transition runs
    requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("is-open"); }); });
    toggle.setAttribute("aria-expanded", "true");
    toggleLabel.textContent = "Close menu";
    document.body.style.overflow = "hidden";
    var first = $("a", menu);
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 50);
  }
  function closeMenu(returnFocus) {
    menuOpen = false;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggleLabel.textContent = "Open menu";
    document.body.style.overflow = "";
    var done = function () { if (!menuOpen) menu.hidden = true; };
    if (reduced) done(); else setTimeout(done, 700);
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener("click", function () { menuOpen ? closeMenu(false) : openMenu(); });
  $$("[data-menu-link]", menu).forEach(function (a) { a.addEventListener("click", function () { closeMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (!menuOpen) return;
    if (e.key === "Escape") { closeMenu(true); return; }
    if (e.key === "Tab") {
      var f = focusables();
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  window.addEventListener("resize", function () { if (menuOpen && window.innerWidth > 860) closeMenu(false); });

  /* =======================================================
     TREATMENT TABS (WAI-ARIA tabs pattern)
     ======================================================= */
  var tabs = $$("[data-tab]");
  var ink = $("[data-tab-ink]");
  var tabList = $(".tabs__list");

  function placeInk(tab) {
    if (!ink || !tab) return;
    var pad = parseFloat(getComputedStyle(tab).paddingLeft);
    var padR = parseFloat(getComputedStyle(tab).paddingRight);
    ink.style.width = (tab.offsetWidth - pad - padR) + "px";
    ink.style.transform = "translateX(" + (tab.offsetLeft + pad) + "px)";
  }

  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    placeInk(tab);
    if (focus) tab.focus();
    // keep the chosen tab in view on narrow screens
    var l = tab.offsetLeft - 16, r = tab.offsetLeft + tab.offsetWidth + 16;
    if (l < tabList.scrollLeft) tabList.scrollTo({ left: l, behavior: reduced ? "auto" : "smooth" });
    else if (r > tabList.scrollLeft + tabList.clientWidth) tabList.scrollTo({ left: r - tabList.clientWidth, behavior: reduced ? "auto" : "smooth" });

    if (animate) {
      var panel = document.getElementById(tab.getAttribute("aria-controls"));
      gsap.fromTo($$(".treat", panel), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .05, ease: "power3.out", overwrite: true });
    }
    if (hasGsap) ScrollTrigger.refresh();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });
  window.addEventListener("resize", function () { placeInk($('[data-tab][aria-selected="true"]')); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { placeInk($('[data-tab][aria-selected="true"]')); });
  placeInk($('[data-tab][aria-selected="true"]'));

  // "See every brow treatment" style links open the matching tab
  $$("[data-open-tab]").forEach(function (a) {
    a.addEventListener("click", function () {
      var t = $('[data-tab="' + a.getAttribute("data-open-tab") + '"]');
      if (t) selectTab(t, false);
    });
  });

  /* =======================================================
     GALLERY + LIGHTBOX
     ======================================================= */
  var photos = (window.CHRYSALIS_GALLERY || []).filter(function (p) { return p && p.src; });
  var gallery = $("[data-gallery]");
  var empty = $("[data-gallery-empty]");
  var lb = $("[data-lightbox]");
  var lbImg = $("[data-lightbox-img]");
  var lbCap = $("[data-lightbox-cap]");
  var current = 0;
  var opener = null;

  function show(i) {
    current = (i + photos.length) % photos.length;
    var p = photos[current];
    lbImg.src = p.src;
    lbImg.alt = p.alt || "";
    lbCap.textContent = [p.category, p.alt].filter(Boolean).join(" · ");
  }

  if (photos.length) {
    photos.forEach(function (p, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "gallery__item";
      b.setAttribute("aria-label", "Enlarge photo: " + (p.alt || "salon work"));
      var img = document.createElement("img");
      img.src = p.src; img.alt = p.alt || ""; img.loading = "lazy"; img.decoding = "async";
      if (p.width) img.width = p.width;
      if (p.height) img.height = p.height;
      b.appendChild(img);
      if (p.category) {
        var c = document.createElement("span");
        c.className = "gallery__cap"; c.textContent = p.category; c.setAttribute("aria-hidden", "true");
        b.appendChild(c);
      }
      b.addEventListener("click", function () {
        opener = b; show(i);
        if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
      });
      gallery.appendChild(b);
    });
    gallery.hidden = false;
    empty.hidden = true;
    var single = photos.length < 2;
    $("[data-lightbox-prev]").hidden = single;
    $("[data-lightbox-next]").hidden = single;
  }
  function closeLb() { if (lb.open) lb.close(); }
  $("[data-lightbox-close]").addEventListener("click", closeLb);
  $("[data-lightbox-prev]").addEventListener("click", function () { show(current - 1); });
  $("[data-lightbox-next]").addEventListener("click", function () { show(current + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
  lb.addEventListener("keydown", function (e) {
    if (photos.length < 2) return;
    if (e.key === "ArrowRight") show(current + 1);
    if (e.key === "ArrowLeft") show(current - 1);
  });
  lb.addEventListener("close", function () { if (opener) opener.focus(); });

  /* =======================================================
     MOTION
     ======================================================= */
  if (!animate) return;

  gsap.registerPlugin(ScrollTrigger);

  function splitChars(el) {
    var text = el.textContent;
    // headings keep their name; a bare span relies on its labelled parent (the h1)
    if (/^H\d$/.test(el.tagName)) el.setAttribute("aria-label", text);
    el.textContent = "";
    var out = [];
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.className = "char"; s.setAttribute("aria-hidden", "true");
      s.textContent = text[i];
      el.appendChild(s); out.push(s);
    }
    return out;
  }
  function splitWords(el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    return words.map(function (w, i) {
      var s = document.createElement("span");
      s.className = "w"; s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      return s;
    });
  }

  /* ---------- 1. Hero: the capsule unfolds, the name arrives ---------- */
  var heroChars = splitChars($("[data-split-chars]"));
  var capsule = $("[data-hero-capsule]");
  var heroImg = $("[data-hero-img]");
  var ring = $(".hero__ring");

  var intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  intro
    .fromTo(capsule, { clipPath: "inset(48% 0% 48% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut" }, 0)
    .fromTo(heroImg, { scale: 1.45 }, { scale: 1, duration: 2.2 }, 0.1)
    .fromTo(ring, { opacity: 0, scale: .86, rotate: -24 }, { opacity: 1, scale: 1, rotate: -8, duration: 2 }, 0.5)
    .fromTo(heroChars, { yPercent: 70, opacity: 0, rotate: 6 }, { yPercent: 0, opacity: 1, rotate: 0, duration: 1.3, stagger: .05 }, 0.45)
    .fromTo(".hero__crown i", { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: .6, stagger: .07, ease: "back.out(3)" }, 1.0)
    .fromTo("[data-hero-fade]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.1, stagger: .08 }, 0.9);

  // leaving the hero: the capsule drifts up and swells, the name slides apart from it
  var heroOut = gsap.timeline({
    scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom top", scrub: .6 }
  });
  heroOut
    .to("[data-hero-media]", { yPercent: -14, ease: "none" }, 0)
    .to(heroImg, { scale: 1.18, ease: "none" }, 0)
    .to(ring, { rotate: 14, scale: 1.08, ease: "none" }, 0)
    .to(".hero__name", { xPercent: -8, ease: "none" }, 0)
    .to(".hero__copy", { yPercent: 10, opacity: .25, ease: "none" }, 0);

  /* ---------- 2. Story: the paragraph brightens as you read it ---------- */
  var lede = $("[data-read]");
  var words = splitWords(lede);
  gsap.fromTo(words, { opacity: .16 }, {
    opacity: 1, stagger: .05, ease: "none",
    scrollTrigger: { trigger: lede, start: "top 80%", end: "bottom 45%", scrub: true }
  });

  gsap.from(".story__title", { y: 40, opacity: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".story__title", start: "top 85%" } });

  $$("[data-fact]").forEach(function (li, i) {
    var num = $("[data-count]", li);
    var target = parseInt(num.getAttribute("data-count"), 10);
    var o = { v: 0 };
    gsap.from(li, { y: 30, opacity: 0, duration: 1, delay: i * .12, ease: "power3.out", scrollTrigger: { trigger: li, start: "top 88%" } });
    gsap.to(o, {
      v: target, duration: 1.6, delay: i * .12, ease: "power2.out",
      scrollTrigger: { trigger: li, start: "top 88%" },
      onUpdate: function () { num.textContent = Math.round(o.v); }
    });
  });

  gsap.fromTo(".person__portrait",
    { clipPath: "inset(100% 0% 0% 0%)" },
    { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: ".person", start: "top 75%" } });
  gsap.from(".person__monogram", { yPercent: 30, opacity: 0, duration: 1.4, delay: .4, ease: "expo.out", scrollTrigger: { trigger: ".person", start: "top 75%" } });

  /* ---------- 3. Featured chapters: close crop opens into the full plate ---------- */
  $$("[data-chapter]").forEach(function (ch, i) {
    var media = $("[data-chapter-media]", ch);
    var img = $("img", media);
    var title = $("[data-chapter-title]", ch);
    var chars = splitChars(title);
    var from = ["inset(22% 26% 22% 26%)", "inset(30% 8% 30% 40%)", "inset(12% 30% 34% 30%)"][i % 3];

    gsap.timeline({ scrollTrigger: { trigger: ch, start: "top 85%", end: "center 55%", scrub: .8 } })
      .fromTo(media, { clipPath: from }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
      .fromTo(img, { scale: 1.4 }, { scale: 1, ease: "none" }, 0);

    gsap.timeline({ scrollTrigger: { trigger: ch, start: "top 65%" } })
      .from(chars, { yPercent: 80, opacity: 0, duration: 1.1, stagger: .04, ease: "expo.out" })
      .from($$(".chapter__num, .chapter__sub, .chapter__body > p, .chips li, .chapter__body > .link", ch), { y: 20, opacity: 0, duration: .9, stagger: .06, ease: "power3.out" }, .2);

  });

  /* ---------- 4. Menu: drifting outline marquee ---------- */
  gsap.fromTo("[data-marquee]", { xPercent: 2 }, {
    xPercent: -38, ease: "none",
    scrollTrigger: { trigger: ".menu-sec", start: "top bottom", end: "bottom top", scrub: true }
  });
  gsap.from(".menu-sec__head > *", { y: 30, opacity: 0, duration: 1, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: ".menu-sec__head", start: "top 80%" } });
  gsap.from("#panel-brows .treat", { y: 18, opacity: 0, duration: .7, stagger: .06, ease: "power3.out", scrollTrigger: { trigger: ".tabs", start: "top 80%" } });

  /* ---------- 5. Experience: layered depth ---------- */
  $$(".experience [data-depth]").forEach(function (el) {
    var d = parseFloat(el.getAttribute("data-depth"));
    gsap.fromTo(el, { yPercent: d * 100 }, {
      yPercent: -d * 100, ease: "none",
      scrollTrigger: { trigger: ".experience", start: "top bottom", end: "bottom top", scrub: true }
    });
  });
  gsap.fromTo(".experience__layer--back", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: ".experience__stage", start: "top 75%" } });
  gsap.fromTo(".experience__layer--front", { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, delay: .35, ease: "expo.inOut", scrollTrigger: { trigger: ".experience__stage", start: "top 75%" } });
  gsap.from("[data-note]", { x: -24, opacity: 0, duration: .9, stagger: .1, ease: "power3.out", scrollTrigger: { trigger: ".notes", start: "top 85%" } });

  /* ---------- 6. Review themes slide in, one after the other ---------- */
  $$("[data-theme-word]").forEach(function (li, i) {
    gsap.fromTo($(".theme__word", li), { xPercent: i % 2 ? 12 : -12, opacity: 0 }, {
      xPercent: 0, opacity: 1, ease: "none",
      scrollTrigger: { trigger: li, start: "top 95%", end: "top 60%", scrub: .6 }
    });
  });

  /* ---------- 7. Booking: the close ---------- */
  gsap.fromTo(".book__bg img", { scale: 1.25 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "[data-book-sec]", start: "top bottom", end: "bottom bottom", scrub: true } });
  gsap.timeline({ scrollTrigger: { trigger: "[data-book-sec]", start: "top 60%" } })
    .from("[data-book-crown] i", { scale: 0, opacity: 0, duration: .5, stagger: { each: .06, from: "center" }, ease: "back.out(3)" })
    .from("[data-book-line]", { yPercent: 60, opacity: 0, duration: 1.2, stagger: .12, ease: "expo.out" }, .1)
    .from(".steps li, .book__actions, .book__note", { y: 24, opacity: 0, duration: .9, stagger: .08, ease: "power3.out" }, .4);

  /* ---------- 8. Visit + footer ---------- */
  gsap.from(".visit__title > *", { yPercent: 40, opacity: 0, duration: 1.1, stagger: .1, ease: "expo.out", scrollTrigger: { trigger: ".visit", start: "top 75%" } });
  gsap.fromTo("[data-foot-word]", { yPercent: 35, letterSpacing: "0.04em" }, {
    yPercent: 0, letterSpacing: "-0.05em", ease: "none",
    scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true }
  });

  // images that load late can change layout; keep trigger positions honest
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
