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
signup) plus handmade graphic details (halftone texture, lit-glass
windows on the illustrated facade) so it doesn't read as a single
generic template.

## Preview locally

No build step — plain HTML/CSS/JS.

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## What's on the page now

Beyond the original hero/floors/contact, this pass adds:

- **Always opens at the top.** A small inline script in `<head>` handles
  two separate causes of landing mid-page: `history.scrollRestoration =
  "manual"` stops the browser restoring a remembered scroll position on
  refresh or back/forward navigation, and — since the URL keeps whatever
  `#section` hash was last clicked (e.g. after visiting `#floors`), the
  browser will otherwise auto-scroll straight to that section on the next
  load — the script also strips the hash from the URL via
  `history.replaceState` before the browser can act on it, plus a few
  staggered `scrollTo(0,0)` calls (on `DOMContentLoaded`, `load`, and a
  handful of short timeouts) to catch that auto-scroll even if it fires
  asynchronously after slower-loading resources. Stress-tested by loading
  the page with a `#section` hash repeatedly; it now lands at the top
  every time. Clicking a nav link to jump to a section after the page has
  already loaded is unaffected and still scrolls normally.
  **Found and fixed a real bug in this while testing something unrelated:**
  the repeated top-lock retries run for up to 1.2s after load, and the
  first version reasserted scroll-position-0 on that schedule
  unconditionally — so a visitor who started scrolling, clicking a nav
  link, or pressing an arrow key/spacebar within that 1.2s window would
  get yanked back to the top mid-scroll. Now the first wheel/touch/click/
  scroll-key input flips a flag that cancels every remaining retry, so
  the top-lock only ever fights the browser's own hash-scroll, never a
  real visitor. Verified: scrolling, and separately clicking a nav link,
  at several points inside that window (50ms/300ms/400ms/800ms/1100ms
  after load) all now stick, while the hash-load fix still lands at the
  top every time across repeated tests.
- **Labrinth's hero is the venue's own footage**, same treatment as Eddie
  Rocks. Cut from a 7-second recording the client supplied, using the first
  4 seconds — the packed crowd under the arched ceiling — and stopping
  before the red DJ segment and the black tail the clip ends on.
  Encoded to `assets/video/labrinth-loop.mp4|.webm` (1440x810 landscape band
  cropped out of the portrait original) and `labrinth-loop-portrait.*`
  (636x848 for phones), both dropped from 60fps to 30 since it is a
  background loop, with `labrinth-room.jpg` / `labrinth-room-portrait.jpg`
  as posters and as the whole hero under `prefers-reduced-motion`.
  The grade cools the shadows toward the page's ink base while leaving the
  room's magenta and violet in the highlights — a teal/magenta split rather
  than fighting the actual lighting, so the jade UI reads as deliberate
  against it. The drawn maze motif is gone: it stood in for footage that
  now exists.
  `main.js` drives both heroes; it picks the cut per viewport from the same
  `data-webm-*`/`data-mp4-*` attributes, and its hero query now matches
  `.hero, .lab-hero` with the `#hero-content` parallax null-guarded, since
  only the footage layer is shared between the two venues.
- **Two venues, one switcher, two sites.** Labrinth used to be a passive
  "Also by Eddie's: Labrinth" badge — on desktop beside the logo, and again
  down in the mobile drawer's footer, linked to `#`. It's now an actual
  venue switch sitting next to the wordmark at every width (the drawer copy
  is gone), with the current venue lit and underlined in that venue's own
  accent. Labrinth is a **separate page** (`labrinth.html`), not a section
  of this one, because the two are different places that happen to share an
  owner.
  `labrinth.html` reuses the same stylesheet, type system and craft (grain,
  dot cursor, magnetic buttons) but overrides the palette tokens under
  `:root.theme-labrinth` — Eddie's warm copper/aubergine swaps for a cold
  ink-and-jade register, so arriving there reads as a different room rather
  than another page. Only the tokens change, so every existing component
  follows automatically. Its one owned motif is a maze path that draws
  itself on arrival, which is the name made visual rather than decoration.
  `js/main.js` is shared by both pages, so the header and drawer blocks are
  now null-guarded — Labrinth has a header and footer but no drawer, hero
  video, building or countdown.
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
- **The Residents / "Who's playing where" section was cut.** Three
  unnamed residents ("Main Bar Resident", "RnB Bar Resident", "Guest
  Selectors") with invented one-line bios was placeholder content
  wearing a section heading — the single clearest "AI-generated site"
  tell after the fake gallery. The who-plays-what information it carried
  now lives where people actually look for it: a `.level-meta` list
  inside each floor panel ("On the decks" / "Nights"). The `#residents`
  entries were removed from the mobile drawer and footer nav with it.
- **The Experience section is an editorial run, not three cards.**
  "Three ways to spend the night" was three equal-width cards, each
  wearing a category badge *and* a numbered index *and* an eyebrow —
  decoration carrying no information. It's now three alternating
  full-width rows (photo left/right, copy opposite), each led by a real
  photograph of the actual room, with the number reduced to a small
  Anton label. Rows reveal from the side their photo sits on, so the
  alternation reads in the motion too.
- **The building is where 3D actually earns its place.** The facade now
  sits on a `perspective` and tips through about ±4.5° as it travels
  through the viewport (`--facade-tilt`, driven from `main.js`), so three
  stacked rows read as a building you're looking up at rather than three
  bars. Deliberately small — it should be felt, not spotted. The windows
  were the weakest craft on the page (flat brown blocks that read as a
  chocolate bar); they're now lit glass — a hot near-white core falling
  to copper, thin glazing bars, and two layers of glow bleeding onto the
  brickwork — with an irregular `nth-child(3n)/(7n)/(4n)` scatter of dark
  and half-lit panes so the facade stops reading as a grid.
- **Sticky mobile CTA only appears once the hero is behind you.** It was
  a permanent full-width gradient slab pinned across the bottom of every
  screen including the first one. It's now a floating inset pill bar that
  slides up on scroll past the hero, which also let `body` drop from
  `padding-bottom:74px` to `16px`.
- **One vertical rhythm for the whole page.** Every section had picked
  its own padding (40/56/64/72px). They all now use a single
  `--section-y: clamp(64px, 8vw, 116px)`, so the page breathes
  consistently and scales properly on small screens. Anchor targets also
  got `scroll-margin-top` — section headings were previously being
  clipped underneath the sticky header on every in-page nav click.
- **The building is a real 3D scene now.** "One building, three floors" was
  the strongest idea on the site and the weakest execution — a flat facade
  built out of divs that read as clip art. It's now a stylised miniature of
  the venue modelled in Three.js (`js/building3d.js`), with a scroll-driven
  camera that flies in through a window and travels down through the floors.
  - **Structure.** The section is a tall `.venue-scroller` holding a sticky
    full-height `.venue-stage`; scroll distance through the scroller is the
    only input to the camera. Copy panels swap per stage, so the writing and
    the camera never disagree.
  - **The journey.** Exterior three-quarter orbit → in through the top-floor
    centre window → RnB Bar → down to the Main Bar → down to the Florist →
    back out onto the street. Thirteen keyframes interpolated with a
    smoothstep. The centre window on each upper storey is left genuinely
    unglazed rather than faded out, because that is the opening the camera
    actually passes through.
  - **Three different rooms, not three tinted boxes.** The Florist has warm
    festoon lights, a hanging canopy of blooms, planting and café tables; the
    Main Bar has a DJ booth, speaker stacks with visible drivers, a lit
    dancefloor and four sweeping spotlights; the RnB Bar is darker and
    magenta, built around a back-lit bar and booth seating.
  - **Interaction.** On a pointer-fine device, raycasting against three
    invisible slabs lights the hovered floor and names it in a readout that
    follows the cursor. The floor picker works by scrolling the page to the
    right point in the sequence rather than moving the camera directly, so
    the camera and the scrollbar can never disagree.
- **What that 3D cost, and what was done about it.** The scene ships with no
  shadow maps and no post-processing — both are the expensive parts of a
  Three.js page, and the glow is faked with additive sprites instead.
  Measured draw calls came in at 160/frame on the first pass; instancing the
  crowd (35 figures across three floors, previously two meshes each) brought
  that to 114. Pixel ratio is capped, antialiasing is off on mobile, particle
  and haze counts are halved there, the render loop is gated by an
  `IntersectionObserver`, and scroll damping is exponential in real time
  rather than per-frame so the camera doesn't lag behind the scrollbar on a
  slow device.
  **Dependency**: Three.js r160, self-hosted at
  `assets/vendor/three.module.min.js` (MIT, licence kept alongside it),
  fetched with `npm pack` — no CDN, no bundler, no `node_modules`.
- **The illustrated facade is now the fallback, not the main event.** It is
  still in the page, unchanged, inside `.venue-fallback`, and it is what gets
  shown when WebGL is unavailable, when `prefers-reduced-motion` is set, or
  when JS is off. In those cases `building3d.js` returns before it creates a
  renderer, so nothing is downloaded or initialised. It keeps its accordion,
  its real room photos and its floor-by-floor detail, so no content is lost
  on that path.
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
  with the venue's contact details. Closes on a link click,
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
- **No gallery section.** There was one ("Inside / The rooms, on a night
  that ran") — four real venue photographs in an asymmetric picture edit.
  It has been removed at the client's request, along with its four derived
  crops (`gallery-decks/hands/crowd/florist.jpg`) and the lightbox that
  only ever served it. The rooms are still shown: the 3D building takes you
  into all three, and the Experience section carries a photograph of each.
- **Interaction details**: small dot cursor, magnetic buttons with press
  feedback, a cursor-follow spotlight highlight on floor/experience/
  review cards, hero parallax (the type lifts and fades while the
  footage holds its ground, so the section reads as depth rather than one
  flat sheet), amber shimmer headline text and a subtle halftone accent.
  All respect `prefers-reduced-motion` and are disabled on touch/
  coarse-pointer devices.
- **3D tilt got a lot more pronounced**, and covers the building's floor
  photos as well as the Experience photos. Rotation range roughly tripled (was ±6°, now up
  to ±16°), it's smoothed with smoothing-lerp'd (spring-like easing via
  `requestAnimationFrame` rather than snapping straight to the cursor
  position), it lifts the photo slightly toward the viewer
  (`scale3d(1.035,...)`) at full tilt, and it casts a drop-shadow that
  shifts opposite the tilt direction so the light appears to come from a
  fixed source — the same technique real "premium tilt card" UI uses.
  Transform and the dynamic shadow are both set as inline styles from JS
  specifically so they can't fight the existing per-element `box-shadow`
  CSS rules on those card types.
- **Framed-photo treatment** — the building's floor photos still sit in a
  double-bezel frame (a warm gradient inset border) so they read as
  mounted prints inside the panel. The Experience photographs deliberately
  dropped the bezel in this pass: at the size they run now,
  a frame around them reads as a widget, and the picture is stronger
  bleeding to its own edge.

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
- **Hero background is the venue's own footage again.** The WebGL 3D
  scene from the previous pass (a metallic torus knot, Three.js r160) has
  been removed entirely — `js/hero3d.js` and
  `assets/vendor/three.module.min.js` are deleted and the project has no
  third-party JS dependency again. An abstract sculpture said "agency
  template", not "nightclub in Haverfordwest", and the brief for this
  pass was explicitly to use 3D only where it tells a story. It doesn't
  here; it does on the building (below).
  The hero now plays a graded 8-second cut of the real strobing
  crowd footage, built with ffmpeg from `assets/video/hero.mp4`:
  - `assets/video/hero-loop.mp4|.webm` — 1440×810 landscape band,
    cropped out of the portrait original so wide screens don't get a
    hard `object-fit` zoom.
  - `assets/video/hero-loop-portrait.mp4|.webm` — 640×888, for phones.
    The source was shot vertically on a phone, so a portrait cut is the
    natural fit; the landscape one cover-fits into a tall hero so
    aggressively that the room disappears.
  - `assets/images/hero-room.jpg` + `hero-room-portrait.jpg` — graded
    stills used as the `poster`, and as the whole hero for anyone with
    reduced motion or JS off.
  Sources are attached by `main.js` (not hard-coded `<source>` children)
  so the right cut is chosen per viewport and **nothing downloads at all**
  under `prefers-reduced-motion` — that path gets the still and never
  creates a source element. This matters more than usual here: the
  footage is a genuine strobe, and a full-screen strobe is a
  photosensitivity risk, not just a motion preference.
  The grade also deliberately compresses the highlights (ffmpeg `curves`
  capping white around 0.64) — ungraded, the flashes blew the entire hero
  to near-white, which both wrecked text contrast and made the strobe
  far harsher than it should be. Measured in-browser across a full loop,
  the rendered hero now swings roughly 26→101 mean luminance instead of
  33→190: the flash still reads clearly, it just no longer whites out.
- **The hero layout was rebuilt around the footage.** Display type is
  much larger (`clamp(58px, 11.5vw, 148px)`, line-height .86) and
  bottom-weighted rather than vertically centred, the second line takes
  the copper as emphasis **in the same Anton face** rather than borrowing
  a different family, and a `<dl>` rail along the bottom edge carries the
  practical facts (floors / doors / entry) where a club poster would put
  them. The old `.hero-disco`, `.hero-ambient`, `.hero-letterbox` and
  `.hero-scrim` layers are gone, replaced by two overlays that exist only
  to keep type legible over moving footage.
- **Animations sped up across the board** — the whole site read as
  sluggish. Cut roughly a third to half off the major durations:
  scroll-reveal fade (.6s→.4s), the building's entrance (.85s→.55s),
  card hover lifts and image zooms, the floor-panel open/close
  animation, the birdcage door/bird and neon-sign hover effects, the
  mobile-menu slide and its item cascade, and the slower ambient loops
  (headline shimmer 8s→4.5s, ticker marquee 24s→16s, disco beams and
  the RnB neon flicker). Nothing here changes
  *what* animates, only how quickly it gets there — the intent was
  energy, not different motion.
- **Photos are all real venue photography now.** The generated
  placeholder SVGs are gone: `gallery-1.svg` … `gallery-6.svg` and
  `resident-guest.svg` are deleted, and with them the last fabricated
  "photos" on the site. Everything on the page is cut from four genuine
  photographs the venue provided — the packed Main Bar, the RnB Bar DJ
  booth facing a room with its hands up, a close-up of raised hands, and
  The Forbidden Florist's floral bar.
  Derived crops live alongside their sources and are generated by a
  script (kept out of the repo; the crop boxes are recorded in the commit
  that added them): `hero-room*.jpg` and `exp-showcase/vip/private.jpg`.
  All of them run through
  one shared warm split-tone grade — shadows toward the aubergine
  `#2B1B24`, highlights toward the copper `#F6C9A0` — so the whole site
  reads as a single shoot rather than a folder of unrelated images. That
  grade also fixed a real clash: the old Experience photos were cold
  blue/cyan stock (one was a card payment terminal) sitting inside a warm
  copper palette.
  Two source files are kept in the repo despite not being referenced
  directly — `assets/images/resident-rnb.jpg` and the original
  `assets/video/hero.mp4|.webm`. They are masters, not placeholders:
  hero.mp4 is what both hero loops are cut from, and resident-rnb.jpg is
  real venue photography that happens to have no derivative on the page
  right now (its crop lived in the deleted gallery). Real venue material
  is never deleted, only generated placeholders are.
  The standing rule still holds: when a *placeholder* is replaced, the
  placeholder file gets deleted rather than left unused. Real venue
  material is never deleted.
- **Social links** — Facebook/Instagram/X icons in the footer link to `#`.
  Update the `href`s in `index.html` once you have the real profile URLs.

## Content that needs confirming before launch

Everything below reads confidently on the page but is an assumption or
industry-standard placeholder, not confirmed fact — check and edit before
this goes live:

- **Everything about Labrinth.** The page deliberately asserts almost
  nothing: no address, no opening nights, no door policy, no photography,
  no reviews. All that is known from this project is that it shares an
  owner with Eddie Rocks, so that is all the page claims. The wordmark is
  set in Anton as a stand-in — there is no Labrinth logo asset. The phone
  number and email on it are Eddie's own, presented as the office handling
  enquiries for both venues; if Labrinth has its own line, swap them.
  If Labrinth already has a live website, the switcher should point at that
  URL instead and `labrinth.html` can be deleted.

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
- **Who plays which floor** — the `.level-meta` lines in the floor panels
  ("RnB, hip-hop, slow-burners" / "House & dance, guest line-ups") are
  written from what was described in chat, not from a booking sheet.
  Deliberately no DJ names: role and genre only, so nothing invents a
  real person.
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
