# Snippers Hairdressers, Haverfordwest

A one-page website for Snippers, 57 Portfield, Haverfordwest. It's static HTML, CSS and JS with no build step, in the same setup as `bambo/`.

```
cd snippers && python3 -m http.server 8000   # then open http://localhost:8000
```

## Creative concept: the strand and the snip

The name says what a hairdresser does, so the identity is built from two marks:

- **The strand.** Fine copper hairlines run through the page: section rules, the scroll-progress line under the nav, the curve behind "Your visit", and the single strand that runs down into the booking section.
- **The snip.** One shared diagonal cut.
  - The **wordmark** is set twice and clipped along it. The halves slip apart when the page opens and keep separating as you scroll away from the hero.
  - **Section edges, image frames and buttons** (with a snipped corner) all lean on the same angle.
  - **At the booking section,** a pair of shears closes on the strand and the loose end falls away, leaving the phone number.

The hero layers the wordmark around the photograph. The top half of SNIPPERS sits in front of the image and the bottom half slides behind it, so the cut reads as depth.

### Design system

| Token | Value | Use |
|---|---|---|
| `--ink` | `#120e0b` | Warm black, main background |
| `--bone` | `#efe8dc` | Warm paper for light sections and text on ink |
| `--copper` / `--copper-hi` | `#c8662f` / `#e0844a` | The colour of lifted hair: italics, CTAs, strands |
| `--copper-deep` | `#9a4320` | Copper for small text on bone (5.4:1) |
| `--ash` / `--ash-deep` | `#a89f91` / `#655c51` | Quiet text on ink / on bone |

- **Type.** Bodoni Moda for display; its hairline serifs echo single strands, and the italic carries the emphasis. Schibsted Grotesk for body and UI. Both are self-hosted (OFL, `assets/fonts/`).
- **Colour.** No real signage or brand colours could be verified (see below), so the palette comes from hair colour itself: dark roots, copper lift, toned blonde, ash. If the salon has brand colours, swap the tokens at the top of `css/snippers.css`.

### Motion

- **Opening curtain** (about 1.2s, first visit per session only; any click, key, scroll or tap skips it). The wordmark appears, a copper line crosses it, and the screen is snipped open along the diagonal.
- **Hero.** The wordmark halves rise in, the photo unclips upward, the headline lines rise from masks, then a blade runs along the cut and the halves part. The photo shifts slightly with the pointer, and the wordmark keeps separating as you scroll away.
- **The salon.** The statement fills in word by word as it scrolls past. The two images unclip and drift at different speeds.
- **Services.** On desktop a sticky frame wipes to each service's image as you read down the list. On mobile each service carries its own image.
- **Colour story** (the pinned moment, desktop only, about 1.6 screens long). A marker walks a swatch from box-dye black to toned blonde. Each stage lights up and the section's background warms with it. On mobile it's a static swatch with the four stages in a grid.
- **Your visit.** A copper strand draws itself behind layered images.
- **Gallery.** An editorial layout with gentle depth. On fine pointers there's a "View" cursor and a pointer-led crop. The lightbox works with arrow keys, swipe and Escape. On mobile the gallery becomes a swipe strip.
- **Why Snippers.** Oversized words drift against each other, and a small pair of scissors runs along each dividing rule.
- **Book.** The strand is snipped, as described above.
- **Footer.** The wordmark comes apart as the page ends.

Buttons fill on a diagonal, links draw their underline, and the menu toggle is two blades that cross into an X.

`prefers-reduced-motion` switches all of this off. The curtain and pin are skipped and everything shows in its final state. GSAP + ScrollTrigger (`assets/vendor/`, 3.13) drive only the scrubbed scroll effects. If they fail to load, the page is still complete.

## Research: what's verified and what isn't

The research was done by web search. Facebook, Google Maps and the directory pages themselves couldn't be opened from the build environment, so **someone should check the items below against the live Facebook page or with the salon.**

### Verified (consistent across several independent listings) and used

- Name **Snippers** (Facebook: "Snippers Hairdressing Salons")
- **57 Portfield, Haverfordwest SA61 1BS**
- **01437 762114**
- Facebook page: https://www.facebook.com/p/Snippers-Hairdressing-Salons-100063592809616/
- **Booking is by phone.** Fresha lists the salon as "Call to book", and no online booking system was found.

### From directory listings: used, but please confirm

Sources: Fresha, Secret Salons, beautynailhairsalons.com.

| Item on the site | Where it came from | Status |
|---|---|---|
| Women's, men's and children's cuts | Fresha, Secret Salons | likely |
| Colour, balayage | Fresha, Secret Salons | likely |
| Colour correction (lifting home box dye to softer blonde) | 2026 posts shown on an aggregator of the salon's Facebook | likely, confirm |
| Blow-dries and styling | Fresha, Secret Salons | likely |
| Wedding and occasion hair (`data-confirm="true"`) | Secret Salons | **confirm** |
| Keratin treatments and extensions (`data-confirm="true"`) | Fresha category tags | **confirm** |

### Deliberately left out

- **Opening hours.** Three listings disagree: Fresha has Mon 9–4 and Tue–Fri 9–5:30; Cylex has weekdays 9–5:30 and Sat 9–3; another directory differs again. The site asks people to call. Once the hours are confirmed, add them in `js/config.js`; they render automatically.
- **Prices.** None found. The site says the salon quotes when you call.
- **Staff names.** "Sarah" and "Melanie" appear only in an AI-written directory summary, so they're not used.
- **Reviews and ratings.** Too few, and inconsistent across platforms. No testimonials, stats or ratings are shown or added to structured data.
- **A second salon.** Snippers Salon Ltd at 47 Waterloo Road, Hakin, Milford Haven (01646 696944) may be connected: the Facebook page is "Salons", plural, and one listing shows that number. This wasn't verified. If it's the same business, it could get its own block in the Book section.
- **Signage, logo and interior.** No real photographs could be retrieved.

## Photography: all temporary

**No real Snippers photographs could be downloaded**: Facebook, Google Maps and image hosts were blocked. Rather than use stock photos or another salon's work, every image is a **generated hair study** made for this site. `tools/strands.html` draws thousands of strands that share waves, clump into locks and catch a sheen band where their slope meets the light; some end in a clean blunt cut. They're art-directed in the same palette, and the gallery says plainly that they're studies, linking to Facebook for real work.

Replace these with real photos of the salon and its work as soon as they're available:

| File | Used in | Ideal replacement |
|---|---|---|
| `hero` | Hero, gallery 01, OG image | Strong close-up of real client hair, or the salon interior (portrait 4:5) |
| `cut`, `colour` | The salon section | A cut in progress; a colour result (4:5) |
| `cut`, `short`, `colour`, `lift`, `blowdry`, `occasion`, `auburnfall` | Services 01–07 | One real photo per service (4:5) |
| `liftwide` | Colour story swatch | Can stay: it illustrates the lightening stages, not client work |
| `inkwave`, `g_blondecut` | Your visit | Shopfront on Portfield; the inside of the salon |
| `hero`, `g_copperwide`, `g_blondecut`, `occasion`, `inkwave`, `g_curlsdark`, `blowdry` | Gallery 01–07 | Real client work, **with the clients' permission** |

To swap one, save the photo as `photos/rendered/<name>.jpg`, run `python3 tools/encode.py <name>`, then update the caption and `alt` text in `index.html`. Delete the generated PNG of the same name first. Re-render the studies with `node tools/render-strands.mjs [names…]`.

The social image (`assets/img/og.jpg`) and icons are made by `node tools/og/shoot.mjs`.

## Files

```
index.html            the page (semantic sections, JSON-LD with verified facts only)
css/snippers.css      design tokens, components, responsive rules, reduced motion
js/config.js          opening hours and map embed: edit here, not in the page
js/main.js            curtain, nav, menu, reveals, services, lightbox, map, GSAP scenes
assets/               fonts, GSAP, images, icons
tools/                strand renderer, image encoder, OG/icon renderer
```

## Checked

The site was run locally and inspected in Chromium (Playwright) at 320, 375, 390, 768, 1280, 1440 and 1920px wide:

- No console errors and no horizontal overflow.
- The curtain plays once, can be skipped, and removes itself.
- The mobile menu opens and closes, traps focus (the page behind is inert), closes on Escape and closes after a link is tapped.
- Every phone link is `tel:+441437762114`.
- "Get directions" opens Google Maps directions to 57 Portfield.
- Facebook links are correct.
- The lightbox opens, steps with the arrow keys, closes on Escape and returns focus.
- The map embed loads only when asked.
- Under reduced motion there's no curtain and no pin, and everything is visible.

**Not tested:** real iOS Safari and Android devices; whether the Google Maps embed and the Facebook links resolve from a normal network (both hosts were blocked here); screen-reader pass-throughs beyond the semantics.

## Before publishing

1. Confirm the services marked `data-confirm` and the colour-correction copy with the salon.
2. Get opening hours from the salon and add them to `js/config.js`.
3. Replace the generated images with real photos, using the table above.
4. Choose a domain. Then add `<link rel="canonical">`, absolute `og:url` and `og:image` URLs, and `"url"` in the JSON-LD, and add a `sitemap.xml`.
5. Check the copy with the owner. It's written in the salon's voice ("we", "give us a ring"), but every line should sound like them.
6. Make sure the Google Business Profile shows the same name, address and phone number as the site. That consistency helps local search. It can't guarantee rankings.
7. Deploy, for example on Vercel with `snippers/` as the project root. `vercel.json` sets asset caching.
