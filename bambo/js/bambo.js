(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: fine, state just won't persist */ } },
  };

  const icon = {
    arrow: '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  };
  const money = (n) => (n == null ? "Ask in store" : "£" + (Number.isInteger(n) ? n : n.toFixed(2)));

  /* ---------- page entrance ---------- */
  const markLoaded = () => requestAnimationFrame(() => document.documentElement.classList.add("is-loaded"));
  const heroImg = $(".hero-stage img");
  Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    heroImg && !heroImg.complete ? new Promise((r) => { heroImg.addEventListener("load", r, { once: true }); heroImg.addEventListener("error", r, { once: true }); }) : Promise.resolve(),
  ]).then(markLoaded);
  setTimeout(markLoaded, 1800); // never hold the page hostage to a slow image

  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- header ---------- */
  const header = $(".site-header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const menuBtn = $(".menu-btn"), mobileNav = $(".mobile-nav");
  if (menuBtn && mobileNav) {
    const setMenu = (open) => {
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.querySelector("span").textContent = open ? "Close" : "Menu";
      mobileNav.classList.toggle("is-open", open);
      mobileNav.inert = !open;
      document.body.style.overflow = open ? "hidden" : "";
    };
    mobileNav.inert = true;
    menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
    addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
    matchMedia("(min-width: 960px)").addEventListener("change", (e) => e.matches && setMenu(false));
  }

  /* ---------- scroll reveals ---------- */
  const io = "IntersectionObserver" in window && !reduceMotion
    ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
    : null;
  const observe = (root = document) => $$(".reveal, .reveal-img, .rule", root).forEach((el) => io ? io.observe(el) : el.classList.add("in"));
  observe();

  /* ---------- walk-through video ---------- */
  // Plays muted while on screen; never autoplays for reduced-motion visitors.
  $$("video[data-autoplay]").forEach((video) => {
    const btn = video.parentElement.querySelector("[data-video-toggle]");
    let userPaused = reduceMotion;
    const sync = () => {
      const paused = video.paused;
      btn.classList.toggle("is-paused", paused);
      btn.setAttribute("aria-label", paused ? "Play video" : "Pause video");
    };
    video.addEventListener("play", sync); video.addEventListener("pause", sync);
    btn.addEventListener("click", () => {
      if (video.paused) { userPaused = false; video.play().catch(() => {}); }
      else { userPaused = true; video.pause(); }
    });
    sync();
    if (!("IntersectionObserver" in window)) return;
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused) { video.preload = "auto"; video.play().catch(sync); }
      else if (!e.isIntersecting) video.pause();
    }, { threshold: 0.35 }).observe(video);
  });

  /* ---------- opening hours ---------- */
  // Each row: <tr data-day="1" data-open="09:30" data-close="17:30"> (0 = Sunday). No times = closed.
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  $$("[data-hours]").forEach((table) => {
    const now = new Date(), day = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    const row = $(`tr[data-day="${day}"]`, table);
    if (!row) return;
    row.classList.add("is-today");
    const status = $(table.dataset.hours);
    if (!status) return;
    const { open, close } = row.dataset;
    const isOpen = open && close && mins >= toMin(open) && mins < toMin(close);
    status.classList.toggle("is-open", Boolean(isOpen));
    status.querySelector("span").textContent = isOpen
      ? `Open now until ${close}`
      : open && mins < toMin(open) ? `Closed, opens today at ${open}` : "Closed now";
  });

  /* ---------- age check ---------- */
  const age = $("#age");
  if (age && !store.get("bambo-18", false) && typeof age.showModal === "function") {
    age.showModal();
    age.addEventListener("cancel", (e) => e.preventDefault());
    $("[data-age-yes]", age).addEventListener("click", () => { store.set("bambo-18", true); age.close(); });
    $("[data-age-no]", age).addEventListener("click", () => age.classList.add("is-under"));
  }

  /* ---------- catalogue ---------- */
  const PRODUCTS = window.BAMBO_PRODUCTS || [];
  const CATS = window.BAMBO_CATEGORIES || [];
  const catLabel = (id) => (CATS.find((c) => c.id === id) || {}).label || "";
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const onShop = Boolean($("#catalogue"));

  function cardHTML(p, i = 0) {
    return `
      <article class="card" data-id="${p.id}" style="--d:${Math.min(i, 8) * 0.05}s">
        <div class="card-media reveal-img" style="--d:${(i % 4) * 0.08}s">
          ${p.badge ? `<span class="card-badge${p.badgeRed ? " card-badge--red" : ""}">${p.badge}</span>` : ""}
          <img src="${p.img}" alt="${p.name} on the shelf at Bambo" width="800" height="1000" loading="lazy" decoding="async">
          <button class="card-quick" type="button" data-quick="${p.id}">Quick view</button>
        </div>
        <div class="card-body">
          <span class="card-cat">${catLabel(p.cat)}</span>
          <h3 class="card-name"><a href="shop.html?p=${p.id}" data-open="${p.id}">${p.name}</a></h3>
          <span class="card-spec">${p.spec}</span>
          <div class="card-foot"><span class="price${p.price == null ? " price--ask" : ""}">${money(p.price)}</span></div>
        </div>
      </article>`;
  }

  function wireCards(root) {
    if (!onShop) return; // on other pages, the link simply goes to the shop
    $$("[data-open], [data-quick]", root).forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      openProduct(a.dataset.open || a.dataset.quick);
    }));
  }

  // featured rail on the homepage
  const featured = $("#featured");
  if (featured) {
    const ids = featured.dataset.ids.split(",");
    featured.innerHTML = ids.map((id, i) => cardHTML(byId(id), i)).join("");
    wireCards(featured); observe(featured);
  }

  // shop page
  const grid = $("#catalogue");
  if (grid) {
    const chipsEl = $("#chips"), sortEl = $("#sort"), countEl = $("#count");
    const params = new URLSearchParams(location.search);
    let cat = CATS.some((c) => c.id === params.get("cat")) ? params.get("cat") : "all";

    chipsEl.innerHTML = CATS.map((c) => {
      const n = c.id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c.id).length;
      return `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${c.id === cat}">${c.label}<span class="n">${n}</span></button>`;
    }).join("");

    const render = () => {
      let list = PRODUCTS.filter((p) => cat === "all" || p.cat === cat);
      const s = sortEl.value;
      const pr = (p, dflt) => (p.price == null ? dflt : p.price);
      if (s === "price-asc") list = [...list].sort((a, b) => pr(a, Infinity) - pr(b, Infinity));
      if (s === "price-desc") list = [...list].sort((a, b) => pr(b, -1) - pr(a, -1));
      if (s === "new") list = [...list].sort((a, b) => b.added - a.added);
      countEl.textContent = `${list.length} ${list.length === 1 ? "product" : "products"}`;
      $("#cat-title").textContent = cat === "all" ? "The full range" : catLabel(cat);
      grid.innerHTML = list.length ? list.map(cardHTML).join("") : `<p class="empty">Nothing here yet. Ask in store, we can usually order it in.</p>`;
      wireCards(grid); observe(grid);
    };

    chipsEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]"); if (!b) return;
      cat = b.dataset.cat;
      $$("[data-cat]", chipsEl).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const url = new URL(location.href);
      cat === "all" ? url.searchParams.delete("cat") : url.searchParams.set("cat", cat);
      url.searchParams.delete("p");
      history.replaceState(null, "", url);
      render();
      b.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
    });
    sortEl.addEventListener("change", render);
    render();
    if (params.get("p") && byId(params.get("p"))) openProduct(params.get("p"));
  }

  /* ---------- product detail ---------- */
  function openProduct(id) {
    const dlg = $("#product"); const p = byId(id); if (!dlg || !p) return;
    let strength = p.strengths ? p.strengths[p.strengths.length - 1] : null;
    dlg.innerHTML = `
      <button class="dlg-close" type="button" aria-label="Close" data-close>${icon.close}</button>
      <div class="pd">
        <div class="pd-media"><img src="${p.img}" alt="${p.name} on the shelf at Bambo" width="800" height="1000"></div>
        <div class="pd-body">
          <span class="label">${catLabel(p.cat)}</span>
          <h2 class="display">${p.name}</h2>
          <div class="pd-price">${money(p.price)}${p.badge ? ` <span class="card-badge card-badge--red" style="position:static;vertical-align:4px;margin-left:.4rem">${p.badge}</span>` : ""}</div>
          <p>${p.desc}</p>
          ${p.strengths ? `<div class="opt-group"><span class="label">Nicotine strength</span><div class="opts">${p.strengths.map((s) => `<button class="opt" type="button" data-s="${s}" aria-pressed="${s === strength}">${s}/ml</button>`).join("")}</div></div>` : ""}
          <ul class="specs">${p.specs.map((s) => `<li><span class="slot"></span>${s}</li>`).join("")}</ul>
          ${p.nicotine ? `<div class="nic-warning">This product contains nicotine which is a highly addictive substance.</div>` : ""}
          <button class="btn btn--block" type="button" data-add>Add to collection list ${icon.arrow}</button>
          <a class="text-link" href="visit.html">Pay and collect at the shop in Haverfordwest</a>
        </div>
      </div>`;
    $$("[data-s]", dlg).forEach((b) => b.addEventListener("click", () => {
      strength = b.dataset.s;
      $$("[data-s]", dlg).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }));
    $("[data-add]", dlg).addEventListener("click", (e) => {
      addToBag({ id: p.id, s: strength });
      const btn = e.currentTarget;
      btn.innerHTML = "Added to your list";
      setTimeout(() => dlg.close(), 650);
    });
    $("[data-close]", dlg).addEventListener("click", () => dlg.close());
    dlg.onclick = (e) => { if (e.target === dlg) dlg.close(); };
    dlg.onclose = () => { const url = new URL(location.href); url.searchParams.delete("p"); history.replaceState(null, "", url); };
    const url = new URL(location.href); url.searchParams.set("p", p.id); history.replaceState(null, "", url);
    dlg.showModal();
  }

  /* ---------- collection list ("reserve") ---------- */
  // No checkout: you build a list, then show it at the counter or send it to the shop.
  let bag = store.get("bambo-bag", []).filter((b) => byId(b.id));
  const fab = $("#bag-fab");
  const bagTotal = () => bag.reduce((t, b) => t + (byId(b.id).price || 0), 0);
  const bagHasAsk = () => bag.some((b) => byId(b.id).price == null);
  const syncFab = (bump) => {
    if (!fab) return;
    $(".bag-count", fab).textContent = bag.length;
    fab.classList.toggle("is-visible", bag.length > 0);
    if (bump) { fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump"); }
  };
  function addToBag(item) { bag.push(item); store.set("bambo-bag", bag); syncFab(true); }
  const bagText = () => ["My Bambo collection list:", ...bag.map((b) => {
    const p = byId(b.id);
    return `- ${p.name}${b.s ? ` ${b.s}` : ""}: ${money(p.price)}`;
  }), `Total: ${money(bagTotal())}${bagHasAsk() ? " plus items priced in store" : ""}`].join("\n");

  function openBag() {
    const dlg = $("#bag"); if (!dlg) return;
    const draw = () => {
      dlg.innerHTML = `
        <button class="dlg-close" type="button" aria-label="Close" data-close>${icon.close}</button>
        <div class="bag-inner">
          <span class="label">Collection list</span>
          <h2 class="display">Ready when you are</h2>
          ${bag.length ? `<ul class="bag-list">${bag.map((b, i) => {
            const p = byId(b.id);
            return `<li><img src="${p.img}" alt=""><div><strong>${p.name}</strong><div class="meta">${b.s || p.spec}</div></div><div style="text-align:right"><div class="price">${money(p.price)}</div><button type="button" data-rm="${i}">Remove</button></div></li>`;
          }).join("")}</ul>
          <div class="bag-total"><span>Estimated total${bagHasAsk() ? " (some items priced in store)" : ""}</span><span>${money(bagTotal())}</span></div>
          <p class="bag-note">Show this list at the counter. Multi-buy offers are applied when you pay in store, and we'll check ID if you look under 25.</p>
          <button class="btn btn--block" type="button" data-share>Send or copy my list ${icon.arrow}</button>`
          : `<p class="bag-note">Your list is empty. Add products from the shop and they'll appear here.</p>`}
        </div>`;
      $("[data-close]", dlg).addEventListener("click", () => dlg.close());
      $$("[data-rm]", dlg).forEach((b) => b.addEventListener("click", () => { bag.splice(Number(b.dataset.rm), 1); store.set("bambo-bag", bag); syncFab(); draw(); }));
      const share = $("[data-share]", dlg);
      share && share.addEventListener("click", async () => {
        const text = bagText();
        try {
          if (navigator.share) await navigator.share({ title: "Bambo collection list", text });
          else { await navigator.clipboard.writeText(text); share.textContent = "Copied, paste it into a message to us"; }
        } catch { /* share sheet dismissed */ }
      });
    };
    draw();
    dlg.onclick = (e) => { if (e.target === dlg) dlg.close(); };
    dlg.showModal();
  }
  if (fab) { fab.addEventListener("click", openBag); syncFab(); }
})();
