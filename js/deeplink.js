/* Scroll behaviour on arrival, shared by both venue pages.

   Two jobs. A fresh load should open on the hero rather than wherever the
   browser last left you — but only a fresh load, so an incoming hash is left
   alone and simply opts out of the scroll-to-top. And a deep link lands
   before either page's lazily-built 3D scene has switched its scroller on,
   which adds several screens of height above the target, so the aim is
   re-taken while the page height is still moving.

   Loaded as a classic script in <head> on purpose: it has to run before the
   body exists, which a module or a deferred script would not.
*/
/* Marks the document as scripted before any of it paints, so the CSS can
   hide things it intends to animate in. Anything that hides itself and waits
   for JavaScript to bring it back has to be gated on this, or a page whose
   scripts never arrive is a blank one. */
document.documentElement.classList.add("js");

if ("scrollRestoration" in history) history.scrollRestoration = "manual";
var deepLinked = !!location.hash;
var userScrolled = deepLinked;
function markUserScrolled() { userScrolled = true; }
function forceScrollTop() { if (!userScrolled) window.scrollTo(0, 0); }
document.addEventListener("DOMContentLoaded", forceScrollTop);
window.addEventListener("load", forceScrollTop);
window.addEventListener("wheel", markUserScrolled, { once: true, passive: true });
window.addEventListener("touchmove", markUserScrolled, { once: true, passive: true });
window.addEventListener("click", markUserScrolled, { once: true, passive: true });
window.addEventListener("keydown", function (e) {
  if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].indexOf(e.key) > -1) markUserScrolled();
}, { once: true });
[0, 60, 150, 300, 600, 1200].forEach(function (ms) { setTimeout(forceScrollTop, ms); });

/* A deep link lands before the building's scroller has been switched on,
   and that adds several screens of height above the target — so the
   browser's own jump ends up somewhere else entirely. The scene builds
   lazily, so there's no single moment to re-aim at: instead, keep
   re-aiming while the page height is still moving, and stop after a few
   seconds so it never fights someone who has started scrolling. */
function deepLinkTarget() {
  var id = location.hash.slice(1);
  /* a drinks category should land on the menu itself, not halfway down
     the panel it selected */
  if (id.indexOf("drinks-") === 0) id = "drinks";
  var el = document.getElementById(id);
  return el && el.offsetParent ? el : null;
}
function settleDeepLink() {
  if (!deepLinked || userScrolledForReal) return;
  var el = deepLinkTarget();
  if (el) el.scrollIntoView({ block: "start", behavior: "auto" });
}
var userScrolledForReal = false;
["wheel", "touchmove", "keydown"].forEach(function (evt) {
  window.addEventListener(evt, function () { userScrolledForReal = true; },
    { once: true, passive: true });
});
window.addEventListener("load", settleDeepLink);
if (deepLinked) {
  var until = Date.now() + 4000;
  var lastH = 0;
  (function watchHeight() {
    var h = document.documentElement.scrollHeight;
    if (h !== lastH) { lastH = h; settleDeepLink(); }
    if (Date.now() < until) setTimeout(watchHeight, 120);
  })();
}
