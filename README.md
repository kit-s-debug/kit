# Eddie Rocks — Midnight Velvet redesign

A static rebuild of eddies.co in the "Midnight Velvet" direction: near-black,
brass and wine palette, Fraunces + Familjen Grotesk type, and scroll-driven
interactions in place of the old blue-gradient template look.

## Preview locally

No build step — plain HTML/CSS/JS.

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Swapping in the real logo and photos

Nothing here is final content — placeholders are marked so they're easy to
find and replace.

- **Logo** — currently a text wordmark styled with Fraunces (`.wordmark` in
  `index.html`, appears in the header and footer). To use the real Eddie
  Rocks logo file instead, drop it in `assets/images/` and replace the two
  `.wordmark` blocks with an `<img>` tag pointing to it.
- **Photos** — every image currently points at a generated placeholder SVG
  in `assets/images/` (moody gradients labelled with what should go there:
  hero, Main Floor, RnB Floor, gallery shots, etc.). Replace each file with
  the real photo **using the same filename** and it drops straight in — no
  markup changes needed. Recommended sizes are roughly the placeholder's
  dimensions (see `alt` text and surrounding markup in `index.html` for
  which image is which).
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

Fraunces and Familjen Grotesk are self-hosted in `assets/fonts/` (SIL Open
Font License — see the `LICENSE-*.txt` files alongside them), pulled in via
`@font-face` in `css/styles.css`. No external font requests.
