/* ==========================================================================
   The drinks menu.

   Small render functions, each doing one job, composed by DrinkMenu. There
   is no framework on this site, so a "component" here is a function that
   returns markup — but the boundaries are the same, and the data it draws
   lives in drinks-data.js so the menu can be edited without touching this
   file at all.

   The categories are a real tab control rather than a page of anchors:
   picking Cocktails should show you cocktails, not scroll you past six
   other sections to reach them. It follows the ARIA tabs pattern, so arrow
   keys work and screen readers announce it as one.
   ========================================================================== */

import { menuFor, TONES } from "./drinks-data.js";

/* Accents are folded rather than dropped, so Moët and Jägerbomb become
   moet.jpg and jagerbomb.jpg — filenames a person can be asked to produce,
   instead of mo-t.jpg and j-gerbomb.jpg. */
var slug = function (s) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};
var esc = function (s) {
  return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
  });
};

/* ---------------------------------------------------------------- DrinkCard
   Image-led, for the drinks worth looking at. The artwork is a generated
   colour tile keyed to the drink; give the item a `photo` and it uses that
   instead, no other change needed. */
function DrinkCard(item) {
  var src = item.photo || "assets/images/drinks/" + slug(item.name) + ".jpg";
  var tone = TONES[item.tone] || TONES.copper;
  var meta = item.price
    ? '<span class="drink-price">' + esc(item.price) + "</span>"
    : item.serves
      ? '<span class="drink-serves">' + item.serves.map(esc).join(" · ") + "</span>"
      : item.note
        ? '<span class="drink-note">' + esc(item.note) + "</span>"
        : "";
  return (
    '<article class="drink-card" style="--tone:' + tone + '">' +
      '<div class="drink-card-media">' +
        '<img src="' + src + '" alt="" loading="lazy" decoding="async" width="720" height="720">' +
      "</div>" +
      '<div class="drink-card-body">' +
        "<h4>" + esc(item.name) + "</h4>" +
        meta +
      "</div>" +
    "</article>"
  );
}

/* ---------------------------------------------------------------- PromoCard
   Louder than a drink card, because an offer is a different kind of thing:
   the price leads and the tone colour is allowed to burn a little brighter.
   Still the same palette — no separate neon design language. */
function PromoCard(item) {
  var src = item.photo || "assets/images/drinks/" + slug(item.name) + ".jpg";
  return (
    '<article class="promo-card" style="--tone:' + (TONES[item.tone] || TONES.copper) + '">' +
      '<div class="promo-card-media">' +
        '<img src="' + src + '" alt="" loading="lazy" decoding="async" width="720" height="720">' +
      "</div>" +
      '<div class="promo-card-body">' +
        '<span class="promo-price">' + esc(item.price) + "</span>" +
        "<h4>" + esc(item.name) + "</h4>" +
      "</div>" +
    "</article>"
  );
}

/* ---------------------------------------------------------------- DrinkGrid */
function DrinkGrid(items, kind) {
  var draw = kind === "promo" ? PromoCard : DrinkCard;
  return '<div class="' + (kind === "promo" ? "promo-grid" : "drink-grid") + '">' +
    items.map(draw).join("") + "</div>";
}

/* ---------------------------------------------------------------- DrinkList
   The other half of the menu. Nobody needs a photograph of a Pepsi, and 40
   picture cards is a wall to scroll rather than a list to scan — so spirits,
   bottles, draught and mixers are set as type and grouped the way the bar
   is. */
function DrinkList(groups) {
  return '<div class="drink-lists">' + groups.map(function (g) {
    return (
      '<div class="drink-list">' +
        "<h4>" + esc(g.name) + "</h4>" +
        "<ul>" + g.items.map(function (it) {
          return "<li><span>" + esc(it.name) + "</span>" +
            (it.note ? '<em class="drink-note">' + esc(it.note) + "</em>" : "") +
            "</li>";
        }).join("") + "</ul>" +
      "</div>"
    );
  }).join("") + "</div>";
}

/* -------------------------------------------------------------- MenuSection */
function MenuSection(cat, index, ns) {
  var body = cat.layout === "list"
    ? (cat.strip
        ? '<div class="drink-strip"><h4 class="drink-strip-title">' + esc(cat.strip.name) +
          "</h4>" + DrinkGrid(cat.strip.items) + "</div>" +
          /* a category can end up fully photographed, and then there is no
             list left to draw under the strip */
          (cat.groups && cat.groups.length ? DrinkList(cat.groups) : "")
        : DrinkList(cat.groups))
    : DrinkGrid(cat.items, cat.layout);
  return (
    '<section class="menu-section' + (cat.layout === "promo" ? " menu-section--promo" : "") + '"' +
      ' id="' + ns + 'drinks-' + cat.id + '" data-cat="' + cat.id + '"' +
      ' role="tabpanel" tabindex="0"' +
      ' aria-labelledby="' + ns + 'drinks-tab-' + cat.id + '"' + (index === 0 ? "" : " hidden") + ">" +
      (cat.eyebrow ? '<p class="eyebrow menu-section-eyebrow">' + esc(cat.eyebrow) + "</p>" : "") +
      "<h3>" + esc(cat.name) + "</h3>" +
      body +
    "</section>"
  );
}

/* -------------------------------------------------------------- CategoryTabs
   Horizontally scrollable, so nine categories cost one row on a phone
   instead of a screenful. The active pill is a single element that moves,
   rather than a border on each tab, so the change reads as one motion. */
function CategoryTabs(cats, ns) {
  return (
    '<div class="menu-tabs">' +
      '<div class="menu-tabs-rail" role="tablist" aria-label="Drinks categories">' +
        '<span class="menu-tabs-marker" aria-hidden="true"></span>' +
        cats.map(function (c, i) {
          return '<button type="button" class="menu-tab' + (i === 0 ? " is-active" : "") + '"' +
            ' id="' + ns + 'drinks-tab-' + c.id + '" role="tab" data-cat="' + c.id + '"' +
            ' aria-controls="' + ns + 'drinks-' + c.id + '" aria-selected="' + (i === 0) + '"' +
            ' tabindex="' + (i === 0 ? "0" : "-1") + '">' + esc(c.tabName || c.name) + "</button>";
        }).join("") +
      "</div>" +
    "</div>"
  );
}

/* ------------------------------------------------------------------ DrinkMenu */
export function DrinkMenu(root) {
  if (!root) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Same menu at both venues, different offer — the mount point says which
     one it is, so neither page carries a copy of the other's drinks. */
  var CATS = menuFor(root.getAttribute("data-venue") || "eddies");
  /* Panel ids stay bare on a normal page, so #drinks-cocktails keeps
     working. A second menu mounted in the same document — which is what the
     combined preview does — mounts under its own id and namespaces its
     panels behind it, so the two menus cannot claim each other's tabs. */
  var ns = root.id && root.id !== "drink-menu" ? root.id + "-" : "";

  root.innerHTML =
    CategoryTabs(CATS, ns) +
    '<div class="menu-panels">' +
      CATS.map(function (c, i) { return MenuSection(c, i, ns); }).join("") +
    "</div>";

  var tabs = Array.prototype.slice.call(root.querySelectorAll(".menu-tab"));
  var rail = root.querySelector(".menu-tabs-rail");
  var marker = root.querySelector(".menu-tabs-marker");

  function moveMarker(tab) {
    /* A menu can be built while its page is hidden — the combined preview
       mounts both venues at once — and measuring then pins the pill at
       nothing. Refuse the measurement rather than storing a bad one. */
    if (!tab.offsetWidth) return;
    marker.style.width = tab.offsetWidth + "px";
    marker.style.transform = "translateX(" + tab.offsetLeft + "px)";
  }

  /* Switching category swaps the panel under the tabs, and a long panel
     leaves you standing wherever the last one happened to reach — often
     halfway down a category you did not choose. Put the top of the menu
     back under the header instead, so a new category starts at its first
     card. Only on a real choice: doing it on mount, or on the deep link
     that runs at load, would fight the arrival scroll. */
  function scrollToMenu() {
    var tabsBox = root.querySelector(".menu-tabs");
    if (!tabsBox) return;
    var header = document.querySelector(".site-header");
    var top = tabsBox.getBoundingClientRect().top + window.pageYOffset
            - (header ? header.offsetHeight : 0);
    /* already at the top of the menu, so leave the page where it is */
    if (Math.abs(window.pageYOffset - top) < 8) return;
    window.scrollTo({ top: top, behavior: reduced ? "auto" : "smooth" });
  }

  function select(id, focus, move) {
    var found = false;
    tabs.forEach(function (t) {
      var on = t.dataset.cat === id;
      if (on) found = true;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = root.querySelector('.menu-section[data-cat="' + t.dataset.cat + '"]');
      if (panel) panel.hidden = !on;
      if (on) {
        moveMarker(t);
        /* keep the chosen tab in view on a phone, where the rail scrolls */
        t.scrollIntoView({ block: "nearest", inline: "center",
                           behavior: reduced ? "auto" : "smooth" });
        if (focus) t.focus();
      }
    });
    if (found && move) scrollToMenu();
    return found;
  }

  rail.addEventListener("click", function (e) {
    var tab = e.target.closest(".menu-tab");
    if (tab) select(tab.dataset.cat, false, true);
  });

  rail.addEventListener("keydown", function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var next = e.key === "ArrowRight" ? i + 1
      : e.key === "ArrowLeft" ? i - 1
      : e.key === "Home" ? 0
      : e.key === "End" ? tabs.length - 1
      : -1;
    if (next < 0 && e.key !== "Home") return;
    e.preventDefault();
    select(tabs[(next + tabs.length) % tabs.length].dataset.cat, true, true);
  });

  /* Deep links: /#drinks-cocktails opens on cocktails, same as the floors. */
  function fromHash(move) {
    var h = window.location.hash.replace("#drinks-", "");
    if (h && h !== window.location.hash) select(h, false, move);
  }
  /* a hash arriving later is someone following a link, so carry them to the
     menu; the one present at load is the arrival scroll's job, not ours */
  window.addEventListener("hashchange", function () { fromHash(true); });
  fromHash(false);

  /* the marker is measured, so it has to be remeasured when the type does */
  window.addEventListener("resize", function () {
    var on = root.querySelector(".menu-tab.is-active");
    if (on) moveMarker(on);
  });
  /* ...and take the measurement again the first time it is actually on
     screen, since that is when there is something to measure. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var on = root.querySelector(".menu-tab.is-active");
        if (on && on.offsetWidth) { moveMarker(on); obs.disconnect(); }
      });
    }).observe(root);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      var on = root.querySelector(".menu-tab.is-active");
      if (on) moveMarker(on);
    });
  }
  requestAnimationFrame(function () {
    var on = root.querySelector(".menu-tab.is-active");
    if (on) moveMarker(on);
  });
}

DrinkMenu(document.getElementById("drink-menu"));
