(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- sticky header shrink/blur ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile nav: slide-in drawer ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  var mobileNavBackdrop = document.getElementById("mobile-nav-backdrop");
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
    var tall = window.matchMedia("(max-width: 700px)").matches;
    var base = heroVideo.getAttribute(tall ? "data-src-tall" : "data-src-wide");
    if (tall) heroVideo.poster = heroVideo.getAttribute("data-poster-tall");
    [["webm", "video/webm"], ["mp4", "video/mp4"]].forEach(function (pair) {
      var source = document.createElement("source");
      source.src = base + "." + pair[0];
      source.type = pair[1];
      heroVideo.appendChild(source);
    });
    heroVideo.load();

    /* autoplay can be refused until a gesture in some embedded contexts,
       which would leave the frame frozen on the poster */
    var tryPlay = function () {
      var attempt = heroVideo.play();
      if (attempt && typeof attempt.catch === "function") attempt.catch(function () {});
    };
    tryPlay();
    ["click", "touchstart", "keydown"].forEach(function (evt) {
      window.addEventListener(evt, tryPlay, { once: true, passive: true });
    });
  }

  /* ---------- hero scroll parallax ---------- */
  var heroContent = document.getElementById("hero-content");
  var heroMedia = document.getElementById("hero-media");
  var hero = document.querySelector(".hero");
  if (hero && !reducedMotion) {
    var ticking = false;
    function updateParallax() {
      var rect = hero.getBoundingClientRect();
      var progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      heroContent.style.transform = "translate3d(0," + progress * 46 + "px,0)";
      heroContent.style.opacity = String(1 - progress * 1.15);
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

    var hoverables = document.querySelectorAll("a, button, [data-magnetic], .gallery-item, [data-tilt]");
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

  /* ---------- gallery lightbox ---------- */
  var galleryImages = Array.prototype.map.call(
    document.querySelectorAll("#gallery-grid img"),
    function (img) { return { src: img.currentSrc || img.src, alt: img.alt }; }
  );
  var lightbox = document.getElementById("lightbox");
  var lightboxImage = document.getElementById("lightbox-image");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxPrev = document.getElementById("lightbox-prev");
  var lightboxNext = document.getElementById("lightbox-next");
  var currentIndex = 0;
  var lightboxLastFocused = null;

  function showImage(index) {
    currentIndex = (index + galleryImages.length) % galleryImages.length;
    var item = galleryImages[currentIndex];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
  }
  function openLightbox(index) {
    lightboxLastFocused = document.activeElement;
    showImage(index);
    lightbox.hidden = false;
    lightboxClose.focus();
    document.addEventListener("keydown", onLightboxKeydown);
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.removeEventListener("keydown", onLightboxKeydown);
    if (lightboxLastFocused) lightboxLastFocused.focus();
  }
  function onLightboxKeydown(e) {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    if (e.key === "ArrowRight") showImage(currentIndex + 1);
  }
  document.querySelectorAll(".gallery-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      openLightbox(parseInt(btn.dataset.index, 10));
    });
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", function () { showImage(currentIndex - 1); });
  lightboxNext.addEventListener("click", function () { showImage(currentIndex + 1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

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
