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

  /* ---------- mobile nav toggle ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  navToggle.addEventListener("click", function () {
    var open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    mobileNav.hidden = open;
  });
  mobileNav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      navToggle.setAttribute("aria-expanded", "false");
      mobileNav.hidden = true;
    }
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

  /* ---------- hero scroll parallax ---------- */
  var heroParallax = document.getElementById("hero-parallax");
  var heroContent = document.getElementById("hero-content");
  var hero = document.querySelector(".hero");
  if (hero && !reducedMotion) {
    var ticking = false;
    function updateParallax() {
      var rect = hero.getBoundingClientRect();
      var progress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
      heroParallax.style.transform = "translate3d(0," + progress * 90 + "px,0) scale(" + (1 + progress * 0.08) + ")";
      heroContent.style.transform = "translate3d(0," + progress * 40 + "px,0)";
      heroContent.style.opacity = String(1 - progress * 1.1);
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

  /* ---------- tilt on floor/experience media ---------- */
  if (canHover && !reducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = "perspective(800px) rotateX(" + (-py * 6) + "deg) rotateY(" + (px * 6) + "deg)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
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

  /* ---------- random disco light flicker (RnB Bar + Main Bar windows) ---------- */
  if (!reducedMotion) {
    var discoColors = ["#F3B98C", "#C85C7E", "#4FA8A0", "#E2895E"];
    document.querySelectorAll(".floor-disco").forEach(function (container) {
      for (var i = 0; i < 6; i++) {
        var beam = document.createElement("span");
        beam.className = "beam";
        beam.style.setProperty("--beam-x", (6 + Math.random() * 88) + "%");
        beam.style.setProperty("--beam-color", discoColors[Math.floor(Math.random() * discoColors.length)]);
        beam.style.setProperty("--beam-dur", (2.6 + Math.random() * 2.4) + "s");
        beam.style.setProperty("--beam-delay", (Math.random() * 4.5) + "s");
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
  var cdSecs = document.getElementById("cd-secs");
  if (cdDays && cdHours && cdMins && cdSecs) {
    function nextDoorsOpen(now) {
      for (var i = 0; i < 8; i++) {
        var d = new Date(now);
        d.setDate(now.getDate() + i);
        d.setHours(21, 0, 0, 0);
        var day = d.getDay();
        if ((day === 5 || day === 6) && d.getTime() > now.getTime()) return d;
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
      var secs = Math.floor((diff % 60000) / 1000);
      cdDays.textContent = pad(days);
      cdHours.textContent = pad(hours);
      cdMins.textContent = pad(mins);
      cdSecs.textContent = pad(secs);
    }
    tick();
    setInterval(tick, 1000);
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
