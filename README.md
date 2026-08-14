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

- **Always opens at the top.** A small inline script in `<head>` handles
  two separate causes of landing mid-page: `history.scrollRestoration =
  "manual"` stops the browser restoring a remembered scroll position on
  refresh or back/forward navigation, and — since the URL keeps whatever
  `#section` hash was last clicked (e.g. after visiting `#gallery`), the
  browser will otherwise auto-scroll straight to that section on the next
  load — the script also strips the hash from the URL via
  `history.replaceState` before the browser can act on it, plus a few
  staggered `scrollTo(0,0)` calls (on `DOMContentLoaded`, `load`, and a
  handful of short timeouts) to catch that auto-scroll even if it fires
  asynchronously after slower-loading resources. Stress-tested by loading
  the page with a `#section` hash repeatedly; it now lands at the top
  every time. Clicking a nav link to jump to a section after the page has
  already loaded is unaffected and still scrolls normally.
- **No separate "About" section.** There used to be a stat-strip section
  right after the hero ("Two/Three floors. One reputation." plus a
  reputation/layout/address stat list) that mostly repeated what the
  hero copy already says. Removed it entirely — the merged hero line
  carries that content on its own now — and repointed the nav item that
  used to link to it (`#about`) to `#floors` ("The Building") instead,
  across the primary nav, mobile drawer and footer.
- **Utility ticker** — a thin marquee above the header with opening days,
  entry fee, hours, dress code and ID policy (a pattern real venue sites
  use to answer the most common questions before a visitor even scrolls).
  Open Wednesday, Friday and Saturday: Wednesday and Friday are free
  entry, 9pm–2am; Saturday is 9pm–late with an entry fee that varies by
  the night. Same facts are in the FAQ's first two questions.
- **Live doors-open countdown** — genuinely computed in JS
  (`nextDoorsOpen` in `js/main.js`) to the next Wednesday, Friday or
  Saturday 9pm, not a fabricated one-off event. Lives as a compact, non-scrolling
  segment inside the utility ticker bar (days/hours/mins, no seconds —
  a persistent header element re-rendering every second was too twitchy)
  rather than as a boxed card in the hero.
- **Lineup / Residents section** and **Experience section** ("Three ways
  to spend the night") are both horizontal scroll-snap strips now
  instead of a grid that forced everything to stack tall on narrower
  screens — cards are fixed-width, swipeable, edge-masked with a fade,
  and centred within the normal content column on wide viewports.
- **A literal illustrated building** — the old side-by-side floor panels
  are now an actual building facade, drawn in CSS: a cornice cap, three
  storeys, and a foundation strip labelled "Quay Street." Each storey is
  a clickable floor: the top two (RnB Bar, Main Bar) are rows of lit
  windows that brighten further on hover/open; the ground floor is a
  striped shopfront awning over an arched doorway for The Forbidden
  Florist — same business, same building, just a different room, styled
  differently because it's a different kind of space, not because it's
  someone else's. Clicking a floor opens with a smooth height animation
  (CSS grid `0fr → 1fr`, not a JS-measured height) to reveal a framed
  photo and description right inside the building frame; opening one
  closes whichever was open, like a normal accordion. Built with plain
  `<button>`s and `aria-expanded`/`role="region"`, and closed panels are
  marked `inert` so keyboard/screen-reader users can't tab into content
  that's visually collapsed. All three floors start closed on load (was
  Main Bar open by default; changed since it looked like it was stuck
  open every time you visited). Opening a floor now zooms and focus-pulls into
  view (a scale + blur transition on the panel content on top of the
  height reveal), the building's own scroll-entrance is a slower
  cinematic scale+fade instead of the standard section fade so arriving
  at it from the hero feels like one deliberate move, the hard border
  between floors is now a soft inset shadow so the storeys read as one
  connected structure, and the RnB Bar and Main Bar windows get
  randomized flickering disco-light beams (colour/timing generated fresh
  in JS on every load, skipped entirely rather than just frozen under
  `prefers-reduced-motion`). All three opened-panel photos are now real
  (see "Swapping in the real logo and photos" below) rather than the
  generated illustrations they started as — the illustrated versions
  (golden birdcage/shrubs/birds for the Florist, a retro neon "RnB" sign
  for the RnB Bar) live on only as small hover decorations on the closed
  building facade, described next. Those facade decorations aren't just
  static illustrations, either — the birdcage and neon sign are drawn as
  inline SVG directly on the closed floor button itself (separate from
  the opened-panel photo), and react to hover: hovering The Forbidden
  Florist swings the cage door open and sends the bird flying up and off
  the top of the building, fading out as it goes; hovering the RnB floor
  lights the neon sign up from a dim, barely-there outline to a full
  glowing "RnB" with a subtle flicker. Both are gated behind
  `@media (hover:hover) and (pointer:fine)` so only real mouse/trackpad
  input can trigger them — on touch, tapping still opens the floor panel
  as normal, it just skips the decorative animation with no risk of it
  getting visually "stuck" lit/open from a lingering touch — and collapse
  to an instant state change under `prefers-reduced-motion` along with
  everything else on the page.
- **FAQ** — a native `<details>/<summary>` accordion (no JS needed for
  the disclosure itself), covering booking, age, dress code, private hire
  and parking.
- **Newsletter signup** in the footer — the front-end flow (validation +
  a client-side "you're on the list" confirmation) is built; **it isn't
  wired to a real email provider**. Hook it up to Mailchimp/Klaviyo/etc.
  before relying on it to actually collect addresses.
- **Sticky "Enquire" bar** on mobile only, with a one-tap call button
  (was "Reserve a Table" — dropped that wording sitewide).
- **Mobile menu** is a full-height slide-in drawer (not a dropdown) with a
  blurred backdrop, numbered links that cascade in on open, and a footer
  with the sister-venue badge and contact details. Closes on a link click,
  backdrop click, or Escape; marked `inert` while closed so it can't be
  tabbed into, and locks background scroll while open.
- **A light 3D tilt on scroll-reveal** — sections settle in with a small
  `perspective`/`rotateX` lean on top of the usual fade-up, instead of a
  flat slide. Kept deliberately subtle; the building's own entrance is a
  slightly more pronounced version since it's the first thing after the
  hero.
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
- **Photos** — every image still points at a generated placeholder SVG in
  `assets/images/` (warm amber/plum gradient scenes standing in for real
  venue photography), **except the hero background**, which is now a
  real photo (`assets/images/hero.jpg`, a crowd and DJ shot). It's a
  small source file (516×224), so it's stretched full-bleed behind a
  dark scrim and the page's grain overlay — both were already there for
  the placeholder gradients, and they happen to hide the low resolution
  well, but a higher-resolution version would look sharper if one's
  available. All three building-panel photos are now real too:
  `assets/images/floor-florist.jpg` (the floral-draped bar under string
  lights, alongside its actual logo at `assets/images/florist-logo.jpg`
  shown as a small badge above the panel copy), `assets/images/
  floor-main.jpg` (a packed Main Bar dancefloor) and `assets/images/
  floor-rnb.jpg` (the DJ booth on the RnB floor, hands up under green
  lights). All three cards in the Experience section are real too now
  (`assets/images/feature-showcase-events.jpg`, a DJ on the decks under
  stage lights and smoke; `assets/images/feature-vip-nights.jpg`,
  premium bottles lined up along the bar; and `assets/images/
  feature-private-hire.jpg`, a card payment terminal on the bar). Every
  other placeholder can be replaced the same way: drop the real photo in
  **using the same filename** — no markup changes needed for the SVG
  ones; anything already swapped to a real photo is a `.jpg`, so replace
  that file directly. As a standing rule for this project: whenever a
  placeholder is replaced, the old placeholder file gets deleted rather
  than left unused in the repo (that's why `hero.svg`,
  `floor-florist.svg`, `floor-main.svg`, `floor-rnb.svg`,
  `feature-showcase-events.svg`, `feature-vip-nights.svg` and
  `feature-private-hire.svg` are all gone).
- **Social links** — Facebook/Instagram/X icons in the footer link to `#`.
  Update the `href`s in `index.html` once you have the real profile URLs.

## Content that needs confirming before launch

Everything below reads confidently on the page but is an assumption or
industry-standard placeholder, not confirmed fact — check and edit before
this goes live:

- **Opening days, hours and entry fee** — confirmed directly: open
  Wednesday, Friday and Saturday; Wednesday and Friday are free entry,
  9pm–2am; Saturday is 9pm–late with an entry fee that varies by the
  night. Reflected in the ticker, the FAQ's first two questions, and the
  live countdown. **Age policy is still generic/typical for a UK
  nightclub (18+, photo ID), not venue-confirmed.** (Dress code is
  confirmed: there isn't one, reflected in the ticker and FAQ.) There
  used to be a dedicated Door Policy grid repeating age/dress-code/hours/
  entry; it's been removed as redundant with the ticker and FAQ, which
  already cover the same ground. Per-floor capacity numbers were dropped
  rather than displaying an invented figure.
- **FAQ answers** — opening days/hours and entry fee (questions 1–2) are
  venue-confirmed; the rest (booking, age, dress code, private hire,
  parking) are sensible generic answers, not venue-confirmed.
- **Resident/lineup section** — deliberately uses role labels ("Main
  Bar Resident") instead of inventing real DJ names or using stock
  photos as if they were real people.
- Floor descriptions and the "Above The Forbidden Florist" locator line
  are written from what was described in chat.
- **The Forbidden Florist panel in the building** — now has a real photo
  and the real logo, but the copy itself is still kept deliberately thin,
  describing it as the same business under one roof (confirmed directly)
  without inventing cuisine, hours or menu details that weren't given. If
  you want more said about it there, send over what's actually true.
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
  third room called "Fever." I didn't use it — the naming doesn't match
  anything you've told me — but now that it's confirmed there are three
  floors under one roof rather than two, it's at least plausible that
  "Fever" is a stale or renamed reference to one of them rather than
  pure aggregator noise. Worth a look if you want to chase it down, not
  used on the site either way.
- A separate search also surfaced real eddies.co page titles describing
  the venue with a "Gold Room" and "Main Clubroom" rather than "Main
  Bar"/"RnB Bar." I kept the names you've given me directly throughout
  this project rather than switching to search-snippet names, but
  flagging it in case your naming has changed and you want the site
  updated to match.
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
