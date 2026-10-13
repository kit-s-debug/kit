/* The Spice Box: page behaviour. No dependencies. */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Split headings into masked words ---------- */
  $$("[data-split]").forEach((el) => {
    let i = 0;
    const wrap = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(" "); return; }
            const w = document.createElement("span");
            w.className = "w";
            const inner = document.createElement("span");
            inner.textContent = part;
            inner.style.setProperty("--i", i++);
            w.append(inner);
            frag.append(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          wrap(child);
        }
      });
    };
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    wrap(el);
    $$(".w", el).forEach((w) => w.setAttribute("aria-hidden", "true"));
  });

  /* ---------- Hero intro ---------- */
  const hero = $(".hero");
  const heroImg = $(".hero-img");
  const startHero = () => {
    if (hero.classList.contains("is-loaded")) return;
    requestAnimationFrame(() => hero.classList.add("is-loaded"));
    setTimeout(() => hero.classList.add("is-settled"), 2400);
  };
  if (heroImg.complete) startHero();
  else {
    heroImg.addEventListener("load", startHero, { once: true });
    heroImg.addEventListener("error", startHero, { once: true });
    setTimeout(startHero, 1500); // never hold the page back on a slow image
  }

  /* ---------- Navigation ---------- */
  const nav = $("#nav");
  const burger = $(".burger");
  const menu = $("#menu");

  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    if (open) {
      menu.hidden = false;
      nav.classList.add("is-solid");
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
      $("a", menu).focus({ preventScroll: true });
    } else {
      menu.classList.remove("is-open");
      const done = () => { if (!menu.classList.contains("is-open")) menu.hidden = true; };
      reduceMotion ? done() : setTimeout(done, 600);
      onScroll();
    }
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") { setMenu(false); burger.focus(); }
  });
  // Keep keyboard focus inside the open menu (menu links + burger).
  menu.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const items = [...$$("a", menu), burger];
    const idx = items.indexOf(document.activeElement);
    if (e.shiftKey && idx === 0) { e.preventDefault(); burger.focus(); }
    if (!e.shiftKey && idx === items.length - 2) { e.preventDefault(); burger.focus(); }
  });
  burger.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.shiftKey && burger.getAttribute("aria-expanded") === "true") { e.preventDefault(); $("a", menu).focus(); }
  });
  matchMedia("(min-width: 1041px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  // Highlight the section in view.
  const navLinks = $$(".nav-links a");
  const sections = navLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => sectionIO.observe(s));

  /* ---------- Scroll: solid nav + parallax ---------- */
  const cta = $(".cta");
  const ctaImg = $(".cta-img");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle("is-solid", y > 24 || document.body.classList.contains("menu-open"));
      if (!reduceMotion) {
        if (y < innerHeight * 1.2) heroImg.style.setProperty("--py", `${(y * 0.12).toFixed(1)}px`);
        const r = cta.getBoundingClientRect();
        if (r.bottom > 0 && r.top < innerHeight) {
          const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1..1 through the viewport
          ctaImg.style.setProperty("--py", `${(p * -40).toFixed(1)}px`);
        }
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveals ---------- */
  const revealEls = $$("[data-reveal], [data-split]:not(.hero-title)");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    // Stagger siblings that reveal together.
    const groups = new Map();
    revealEls.forEach((el) => {
      const list = groups.get(el.parentElement) || [];
      list.push(el);
      groups.set(el.parentElement, list);
    });
    groups.forEach((list) => list.forEach((el, i) => el.style.setProperty("--d", `${Math.min(i, 5) * 90}ms`)));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.01 });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Data ---------- */
  const STOCK = Array.isArray(window.SPICEBOX_STOCK) ? window.SPICEBOX_STOCK : [];
  const CATS = $$(".explorer-tabs [role=tab]").map((b) => ({ id: b.dataset.cat, name: b.textContent.replace(/^\d+/, "").trim() }));
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ");
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Product explorer ---------- */
  const tabs = $$(".explorer-tabs [role=tab]");
  const panel = $("#panel");
  const copy = $("#cat-copy").content;
  const mediaImgs = $$(".explorer-media img");
  // A short, varied sample per category: every nth item so it spans the shelf.
  const sample = (cat, n = 9) => {
    const items = STOCK.filter((r) => r[1] === cat);
    const step = Math.max(1, Math.floor(items.length / n));
    return items.filter((_, i) => i % step === 0).slice(0, n).map((r) => r[0]);
  };
  let swapTimer;
  const selectCat = (btn, focus = false) => {
    const cat = btn.dataset.cat;
    tabs.forEach((t) => {
      const on = t === btn;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });
    if (focus) btn.focus();
    // On small screens the tabs are a horizontal strip: scroll only the strip, never the page.
    const strip = btn.parentElement;
    if (strip.scrollWidth > strip.clientWidth) {
      strip.scrollTo({ left: btn.offsetLeft - strip.offsetLeft - 20, behavior: reduceMotion ? "auto" : "smooth" });
    }
    mediaImgs.forEach((img) => {
      const on = img.dataset.cat === cat;
      if (on) img.loading = "eager";
      img.classList.toggle("is-active", on);
    });
    panel.setAttribute("aria-labelledby", btn.id);
    const fill = () => {
      const count = STOCK.filter((r) => r[1] === cat).length;
      $("[data-count]", panel).textContent = count;
      $("[data-title]", panel).textContent = CATS.find((c) => c.id === cat).name;
      $("[data-desc]", panel).textContent = $(`[data-cat="${cat}"]`, copy).textContent;
      $("[data-chips]", panel).innerHTML = sample(cat).map((n) => `<li>${esc(n)}</li>`).join("");
      $("[data-browse]", panel).dataset.cat = cat;
      panel.classList.remove("is-swapping");
    };
    clearTimeout(swapTimer);
    if (reduceMotion || !panel.dataset.ready) { fill(); panel.dataset.ready = "1"; return; }
    panel.classList.add("is-swapping");
    swapTimer = setTimeout(fill, 220);
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectCat(t));
    t.addEventListener("keydown", (e) => {
      const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (e.key in keys) { e.preventDefault(); selectCat(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true); }
      if (e.key === "Home") { e.preventDefault(); selectCat(tabs[0], true); }
      if (e.key === "End") { e.preventDefault(); selectCat(tabs[tabs.length - 1], true); }
    });
  });
  selectCat(tabs[0]);
  // Warm the other category images once the section is near, so switching is instant.
  new IntersectionObserver((entries, obs) => {
    if (entries.some((e) => e.isIntersecting)) { mediaImgs.forEach((img) => (img.loading = "eager")); obs.disconnect(); }
  }, { rootMargin: "400px 0px" }).observe($(".explorer"));

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
    count.textContent = `${hits.length} item${hits.length === 1 ? "" : "s"}`;
    empty.hidden = hits.length > 0;
    list.hidden = hits.length === 0;
  }
  let t;
  q.addEventListener("input", () => { clearTimeout(t); t = setTimeout(render, 80); });
  $$("[data-try]").forEach((b) => b.addEventListener("click", () => { q.value = b.dataset.try; setFilter("all"); q.focus(); }));
  $("[data-browse]").addEventListener("click", (e) => {
    q.value = "";
    setFilter(e.currentTarget.dataset.cat || "all");
  });
  render();

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox");
  const lbImg = $("#lb-img"), lbCap = $("#lb-cap");
  const shots = $$("[data-lightbox]").map((b) => {
    const img = $("img", b);
    const big = (img.getAttribute("srcset") || "").split(",").pop().trim().split(" ")[0] || img.getAttribute("src");
    return { src: big || img.src, alt: img.alt, cap: b.parentElement.querySelector(".g-cap")?.textContent || "" };
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
    opener = b; show(+b.dataset.lightbox); lb.showModal(); document.body.classList.add("menu-open");
  }));
  lb.addEventListener("close", () => { document.body.classList.remove("menu-open"); lbImg.removeAttribute("src"); opener?.focus(); });
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

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
