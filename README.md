# Eddie Rocks — After Hours Minimal redesign

A static rebuild of eddies.co in the "After Hours Minimal" direction:
near-black and bone with a muted wine-violet accent, huge type-driven hero
(Unbounded + JetBrains Mono + Hanken Grotesk), a running ticker, a
full-screen menu overlay, and scroll-driven interactions in place of the
old blue-gradient template look.

## Preview locally

No build step — plain HTML/CSS/JS.

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Swapping in the real logo and photos

Nothing here is final content — placeholders are marked so they're easy to
find and replace.

- **Logo** — currently a text wordmark styled with Unbounded (`.wordmark` in
  `index.html`, appears in the header and the full-screen menu). To use the
  real Eddie Rocks logo file instead, drop it in `assets/images/` and
  replace the `.wordmark` blocks with an `<img>` tag pointing to it.
  (A logo file was pasted into chat once, but it came through unreadable —
  effectively a blank image — so nothing was extracted from it. Please
  resend it as an attached file.)
- **Photos** — every image currently points at a generated placeholder SVG
  in `assets/images/` (moody gradients labelled with what should go there:
  Main Floor, RnB Floor, gallery shots, etc.). Replace each file with the
  real photo **using the same filename** and it drops straight in — no
  markup changes needed. Recommended sizes are roughly the placeholder's
  dimensions (see `alt` text and surrounding markup in `index.html` for
  which image is which). This direction is intentionally type-first, so
  there's no hero background photo — everything above the fold is type.
- **Social links** — the Facebook/Instagram/X icons in the footer currently
  link to `#`. Update the `href`s in `index.html` once you have the real
  profile URLs.

## Content notes / assumptions to double-check

- Floor copy (Main Floor / RnB Floor descriptions) and the "Above The
  Forbidden Florist" locator line are written from what was described in
  chat, not sourced from the club — reword anything that's off.
- The "Upcoming Events" section ships with an honest empty state rather
  than placeholder events, since there was no real events data to work
  from. Wire it up to whatever's used to manage events when ready.

## Fonts

Unbounded, JetBrains Mono and Hanken Grotesk are self-hosted in
`assets/fonts/` (SIL Open Font License — see the `LICENSE-*.txt` files
alongside them), pulled in via `@font-face` in `css/styles.css`. No
external font requests.
