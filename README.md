# Eddie Rocks — Charcoal & Silver redesign

A static rebuild of eddies.co in the "Charcoal & Silver" direction: a
neutral graphite base with a brushed-silver metallic accent, and a type
system tied to the club's own brand mark rather than a generic elegant
pairing — Anton (the same face used in the logo) for the handful of
moments that should genuinely shout, Instrument Serif italic for section
headings, and Public Sans for body/UI. Built after feedback that the
previous pass read as templated and thin — this version adds the content
sections real nightclub sites actually carry (researched via web search:
door policy, DJ lineup, FAQ, live countdown, table booking, newsletter
signup) plus a handful of handmade graphic details (ticket-stub scalloped
dividers, halftone texture, polaroid gallery tiles) so it doesn't read as
a single generic template.

## Preview locally

No build step — plain HTML/CSS/JS.

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What's on the page now

Beyond the original hero/floors/gallery/contact, this pass adds:

- **Utility ticker** — a thin marquee above the header with hours, dress
  code and ID policy (a pattern real venue sites use to answer the most
  common questions before a visitor even scrolls).
- **Live doors-open countdown** — in the hero, genuinely computed in JS
  (`nextDoorsOpen` in `js/main.js`) to the next Friday or Saturday 9pm,
  not a fabricated one-off event.
- **Lineup / Residents section** — role-based cards (Main Floor resident,
  RnB Floor resident, guest selectors) rather than invented DJ names —
  swap in real names/photos/bios when you have them.
- **Door Policy strip** — age, dress code, hours, entry, styled as an
  info panel.
- **FAQ** — a native `<details>/<summary>` accordion (no JS needed for
  the disclosure itself), covering booking, age, dress code, private hire
  and parking.
- **Newsletter signup** in the footer — the front-end flow (validation +
  a client-side "you're on the list" confirmation) is built; **it isn't
  wired to a real email provider**. Hook it up to Mailchimp/Klaviyo/etc.
  before relying on it to actually collect addresses.
- **Sticky "Reserve a Table" bar** on mobile only, with a one-tap call
  button.
- **Interaction details**: small dot cursor, magnetic buttons, hero
  scroll parallax, hover tilt on floor/experience images, silver shimmer
  headline text, ticket-stub scalloped section edges, a subtle halftone
  accent, and two gallery photos with a rotated polaroid/tape treatment.
  All respect `prefers-reduced-motion` and are disabled on touch/coarse-
  pointer devices.

## Swapping in the real logo and photos

Nothing here is final content — placeholders are marked so they're easy to
find and replace.

- **Logo** — `assets/images/logo.svg`, used via `<img>` in the header and
  footer. This is a hand-built recreation, not the original file: two
  attempts to paste the real logo into chat came through unreadable
  (blank/white), but a later screenshot with a dark background behind it
  was visible, so the stacked "EDDIE / ROCKS" mark and stamped/distressed
  texture were rebuilt from that (Anton + an SVG turbulence/displacement
  filter — see `<filter id="stamp">` in the SVG). Close, not pixel-exact.
  Send the original on a dark background or as a flattened JPG/PNG and
  replace `assets/images/logo.svg` directly (same filename).
- **Photos** — every image points at a generated placeholder SVG in
  `assets/images/` (charcoal/silver gradients labelled with what should go
  there). Replace each file with the real photo **using the same
  filename** — no markup changes needed.
- **Social links** — Facebook/Instagram/X icons in the footer link to `#`.
  Update the `href`s in `index.html` once you have the real profile URLs.

## Content that needs confirming before launch

Everything below reads confidently on the page but is an assumption or
industry-standard placeholder, not confirmed fact — check and edit before
this goes live:

- **Opening hours, age policy, capacity numbers** in the Door Policy strip
  and floor capacity badges — generic/typical for a UK nightclub, not
  sourced from the venue. (Dress code is confirmed: there isn't one —
  already reflected across the ticker, Door Policy strip, and FAQ.)
- **FAQ answers** — sensible generic answers, not venue-confirmed.
- **Resident/lineup section** — deliberately uses role labels ("Main
  Floor Resident") instead of inventing real DJ names or using stock
  photos as if they were real people.
- Floor descriptions and the "Above The Forbidden Florist" locator line
  are written from what was described in chat.
- **"Upcoming Events"** ships with an honest empty state rather than
  fabricated events, since there's no real events data to work from.

## Fonts

Anton, Instrument Serif and Public Sans are self-hosted in `assets/fonts/`
(SIL Open Font License — see the `LICENSE-*.txt` files alongside them),
pulled in via `@font-face` in `css/styles.css`. No external font requests.
