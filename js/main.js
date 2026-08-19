(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* This file is shared by both venues' pages, so anything page-specific is
     guarded. Both now have a header, footer, drawer, hero video and 3D
     building; Labrinth has no countdown, events, gallery or experience rows. */

  /* ---------- sticky header shrink/blur ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile nav: slide-in drawer ---------- */
  /* Wired per toggle rather than by a single id: both venues have their own
     drawer, and the combined single-file preview puts both in one document. */
  Array.prototype.forEach.call(document.querySelectorAll(".nav-toggle"), function (navToggle) {
    var mobileNav = document.getElementById(navToggle.getAttribute("aria-controls"));
    if (!mobileNav) return;
    var mobileNavBackdrop = mobileNav.previousElementSibling;
    if (!mobileNavBackdrop || !mobileNavBackdrop.classList.contains("mobile-nav-backdrop")) return;

    mobileNav.inert = true;
    function openMobileNav() {
      navToggle.setAttribute("aria-expanded", "true");
      mobileNav.classList.add("is-open");
      mobileNavBackdrop.classList.add("is-open");
      mobileNav.inert = false;
      document.body.style.overflow = "hidden";
      var firstLink = mobileNav.querySelector("a");
      if (firstLink) firstLink.focus();
    }
    function closeMobileNav() {
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("is-open");
      mobileNavBackdrop.classList.remove("is-open");
      mobileNav.inert = true;
      document.body.style.overflow = "";
      navToggle.focus();
    }
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      if (open) closeMobileNav(); else openMobileNav();
    });
    mobileNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") closeMobileNav();
    });
    mobileNavBackdrop.addEventListener("click", closeMobileNav);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") closeMobileNav();
    });
  });

  /* ---------- showcase line-ups ---------- */
  /* A rail in time order: earlier nights to the left, coming ones to the
     right, landing on the next one open. Generated from the venue's real
     opening nights rather than a hand-written list, so it can't go stale and
     nobody has to remember to prune last month off the page. */
  var rail = document.getElementById("lineup-rail");
  if (rail) {
    var NIGHTS = [
      { day: 3, name: "Midweek", floors: "Main Bar", note: "Free entry" },
      { day: 5, name: "Friday", floors: "Main Bar · RnB Bar", note: "Free entry" },
      { day: 6, name: "Saturday", floors: "Main Bar · RnB Bar", note: "Entry varies" },
    ];
    var WEEKS_BACK = 6, WEEKS_ON = 8;
    var DAY_MS = 86400000;
    var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var cards = [];
    for (var wk = -WEEKS_BACK; wk <= WEEKS_ON; wk++) {
      NIGHTS.forEach(function (night) {
        var d = new Date(today.getTime());
        d.setDate(d.getDate() + (night.day - d.getDay()) + wk * 7);
        cards.push({ date: d, night: night });
      });
    }
    cards.sort(function (a, b) { return a.date - b.date; });

    var firstUpcoming = null;
    var frag = document.createDocumentFragment();
    cards.forEach(function (c) {
      var past = c.date.getTime() < today.getTime();
      var isToday = c.date.getTime() === today.getTime();
      var el = document.createElement("article");
      el.className = "lineup-card" + (past ? " is-past" : "") + (isToday ? " is-tonight" : "");
      el.innerHTML =
        '<span class="lineup-tag">' + (isToday ? "Tonight" : past ? "Been" : "Coming up") + "</span>" +
        '<span class="lineup-date"><b>' + DAYS[c.date.getDay()] + "</b> " +
        c.date.getDate() + " " + MONTHS[c.date.getMonth()] + "</span>" +
        "<h3>" + c.night.name + "</h3>" +
        '<p class="lineup-floors">' + c.night.floors + "</p>" +
        '<p class="lineup-bill">' + (past ? "Residents on both floors" : "Line-up announced closer to the night") + "</p>" +
        '<span class="lineup-note">' + c.night.note + "</span>";
      frag.appendChild(el);
      if (!past && !firstUpcoming) firstUpcoming = el;
    });
    rail.appendChild(frag);

    /* Land on the next night open, so what's coming reads first and the past
       is a deliberate move leftwards rather than the default view. */
    var land = function () {
      if (!firstUpcoming) return;
      rail.scrollLeft = firstUpcoming.offsetLeft - rail.offsetLeft;
    };
    land();
    window.addEventListener("load", land);

    var step = function () {
      var card = rail.querySelector(".lineup-card");
      return card ? card.offsetWidth + 18 : 300;
    };
    var buttons = document.querySelectorAll("[data-lineup-dir]");
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        rail.scrollBy({
          left: Number(btn.dataset.lineupDir) * step(),
          behavior: reducedMotion ? "auto" : "smooth",
        });
      });
    });
    var syncEnds = function () {
      var atStart = rail.scrollLeft <= 2;
      var atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
      Array.prototype.forEach.call(buttons, function (btn) {
        btn.disabled = Number(btn.dataset.lineupDir) < 0 ? atStart : atEnd;
      });
    };
    rail.addEventListener("scroll", syncEnds, { passive: true });
    syncEnds();
    rail.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      rail.scrollBy({
        left: (e.key === "ArrowLeft" ? -1 : 1) * step(),
        behavior: reducedMotion ? "auto" : "smooth",
      });
    });
  }

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hero video ---------- */
  /* Autoplay can be refused until a gesture in some embedded/sandboxed
     contexts, which leaves the frame frozen on the poster. Ask once on
     load, then retry on the first interaction. */
  var heroVideo = document.getElementById("hero-video");
  if (heroVideo && !reducedMotion) {
    /* a landscape crop cover-fitted into a phone's portrait hero zooms in
       so far the room disappears, so narrow screens get a portrait cut of
       the same clip instead */
    var variant = window.matchMedia("(max-width: 700px)").matches ? "tall" : "wide";
    if (variant === "tall") {
      var tallPoster = heroVideo.getAttribute("data-poster-tall");
      if (tallPoster) heroVideo.poster = tallPoster;
    }
    if (!heroVideo.querySelector("source")) {
      [["webm", "video/webm"], ["mp4", "video/mp4"]].forEach(function (pair) {
        var src = heroVideo.getAttribute("data-" + pair[0] + "-" + variant);
        if (!src) return;
        var source = document.createElement("source");
        source.src = src;
        source.type = pair[1];
        heroVideo.appendChild(source);
      });
      /* the element ships as preload="none" so the reduced-motion path
         downloads nothing at all; once we've decided to play, it needs to
         actually fetch or play() can be rejected for having no data */
      heroVideo.preload = "auto";
      heroVideo.load();
    }

    /* Autoplay gets refused in more places than it used to — embedded and
       sandboxed contexts, iOS low-power mode, and any browser that hasn't
       decided the document is "engaged" yet. A single attempt on load
       leaves the hero frozen on its poster, so keep asking: on every
       readiness event, and on the first sign of any user activity. The
       listeners tear themselves down once it's genuinely running. */
    var tryPlay = function () {
      if (!heroVideo.paused) return;
      var attempt = heroVideo.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(function () {});
    };
    var nudges = ["pointerdown", "touchstart", "keydown", "scroll", "mousemove"];
    var listen = function (add) {
      nudges.forEach(function (evt) {
        if (add) window.addEventListener(evt, tryPlay, { passive: true });
        else window.removeEventListener(evt, tryPlay);
      });
    };
    ["loadeddata", "canplay", "canplaythrough"].forEach(function (evt) {
      heroVideo.addEventListener(evt, tryPlay);
    });
    heroVideo.addEventListener("playing", function () { listen(false); });
    listen(true);
    tryPlay();

    /* Coming back to a tab that has been in the background for a while is
       the most reliable way to find the hero frozen, so ask again on the
       way in. */
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) tryPlay();
    });

    /* Watch the clock rather than trust the events. A background video can
       stop painting without firing anything useful — a decoder the phone
       evicted under memory pressure looks exactly like a video that is
       still "playing" — so if currentTime hasn't moved while we believe it
       is running, ask again, and re-fetch if asking doesn't take. */
    var lastTime = -1;
    var stuck = 0;
    setInterval(function () {
      if (heroVideo.paused || document.hidden) {
        lastTime = -1;
        stuck = 0;
        return;
      }
      if (heroVideo.currentTime === lastTime) {
        stuck++;
        if (stuck === 3) tryPlay();
        if (stuck >= 6) {
          stuck = 0;
          heroVideo.load();
          tryPlay();
        }
      } else {
        stuck = 0;
      }
      lastTime = heroVideo.currentTime;
    }, 1000);
  }

  /* ---------- hero scroll parallax ---------- */
  var heroContent = document.getElementById("hero-content");
  var heroMedia = document.getElementById("hero-media");
  /* both venues have a footage hero, they just carry different class names */
  var hero = document.querySelector(".hero, .lab-hero");
  if (hero && !reducedMotion) {
    var ticking = false;
    function updateParallax() {
      var rect = hero.getBoundingClientRect();
      var progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      /* Labrinth's hero has no #hero-content wrapper — only the footage
         layer is shared between the two venues */
      if (heroContent) {
        heroContent.style.transform = "translate3d(0," + progress * 46 + "px,0)";
        heroContent.style.opacity = String(1 - progress * 1.15);
      }
      /* the footage holds its ground while the type lifts away, so the
         section reads as depth rather than one flat sheet scrolling */
      if (heroMedia) heroMedia.style.transform = "translate3d(0," + progress * 14 + "%,0)";
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
    updateParallax();
  }

  /* ---------- sticky enquire bar: only once the hero is behind you ---------- */
  var stickyBar = document.querySelector(".sticky-reserve");
  if (stickyBar && hero) {
    var stickyTicking = false;
    function updateSticky() {
      var past = hero.getBoundingClientRect().bottom < 40;
      stickyBar.classList.toggle("is-visible", past);
      stickyTicking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!stickyTicking) {
          window.requestAnimationFrame(updateSticky);
          stickyTicking = true;
        }
      },
      { passive: true }
    );
    updateSticky();
  }

  /* ---------- custom cursor ---------- */
  var cursor = document.getElementById("cursor");
  if (cursor && canHover) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    var tx = cx, ty = cy;
    document.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
    });
    function loop() {
      cx += (tx - cx) * 0.5;
      cy += (ty - cy) * 0.5;
      cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0) translate(-50%,-50%)";
      window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);

    document.addEventListener("mousedown", function () { cursor.classList.add("is-clicking"); });
    document.addEventListener("mouseup", function () { cursor.classList.remove("is-clicking"); });

    var hoverables = document.querySelectorAll("a, button, [data-magnetic], [data-tilt]");
    hoverables.forEach(function (el) {
      el.addEventListener("mouseenter", function () { cursor.classList.add("is-hovering"); });
      el.addEventListener("mouseleave", function () { cursor.classList.remove("is-hovering"); });
    });
  } else if (cursor) {
    cursor.remove();
  }

  /* ---------- magnetic buttons ---------- */
  if (canHover && !reducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var mx = 0, my = 0, pressed = false;
      function apply() {
        el.style.transform = "translate(" + mx + "px," + my + "px) scale(" + (pressed ? 0.96 : 1) + ")";
      }
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        mx = (e.clientX - rect.left - rect.width / 2) * 0.28;
        my = (e.clientY - rect.top - rect.height / 2) * 0.35;
        apply();
      });
      el.addEventListener("mouseleave", function () {
        mx = 0; my = 0; pressed = false;
        el.style.transform = "";
      });
      el.addEventListener("mousedown", function () { pressed = true; apply(); });
      el.addEventListener("mouseup", function () { pressed = false; apply(); });
    });
  }

  /* ---------- cursor-follow spotlight on cards ---------- */
  if (canHover && !reducedMotion) {
    document.querySelectorAll("[data-spotlight]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        el.style.setProperty("--sx", ((e.clientX - rect.left) / rect.width * 100) + "%");
        el.style.setProperty("--sy", ((e.clientY - rect.top) / rect.height * 100) + "%");
      });
    });
  }

  /* ---------- 3D tilt on floor/experience/resident photo frames ---------- */
  if (canHover && !reducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      var rafId = null;
      var rotX = 0, rotY = 0, targetX = 0, targetY = 0, scale = 1, targetScale = 1;
      function step() {
        rotX += (targetX - rotX) * 0.16;
        rotY += (targetY - rotY) * 0.16;
        scale += (targetScale - scale) * 0.16;
        el.style.transform = "perspective(600px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg) scale3d(" + scale.toFixed(3) + "," + scale.toFixed(3) + ",1)";
        el.style.filter = "drop-shadow(" + (-rotY * 1.6).toFixed(1) + "px " + (rotX * 1.6).toFixed(1) + "px 20px rgba(0,0,0,.5))";
        var settled = Math.abs(targetX - rotX) < 0.02 && Math.abs(targetY - rotY) < 0.02 && Math.abs(targetScale - scale) < 0.001;
        if (!settled) {
          rafId = requestAnimationFrame(step);
        } else {
          rafId = null;
        }
      }
      function ensureLoop() { if (!rafId) rafId = requestAnimationFrame(step); }
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        targetX = -py * 16;
        targetY = px * 16;
        targetScale = 1.035;
        ensureLoop();
      });
      el.addEventListener("mouseleave", function () {
        targetX = 0; targetY = 0; targetScale = 1;
        ensureLoop();
      });
    });
  }

  /* ---------- facade tilt: the building leans as it passes through view ---------- */
  var building = document.getElementById("building");
  if (building && !reducedMotion) {
    var facadeTicking = false;
    function updateFacade() {
      var rect = building.getBoundingClientRect();
      /* -1 when the block is entering from below, +1 once it has left the top */
      var mid = (rect.top + rect.height / 2) / window.innerHeight;
      var t = Math.min(Math.max((mid - 0.5) * 2, -1), 1);
      building.style.setProperty("--facade-tilt", (t * 4.5).toFixed(2) + "deg");
      facadeTicking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!facadeTicking) {
          window.requestAnimationFrame(updateFacade);
          facadeTicking = true;
        }
      },
      { passive: true }
    );
    updateFacade();
  }

  /* ---------- building levels (expand/collapse) ---------- */
  var buildingLevels = document.querySelectorAll(".building-level");
  buildingLevels.forEach(function (level) {
    var btn = level.querySelector(".building-floor");
    var wrap = level.querySelector(".level-panel-wrap");
    wrap.inert = !level.classList.contains("is-open");
    btn.addEventListener("click", function () {
      var wasOpen = level.classList.contains("is-open");
      buildingLevels.forEach(function (other) {
        other.classList.remove("is-open");
        other.querySelector(".building-floor").setAttribute("aria-expanded", "false");
        other.querySelector(".level-panel-wrap").inert = true;
      });
      if (!wasOpen) {
        level.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        wrap.inert = false;
      }
    });
  });

  /* ---------- random disco light flicker (hero, RnB Bar + Main Bar windows) ---------- */
  if (!reducedMotion) {
    var discoColors = ["#F3B98C", "#C85C7E", "#4FA8A0", "#E2895E"];
    document.querySelectorAll(".floor-disco").forEach(function (container) {
      for (var i = 0; i < 6; i++) {
        var beam = document.createElement("span");
        beam.className = "beam";
        beam.style.setProperty("--beam-x", (6 + Math.random() * 88) + "%");
        beam.style.setProperty("--beam-color", discoColors[Math.floor(Math.random() * discoColors.length)]);
        beam.style.setProperty("--beam-dur", (1.8 + Math.random() * 1.6) + "s");
        beam.style.setProperty("--beam-delay", (Math.random() * 2.8) + "s");
        container.appendChild(beam);
      }
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- doors-open countdown (next Fri/Sat 9pm) ---------- */
  var cdDays = document.getElementById("cd-days");
  var cdHours = document.getElementById("cd-hours");
  var cdMins = document.getElementById("cd-mins");
  if (cdDays && cdHours && cdMins) {
    function nextDoorsOpen(now) {
      for (var i = 0; i < 8; i++) {
        var d = new Date(now);
        d.setDate(now.getDate() + i);
        d.setHours(21, 0, 0, 0);
        var day = d.getDay();
        if ((day === 3 || day === 5 || day === 6) && d.getTime() > now.getTime()) return d;
      }
      return null;
    }
    function pad(n) { return String(n).padStart(2, "0"); }
    var target = nextDoorsOpen(new Date());
    function tick() {
      var now = new Date();
      if (!target || target.getTime() <= now.getTime()) target = nextDoorsOpen(now);
      var diff = Math.max(0, target.getTime() - now.getTime());
      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff % 86400000) / 3600000);
      var mins = Math.floor((diff % 3600000) / 60000);
      cdDays.textContent = String(days);
      cdHours.textContent = pad(hours);
      cdMins.textContent = pad(mins);
    }
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- newsletter form ---------- */
  var newsletterForm = document.getElementById("newsletter-form");
  var newsletterStatus = document.getElementById("newsletter-status");
  if (newsletterForm && newsletterStatus) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var emailInput = document.getElementById("newsletter-email");
      if (!emailInput.value) return;
      newsletterStatus.textContent = "Thanks, you're on the list.";
      newsletterForm.reset();
    });
  }
})();
