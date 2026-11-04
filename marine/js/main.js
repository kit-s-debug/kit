/* Marine site behaviour. No dependencies.
   - opening title, hero entrance, nav states, mobile menu
   - scroll reveals, parallax, the services stage, the approach course
   - the enquiry form (posts to an endpoint if one is configured, otherwise
     hands the written enquiry to WhatsApp or email) */
(() => {
  "use strict";
  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SITE = window.SITE || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let vh = innerHeight;

  /* ---------------- opening + hero entrance ---------------- */
  const intro = $(".intro");
  const nav = $("[data-nav]");
  const heroSeq = [".hero__eyebrow", ".hero__title .line:nth-child(1) > span", ".hero__title .line:nth-child(2) > span",
    ".hero__title .line:nth-child(3) > span", ".hero__lede", ".hero__ctas", ".scroll-cue"];
  heroSeq.forEach((s, i) => { const el = $(s); if (el) el.style.setProperty("--d", (0.25 + i * 0.12 + (i > 3 ? 0.25 : 0)).toFixed(2) + "s"); });

  const start = () => {
    doc.classList.add("is-loaded");
    setTimeout(() => nav.classList.add("is-ready"), reduced.matches ? 0 : 650);
  };
  const playIntro = !doc.classList.contains("intro-seen") && !reduced.matches && intro;
  if (playIntro) {
    try { sessionStorage.setItem("intro-seen", "1"); } catch (e) {}
    const lift = () => {
      intro.classList.add("is-done");
      setTimeout(start, 380);
      intro.addEventListener("animationend", e => { if (e.target === intro) intro.remove(); });
    };
    // hold the title for its own animation, but never longer than it needs if fonts are slow
    Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 900))])
      .then(() => setTimeout(lift, 1500));
  } else {
    if (intro) intro.remove();
    requestAnimationFrame(() => requestAnimationFrame(start));
  }

  /* ---------------- reveals ---------------- */
  $$("[data-reveal-lines]").forEach(h => $$(".line", h).forEach((l, i) => l.style.setProperty("--li", i)));
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); } });
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.01 });
  $$("[data-reveal], [data-reveal-lines], .svc-item, .value").forEach(el => revealIO.observe(el));

  /* ---------------- nav ---------------- */
  let lastY = scrollY;
  const links = $$("[data-link]");
  const sectionIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.dataset.section;
      links.forEach(a => a.classList.toggle("is-active", a.dataset.link === id));
      $$("[data-wp]").forEach(a => a.classList.toggle("is-active", a.dataset.wp === id));
    });
  }, { rootMargin: "-45% 0px -54% 0px" });
  $$("[data-section]").forEach(s => sectionIO.observe(s));

  /* mobile menu */
  const toggle = $(".nav__toggle"), menu = $("#menu");
  const setMenu = open => {
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    doc.classList.toggle("menu-open", open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("is-open")));
      nav.classList.remove("is-hidden");
      setTimeout(() => $("a", menu).focus({ preventScroll: true }), 300);
    } else {
      menu.classList.remove("is-open");
      const done = () => { if (!menu.classList.contains("is-open")) menu.hidden = true; };
      reduced.matches ? done() : setTimeout(done, 900);
    }
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => {
    if (e.key === "Escape" && doc.classList.contains("menu-open")) { setMenu(false); toggle.focus(); }
    if (e.key === "Tab" && doc.classList.contains("menu-open")) { // keep focus inside the open menu
      const f = [toggle, ...$$("a", menu)], i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });
  matchMedia("(min-width: 1081px)").addEventListener("change", e => { if (e.matches) setMenu(false); });

  /* ---------------- scroll-driven pieces ---------------- */
  const hero = $(".hero"), heroPic = $("[data-hero-media] .pic"), heroContent = $(".hero__content");
  const passage = $("[data-passage]"), wps = $$("[data-wp]");
  const parallax = $$("[data-parallax]");
  const breakMedia = $("[data-break]");
  const totop = $("[data-totop]");
  const approach = $("[data-approach]")?.closest(".approach");
  const steps = $$(".stage-step");
  const course = $(".course");
  const pinMQ = matchMedia("(min-width: 900px)");

  const setPin = () => approach && approach.classList.toggle("is-pinned", pinMQ.matches && !reduced.matches);
  setPin(); pinMQ.addEventListener("change", () => { setPin(); measure(); });

  let sections = [];
  const measure = () => {
    vh = innerHeight;
    sections = wps.map(a => $("#" + a.dataset.wp)).filter(Boolean).map(s => s.getBoundingClientRect().top + scrollY);
    parallax.forEach(el => el.style.setProperty("--pr", Math.round(el.offsetHeight * parseFloat(el.dataset.parallax || .1)) + "px"));
    update();
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY, moving = !reduced.matches;

    // nav background + hide while reading downwards, return on any upward scroll
    nav.classList.toggle("is-scrolled", y > 30);
    if (!doc.classList.contains("menu-open")) nav.classList.toggle("is-hidden", y > vh * 0.9 && y > lastY + 2);
    if (y < lastY - 2) nav.classList.remove("is-hidden");
    lastY = y;

    // hero: slow image drift and a gentle fade of the copy
    if (moving && y < vh * 1.2 && heroPic) {
      const k = y / vh;
      if (doc.classList.contains("is-loaded")) heroPic.style.setProperty("--py", (y * 0.32).toFixed(1) + "px");
      heroContent.style.opacity = clamp(1 - k * 1.3).toFixed(3);
      heroContent.style.transform = `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0)`;
    }

    // passage waypoints
    if (passage && sections.length) {
      const first = sections[0], last = sections[sections.length - 1], probe = y + vh * 0.5;
      passage.classList.toggle("is-visible", y > vh * 0.6);
      passage.style.setProperty("--p", clamp((probe - first) / (last - first)).toFixed(4));
      wps.forEach((a, i) => a.classList.toggle("is-past", probe >= sections[i]));
    }

    // parallax photographs
    if (moving) parallax.forEach(el => {
      const r = el.getBoundingClientRect(); if (r.bottom < -100 || r.top > vh + 100) return;
      const range = parseFloat(el.style.getPropertyValue("--pr")) || 0;
      const p = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      el.style.setProperty("--py", (-p * range).toFixed(1) + "px");
    });

    // cinematic break: the frame opens to full bleed as it arrives
    if (breakMedia) {
      const r = breakMedia.getBoundingClientRect();
      const p = moving ? clamp((vh - r.top) / (vh * 0.85)) : 1;
      breakMedia.style.setProperty("--inset", ((1 - p) * Math.min(innerWidth * 0.06, 90)).toFixed(1) + "px");
    }

    // approach: the course draws as you travel through the section
    if (approach) {
      let cp;
      if (reduced.matches) cp = 1;
      else if (approach.classList.contains("is-pinned")) {
        const r = approach.getBoundingClientRect();
        cp = clamp((-r.top / (r.height - vh) - 0.06) / 0.78);
      } else {
        const r = course.getBoundingClientRect();
        cp = clamp((vh * 0.72 - r.top) / r.height);
      }
      course.style.setProperty("--cp", cp.toFixed(4));
      const pts = approach.classList.contains("is-pinned") ? [0.14, 0.5, 0.84] : null;
      steps.forEach((s, i) => {
        let reached;
        if (pts) reached = cp >= pts[i];
        else reached = cp * course.offsetHeight >= s.offsetTop + 4;
        s.classList.toggle("is-reached", reached || reduced.matches);
      });
    }

    // back-to-top ring shows how far down the page you are
    if (totop) totop.style.setProperty("--sp", clamp(y / (doc.scrollHeight - vh)).toFixed(4));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { clearTimeout(measure.t); measure.t = setTimeout(measure, 120); });
  addEventListener("load", measure);
  measure();

  // once the hero image has finished its entrance, follow scroll without easing lag
  if (heroPic) setTimeout(() => heroPic.classList.add("is-tracking"), playIntro ? 4800 : 2900);

  /* ---------------- services stage ---------------- */
  const svcRoot = $("[data-svc-root]");
  if (svcRoot) {
    const items = $$(".svc-item", svcRoot), panels = $$("[data-panel]", svcRoot);
    const nameEl = $("[data-stage-name]"), numEl = $("[data-stage-n]"), stage = $("[data-stage]");
    let current = null;
    const show = key => {
      if (key === current) return;
      const prev = current; current = key;
      items.forEach(it => it.classList.toggle("is-current", it.dataset.svc === key));
      panels.forEach(p => {
        p.classList.remove("is-leaving");
        if (p.dataset.panel === prev) p.classList.add("is-leaving");
        p.classList.toggle("is-active", p.dataset.panel === key);
      });
      const it = items.find(i => i.dataset.svc === key);
      if (it) { nameEl.textContent = $(".svc-item__title", it).textContent; numEl.textContent = $(".svc-item__num", it).textContent; }
    };
    show(items[0].dataset.svc);
    const focusIO = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && show(e.target.dataset.svc)), { rootMargin: "-42% 0px -42% 0px" });
    items.forEach(it => {
      focusIO.observe(it);
      it.addEventListener("pointerenter", () => fine.matches && show(it.dataset.svc));
      it.addEventListener("focusin", () => show(it.dataset.svc));
    });
    // a little cursor-led drift inside the frame (desktop pointers only)
    if (stage) stage.addEventListener("pointermove", e => {
      if (!fine.matches || reduced.matches) return;
      const r = stage.getBoundingClientRect();
      stage.style.setProperty("--mx", (((e.clientX - r.left) / r.width - .5) * -14).toFixed(1) + "px");
      stage.style.setProperty("--my", (((e.clientY - r.top) / r.height - .5) * -10).toFixed(1) + "px");
    });
  }

  /* ---------------- enquiry form ---------------- */
  const form = $("[data-form]");
  if (form) {
    const status = $("[data-status]", form), submit = $("[data-submit]", form), label = $("[data-submit-label]", form);
    const note = $("[data-form-note]", form), emailBtn = $("[data-email-fallback]", form);
    const endpoint = (SITE.form && SITE.form.endpoint || "").trim();
    const c = SITE.contact || {}, brand = SITE.brand || "us";
    const setLabel = t => { label.textContent = t; label.dataset.text = t; };

    if (!endpoint) {
      setLabel("Continue in WhatsApp");
      note.textContent = "Your enquiry opens in WhatsApp, written out and ready to send. Nothing is sent until you press send there.";
    } else {
      note.textContent = "We’ll reply by email or phone, whichever suits you.";
    }

    const select = $("select", form);
    const syncSelect = () => select.classList.toggle("has-value", !!select.value);
    select.addEventListener("change", syncSelect); syncSelect();

    const rules = {
      name: v => v.trim().length >= 2 || "Please tell us your name.",
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Please enter a valid email address.",
      phone: v => { const d = v.replace(/\D/g, ""); return (/^[\d\s()+.-]+$/.test(v.trim()) && d.length >= 7 && d.length <= 15) || "Please enter a phone number we can reach you on."; },
      service: v => !!v || "Please choose the service you’re interested in.",
      message: v => v.trim().length >= 10 || "Please add a few words about your vessel or what you need.",
    };
    const check = (name, show = true) => {
      const el = form.elements[name], res = rules[name](el.value), ok = res === true;
      const field = el.closest(".field"), err = $(".field__error", field);
      if (show) {
        field.classList.toggle("is-invalid", !ok); err.textContent = ok ? "" : res;
        el.setAttribute("aria-invalid", ok ? "false" : "true");
        if (err.id) el.setAttribute("aria-describedby", err.id);
      }
      return ok;
    };
    Object.keys(rules).forEach(n => {
      const el = form.elements[n];
      el.addEventListener("blur", () => { if (el.value) check(n); });
      el.addEventListener("input", () => { if (el.closest(".field").classList.contains("is-invalid")) check(n); });
      el.addEventListener("change", () => { if (el.closest(".field").classList.contains("is-invalid")) check(n); });
    });

    const validate = () => {
      const bad = Object.keys(rules).filter(n => !check(n));
      if (bad.length) { form.elements[bad[0]].focus(); say("Please check the highlighted fields.", true); return false; }
      return true;
    };
    const say = (html, err = false) => { status.innerHTML = html; status.classList.toggle("is-error", err); };
    const data = () => Object.fromEntries(["name", "email", "phone", "vessel", "service", "message"].map(k => [k, form.elements[k].value.trim()]));
    const compose = d => [
      `Hello ${brand}, I'd like to make an enquiry.`, "",
      `Name: ${d.name}`, `Email: ${d.email}`, `Phone: ${d.phone}`,
      d.vessel ? `Vessel: ${d.vessel}` : null, `Service: ${d.service}`, "", d.message,
    ].filter(l => l !== null).join("\n");
    // "noopener" in the features string makes window.open return null, so detach the opener by hand instead
    const open = url => { const w = window.open(url, "_blank"); if (w) { try { w.opener = null; } catch (e) {} } else location.href = url; };

    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (form.elements.company.value) return; // spam trap
      if (!validate()) return;
      const d = data();

      if (!endpoint) {
        const url = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(compose(d))}`;
        open(url);
        say(`WhatsApp should now be open with your enquiry written out. Press send there to deliver it. If nothing opened, <a href="${url}" target="_blank" rel="noopener">open WhatsApp here</a> or call <a href="tel:${c.phoneE164}">${c.phoneDisplay}</a>.`);
        status.focus();
        return;
      }

      submit.disabled = true; setLabel("Sending…"); say("");
      try {
        const body = { ...d, _subject: `Website enquiry: ${d.service}`, ...(SITE.form.accessKey && { access_key: SITE.form.accessKey, subject: `Website enquiry: ${d.service}` }) };
        const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error(res.status);
        form.reset(); syncSelect();
        say(`Thank you, ${d.name.split(" ")[0]}. Your enquiry has been sent and we’ll be in touch soon.`);
      } catch (err) {
        const url = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(compose(d))}`;
        say(`Sorry, your enquiry couldn’t be sent just now. You can <a href="${url}" target="_blank" rel="noopener">send it on WhatsApp</a> instead, or email <a href="mailto:${c.email}">${c.email}</a>. Your details are still in the form.`, true);
      } finally {
        submit.disabled = false; setLabel("Send enquiry"); status.focus();
      }
    });

    emailBtn.addEventListener("click", () => {
      if (!validate()) return;
      const d = data();
      const url = `mailto:${c.email}?subject=${encodeURIComponent(`Enquiry: ${d.service}`)}&body=${encodeURIComponent(compose(d))}`;
      location.href = url;
      say(`Your email app should now be open with the enquiry written out. If it didn’t open, email us at <a href="mailto:${c.email}">${c.email}</a>.`);
      status.focus();
    });
  }

  /* ---------------- small things ---------------- */
  $$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
})();
