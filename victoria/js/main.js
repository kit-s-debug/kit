/* Victoria Bookshop — interactions and scroll choreography.
   Everything works without this file; it only adds motion and conveniences. */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  var motion = hasGsap && !reduceMQ.matches;
  root.classList.add("vb-ready");

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------ masthead */
  var mast = $("#masthead");
  var lastY = window.scrollY;
  var menuOpen = false;
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      mast.classList.toggle("is-scrolled", y > 40);
      var goingDown = y > lastY + 4;
      var goingUp = y < lastY - 4;
      if (!menuOpen && goingDown && y > window.innerHeight * 0.8) mast.classList.add("is-tucked");
      else if (goingUp || y < 200) mast.classList.remove("is-tucked");
      lastY = y;
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  mast.addEventListener("focusin", function () { mast.classList.remove("is-tucked"); });

  // current chapter in the nav
  var navLinks = $$(".mast-nav a");
  if ("IntersectionObserver" in window) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var id = en.target.id;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["story", "books", "signed", "local", "picks", "visit"].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) navIO.observe(s);
    });
  }

  /* ------------------------------------------- contents page (mobile menu) */
  var toggle = $("#menu-toggle");
  var contents = $("#contents");
  var contentsPage = $(".contents-page", contents);
  var focusables = $$("a, button", contents);

  function openMenu() {
    menuOpen = true;
    contents.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    $(".mast-toggle-label", toggle).textContent = "Close";
    root.style.overflow = "hidden";
    mast.classList.remove("is-tucked");
    if (motion) {
      gsap.fromTo(contentsPage, { rotationY: -70, opacity: 0.4 }, { rotationY: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
      gsap.fromTo($$(".contents-list li", contents), { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.045, delay: 0.12 });
    }
    setTimeout(function () { var first = $(".contents-list a", contents); if (first) first.focus(); }, 60);
  }
  function closeMenu(returnFocus) {
    if (!menuOpen) return;
    menuOpen = false;
    toggle.setAttribute("aria-expanded", "false");
    $(".mast-toggle-label", toggle).textContent = "Contents";
    root.style.overflow = "";
    function hide() { contents.hidden = true; gsap.set(contentsPage, { clearProps: "transform,opacity" }); }
    if (motion) gsap.to(contentsPage, { rotationY: -80, opacity: 0, duration: 0.45, ease: "power2.in", onComplete: hide });
    else contents.hidden = true;
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener("click", function () { menuOpen ? closeMenu(true) : openMenu(); });
  contents.addEventListener("click", function (e) {
    if (e.target === contents) closeMenu(true);
    var a = e.target.closest("a");
    if (a && a.getAttribute("href").charAt(0) === "#") {
      // close instantly so the jump lands where it should
      menuOpen = false;
      contents.hidden = true;
      root.style.overflow = "";
      toggle.setAttribute("aria-expanded", "false");
      $(".mast-toggle-label", toggle).textContent = "Contents";
    }
  });
  document.addEventListener("keydown", function (e) {
    if (!menuOpen) return;
    if (e.key === "Escape") { closeMenu(true); return; }
    if (e.key === "Tab") {
      var list = [toggle].concat(focusables);
      var i = list.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); list[list.length - 1].focus(); }
      else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus(); }
    }
  });
  window.addEventListener("resize", function () { if (menuOpen && window.innerWidth > 1080) closeMenu(false); });

  /* --------------------------------------------------------- the shelf */
  var SHELF = {
    fiction: { mark: "I", title: "Fiction", text: "New novels and short stories, from the year’s big releases to the collections the booksellers press into people’s hands.",
      links: [["Browse on Bookshop.org", "https://uk.bookshop.org/shop/victoriabookshop", true], ["See Bethan’s picks", "#picks"]] },
    history: { mark: "II", title: "History", text: "History of every period and place, and a strong showing for the history of Haverfordwest and Pembrokeshire.",
      links: [["Local history", "#local"], ["Browse on Bookshop.org", "https://uk.bookshop.org/shop/victoriabookshop", true]] },
    biography: { mark: "III", title: "Biography", text: "Lives and memoirs, including the ones that arrive signed.",
      links: [["Signed editions", "#signed"], ["Browse on Bookshop.org", "https://uk.bookshop.org/shop/victoriabookshop", true]] },
    gardening: { mark: "IV", title: "Gardening", text: "Books for the garden, the allotment and the window box.",
      links: [["Ask the shop", "mailto:bethan@victoriabookshop.co.uk?subject=Gardening%20books"], ["Browse on Bookshop.org", "https://uk.bookshop.org/shop/victoriabookshop", true]] },
    travel: { mark: "V", title: "Travel guides", text: "Guides for the trip you are planning, and for exploring the county you are already in.",
      links: [["Ask the shop", "mailto:bethan@victoriabookshop.co.uk?subject=Travel%20guides"], ["Browse on Bookshop.org", "https://uk.bookshop.org/shop/victoriabookshop", true]] },
    nature: { mark: "VI", title: "Natural history", text: "Birds, wild flowers, coast and countryside: field guides and nature writing.",
      links: [["Ask the shop", "mailto:bethan@victoriabookshop.co.uk?subject=Natural%20history%20books"], ["Browse on Bookshop.org", "https://uk.bookshop.org/shop/victoriabookshop", true]] },
    local: { mark: "VII", title: "Local interest", text: "One of the shop’s two specialities. Local history, local authors and Pembrokeshire subjects, many of them not listed online anywhere.",
      links: [["Pembrokeshire, on paper", "#local"], ["Ring 01437 762750", "tel:+441437762750"]] },
    signed: { mark: "VIII", title: "Signed editions", text: "The other speciality. Signed copies of recent titles, some with sprayed edges, changing as authors sign and stock sells.",
      links: [["Signed, in ink", "#signed"], ["The shop on eBay", "https://www.ebay.co.uk/str/victoriabookshop", true]] },
    tokens: { mark: "IX", title: "Book tokens", text: "Victoria Bookshop is a National Book Tokens stockist, for the reader whose next book you would rather they chose themselves.",
      links: [["National Book Tokens listing", "https://www.nationalbooktokens.com/stockist/victoria-bookshop-haverfordwest-1", true]] }
  };
  var shelf = $("#bookshelf");
  var spines = $$(".spine", shelf);
  var scMark = $("#sc-mark"), scTitle = $("#sc-title"), scText = $("#sc-text"), scLinks = $("#sc-links");
  shelf.classList.add("has-pick");

  function renderCard(key) {
    var d = SHELF[key];
    if (!d) return;
    scMark.textContent = "VB · " + d.mark;
    scTitle.textContent = d.title;
    scText.textContent = d.text;
    scLinks.innerHTML = "";
    d.links.forEach(function (l) {
      var a = document.createElement("a");
      a.className = "ln";
      a.href = l[1];
      a.textContent = l[0];
      if (l[2]) {
        a.target = "_blank"; a.rel = "noopener";
        a.insertAdjacentHTML("beforeend", '<span class="sr-only"> (opens in a new tab)</span> <span aria-hidden="true">↗</span>');
      }
      scLinks.appendChild(a);
    });
  }
  spines.forEach(function (sp) {
    sp.addEventListener("click", function () {
      if (sp.getAttribute("aria-pressed") === "true") return;
      spines.forEach(function (o) { o.setAttribute("aria-pressed", o === sp ? "true" : "false"); });
      var card = $("#shelf-card");
      if (motion) {
        gsap.timeline()
          .to(card.children, { y: -8, opacity: 0, duration: 0.18, ease: "power2.in", stagger: 0.02 })
          .add(function () { renderCard(sp.dataset.key); })
          .fromTo(card.children, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.05 });
      } else {
        renderCard(sp.dataset.key);
      }
    });
  });
  // arrow keys move along the shelf
  shelf.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    var i = spines.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    var next = spines[(i + (e.key === "ArrowRight" ? 1 : -1) + spines.length) % spines.length];
    next.focus();
    next.scrollIntoView({ block: "nearest", inline: "nearest" });
  });

  /* ------------------------------------------------ signed-book plates */
  var plates = $("#plates");
  var thumb = $("#pc-thumb");
  var pcBtns = $$(".pc-btn");
  function updatePlates() {
    var max = plates.scrollWidth - plates.clientWidth;
    var ratio = plates.clientWidth / plates.scrollWidth;
    var p = max > 0 ? plates.scrollLeft / max : 0;
    thumb.style.width = (ratio * 100) + "%";
    thumb.style.transform = "translateX(" + (p * (1 / ratio - 1) * 100) + "%)";
    pcBtns[0].disabled = plates.scrollLeft <= 2;
    pcBtns[1].disabled = plates.scrollLeft >= max - 2;
  }
  plates.addEventListener("scroll", function () { requestAnimationFrame(updatePlates); }, { passive: true });
  window.addEventListener("resize", updatePlates);
  updatePlates();
  pcBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var step = $(".plate", plates).getBoundingClientRect().width + 24;
      plates.scrollBy({ left: step * Number(b.dataset.dir), behavior: reduceMQ.matches ? "auto" : "smooth" });
    });
  });
  // drag to browse with a mouse (touch already scrolls natively)
  (function () {
    var down = false, startX = 0, startLeft = 0;
    plates.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; startX = e.clientX; startLeft = plates.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 3) plates.classList.add("is-dragging");
      plates.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      plates.classList.remove("is-dragging");
    });
  })();

  /* ------------------------------------------------------------ events */
  (function () {
    var list = (window.VB_EVENTS || []).filter(function (ev) {
      var end = new Date(ev.date + "T23:59:59");
      return !isNaN(end) && end >= new Date();
    }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    if (!list.length) return;
    var body = $("#events-body");
    var ul = document.createElement("ul");
    ul.className = "ev-list";
    list.forEach(function (ev) {
      var d = new Date(ev.date + "T12:00:00");
      var li = document.createElement("li");
      var date = document.createElement("p");
      date.className = "ev-date";
      date.textContent = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      var small = document.createElement("small");
      small.textContent = d.toLocaleDateString("en-GB", { weekday: "long" }) + (ev.time ? " · " + ev.time : "");
      date.appendChild(small);
      var info = document.createElement("div");
      var t = document.createElement("p"); t.className = "ev-title"; t.textContent = ev.title; info.appendChild(t);
      var meta = [ev.who, ev.details].filter(Boolean).join(". ");
      if (meta) { var m = document.createElement("p"); m.className = "ev-meta"; m.textContent = meta; info.appendChild(m); }
      li.appendChild(date); li.appendChild(info);
      if (ev.link) {
        var a = document.createElement("a");
        a.className = "ln ev-link"; a.href = ev.link; a.textContent = ev.linkText || "Details";
        if (/^https?:/.test(ev.link)) { a.target = "_blank"; a.rel = "noopener"; }
        li.appendChild(a);
      }
      ul.appendChild(li);
    });
    body.innerHTML = "";
    body.appendChild(ul);
  })();

  /* ------------------------------------------------- map, on approach */
  (function () {
    var frame = $("#map-frame");
    if (!frame) return;
    function load() {
      var f = document.createElement("iframe");
      f.title = "Map showing Victoria Bookshop, 6 Bridge Street, Haverfordwest";
      f.loading = "lazy";
      f.referrerPolicy = "no-referrer-when-downgrade";
      f.src = "https://www.google.com/maps?q=Victoria+Bookshop,+6+Bridge+Street,+Haverfordwest+SA61+2AD&z=17&output=embed";
      f.addEventListener("load", function () { f.classList.add("is-loaded"); });
      frame.appendChild(f);
    }
    if (!("IntersectionObserver" in window)) { load(); return; }
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); load(); }
    }, { rootMargin: "600px 0px" });
    io.observe(frame);
  })();

  /* ------------------------------------------- book covers tilt to the pointer */
  if (finePointer && !reduceMQ.matches) {
    $$(".tome, .plate").forEach(function (el) {
      if (el.classList.contains("plate")) return; // plates have their own hover turn
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty("--ry", (px * 14).toFixed(2) + "deg");
        el.style.setProperty("--rx", (py * -10).toFixed(2) + "deg");
      });
      el.addEventListener("pointerleave", function () { el.style.setProperty("--ry", "0deg"); el.style.setProperty("--rx", "0deg"); });
    });
  }

  /* ==================================================================
     MOTION. Only with GSAP loaded and reduced motion not requested.
     ================================================================== */
  if (!motion) {
    root.classList.add("hero-done");
    root.classList.remove("has-cover");
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: "power3.out" });

  // For elements whose resting transform lives in CSS (hover lifts, tilts, rotations):
  // switch their CSS transitions off while GSAP drives them, then hand the transform back.
  function held(els, vars) {
    vars.onStart = function () { els.forEach(function (e) { e.classList.add("is-animating"); }); };
    vars.onComplete = function () { els.forEach(function (e) { e.classList.remove("is-animating"); }); };
    vars.clearProps = "transform,opacity";
    return vars;
  }

  /* -------- split text into words for line-by-line reveals -------- */
  function splitWords(el) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var w = document.createElement("span"); w.className = "w";
            var inner = document.createElement("span"); inner.textContent = p;
            w.appendChild(inner); frag.appendChild(w); words.push(inner);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && !child.classList.contains("sr-only")) {
          walk(child);
        }
      });
    })(el);
    return words;
  }
  function revealLines(el) {
    if (el.classList.contains("dropcap")) {
      gsap.from(el, { y: 30, opacity: 0, duration: 1.1, scrollTrigger: { trigger: el, start: "top 86%", once: true } });
      return;
    }
    var words = splitWords(el);
    gsap.set(words, { yPercent: 108 });
    ScrollTrigger.create({
      trigger: el, start: "top 86%", once: true,
      onEnter: function () {
        var top = null, line = -1, idx = 0;
        words.forEach(function (w) {
          var t = w.parentNode.offsetTop;
          if (top === null || Math.abs(t - top) > 4) { top = t; line++; idx = 0; }
          gsap.to(w, { yPercent: 0, duration: 0.95, ease: "power4.out", delay: line * 0.09 + idx * 0.008 });
          idx++;
        });
      }
    });
  }
  $$(".reveal-lines").forEach(revealLines);

  // chapter headers: numeral rises, rule draws across
  $$(".chap").forEach(function (c) {
    if (c.closest(".story")) return; // the story header animates with the pinned book
    var tl = gsap.timeline({ scrollTrigger: { trigger: c, start: "top 88%", once: true } });
    tl.from(c.querySelector(".chap-no"), { yPercent: 60, opacity: 0, duration: 0.8 })
      .from(c.querySelector(".chap-rule"), { scaleX: 0, duration: 1.2, ease: "power3.inOut" }, 0.05)
      .from(c.querySelector(".chap-name"), { x: 16, opacity: 0, duration: 0.8 }, 0.35);
  });

  /* ---------------------------------------------------- title page */
  var arch = $("#arch");
  var archPath = $(".arch-line path");
  var archLen = archPath.getTotalLength();
  function heroIntro() {
    var tl = gsap.timeline({ onComplete: function () { root.classList.add("hero-done"); } });
    tl.fromTo(".tp-word", { yPercent: 112, y: 0 }, { yPercent: 0, y: 0, duration: 1.25, ease: "power4.out", stagger: 0.13 })
      .fromTo(".tp-kicker", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.1)
      .fromTo(".tp-orn span", { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power3.inOut" }, 0.45)
      .fromTo(".tp-orn", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.45)
      .fromTo([".tp-lede", ".tp-sub", ".tp-actions", ".tp-imprint"], { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.09 }, 0.6)
      .fromTo(arch, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "power3.inOut" }, 0.15)
      .fromTo(archPath, { strokeDasharray: archLen, strokeDashoffset: archLen }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut" }, 0.5)
      .fromTo(".shelf i", { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "back.out(1.4)", stagger: { each: 0.018, from: "random" } }, 0.55)
      .fromTo(".frontis-cap, .scroll-cue", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.4);
    return tl;
  }

  // the cloth cover swings open over the title page, once per visit
  if (root.classList.contains("has-cover")) {
    var cover = $("#cover");
    var board = $(".cover-board", cover);
    var title = $(".cover-title", cover);
    var done = false;
    var coverTl = gsap.timeline({
      onComplete: function () {
        done = true;
        root.classList.remove("has-cover");
        try { sessionStorage.setItem("vb-cover", "1"); } catch (e) {}
        detach();
      }
    });
    coverTl
      .to(title, { backgroundPosition: "100% 0", duration: 1.1, ease: "power2.inOut" }, 0)
      .to(board, { rotationY: -172, duration: 1.45, ease: "power3.inOut" }, 0.7)
      .to($(".cover-skip", cover), { opacity: 0, duration: 0.3 }, 0.7)
      .add(heroIntro(), 1.05);
    var hurry = function () { if (!done) coverTl.timeScale(4); };
    var evs = ["wheel", "touchstart", "keydown", "pointerdown"];
    var detach = function () { evs.forEach(function (n) { window.removeEventListener(n, hurry); }); };
    evs.forEach(function (n) { window.addEventListener(n, hurry, { passive: true }); });
  } else {
    heroIntro();
  }

  // depth as the title page scrolls away
  gsap.matchMedia().add("(min-width: 861px)", function () {
    $$(".shelf").forEach(function (s) {
      var d = parseFloat(s.dataset.depth) || 0.5;
      gsap.to(s, { yPercent: -18 * d, ease: "none", scrollTrigger: { trigger: ".title-page", start: "top top", end: "bottom top", scrub: true } });
    });
    gsap.to(".arch-glow", { opacity: 0.4, ease: "none", scrollTrigger: { trigger: ".title-page", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".tp", { yPercent: -8, ease: "none", scrollTrigger: { trigger: ".title-page", start: "top top", end: "bottom top", scrub: true } });
    if (finePointer) {
      var qx = $$(".shelf").map(function (s) { return gsap.quickTo(s, "x", { duration: 1.2, ease: "power3.out" }); });
      var onMove = function (e) {
        var px = e.clientX / window.innerWidth - 0.5;
        qx.forEach(function (q, i) { q(px * (6 + i * 7)); });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return function () { window.removeEventListener("pointermove", onMove); };
    }
  });

  /* -------------------------------------------- II. the story, as a book */
  gsap.matchMedia().add("(min-width: 961px) and (min-height: 620px)", function () {
    var section = $("#story");
    var leaves = $$(".leaf", section);
    var index = $$(".story-index li", section);
    var turns = leaves.length - 1;
    section.classList.add("is-book");

    leaves.forEach(function (leaf, i) {
      leaf.style.zIndex = String(leaves.length - i);
      if (!leaf.dataset.versoYr) return;
      var back = document.createElement("div");
      back.className = "leaf-back verso";
      back.setAttribute("aria-hidden", "true");
      back.innerHTML = '<span class="verso-yr"></span><span class="verso-cap"></span>';
      back.firstChild.textContent = leaf.dataset.versoYr;
      back.lastChild.innerHTML = leaf.dataset.versoCap; // trusted copy from our own markup
      leaf.appendChild(back);
    });

    var current = -1;
    function setIndex(n) {
      if (n === current) return;
      current = n;
      index.forEach(function (li, i) { li.classList.toggle("is-on", i === n); });
    }

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section, start: "top top", end: "+=" + (turns * 75) + "%",
        pin: ".story-pin", scrub: 0.7, anticipatePin: 1,
        snap: { snapTo: 1 / turns, duration: { min: 0.2, max: 0.6 }, delay: 0.08, ease: "power2.inOut" },
        onUpdate: function (self) { setIndex(Math.round(self.progress * turns)); }
      }
    });
    leaves.slice(0, turns).forEach(function (leaf, i) {
      tl.to(leaf, { rotationY: -180, duration: 1, ease: "power1.inOut" }, i)
        .to(leaf, { "--s": 1, duration: 0.5 }, i)
        .to(leaf, { "--s": 0, duration: 0.5 }, i + 0.5)
        .set(leaf, { zIndex: 100 + i }, i + 0.5);
    });

    var intro = gsap.timeline({ scrollTrigger: { trigger: section, start: "top 70%", once: true } });
    intro.from(".story .chap-no", { yPercent: 60, opacity: 0, duration: 0.8 })
      .from(".story .chap-rule", { scaleX: 0, duration: 1.2, ease: "power3.inOut" }, 0)
      .from([".story-h", ".story-p", ".story-index"], { y: 26, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.15)
      .from(".story-book", { y: 60, rotationX: 8, opacity: 0, duration: 1.3, transformPerspective: 1600 }, 0.1);

    return function () {
      section.classList.remove("is-book");
      leaves.forEach(function (leaf) {
        var back = leaf.querySelector(".leaf-back");
        if (back) back.remove();
        leaf.style.zIndex = "";
      });
    };
  });
  // flowing version (narrow screens): leaves slide in as they arrive
  gsap.matchMedia().add("(max-width: 960px), (max-height: 619px)", function () {
    $$(".story .chap-no, .story .chap-rule").forEach(function (el) {
      gsap.from(el, { opacity: 0, duration: 0.8, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    });
    $$(".story .leaf").forEach(function (leaf) {
      gsap.from(leaf, { x: -20, opacity: 0, duration: 0.9, scrollTrigger: { trigger: leaf, start: "top 88%", once: true } });
    });
    gsap.fromTo(".sb-leaves", { "--line": 0 }, { "--line": 1, ease: "none", scrollTrigger: { trigger: ".sb-leaves", start: "top 80%", end: "bottom 60%", scrub: true } });
  });

  /* ---------------------------------------------------- III. the shelf */
  gsap.from(spines, held(spines, {
    y: 70, rotation: function (i) { return i % 2 ? 3 : -3; }, opacity: 0,
    duration: 1, ease: "power4.out", stagger: 0.06,
    scrollTrigger: { trigger: shelf, start: "top 82%", once: true }
  }));
  gsap.from(".bookend, .shelf-plank", { opacity: 0, duration: 1, scrollTrigger: { trigger: shelf, start: "top 82%", once: true } });
  gsap.from(".shelf-card", { y: 50, opacity: 0, duration: 1.1, scrollTrigger: { trigger: ".shelf-card", start: "top 90%", once: true } });
  gsap.from(".browse-hint", { opacity: 0, x: -10, rotation: -12, duration: 0.9, delay: 0.5, scrollTrigger: { trigger: ".browse-head", start: "top 80%", once: true } });

  /* ---------------------------------------------------- IV. signed */
  var sig = $(".sig-stroke path");
  var sigLen = sig.getTotalLength();
  gsap.set(sig, { strokeDasharray: sigLen, strokeDashoffset: sigLen });
  gsap.to(sig, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ".signed-h", start: "top 75%", end: "bottom 35%", scrub: 0.6 } });
  gsap.timeline({ scrollTrigger: { trigger: ".signed-h", start: "top 80%", once: true } })
    .from(".sh-a", { yPercent: 40, opacity: 0, duration: 1.1, ease: "power4.out" })
    .from(".sh-b", { x: -30, opacity: 0, duration: 0.9 }, 0.2)
    .from(".sh-c", { yPercent: 40, opacity: 0, duration: 1.1, ease: "power4.out" }, 0.3)
    .from(".signed-copy > *", { y: 20, opacity: 0, duration: 0.9, stagger: 0.12 }, 0.4);

  // plates arrive as a stacked pile and fan out along the row
  var plateEls = $$(".plate", plates);
  ScrollTrigger.create({
    trigger: plates, start: "top 82%", once: true,
    onEnter: function () {
      var first = plateEls[0].getBoundingClientRect().left;
      gsap.from(plateEls, {
        x: function (i, el) { return first - el.getBoundingClientRect().left + i * 8; },
        rotation: function (i) { return -6 + i * 2.2; },
        y: function (i) { return 30 + i * 4; },
        opacity: function (i) { return i === 0 ? 0 : 1; },
        duration: 1.4, ease: "power4.inOut", stagger: 0.05,
        clearProps: "transform,opacity",
        onComplete: updatePlates
      });
    }
  });

  /* ---------------------------------------------------- V. local */
  gsap.fromTo(".local-scene",
    { clipPath: "inset(7% 6% 0% 6% round 18px)" },
    { clipPath: "inset(0% 0% -2% 0% round 0px)", ease: "none", scrollTrigger: { trigger: "#local", start: "top bottom", end: "top 15%", scrub: true } });
  gsap.fromTo(".lh-big", { xPercent: 14 }, { xPercent: -4, ease: "none", scrollTrigger: { trigger: ".local-h", start: "top bottom", end: "bottom top", scrub: true } });
  $$(".contours path").forEach(function (p, i) {
    var L = p.getTotalLength();
    gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: { trigger: "#local", start: "top " + (85 - i * 3) + "%", end: "top " + (10 - i * 2) + "%", scrub: true }
    });
  });
  gsap.from(".tome-feature .tome", held($$(".tome-feature .tome"), { y: 80, rotation: 4, opacity: 0, duration: 1.3, ease: "power4.out", scrollTrigger: { trigger: ".local-grid", start: "top 80%", once: true } }));
  gsap.from(".local-notes li", { y: 24, opacity: 0, duration: 0.9, stagger: 0.12, scrollTrigger: { trigger: ".local-notes", start: "top 85%", once: true } });

  /* ---------------------------------------------------- VI. picks */
  $$(".note").forEach(function (note, i) {
    var tome = note.querySelector(".tome"), card = note.querySelector(".note-card");
    gsap.from(tome, held([tome], { y: 70, rotation: i % 2 ? 5 : -5, opacity: 0, duration: 1.2, ease: "power4.out", scrollTrigger: { trigger: note, start: "top 85%", once: true } }));
    gsap.from(card, held([card], { y: 60, x: window.innerWidth > 860 ? (i % 2 ? -30 : 30) : 0, rotation: i % 2 ? -8 : 8, opacity: 0, duration: 1.2, delay: 0.18, ease: "power4.out", scrollTrigger: { trigger: note, start: "top 85%", once: true } }));
  });
  gsap.matchMedia().add("(min-width: 861px)", function () {
    [-40, 30, -15].forEach(function (d, i) {
      gsap.to($$(".note")[i], { y: d, ease: "none", scrollTrigger: { trigger: ".notes", start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  /* ---------------------------------------------------- VII. order + VIII. visit */
  gsap.from(".routes li", { y: 34, opacity: 0, duration: 0.9, stagger: 0.08, scrollTrigger: { trigger: ".routes", start: "top 82%", once: true } });
  gsap.from(".order-h", { y: 30, opacity: 0, duration: 1, scrollTrigger: { trigger: ".order-h", start: "top 85%", once: true } });
  gsap.from(".visit-h > span:not(.sr-only)", { yPercent: 60, opacity: 0, duration: 1.1, ease: "power4.out", stagger: 0.1, scrollTrigger: { trigger: ".visit-h", start: "top 85%", once: true } });
  gsap.from(".visit-p, .visit-actions, .visit-facts > div", { y: 22, opacity: 0, duration: 0.8, stagger: 0.07, scrollTrigger: { trigger: ".visit-p", start: "top 88%", once: true } });
  gsap.from(".map-frame", { clipPath: "inset(0% 0% 100% 0%)", duration: 1.4, ease: "power3.inOut", scrollTrigger: { trigger: ".visit-map", start: "top 82%", once: true } });

  /* ---------------------------------------------------- the end: the book closes */
  (function () {
    var end = $("#end");
    var endBoard = $(".end-board", end);
    end.classList.add("is-closing");
    var back = document.createElement("div");
    back.className = "end-board-back";
    back.setAttribute("aria-hidden", "true");
    endBoard.insertBefore(back, endBoard.firstChild);
    var tl = gsap.timeline({ scrollTrigger: { trigger: end, start: "top top", end: "bottom bottom", scrub: 0.8 } });
    tl.fromTo(endBoard, { rotationY: -168 }, { rotationY: 0, duration: 1, ease: "power2.inOut" })
      .fromTo(".end-page > *", { opacity: 1 }, { opacity: 0.25, duration: 0.4 }, 0.55)
      .from(".end-board-in > *", { y: 20, opacity: 0, duration: 0.3, stagger: 0.05 }, 0.72);
    gsap.from(".end-page > *", { y: 30, opacity: 0, duration: 1, stagger: 0.12, scrollTrigger: { trigger: end, start: "top 70%", once: true } });
  })();

  // fonts can shift line heights; re-measure once they land
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
