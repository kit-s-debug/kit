/* NAVICREW site behaviour. No dependencies.
   Header state, mobile menu, gentle fade-ins, floating WhatsApp, the work tabs
   and the enquiry form (posts to an endpoint if one is configured, otherwise
   hands the written enquiry to WhatsApp or email). */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const SITE = window.SITE || {};
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------- header + mobile menu ---------------- */
  const nav = $("[data-nav]"), toggle = $(".nav__toggle"), menu = $("#menu");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const setMenu = open => {
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    menu.hidden = !open;
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); toggle.focus(); } });
  matchMedia("(min-width: 901px)").addEventListener("change", e => { if (e.matches) setMenu(false); });

  /* ---------------- fade-ins ---------------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$("[data-reveal]").forEach(el => io.observe(el));

  /* ---------------- floating WhatsApp (after the hero, hidden over Contact) ---------------- */
  const fwa = $("[data-float-wa]"), contact = $("#contact");
  if (fwa && contact) {
    let inContact = false;
    const place = () => fwa.classList.toggle("is-shown", scrollY > innerHeight * .7 && !inContact);
    new IntersectionObserver(es => { inContact = es[0].isIntersecting; place(); }, { threshold: .15 }).observe(contact);
    addEventListener("scroll", place, { passive: true }); place();
  }

  /* ---------------- recent work tabs ---------------- */
  const workTabs = $$(".work__tab");
  if (workTabs.length) {
    const caps = [
      "Teak deck: deep clean and restoration, bringing back the colour of the wood.",
      "Sailing yacht: topsides and deck brought back to a finish fit for the mooring.",
      "Cockpit: years of staining and mould lifted, ready to enjoy again.",
      "On the hard: a slow look along freshly polished topsides.",
    ];
    const film = $("[data-work-video]");
    const capEl = $("[data-work-cap]");
    const select = i => {
      workTabs.forEach((t, j) => { const on = i === j; t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1; });
      $$(".work__panel").forEach((p, j) => {
        if (j === i) { p.hidden = false; requestAnimationFrame(() => p.classList.add("is-active")); }
        else { p.classList.remove("is-active"); setTimeout(() => { if (!p.classList.contains("is-active")) p.hidden = true; }, 900); }
      });
      capEl.textContent = caps[i];
      // the film only loads and plays while its tab is open
      if (film) { if (i === 3 && !reduced.matches) film.play().catch(() => {}); else if (i === 3) film.load(); else film.pause(); }
    };
    workTabs.forEach((t, i) => {
      t.addEventListener("click", () => select(i));
      t.addEventListener("keydown", e => {
        const k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (!k) return;
        e.preventDefault(); const n = (i + k + workTabs.length) % workTabs.length; workTabs[n].focus(); select(n);
      });
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
        submit.disabled = false; setLabel("Send message"); status.focus();
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


  $$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
})();
