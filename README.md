# Eddie Rocks — Velvet Ember redesign

A static rebuild of eddies.co. The palette moved from an earlier cooler
"Charcoal & Silver" direction to **Velvet Ember**: a deep aubergine-plum
base with a single warm amber-coral accent and cream text, at the
request to move off charcoal into something more inviting without
sliding into the previously-rejected gold-and-black look — this is a
warm wine/candlelight register instead, not metallic. Type system is
still tied to the club's own brand mark rather than a generic elegant
pairing: Anton (the same face used in the logo) for the handful of
moments that should genuinely shout, Cormorant Garamond italic for
section headings, and Public Sans for body/UI.

Built after several feedback rounds: an "anti-slop" pass stripped out
AI-generated tells (em dashes, an eyebrow on nearly every section, a
repeated hairline-bordered grid reused across four sections, a
three-equal-cards layout, five different CTA phrasings for the same
action); a follow-up "glow-up" pass then added the finishing detail a
template usually skips — a cursor-follow spotlight highlight on cards, a
double-bezel framed-photo treatment on every image, nested icon-in-button
hover physics, a live-pulse doors-open indicator, an ambient drifting
glow behind the hero, and a FAQ rebuilt as a clean border-bottom list
instead of another bordered grid. This version also carries the content
sections real nightclub sites actually have (researched via web search:
door policy, DJ lineup, FAQ, live countdown, table booking, newsletter
signup) plus handmade graphic details (ticket-stub scalloped dividers,
halftone texture, polaroid gallery tiles) so it doesn't read as a single
generic template.

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
- **Lineup / Residents section** — role-based cards (Main Bar resident,
  RnB Bar resident, guest selectors) rather than invented DJ names —
  swap in real names/photos/bios when you have them.
- **A literal illustrated building** — the old side-by-side floor panels
  are now an actual building facade, drawn in CSS: a cornice cap, three
  storeys, and a foundation strip labelled "Quay Street." Each storey is
  a clickable floor: the top two (RnB Bar, Main Bar) are rows of lit
  windows that brighten further on hover/open; the ground floor is a
  striped shopfront awning over an arched doorway for The Forbidden
  Florist. Clicking a floor opens with a smooth height animation (CSS
  grid `0fr → 1fr`, not a JS-measured height) to reveal a framed photo
  and description right inside the building frame; opening one closes
  whichever was open, like a normal accordion. Built with plain
  `<button>`s and `aria-expanded`/`role="region"`, and closed panels are
  marked `inert` so keyboard/screen-reader users can't tab into content
  that's visually collapsed. Main Bar is open by default so the building
  isn't empty on load.
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
- **Reviews section** — two real, attributed quotes pulled from public
  TripAdvisor reviews (linked back to the source), plus a factual note
  on TripAdvisor ranking. See "Reviews research" below for what I could
  and couldn't verify.
- **Labrinth sister-venue badge** next to the logo (header on desktop,
  bottom of the menu on mobile) — links to `#` until there's a real URL.
- **Illustrated placeholder scenes** (crowd/DJ booth/VIP table under
  stage lights) replacing the earlier abstract gradient boxes — still
  illustration, not photography (no real photo source is reachable from
  this dev environment), but closer to "a nightclub." Swap for real
  photos any time, same filenames.
- **Interaction details**: small dot cursor, magnetic buttons with press
  feedback, a cursor-follow spotlight highlight on floor/experience/
  resident/review/gallery cards, hero scroll parallax plus a slow ambient
  glow drifting behind it, hover tilt on floor/experience images, amber
  shimmer headline text, ticket-stub scalloped section edges, a subtle
  halftone accent, and two gallery photos with a rotated polaroid/tape
  treatment. All respect `prefers-reduced-motion` and are disabled on
  touch/coarse-pointer devices.
- **Framed-photo treatment** — floor, experience, resident and gallery
  images sit in a double-bezel frame (a warm gradient inset border around
  each photo) instead of a flat crop, so every "photograph" on the page
  reads as mounted rather than just an `<img>` dropped on the page.

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
  `assets/images/` (warm amber/plum gradient scenes standing in for real
  venue photography). Replace each file with the real photo **using the
  same filename** — no markup changes needed.
- **Social links** — Facebook/Instagram/X icons in the footer link to `#`.
  Update the `href`s in `index.html` once you have the real profile URLs.

## Content that needs confirming before launch

Everything below reads confidently on the page but is an assumption or
industry-standard placeholder, not confirmed fact — check and edit before
this goes live:

- **Opening hours and age policy** in the Door Policy strip — generic/
  typical for a UK nightclub, not sourced from the venue. (Dress code is
  confirmed: there isn't one, already reflected across the ticker, Door
  Policy strip, and FAQ.) Per-floor capacity numbers were dropped rather
  than displaying an invented figure.
- **FAQ answers** — sensible generic answers, not venue-confirmed.
- **Resident/lineup section** — deliberately uses role labels ("Main
  Bar Resident") instead of inventing real DJ names or using stock
  photos as if they were real people.
- Floor descriptions and the "Above The Forbidden Florist" locator line
  are written from what was described in chat.
- **The Forbidden Florist panel in the building** — kept deliberately
  thin: it states the one confirmed fact (ground floor, separate
  restaurant, not run by Eddie's) and nothing else. No cuisine, hours or
  menu details are invented for someone else's business. If you want
  more said about it there, send over what's actually true.
- **"Upcoming Events"** ships with an honest empty state rather than
  fabricated events, since there's no real events data to work from.

## Reviews research (and what I couldn't confirm)

Searched for real public information about Eddie Rocks/"Eddies Haverfordwest"
to add a genuine Reviews section and any certificates. Direct fetches of
Google/TripAdvisor/gov.uk pages are blocked in this environment, so this is
from search snippets only — treat it as a starting point, not verified fact:

- **Real and used on the site**: Eddie Rocks/"Eddies Haverfordwest" is
  listed on [TripAdvisor](https://www.tripadvisor.co.uk/Attraction_Review-g552047-d5915191-Reviews-Eddies_Haverfordwest-Haverfordwest_Pembrokeshire_Wales.html)
  with 11 reviews, ranked #3 of 4 nightlife venues in Haverfordwest. Two
  positive quotes found there are used in the new Reviews section, both
  linked back to the source.
- **No numeric star rating shown on the site, deliberately.** Search
  results gave conflicting signals (one summary said "5 stars on
  reviews.co.uk," another said "Google users haven't given this place a
  high rating"), and I can't verify either figure directly — displaying a
  wrong rating on your own site would be worse than showing none. If you
  can pull the actual current number from your Google Business Profile or
  TripAdvisor dashboard, send it over and I'll add it properly (ideally as
  a live widget rather than a hardcoded number, so it doesn't go stale).
- **Certificates: none found, none added.** No confirmed Best Bar None,
  Purple Flag, SIA, or similar nightlife accreditation turned up in
  search. There's a UK Food Hygiene Rating Scheme listing under the name
  "Eddies" (ratings.food.gov.uk/business/444083), which is a genuine
  government inspection certificate many venues display — but the page
  itself is unreachable from here, so I don't have the actual score. If
  you have the certificate (it's usually a sticker near the entrance) or
  know the number, tell me and I'll add it properly.
- **Worth flagging**: some low-quality directory/aggregator sites
  (Yelp, evendo.com) describe the venue as having a snooker bar and a
  third room called "Fever." That contradicts what you told me directly
  (two floors — Main Bar and RnB Bar, ground floor is the separate
  Forbidden Florist business), so I did not use it. Likely just stale or
  wrong listing data, but flagging in case it's not.
- Also confirmed: mixed/negative reviews exist too (complaints about
  music, drink prices, and a £5 entry charge). Not used on the site —
  showcasing only positive testimonials is normal practice — but worth
  knowing they're out there publicly.

## Fonts

Anton, Cormorant Garamond and Public Sans are self-hosted in
`assets/fonts/` (SIL Open Font License, see the `LICENSE-*.txt` files
alongside them), pulled in via `@font-face` in `css/styles.css`. No
external font requests.

## Colour

Velvet Ember lives entirely as CSS custom properties at the top of
`css/styles.css` (`--charcoal`, `--panel`, `--silver*`, `--white`,
`--dim` — names are carried over from the earlier direction but now hold
warm plum/amber/cream values). Changing the palette again only means
editing that `:root` block plus the handful of hardcoded shadow-tint
`rgba()` values called out in a comment nearby, and regenerating the
illustration SVGs in `assets/images/` with matching tones.
