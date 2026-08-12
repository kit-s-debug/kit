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
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        el.style.transform = "translate(" + relX * 0.28 + "px," + relY * 0.35 + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
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
})();
