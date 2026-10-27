# Victoria Bookshop — website

A one-page site for Victoria Bookshop, 6 Bridge Street, Haverfordwest. Plain
HTML, CSS and JavaScript, no build step. Facts and sources are in
[RESEARCH.md](RESEARCH.md); read its **Needs confirming** list before launch.

## Run it locally

```
cd victoria
python3 -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` straight from disk also
works, but the fonts load more reliably through a server.)

## The idea

The site is a book. A green cloth cover with a gilt title swings open on the
first visit of a session, and behind it is a title page. The chapters are
numbered like a book's (I. Foreword to VIII. Finding the shop), the mobile menu
is a contents page with dotted leaders, there are pencil notes in the margins,
and the footer is a colophon. At the very end, the back cover closes over the
last page.

- **Type:** Libre Caslon Display and Text (after William Caslon's 18th-century
  types), Instrument Sans for small print, Caveat for the handwritten notes.
  All self-hosted in `assets/fonts`.
- **Colour:** paper `#f3ecdc`, ink `#1c1a16`, bookcloth green `#1e3a2f`,
  oxblood `#7a2a2e`, gilt `#c9a45c`. Tokens are at the top of `css/style.css`.

## What moves, and where

| Moment | How |
| --- | --- |
| Cloth cover opens (once per visit, skippable by any key, click, tap or scroll) | `main.js` → "the cloth cover" |
| Title page: words rise, arch draws, spines grow onto the shelves | `heroIntro()` |
| Story: a pinned book whose pages turn as you scroll (wide screens) / a ruled timeline (phones) | "II. the story, as a book" |
| Shelf of category spines you pull out to read a catalogue card | `SHELF` object + spine handlers |
| Signature drawn in gilt; signed books fan out from a pile | "IV. signed" |
| Local chapter opens from inside the dark section; contour lines draw; "Pembrokeshire" drifts | "V. local" |
| Recommendation notes tucked into books | "VI. picks" |
| Back cover closes over the last page | "the end" |

GSAP 3.13 and ScrollTrigger are vendored in `js/vendor` (GSAP's standard
licence, free for this use). Everything is readable without JavaScript, and
`prefers-reduced-motion` turns off the cover, the pinned book and the closing
board, leaving a plain, fully laid-out page.

## Updating content

- **Events:** add entries to `js/events.js`. Past dates hide themselves. With
  no entries the section points to Facebook and Instagram.
- **Opening hours:** search `index.html` for `HOURS`. Only "Closed on Sundays"
  is shown, because published listings disagree on times. Add the confirmed
  hours there and as `openingHoursSpecification` in the JSON-LD in `<head>`.
- **Shelf categories:** the `SHELF` object near the top of `js/main.js`.
- **Bookseller picks:** the `<ol class="notes">` block in `index.html`. The
  current three are Bethan's published answers to National Book Tokens'
  *Ask a Bookseller*; the one-line descriptions are ours.
- **Signed examples:** the `<ul class="plates">` block. These are titles the
  shop has listed as signed on eBay/X, labelled as examples, not stock.

## Images still needed

No photographs could be downloaded in the build environment, so the design
does not depend on any. Nothing on the site is a stand-in photo or a fake
cover. Book titles are shown as designed cloth "title plates" rather than
imitation publisher covers.

When the shop can supply them, the best additions would be:

1. **Shopfront on Bridge Street**, for the Visit chapter (beside the map) or
   as a plate in the story's "1996" page.
2. **Inside the shop / the signed shelf**, for the Signed chapter header.
3. **The local-interest shelf**, for the Pembrokeshire chapter.
4. **Real cover images** for the picks and signed examples, if the shop is
   happy to use publisher covers. To swap one in, replace the inner
   `<div class="tome">…</div>` or `<div class="plate-in">…</div>` with an
   `<img>` of the same aspect ratio (2:3), with `loading="lazy"` and alt text.

The shop's own logo was not available either. The wordmark is typeset.

## Before publishing

1. Work through **Needs confirming** in RESEARCH.md (hours, ordering wording,
   Bethan's consent to be named, the domain).
2. Once the domain is known, add `<link rel="canonical">`, an absolute
   `og:url` and `og:image`, a `url` in the JSON-LD and a sitemap.
3. Deploy the `victoria/` folder as its own site (it has its own
   `vercel.json`, like `bambo/`).
