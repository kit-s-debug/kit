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

import { DRINKS, TONES } from "./drinks-data.js";

var slug = function (s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
function MenuSection(cat, index) {
  var body = cat.layout === "list"
    ? DrinkList(cat.groups)
    : DrinkGrid(cat.items, cat.layout);
  return (
    '<section class="menu-section' + (cat.layout === "promo" ? " menu-section--promo" : "") + '"' +
      ' id="drinks-' + cat.id + '" role="tabpanel" tabindex="0"' +
      ' aria-labelledby="drinks-tab-' + cat.id + '"' + (index === 0 ? "" : " hidden") + ">" +
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
function CategoryTabs(cats) {
  return (
    '<div class="menu-tabs">' +
      '<div class="menu-tabs-rail" role="tablist" aria-label="Drinks categories">' +
        '<span class="menu-tabs-marker" aria-hidden="true"></span>' +
        cats.map(function (c, i) {
          return '<button type="button" class="menu-tab' + (i === 0 ? " is-active" : "") + '"' +
            ' id="drinks-tab-' + c.id + '" role="tab" data-cat="' + c.id + '"' +
            ' aria-controls="drinks-' + c.id + '" aria-selected="' + (i === 0) + '"' +
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

  root.innerHTML =
    CategoryTabs(DRINKS) +
    '<div class="menu-panels">' + DRINKS.map(MenuSection).join("") + "</div>";

  var tabs = Array.prototype.slice.call(root.querySelectorAll(".menu-tab"));
  var rail = root.querySelector(".menu-tabs-rail");
  var marker = root.querySelector(".menu-tabs-marker");

  function moveMarker(tab) {
    marker.style.width = tab.offsetWidth + "px";
    marker.style.transform = "translateX(" + tab.offsetLeft + "px)";
  }

  function select(id, focus) {
    var found = false;
    tabs.forEach(function (t) {
      var on = t.dataset.cat === id;
      if (on) found = true;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById("drinks-" + t.dataset.cat);
      if (panel) panel.hidden = !on;
      if (on) {
        moveMarker(t);
        /* keep the chosen tab in view on a phone, where the rail scrolls */
        t.scrollIntoView({ block: "nearest", inline: "center",
                           behavior: reduced ? "auto" : "smooth" });
        if (focus) t.focus();
      }
    });
    return found;
  }

  rail.addEventListener("click", function (e) {
    var tab = e.target.closest(".menu-tab");
    if (tab) select(tab.dataset.cat);
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
    select(tabs[(next + tabs.length) % tabs.length].dataset.cat, true);
  });

  /* Deep links: /#drinks-cocktails opens on cocktails, same as the floors. */
  function fromHash() {
    var h = window.location.hash.replace("#drinks-", "");
    if (h && h !== window.location.hash) select(h);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();

  /* the marker is measured, so it has to be remeasured when the type does */
  window.addEventListener("resize", function () {
    var on = root.querySelector(".menu-tab.is-active");
    if (on) moveMarker(on);
  });
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
