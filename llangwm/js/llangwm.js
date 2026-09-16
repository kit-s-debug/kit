/* ==========================================================================
   LLANGWM RFC — behaviour
   --------------------------------------------------------------------------
   No framework and no dependencies. Everything content-shaped is read from
   js/club-data.js so the club never has to touch this file.

   All scroll work happens in a single requestAnimationFrame loop rather than
   in separate listeners, so the sticky header, the hero parallax and the
   timeline fill cost one layout read per frame between them.
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.LLANGWM || {};
  var CLUB = DATA.club || {};
  var SOCIAL = DATA.social || {};

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Everything injected as HTML goes through this first. */
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function mapsUrl(kind) {
    var q = encodeURIComponent(CLUB.mapQuery || CLUB.shortName || "Llangwm RFC");
    return kind === "dir"
      ? "https://www.google.com/maps/dir/?api=1&destination=" + q
      : "https://www.google.com/maps/search/?api=1&query=" + q;
  }

  var MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function parseDate(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    var d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
  }

  /* ----------------------------------------------------------------------
     Simple bindings: data-link="instagram", data-text="phone", etc.
     A link whose value is empty is removed rather than left pointing at "#".
     ---------------------------------------------------------------------- */
  var LINKS = {
    instagram: SOCIAL.instagram,
    facebook: SOCIAL.facebook,
    officialSite: CLUB.officialSite,
    officialFixtures: CLUB.officialFixtures,
    officialNews: CLUB.officialNews
  };
  var TEXTS = {
    instagramHandle: SOCIAL.instagramHandle,
    phone: CLUB.phone,
    groundNote: CLUB.groundNote,
    shortName: CLUB.shortName
  };

  function bind() {
    $$("[data-link]").forEach(function (el) {
      var href = LINKS[el.getAttribute("data-link")];
      if (href) { el.setAttribute("href", href); return; }
      if (el.hasAttribute("data-hide-if-empty") && el.parentNode) el.parentNode.removeChild(el);
      else el.setAttribute("href", CLUB.officialSite || "#top");
    });
    $$("[data-text]").forEach(function (el) {
      var v = TEXTS[el.getAttribute("data-text")];
      if (v) el.textContent = v;
    });
    var y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ----------------------------------------------------------------------
     A shared empty state, so a section the club hasn't filled in yet still
     looks designed rather than broken.
     ---------------------------------------------------------------------- */
  function emptyPanel(title, body, actions) {
    return '<div class="panel-empty">' +
      '<h3>' + esc(title) + '</h3>' +
      '<p>' + body + '</p>' +
      (actions ? '<div class="panel-actions">' + actions + '</div>' : '') +
      '</div>';
  }

  function extLink(href, label, amber) {
    if (!href) return "";
    return '<a class="btn ' + (amber ? "btn-amber " : "") + 'btn-sm" href="' + esc(href) +
      '" target="_blank" rel="noopener noreferrer"><span>' + esc(label) + '</span></a>';
  }

  /* ----------------------------------------------------------------------
     News
     ---------------------------------------------------------------------- */
  function renderNews() {
    var mount = $("#news-list");
    if (!mount) return;
    var items = (DATA.news || []).slice();

    if (!items.length) {
      mount.innerHTML = emptyPanel(
        "Club news",
        "Match reports and club announcements will appear here. In the meantime, the club posts everything to Instagram.",
        extLink(SOCIAL.instagram, "Follow the Wasps", true) + extLink(CLUB.officialNews, "News on the official site")
      );
      return;
    }

    items.sort(function (a, b) {
      var da = parseDate(a.date), db = parseDate(b.date);
      return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
    });

    mount.innerHTML = items.map(function (n) {
      var d = parseDate(n.date);
      var day = d ? String(d.getDate()) : "&mdash;";
      var mon = d ? MONTHS[d.getMonth()].toUpperCase() + " " + String(d.getFullYear()).slice(2) : "";
      var tag = n.url ? "a" : "div";
      var attrs = n.url ? ' href="' + esc(n.url) + '" target="_blank" rel="noopener noreferrer"' : "";
      return "<" + tag + ' class="news-item reveal"' + attrs + ">" +
        '<time class="news-date"' + (d ? ' datetime="' + esc(n.date) + '"' : "") + '>' +
          '<span class="news-day">' + day + '</span><span class="news-mon">' + esc(mon) + '</span>' +
        '</time>' +
        '<div>' +
          (n.kicker ? '<p class="news-kicker">' + esc(n.kicker) + '</p>' : '') +
          '<h3 class="news-title">' + esc(n.title) + '</h3>' +
          (n.summary ? '<p class="news-sum">' + esc(n.summary) + '</p>' : '') +
        '</div>' +
        (n.url ? '<span class="news-go" aria-hidden="true">&rarr;</span>' : '') +
        "</" + tag + ">";
    }).join("");

    var more = extLink(CLUB.officialNews, "All news on the official site");
    if (more) {
      var wrap = document.createElement("div");
      wrap.className = "panel-actions reveal";
      wrap.style.marginTop = "18px";
      wrap.innerHTML = more;
      mount.parentNode.appendChild(wrap);
    }
  }

  /* ----------------------------------------------------------------------
     Fixtures
     ---------------------------------------------------------------------- */
  function fixtureRow(f) {
    var d = parseDate(f.date);
    var home = String(f.venue || "").toLowerCase() === "home";
    var meta = [f.competition, f.ground].filter(Boolean).join(" · ");
    var end = f.result
      ? '<span class="fx-res">' + esc(f.result) + '</span>'
      : (f.kickOff ? esc(f.kickOff) : "");

    return '<li class="fx-row reveal">' +
      '<time class="fx-when"' + (d ? ' datetime="' + esc(f.date) + '"' : "") + '>' +
        '<span class="fx-d">' + (d ? String(d.getDate()) : "&mdash;") + '</span>' +
        '<span class="fx-m">' + (d ? esc(MONTHS[d.getMonth()].toUpperCase()) : "") + '</span>' +
      '</time>' +
      '<span class="fx-ha ' + (home ? "is-home" : "is-away") + '" title="' + (home ? "Home" : "Away") + '">' +
        (home ? "H" : "A") + '<span class="sr-only">' + (home ? "Home" : "Away") + ' fixture</span>' +
      '</span>' +
      '<div>' +
        '<h3 class="fx-opp">' + esc(f.opponent || "To be confirmed") + '</h3>' +
        (meta ? '<p class="fx-meta">' + esc(meta) + '</p>' : '') +
      '</div>' +
      '<div class="fx-end">' + end + '</div>' +
      '</li>';
  }

  function renderFixtureList(list, label) {
    if (!list || !list.length) {
      return emptyPanel(
        label + " fixtures",
        "The club's live fixture list, results and league tables are kept up to date on its official site. Fixtures added to this website's fixture list appear here too, home and away, with kick-off times.",
        extLink(CLUB.officialFixtures || CLUB.officialSite, "See the full fixture list", true) +
        extLink(SOCIAL.instagram, "Team news on Instagram")
      );
    }
    /* What a supporter wants first is the next game, not the season's first.
       Anything played (it has a result, or its date has gone) drops into
       results underneath, most recent first. */
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var upcoming = [], played = [];
    list.forEach(function (f) {
      var d = parseDate(f.date);
      if (f.result || (d && d < today)) played.push(f);
      else upcoming.push(f);
    });

    var byDate = function (dir) {
      return function (a, b) {
        var da = parseDate(a.date), db = parseDate(b.date);
        return dir * ((da ? da.getTime() : 0) - (db ? db.getTime() : 0));
      };
    };
    upcoming.sort(byDate(1));
    played.sort(byDate(-1));

    var group = function (title, rows) {
      if (!rows.length) return "";
      return '<h3 class="fx-group">' + esc(title) + '</h3>' +
        '<ul class="fx-list">' + rows.map(fixtureRow).join("") + '</ul>';
    };

    return group("Next up", upcoming) + group("Recent results", played) +
      '<div class="panel-actions" style="margin-top:22px">' +
      extLink(CLUB.officialFixtures || CLUB.officialSite, "Full fixture list") + '</div>';
  }

  function renderFixtures() {
    var first = $("#panel-first"), junior = $("#panel-junior");
    var fx = DATA.fixtures || {};
    if (first)  first.innerHTML  = renderFixtureList(fx.firstXV, "First XV");
    if (junior) junior.innerHTML = renderFixtureList(fx.juniors, "Mini & junior");

    var tabs = $$(".fx-tab");
    if (!tabs.length) return;

    function select(tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      revealIn(document.getElementById(tab.getAttribute("aria-controls")));
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(tab); });
      tab.addEventListener("keydown", function (e) {
        var dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = tabs[(i + dir + tabs.length) % tabs.length];
        next.focus();
        select(next);
      });
    });
  }

  /* ----------------------------------------------------------------------
     Meet the team
     ---------------------------------------------------------------------- */
  function initials(name) {
    return String(name || "").trim().split(/\s+/).slice(0, 2)
      .map(function (w) { return w.charAt(0).toUpperCase(); }).join("");
  }

  function renderTeam() {
    var mount = $("#people");
    if (!mount) return;
    var people = DATA.team || [];
    if (!people.length) { mount.parentNode.removeChild(mount); return; }

    /* With no photographs yet, tall portrait plates are mostly empty space.
       Switch to a shorter monogram card until the club adds pictures. */
    var hasPhotos = people.some(function (p) { return !!p.photo; });
    mount.classList.toggle("is-monogram", !hasPhotos);

    mount.innerHTML = people.map(function (p, i) {
      var visual = p.photo
        ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + ', ' + esc(p.role) + ', Llangwm RFC" loading="lazy" width="400" height="500">'
        : '<span class="person-mono" aria-hidden="true">' + esc(initials(p.name)) + '</span>';
      return '<article class="person reveal" style="--d:' + (i * 70) + 'ms">' +
        '<div class="person-photo">' + visual + '</div>' +
        '<div class="person-body">' +
          '<h3 class="person-name">' + esc(p.name) + '</h3>' +
          '<p class="person-role">' + esc(p.role) + '</p>' +
        '</div>' +
      '</article>';
    }).join("");

    initTilt(mount);
  }

  /* A small parallax tilt. Pointer devices only, and never on a phone. */
  function initTilt(scope) {
    if (reduced || !window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    $$(".person", scope).forEach(function (card) {
      var frame = 0;
      card.addEventListener("pointermove", function (e) {
        if (frame) return;
        frame = requestAnimationFrame(function () {
          frame = 0;
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - .5;
          var y = (e.clientY - r.top) / r.height - .5;
          card.style.transform =
            "perspective(900px) rotateX(" + (-y * 4).toFixed(2) + "deg) rotateY(" +
            (x * 4).toFixed(2) + "deg) translateY(-4px)";
        });
      });
      card.addEventListener("pointerleave", function () {
        if (frame) { cancelAnimationFrame(frame); frame = 0; }
        card.style.transform = "";
      });
    });
  }

  /* ----------------------------------------------------------------------
     Gallery + lightbox
     ---------------------------------------------------------------------- */
  var lbItems = [], lbIndex = 0, lbLastFocus = null;

  function renderGallery() {
    var mount = $("#gallery-mount");
    if (!mount) return;
    var photos = (DATA.gallery || []).filter(function (p) { return p && p.src; });

    if (!photos.length) {
      mount.innerHTML = emptyPanel(
        "The gallery is ready for the club's photography",
        "Matchday, the junior section, the clubhouse and the archive — drop the photographs in and they appear here with captions, filters and a full-screen viewer. Until then, the club's pictures live on Instagram.",
        extLink(SOCIAL.instagram, "See the photos on Instagram", true)
      );
      return;
    }

    var cats = [];
    photos.forEach(function (p) {
      if (p.category && cats.indexOf(p.category) === -1) cats.push(p.category);
    });

    var filters = cats.length > 1
      ? '<div class="gal-filters" role="group" aria-label="Filter photographs">' +
          '<button class="gal-filter" type="button" data-cat="*" aria-pressed="true">All</button>' +
          cats.map(function (c) {
            return '<button class="gal-filter" type="button" data-cat="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>';
          }).join("") +
        '</div>'
      : "";

    mount.innerHTML = filters + '<div class="gal" id="gal">' + photos.map(function (p, i) {
      return '<button class="gal-item" type="button" data-i="' + i + '" data-cat="' + esc(p.category || "") + '">' +
        '<img src="' + esc(p.src) + '" alt="' + esc(p.alt || "Llangwm RFC") + '" loading="lazy" decoding="async">' +
        '<figcaption>' +
          (p.category ? '<span class="gal-cat">' + esc(p.category) + '</span>' : '') +
          esc(p.alt || "") +
        '</figcaption>' +
      '</button>';
    }).join("") + '</div>';

    lbItems = photos;

    $$(".gal-filter", mount).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var cat = btn.getAttribute("data-cat");
        $$(".gal-filter", mount).forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
        $$(".gal-item", mount).forEach(function (item) {
          var show = cat === "*" || item.getAttribute("data-cat") === cat;
          item.style.display = show ? "" : "none";
        });
      });
    });

    $$(".gal-item", mount).forEach(function (item) {
      item.addEventListener("click", function () {
        openLightbox(Number(item.getAttribute("data-i")));
      });
    });
  }

  function openLightbox(i) {
    var lb = $("#lightbox");
    if (!lb || !lbItems.length) return;
    lbLastFocus = document.activeElement;
    lbIndex = i;
    lb.hidden = false;
    document.body.classList.add("is-locked");
    paintLightbox();
    /* The dialog is visibility:hidden until .is-open lands, and you cannot
       focus into that — so move focus on the next frame, not this one. */
    requestAnimationFrame(function () {
      lb.classList.add("is-open");
      var close = $("#lb-close");
      if (close) close.focus();
    });
  }

  function paintLightbox() {
    var p = lbItems[lbIndex];
    if (!p) return;
    var img = $("#lb-img"), cap = $("#lb-cap");
    if (img) { img.src = p.src; img.alt = p.alt || "Llangwm RFC"; }
    if (cap) cap.textContent = [p.category, p.alt].filter(Boolean).join(" — ");
    var multi = lbItems.length > 1;
    ["#lb-prev", "#lb-next"].forEach(function (s) {
      var b = $(s);
      if (b) b.style.display = multi ? "" : "none";
    });
  }

  function closeLightbox() {
    var lb = $("#lightbox");
    if (!lb) return;
    lb.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    window.setTimeout(function () { lb.hidden = true; }, 300);
    if (lbLastFocus && lbLastFocus.focus) lbLastFocus.focus();
  }

  function stepLightbox(d) {
    if (!lbItems.length) return;
    lbIndex = (lbIndex + d + lbItems.length) % lbItems.length;
    paintLightbox();
  }

  function initLightbox() {
    var lb = $("#lightbox");
    if (!lb) return;
    var close = $("#lb-close"), prev = $("#lb-prev"), next = $("#lb-next");
    if (close) close.addEventListener("click", closeLightbox);
    if (prev) prev.addEventListener("click", function () { stepLightbox(-1); });
    if (next) next.addEventListener("click", function () { stepLightbox(1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowLeft") stepLightbox(-1);
      else if (e.key === "ArrowRight") stepLightbox(1);
      else if (e.key === "Tab") {
        /* Keep focus inside the dialog while it is open. */
        var focusable = $$("button", lb).filter(function (b) { return b.offsetParent !== null; });
        if (!focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ----------------------------------------------------------------------
     Juniors, shop, partners, accreditation
     ---------------------------------------------------------------------- */
  function renderJuniors() {
    var jr = DATA.juniors || {};
    var ages = $("#age-groups");
    if (ages) {
      var list = jr.ageGroups || [];
      ages.innerHTML = list.length
        ? list.map(function (a) { return '<span class="age">' + esc(a) + '</span>'; }).join("")
        : '<p style="color:var(--mist-dim);margin:0">Age groups are listed on the club’s official site.</p>';
    }

    var facts = $("#jr-facts");
    if (!facts) return;
    var rows = [];
    if (jr.trainingTimes) rows.push(["Training", esc(jr.trainingTimes)]);
    if (jr.contactName)   rows.push(["Contact", esc(jr.contactName)]);
    if (jr.contactEmail)  rows.push(["Email", '<a href="mailto:' + esc(jr.contactEmail) + '">' + esc(jr.contactEmail) + '</a>']);
    if (jr.contactPhone)  rows.push(["Phone", '<a href="tel:' + esc(jr.contactPhone.replace(/\s+/g, "")) + '">' + esc(jr.contactPhone) + '</a>']);

    if (!rows.length) {
      rows.push(["Training", "Training times are posted on the club’s Instagram and official site each season."]);
      rows.push(["Get in touch", "Message the club on Instagram, or call the clubhouse."]);
    }

    facts.innerHTML = rows.map(function (r) {
      return '<div class="jr-fact"><dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd></div>';
    }).join("");
  }

  function renderShop() {
    var mount = $("#shop-list");
    if (!mount) return;
    var items = DATA.shop || [];
    if (!items.length) { mount.parentNode.removeChild(mount); return; }

    mount.innerHTML = items.map(function (s) {
      var btn = s.url
        ? '<a class="btn btn-amber btn-sm" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer"><span class="btn-arrow">Visit shop</span></a>'
        : '<a class="btn btn-sm" href="#contact"><span>Ask the club</span></a>';
      return '<div class="shop-item reveal">' +
        '<div><h3 class="shop-name">' + esc(s.name) + '</h3>' +
        '<p class="shop-blurb">' + esc(s.blurb || "") + '</p></div>' + btn +
      '</div>';
    }).join("");
  }

  function renderPartners() {
    var mount = $("#partners-mount");
    if (!mount) return;
    var list = DATA.sponsors || [];

    if (!list.length) {
      mount.innerHTML = emptyPanel(
        "Sponsor the Wasps",
        "Shirt, ground and matchball sponsorship supports a First XV and a full junior section in a village of a few hundred people. If your business would like to back Llangwm RFC, the club would be glad to hear from you.",
        '<a class="btn btn-amber btn-sm" href="#contact"><span class="btn-arrow">Talk to the club</span></a>'
      );
      return;
    }

    mount.innerHTML = '<div class="partners">' + list.map(function (s) {
      var inner = s.logo
        ? '<img src="' + esc(s.logo) + '" alt="' + esc(s.name) + '" loading="lazy">'
        : '<span>' + esc(s.name) + '</span>';
      return s.url
        ? '<a class="partner" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + inner + '</a>'
        : '<div class="partner">' + inner + '</div>';
    }).join("") + '</div>';
  }

  function renderAccreditation() {
    var mount = $("#accreditation-mount");
    if (!mount) return;
    var a = DATA.accreditation || {};
    if (!a.show) { mount.parentNode.removeChild(mount); return; }

    var badge = a.badge
      ? '<img src="' + esc(a.badge) + '" alt="' + esc(a.body + " " + a.level + " accreditation") + '" loading="lazy">'
      : '<span class="accred-level">' + esc(a.level) + '</span><span class="accred-word">Accredited</span>';

    mount.innerHTML = '<div class="accred">' +
      '<div class="accred-badge">' + badge + '</div>' +
      '<div class="accred-copy">' +
        '<h3>' + esc(a.body) + ' ' + esc(a.level) + ' accredited club</h3>' +
        '<p>Club accreditation recognises the standards a club works to off the pitch as well as on it — coaching, safeguarding, and how the club is run for its players and its village.</p>' +
      '</div>' +
    '</div>';
  }

  /* ----------------------------------------------------------------------
     Contact, map, footer, archive credit
     ---------------------------------------------------------------------- */
  function renderContact() {
    var addr = $("#club-address");
    if (addr) addr.innerHTML = (CLUB.address || []).map(esc).join("<br>");

    var rows = $("#contact-rows");
    if (rows) {
      var out = [];
      if (CLUB.phone) {
        out.push(["Phone", '<a href="tel:' + esc(CLUB.phone.replace(/\s+/g, "")) + '">' + esc(CLUB.phone) + '</a>']);
      }
      if (CLUB.email) {
        out.push(["Email", '<a href="mailto:' + esc(CLUB.email) + '">' + esc(CLUB.email) + '</a>']);
      }
      var hours = CLUB.openingHours || [];
      if (hours.length) {
        out.push(["Open", hours.map(esc).join("<br>")]);
      }
      if (SOCIAL.instagram) {
        out.push(["Instagram", '<a href="' + esc(SOCIAL.instagram) + '" target="_blank" rel="noopener noreferrer">' + esc(SOCIAL.instagramHandle || "Instagram") + '</a>']);
      }
      if (CLUB.officialSite) {
        out.push(["Official site", '<a href="' + esc(CLUB.officialSite) + '" target="_blank" rel="noopener noreferrer">llangwm.rfc.wales</a>']);
      }
      rows.innerHTML = out.map(function (r) {
        return '<div class="contact-row"><dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd></div>';
      }).join("");
    }

    var actions = $("#find-actions");
    if (actions) {
      actions.innerHTML =
        extLink(mapsUrl("map"), "Open in Google Maps", true) +
        extLink(mapsUrl("dir"), "Get directions") +
        (CLUB.phone ? '<a class="btn btn-sm" href="tel:' + esc(CLUB.phone.replace(/\s+/g, "")) + '"><span>Call the club</span></a>' : "");
    }

    var foot = $("#foot-contact");
    if (foot) {
      var f = [];
      f.push('<span>' + (CLUB.address || []).slice(1).map(esc).join(", ") + '</span>');
      if (CLUB.phone) f.push('<a href="tel:' + esc(CLUB.phone.replace(/\s+/g, "")) + '">' + esc(CLUB.phone) + '</a>');
      if (SOCIAL.instagram) f.push('<a href="' + esc(SOCIAL.instagram) + '" target="_blank" rel="noopener noreferrer">Instagram</a>');
      if (SOCIAL.facebook) f.push('<a href="' + esc(SOCIAL.facebook) + '" target="_blank" rel="noopener noreferrer">Facebook</a>');
      if (CLUB.officialSite) f.push('<a href="' + esc(CLUB.officialSite) + '" target="_blank" rel="noopener noreferrer">Official club site</a>');
      f.push('<a href="' + esc(mapsUrl("dir")) + '" target="_blank" rel="noopener noreferrer">Directions</a>');
      foot.innerHTML = f.join("");
    }

    var credit = $("#credit-links");
    if (credit) {
      var pages = (DATA.archiveSource && DATA.archiveSource.pages) || [];
      credit.innerHTML = pages.map(function (p) {
        return '<a href="' + esc(p.url) + '" target="_blank" rel="noopener noreferrer">' + esc(p.label) + '</a>';
      }).join("");
    }
  }

  /* The map is only requested once somebody asks for it. */
  function initMap() {
    var btn = $("#map-load"), frame = $("#map-frame"), fallback = $("#map-fallback");
    if (!btn || !frame) return;
    btn.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = "https://www.google.com/maps?q=" +
        encodeURIComponent(CLUB.mapQuery || "Llangwm RFC") + "&output=embed";
      iframe.title = "Map showing Llangwm Rugby Football Club";
      iframe.loading = "lazy";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.setAttribute("allowfullscreen", "");
      frame.appendChild(iframe);
      if (fallback) fallback.style.display = "none";
      btn.blur();
    });
  }

  /* ----------------------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------------------- */
  var observer = null;

  function revealIn(scope) {
    var els = $$(".reveal", scope || document).filter(function (el) { return !el.classList.contains("is-in"); });
    if (reduced || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-in");
          observer.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: .15 });
    }
    els.forEach(function (el) { observer.observe(el); });
  }

  /* Count-up. Short, eased, and it never runs twice. */
  function count(el) {
    var target = el.hasAttribute("data-count-from-year")
      ? new Date().getFullYear() - Number(el.getAttribute("data-count-from-year"))
      : Number(el.getAttribute("data-count-to"));
    if (!isFinite(target)) return;
    if (reduced) { el.textContent = String(target); return; }

    var plain = el.getAttribute("data-plain") === "true";
    var from = plain ? Math.max(0, target - 140) : 0;
    var start = 0, dur = 1100;

    function tick(now) {
      if (!start) start = now;
      var p = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(from + (target - from) * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    if (!("IntersectionObserver" in window) || reduced) {
      $$("[data-count-to],[data-count-from-year]").forEach(function (el) {
        var t = el.hasAttribute("data-count-from-year")
          ? new Date().getFullYear() - Number(el.getAttribute("data-count-from-year"))
          : Number(el.getAttribute("data-count-to"));
        if (isFinite(t)) el.textContent = String(t);
      });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        count(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: .4 });
    $$("[data-count-to],[data-count-from-year]").forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Navigation: sticky state, current section, mobile menu
     ---------------------------------------------------------------------- */
  function initNav() {
    var burger = $("#burger"), panel = $("#mobile-nav");
    if (burger && panel) {
      var setOpen = function (open) {
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("is-locked", open);
        if (open) {
          panel.hidden = false;
          requestAnimationFrame(function () { panel.classList.add("is-open"); });
        } else {
          panel.classList.remove("is-open");
          window.setTimeout(function () {
            if (burger.getAttribute("aria-expanded") === "false") panel.hidden = true;
          }, 400);
        }
      };
      burger.addEventListener("click", function () {
        setOpen(burger.getAttribute("aria-expanded") !== "true");
      });
      $$("a", panel).forEach(function (a) {
        a.addEventListener("click", function () { setOpen(false); });
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
          setOpen(false);
          burger.focus();
        }
      });
      window.addEventListener("resize", function () {
        if (window.innerWidth > 1080 && burger.getAttribute("aria-expanded") === "true") setOpen(false);
      });
    }
  }

  /* ----------------------------------------------------------------------
     One scroll loop for the header state, hero parallax, timeline fill and
     the current nav item.
     ---------------------------------------------------------------------- */
  function initScroll() {
    var masthead = $("#masthead");
    var hoops = $("#hero-hoops");
    var tl = $("#timeline");
    var tlFill = $("#tl-progress");
    var navLinks = $$(".nav a");
    var sections = navLinks.map(function (a) {
      return document.querySelector(a.getAttribute("href"));
    });
    var ticking = false, lastCurrent = -1;

    function frame() {
      ticking = false;
      var y = window.pageYOffset || document.documentElement.scrollTop;

      if (masthead) masthead.classList.toggle("is-stuck", y > 40);

      if (hoops && !reduced && y < window.innerHeight * 1.2) {
        hoops.style.transform = "translate3d(0," + (y * 0.16).toFixed(1) + "px,0)";
      }

      if (tl && tlFill) {
        var r = tl.getBoundingClientRect();
        var mid = window.innerHeight * 0.62;
        var p = (mid - r.top) / (r.height || 1);
        tlFill.style.height = (Math.max(0, Math.min(1, p)) * 100).toFixed(1) + "%";
      }

      /* Current section: of those scrolled past the header, the one furthest
         down the page. The nav is not in document order, so comparing tops
         matters — going by nav index marks the wrong link. */
      var current = -1, bestTop = -Infinity;
      for (var i = 0; i < sections.length; i++) {
        var s = sections[i];
        if (!s) continue;
        var top = s.getBoundingClientRect().top;
        if (top <= 140 && top > bestTop) { bestTop = top; current = i; }
      }
      if (current !== lastCurrent) {
        lastCurrent = current;
        navLinks.forEach(function (a, i) {
          if (i === current) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    frame();
  }

  /* ----------------------------------------------------------------------
     Go
     ---------------------------------------------------------------------- */
  function init() {
    bind();
    renderNews();
    renderFixtures();
    renderTeam();
    renderGallery();
    renderJuniors();
    renderShop();
    renderPartners();
    renderAccreditation();
    renderContact();
    initMap();
    initLightbox();
    initNav();
    initScroll();
    initCounters();
    revealIn(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
