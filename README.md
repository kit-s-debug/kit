# Eddie Rocks — Gold Standard redesign

A static rebuild of eddies.co in the "Gold Standard" direction: true black
with a metallic gold gradient, a high-contrast fashion serif (Bodoni Moda)
for headlines, a custom cursor with hover states, magnetic buttons, a
scroll-linked parallax hero, and hover-triggered image reveals — the kind
of detail work a premium agency build usually charges for.

## Preview locally

No build step — plain HTML/CSS/JS.

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Interactive details in this build

- **Custom cursor** — a gold ring follows the pointer and expands over
  links, buttons, and gallery images (shows a "View" label on gallery
  items). Disabled automatically on touch devices.
- **Magnetic buttons** — primary buttons and key links pull gently toward
  the cursor on hover (`data-magnetic` attribute in `index.html`).
- **Hero scroll effect** — the hero image and headline parallax/fade as
  you scroll past them (`js/main.js`, `updateParallax`).
- **Tilt on hover** — floor photos and experience cards tilt slightly
  toward the cursor (`data-tilt` attribute).
- **Shimmer text** — gold gradient headlines animate a slow shine sweep
  (`.shimmer` class).
- **Grain overlay + gold-tinted scrollbar** for a more filmic, considered
  finish than flat black.

All of the above respects `prefers-reduced-motion` and is skipped/disabled
on touch/coarse-pointer devices.

## Swapping in the real logo and photos

Nothing here is final content — placeholders are marked so they're easy to
find and replace.

- **Logo** — `assets/images/logo.svg`, used via `<img>` in both the header
  and footer `.wordmark` links. This is a hand-built recreation, not the
  original file: two attempts to paste the real logo into chat came through
  unreadable (rendered blank/white, most likely a transparent-background
  file with nothing behind it), but a later screenshot with a dark
  background behind it was visible, so the stacked "EDDIE / ROCKS" mark,
  proportions, and stamped/distressed edge texture were rebuilt from that
  (bold condensed type + an SVG turbulence/displacement filter for the
  rough edges — see `<filter id="stamp">` in the SVG). It should read as
  very close, but it is not a pixel-exact copy. If you have the original
  logo file, send it on a dark background or as a flattened JPG/PNG and
  replace `assets/images/logo.svg` directly (same filename, no markup
  changes needed).
- **Photos** — every image currently points at a generated placeholder SVG
  in `assets/images/` (gold-glow gradients labelled with what should go
  there: hero, Main Floor, RnB Floor, gallery shots, etc.). Replace each
  file with the real photo **using the same filename** and it drops
  straight in — no markup changes needed.
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

Bodoni Moda and Hanken Grotesk are self-hosted in `assets/fonts/` (SIL Open
Font License — see the `LICENSE-*.txt` files alongside them), pulled in via
`@font-face` in `css/styles.css`. No external font requests. The logo SVG
embeds its own copy of Anton (also OFL) so it renders correctly wherever
it's used, independent of the page's fonts.
