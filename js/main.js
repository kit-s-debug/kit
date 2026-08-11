(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky header shadow/blur ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- full-screen menu overlay ---------- */
  var menuBtn = document.getElementById("menu-btn");
  var menuClose = document.getElementById("menu-close");
  var menuOverlay = document.getElementById("menu-overlay");
  var menuLastFocused = null;

  function openMenu() {
    menuLastFocused = document.activeElement;
    menuOverlay.hidden = false;
    menuBtn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    menuClose.focus();
    document.addEventListener("keydown", onMenuKeydown);
  }
  function closeMenu() {
    menuOverlay.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onMenuKeydown);
    if (menuLastFocused) menuLastFocused.focus();
  }
  function onMenuKeydown(e) {
    if (e.key === "Escape") closeMenu();
  }
  menuBtn.addEventListener("click", openMenu);
  menuClose.addEventListener("click", closeMenu);
  menuOverlay.querySelectorAll(".menu-links a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
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
