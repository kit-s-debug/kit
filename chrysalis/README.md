# The Chrysalis Beautique: website

A static, single-page site for The Chrysalis Beautique, 15 Dew Street,
Haverfordwest. Plain HTML/CSS/JS (the same no-build approach as the other
sites in this repo), with GSAP + ScrollTrigger served from `js/vendor/` and
self-hosted fonts. No runtime calls to third-party CDNs.

## Run it locally

```
cd chrysalis
python3 -m http.server 8000
```

Open http://localhost:8000. There is no build step. Deploy the `chrysalis/`
folder as the site root (for Vercel, set the project root to `chrysalis`;
`vercel.json` sets cache headers).

## Creative concept: "Jade & Gilt"

*Chrysalis* comes from the Greek *chrysós*, gold. A real chrysalis is jade
green with a ring of gold dots where the change happens. The identity takes
that one detail and leaves the butterfly out:

- **Palette:** deep jade and green-black for the hero, menu, reviews and
  booking; warm ivory and pale celadon for the reading sections; gilt only as
  dots and the main button; a muted clay rose for warmth in headings.
- **Type:** Bodoni Moda (high-contrast didone, mostly italic) for display,
  Hanken Grotesk for text and UI.
- **Motif:** the "crown" (a row of 5–7 gilt dots) marks the wordmark, section
  labels, the booking close and the footer. The hero image sits in a
  chrysalis-shaped capsule with a single fine gilt outline.

## What's on the page

| Section | Notes |
|---|---|
| Navigation | Transparent over the hero; turns solid on scroll, hides when scrolling down and comes back when scrolling up. Marks the current section. Full-screen mobile menu with focus trap, Escape to close and focus return. |
| Hero | The capsule opens from a horizontal slit, the image settles from 1.45× zoom, "Chrysalis" arrives letter by letter, then the gilt dots appear one at a time (about 2s in total; nothing blocks the page). On scroll the capsule drifts and swells while the name slides away. |
| Our story | A paragraph that brightens word by word as you read it (scrubbed). Count-up facts. A team card for Rebecca James (monogram until a portrait arrives). |
| In focus | Three featured treatments (Brows, Lashes, Skin), each in a different layout. Each image opens from a close crop to the full plate as you scroll, and the title arrives letter by letter. |
| Treatment menu | Accessible tabs (arrow keys, Home/End) with a sliding gilt underline, plus an outline marquee that drifts with scroll. Every row has name, description, time, price and a Book/Call/Email action. Without JS, every category is listed. |
| The visit | A layered image composition with parallax at three depths, plus the verified amenities. |
| Reviews | Recurring themes from Treatwell reviews (no quotes, no names, no counts), linked to the source. |
| The work | Gallery driven by `js/gallery.js`, with a dense editorial grid and a `<dialog>` lightbox (arrow keys, Escape, focus return). **Ships empty on purpose**: until real photos are added, it shows a link to Facebook. |
| Booking | The closing scene: background scale, dots that spread from the centre, three honest steps ("nothing is booked until Treatwell confirms"), and phone/email guidance for treatments that need a conversation first. |
| Visit | Address, directions link, phone, email, Treatwell, Facebook, and opening hours with today highlighted (UK time). |
| Footer | A giant italic wordmark that tightens as you reach the end. |

`prefers-reduced-motion` turns the animation layer off completely (no
splitting, no scrubbing), and all content is visible without JavaScript.
A CSS failsafe reveals the hero if the scripts never load.

## Research: what was verified and where

The salon's own pages (Treatwell, mytreatwell, Facebook, the old ueni site)
were **blocked by this build environment's network policy**, so the facts
below come from web-search snapshots of those pages. Each needs a final
check against the live listings before launch.

| Fact used on the site | Source |
|---|---|
| 15 Dew Street, Haverfordwest, Pembrokeshire, SA61 1ST | Treatwell, Facebook, Cylex |
| Booking: https://thechrysalisbeautique.mytreatwell.co.uk/ | Supplied in the brief (could not be opened from here) |
| Facebook: facebook.com/thechrysalisbeautique | Search result |
| Level 4 advanced beauty therapist, 20+ years in the industry | Treatwell venue description |
| UK Hair & Beauty Awards finalist; 3rd place in Best for Brows, Beauty Therapist of the Year and Best Salon Décor | Treatwell venue description (no independent confirmation found) |
| Wheelchair accessible; complimentary drink for each guest; paid parking nearby | Treatwell |
| Rebecca James named in reviews ("Becky", "Bex"), mostly for brows, tinting, henna and lamination; listed by the Haverfordwest Business Circle as Rebecca James, The Chrysalis Beautique | Treatwell reviews; business circle directory |
| Average Treatwell rating 5.0 | Treatwell (review counts differ between pages: 9 to 47, so no count is shown) |
| Products: Kaeso, Skinny Tan (and "Biosculture", probably Bio Sculpture) | Old ueni site (only Skinny Tan is mentioned on the page) |

Prices and times shown (all from Treatwell snapshots):

| Treatment | Time | Price |
|---|---|---|
| Eyebrow Shape & Tint | 30 min | £20 |
| Brow Lamination & Tint | 1 hr | £30 |
| Eye Trio | 45 min | £30 |
| Eyebrow & Eyelash Tinting | 15 min | from £10 |
| Lash Lift & Brow Lamination | 2 hr 15 | £55 (shown on Treatwell as reduced from £65; the site shows £55 only) |
| Semi-Permanent Makeup: Eyebrows | 1 hr 30 – 2 hr 30 | from £70 |
| Foto RF Skin Rejuvenation Facial | 1 hr – 1 hr 30 | from £27 |
| Wedding Makeup | 1 hr – 1 hr 30 | from £45 |
| Lip wax / Chin wax | 15 min | £7 / £6 |

## ⚠ Confirm before launch

1. **Phone number.** Listings disagree. The site uses **07516 429994**, the
   only number search tied to the Dew Street address (Cylex), and one of the
   two in the brief. Others seen: 01437 723569 (Yell, older Goat Street
   listing), 01437 840895 (Facebook snippet), 07935 980126 (old ueni site,
   Goat Street). Find-and-replace `07516 429994` and `+447516429994` once
   confirmed.
2. **Email spelling.** The brief gives `thechrysalisbeatique@gmail.com`
   ("beatique" without the u). It's used exactly as supplied. Check it's not a
   typo for "beautique".
3. **Opening hours.** The site shows the Treatwell table (Wed–Sat
   10:00–16:00, Sun–Tue closed). Another snapshot showed Tuesday 10:00–14:00,
   and the old site had Thursday to 20:00 and Saturday 09:00–13:00. For that
   reason, hours are **not** in the structured data. Add `openingHoursSpecification`
   once confirmed.
4. **Booking URL.** The brief gives the mytreatwell link, but it couldn't be
   opened from here. Check it works. If Treatwell offers direct links to
   individual treatments, swap them into each row's `.treat__book` href.
5. **Prices marked "ask us".** Henna Brows, Lash Lift (on its own), Party
   Lashes, Chemical Peels, BIAB, Hard Gel Extensions & Overlays, Makeup
   Application, Pamper Parties, other waxing, and Spray Tan are all listed as
   offered, but no current price was found.
6. **Rebecca James.** Confirm Rebecca is happy to be featured, whether
   Rebecca is the owner and/or the Level 4 lead therapist (the site doesn't
   claim either), and supply a portrait. Add more `.person` cards if other
   therapists work there.
7. **Awards.** The year and exact award names come from the Treatwell
   description only. Confirm the wording.
8. **Existing logo/brand.** The salon's current logo couldn't be viewed. If
   it has one, it can replace the typographic wordmark in the nav and footer.
9. **Reviews.** Only themes are shown. If the salon approves specific
   quotes, add them using the commented `.quote` pattern in the reviews
   section, with first name, platform and date.
10. **Domain.** Once known, make `og:image` an absolute URL, add
    `<link rel="canonical">`, add `"url"` to the JSON-LD, and add a sitemap.

## Images: all temporary

No genuine photographs of the salon or its work could be downloaded here, and
stock images of other people's results would misrepresent the salon. So
**every image on the site is an abstract "plate"**: soft-focus satin rendered
procedurally by `tools/render-plates.mjs` (`node tools/render-plates.mjs`,
which needs ffmpeg). They suggest texture and light, and don't depict
treatments or results.

| Where | File | Replace with |
|---|---|---|
| Hero capsule | `satin-jade-*` | A strong portrait-format image: a close-up of the work, or the salon interior |
| No. I Brows | `satin-gilt-*` | Brow work (own client, with consent) |
| No. II Lashes | `satin-clay-*` | Lash lift close-up |
| No. III Skin | `satin-ivory-*` | Facial room or treatment in progress |
| The visit (two layers) | `satin-ivory-*`, `satin-clay-*` | Salon interior, reception, the drinks offer |
| Booking background | `satin-ink-*` | Dark, atmospheric interior detail (heavily overlaid) |
| Rebecca's card | monogram on `satin-gilt` | Portrait |
| Gallery | empty, see `js/gallery.js` | Real work only |

Keep the same file names and widths (or update each `srcset`) to swap them
in. Export around 1800px on the long edge, then generate WebP + JPEG at the
listed widths. `tools/render-og.mjs` re-renders the social card
(`assets/img/og.jpg`) and the touch icon.

## Files

```
chrysalis/
  index.html            page
  css/chrysalis.css     design system + layout
  js/chrysalis.js       nav, menu, tabs, gallery, motion
  js/gallery.js         gallery photo list (empty until real photos exist)
  js/vendor/            GSAP 3.15 + ScrollTrigger
  assets/fonts/         Bodoni Moda, Hanken Grotesk (OFL)
  assets/img/           plates, og.jpg, favicon.svg, apple-touch-icon.png
  tools/                image render scripts
```
