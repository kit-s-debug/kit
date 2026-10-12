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
  const say = (t) => { const [h, m] = t.split(":").map(Number); if (h % 24 === 0 && !m) return h ? "midnight" : "midnight"; const hh = h % 12 || 12; return `${hh}${m ? ":" + String(m).padStart(2, "0") : ""}${h < 12 ? "am" : "pm"}`; };
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
      ? `Open now until ${say(close)}`
      : open && mins < toMin(open) ? `Closed, opens today at ${say(open)}` : "Closed now";
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

  /* ---------- basket ---------- */
  // Items: { id, s (strength), f (flavour), qty }. Same id + strength + flavour stacks.
  const CONFIG = window.BAMBO_CONFIG || {};
  const needsFlavour = (p) => ["pod-kits", "nic-salts", "pouches"].includes(p.cat);
  let bag = store.get("bambo-basket", []).filter((b) => byId(b.id) && b.qty > 0);
  const saveBag = () => { store.set("bambo-basket", bag); syncCounts(); };
  const bagCount = () => bag.reduce((n, b) => n + b.qty, 0);
  const bagTotal = () => bag.reduce((t, b) => t + (byId(b.id).price || 0) * b.qty, 0);
  const bagHasAsk = () => bag.some((b) => byId(b.id).price == null);
  const fab = $("#bag-fab");
  function syncCounts(bump) {
    $$("[data-bag-count]").forEach((el) => { el.textContent = bagCount(); el.hidden = bagCount() === 0; });
    if (!fab) return;
    fab.classList.toggle("is-visible", bagCount() > 0);
    if (bump) { fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump"); }
  }
  function addToBag(item) {
    const same = bag.find((b) => b.id === item.id && b.s === item.s && (b.f || "").toLowerCase() === (item.f || "").toLowerCase());
    same ? (same.qty += item.qty) : bag.push(item);
    saveBag(); syncCounts(true);
  }
  syncCounts();
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lineLabel = (b) => [b.f, b.s && `${b.s}/ml`].filter(Boolean).join(" · ");


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
      $("#cat-title").textContent = cat === "all" ? "Everything" : catLabel(cat);
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
    let qty = 1;
    const fl = needsFlavour(p);
    dlg.innerHTML = `
      <button class="dlg-close" type="button" aria-label="Close" data-close>${icon.close}</button>
      <div class="pd">
        <div class="pd-media"><img src="${p.img}" alt="${p.name} on the shelf at Bambo" width="800" height="1000"></div>
        <form class="pd-body" novalidate>
          <span class="label">${catLabel(p.cat)}</span>
          <h2 class="display">${p.name}</h2>
          <div class="pd-price">${money(p.price)}${p.badge ? ` <span class="card-badge card-badge--red" style="position:static;vertical-align:4px;margin-left:.4rem">${p.badge}</span>` : ""}</div>
          <p>${p.desc}</p>
          <label class="field">
            <span class="label">${fl ? "Flavour" : "Colour or notes (optional)"}</span>
            <input type="text" name="f" list="fl-${p.id}" autocomplete="off" placeholder="${fl ? (p.flavours ? "e.g. " + p.flavours[0] : "Type the flavour you want") : "e.g. gold"}" ${fl ? "required" : ""}>
            ${p.flavours ? `<datalist id="fl-${p.id}">${p.flavours.map((f) => `<option value="${esc(f)}">`).join("")}</datalist>` : ""}
            ${fl ? `<span class="field-hint">Any flavour on the shelf. If it's sold out we'll message you before you come in.</span>` : ""}
            <span class="field-error">Tell us which flavour you'd like.</span>
          </label>
          ${p.strengths ? `<div class="opt-group"><span class="label">Nicotine strength</span><div class="opts">${p.strengths.map((s) => `<button class="opt" type="button" data-s="${s}" aria-pressed="${s === strength}">${s}/ml</button>`).join("")}</div></div>` : ""}
          <div class="opt-group"><span class="label">Quantity</span>
            <div class="stepper"><button type="button" data-q="-1" aria-label="One fewer">−</button><output data-qty>1</output><button type="button" data-q="1" aria-label="One more">+</button></div>
          </div>
          ${p.nicotine ? `<div class="nic-warning">This product contains nicotine which is a highly addictive substance.</div>` : ""}
          <button class="btn btn--block" type="submit">Add to basket ${icon.arrow}</button>
          <ul class="specs">${p.specs.map((s) => `<li><span class="slot"></span>${s}</li>`).join("")}</ul>
        </form>
      </div>`;
    const form = $("form", dlg), input = form.elements.f;
    $$("[data-s]", dlg).forEach((b) => b.addEventListener("click", () => {
      strength = b.dataset.s;
      $$("[data-s]", dlg).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    }));
    $$("[data-q]", dlg).forEach((b) => b.addEventListener("click", () => {
      qty = Math.min(20, Math.max(1, qty + Number(b.dataset.q)));
      $("[data-qty]", dlg).textContent = qty;
    }));
    input.addEventListener("input", () => input.closest(".field").classList.remove("is-invalid"));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = input.value.trim();
      if (fl && !f) { input.closest(".field").classList.add("is-invalid"); input.focus(); return; }
      addToBag({ id: p.id, s: strength, f, qty });
      const btn = $("[type=submit]", form);
      btn.outerHTML = `<div class="added"><span>Added to your basket</span><a class="btn" href="checkout.html">Checkout ${icon.arrow}</a><button class="btn btn--ghost" type="button" data-close>Keep shopping</button></div>`;
      $$("[data-close]", dlg).forEach((b) => b.addEventListener("click", () => dlg.close()));
    });
    $$("[data-close]", dlg).forEach((b) => b.addEventListener("click", () => dlg.close()));
    dlg.onclick = (e) => { if (e.target === dlg) dlg.close(); };
    dlg.onclose = () => { const url = new URL(location.href); url.searchParams.delete("p"); history.replaceState(null, "", url); };
    const url = new URL(location.href); url.searchParams.set("p", p.id); history.replaceState(null, "", url);
    dlg.showModal();
  }

  /* ---------- checkout (click & collect) ---------- */
  const co = $("#checkout");
  if (co) {
    $$("[data-hold]").forEach((el) => (el.textContent = CONFIG.holdHours || 48));
    const listEl = $("#co-items"), totalEl = $("#co-total"), form = $("#co-form"), done = $("#co-done");
    const dateEl = form.elements.day;
    // collection days: next 7 days that have opening hours in the table on this page
    const hoursRows = $$("#co-hours tr[data-day]");
    const openDays = new Set(hoursRows.filter((r) => r.dataset.open).map((r) => Number(r.dataset.day)));
    const fmt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" });
    for (let i = 0, added = 0; i < 10 && added < 6; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      if (!openDays.has(d.getDay())) continue;
      if (i === 0) { const r = hoursRows.find((x) => Number(x.dataset.day) === d.getDay()); const [h, m] = r.dataset.close.split(":").map(Number); if (new Date().getHours() * 60 + new Date().getMinutes() > h * 60 + m - 60) continue; }
      const o = document.createElement("option");
      o.value = d.toISOString().slice(0, 10);
      o.textContent = (i === 0 ? "Today, " : i === 1 ? "Tomorrow, " : "") + fmt.format(d);
      dateEl.append(o); added++;
    }

    const draw = () => {
      co.classList.toggle("is-empty", bag.length === 0);
      listEl.innerHTML = bag.map((b, i) => {
        const p = byId(b.id);
        return `<li>
          <img src="${p.img}" alt="" width="80" height="100">
          <div class="co-line"><strong>${p.name}</strong><span class="meta">${esc(lineLabel(b)) || p.spec}</span>
            <div class="stepper stepper--sm"><button type="button" data-dq="${i}" data-d="-1" aria-label="One fewer ${p.name}">−</button><output>${b.qty}</output><button type="button" data-dq="${i}" data-d="1" aria-label="One more ${p.name}">+</button></div>
          </div>
          <div class="co-price"><span class="price">${p.price == null ? "Ask in store" : money(p.price * b.qty)}</span><button type="button" class="link-btn" data-rm="${i}">Remove</button></div>
        </li>`;
      }).join("");
      totalEl.textContent = money(bagTotal()) + (bagHasAsk() ? " + items priced in store" : "");
      $$("[data-dq]", listEl).forEach((btn) => btn.addEventListener("click", () => {
        const b = bag[Number(btn.dataset.dq)]; b.qty += Number(btn.dataset.d);
        if (b.qty < 1) bag.splice(Number(btn.dataset.dq), 1);
        b.qty = Math.min(b.qty, 20); saveBag(); draw();
      }));
      $$("[data-rm]", listEl).forEach((btn) => btn.addEventListener("click", () => { bag.splice(Number(btn.dataset.rm), 1); saveBag(); draw(); }));
    };
    draw();

    const orderText = (o) => [
      `New click & collect order ${o.ref}`,
      `${o.name} · ${o.phone}${o.email ? " · " + o.email : ""}`,
      `Collecting: ${o.dayLabel}`,
      "",
      ...o.items.map((it) => `${it.qty} × ${it.name}${it.option ? " (" + it.option + ")" : ""}: ${it.price == null ? "price in store" : money(it.price * it.qty)}`),
      "",
      `Estimated total: ${o.total}`,
      o.notes ? `Notes: ${o.notes}` : "",
      "Customer confirmed they are 18 or over.",
    ].filter((l, i, a) => l !== "" || a[i - 1] !== "").join("\n");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      $$(".field", form).forEach((f) => f.classList.remove("is-invalid"));
      let bad = null;
      ["name", "phone", "day", "adult"].forEach((n) => {
        const el = form.elements[n];
        const ok = el.type === "checkbox" ? el.checked : n === "phone" ? /^[0-9 +()-]{10,}$/.test(el.value.trim()) : el.value.trim();
        if (!ok) { el.closest(".field").classList.add("is-invalid"); bad = bad || el; }
      });
      if (!bag.length) return;
      if (bad) { bad.focus(); return; }

      const ref = "BMB-" + Date.now().toString(36).slice(-4).toUpperCase() + Math.floor(Math.random() * 90 + 10);
      const order = {
        ref,
        name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
        email: form.elements.email.value.trim(),
        day: dateEl.value,
        dayLabel: dateEl.selectedOptions[0].textContent,
        notes: form.elements.notes.value.trim(),
        items: bag.map((b) => { const p = byId(b.id); return { id: p.id, name: p.name, option: lineLabel(b), qty: b.qty, price: p.price }; }),
        total: money(bagTotal()) + (bagHasAsk() ? " + items priced in store" : ""),
        createdAt: new Date().toISOString(),
      };
      const text = orderText(order);
      const submit = $("[type=submit]", form);
      submit.disabled = true; submit.textContent = "Sending…";

      let mode = "preview";
      try {
        if (CONFIG.orderEndpoint) {
          const res = await fetch(CONFIG.orderEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ ...order, summary: text }) });
          if (!res.ok) throw new Error(res.status);
          mode = "sent";
        } else if (CONFIG.orderWhatsApp) {
          window.open(`https://wa.me/${CONFIG.orderWhatsApp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
          mode = "whatsapp";
        } else if (CONFIG.orderEmail) {
          location.href = `mailto:${CONFIG.orderEmail}?subject=${encodeURIComponent("Click & collect order " + ref)}&body=${encodeURIComponent(text)}`;
          mode = "email";
        }
      } catch {
        submit.disabled = false; submit.innerHTML = `Place order ${icon.arrow}`;
        $("#co-error").hidden = false;
        return;
      }

      store.set("bambo-last-order", order);
      bag = []; saveBag();
      co.classList.add("is-done");
      $("#co-ref").textContent = ref;
      $("#co-when").textContent = order.dayLabel;
      $("#co-summary").textContent = text;
      $("#co-mode").textContent = {
        sent: "Your order has been sent to the shop.",
        whatsapp: "Press send in WhatsApp to get your order to us. We'll reply when it's ready.",
        email: "Press send in your email app to get your order to us. We'll reply when it's ready.",
        preview: "Preview only: this order wasn't sent anywhere. Online orders switch on once the shop's WhatsApp number or email is added in js/config.js.",
      }[mode];
      done.hidden = false;
      scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
})();
