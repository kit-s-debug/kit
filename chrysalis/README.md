# The Chrysalis Beautique: website

A single-page, real-time 3D site for The Chrysalis Beautique, 15 Dew Street,
Haverfordwest. One WebGL world (Three.js) sits behind the whole page: a jade
chrysalis hangs on a silk thread, shatters into gold dust as you scroll, and
that same dust re-forms as each treatment before ringing the booking button.

## Run it locally

```
cd chrysalis
python3 -m http.server 8000      # or: npm run serve
```

Open http://localhost:8000. The built bundle `js/app.js` is committed, so the
site runs as plain static files. Deploy the `chrysalis/` folder as the site
root (for Vercel, set the project root to `chrysalis`).

To change the scripts, edit `src/` and rebuild:

```
npm install
npm run build        # or npm run watch while working
```

## Concept: "The Unfolding"

*Chrysalis* comes from the Greek *chrysós*, gold, and a real chrysalis is jade
green with a crown of gold dots. The site turns that into one continuous scene:

1. **The chrysalis.** A procedural jade shell (custom shader: mottled,
   translucent at the rim, a gilt seam) with 26 gold dots, hanging in front
   of a giant "Chrysalis" so it stands in for the *y*. It sways, follows the
   light of your cursor, and can be **dragged to spin** or **tapped to wake**
   (the dots flash).
2. **The unfolding.** Scrolling shatters the shell face by face, starting at
   the gold band, into a spiral of gold dust. The shatter is tied to the
   scroll, so it can be scrubbed back and forth.
3. **The dust becomes each treatment.** 9,000 particles (4,200 on phones)
   morph into a **brow arch made of individual hairs**, a **fan of curled
   lashes** and a **dewdrop**, each placed opposite its text. The cursor
   gently parts the dust.
4. **The crown.** At the booking section the dust gathers into seven gilt
   orbs ringing a magnetic gold "Book on Treatwell" orb. The ring is measured
   from the button, so it stays aligned at any screen size.

The atmosphere colour shifts with each chapter (gilt for brows, clay for
lashes, celadon for skin) and there is no pinning or scroll-jacking. Sections
scroll normally while the world reacts.

### Smaller touches

- Custom cursor with contextual labels (Book, Menu, Drag, Turn, Call…), on mouse/trackpad only.
- Magnetic buttons; nav links whose letters shuffle on hover.
- **Live "Open now · until 4pm" status** in the nav, worked out in UK time from the hours table (today is highlighted in the table too).
- A "silk thread" progress line on the right with a dot per chapter (clickable).
- Treatment menu under frosted glass with **filters by category and by time available** ("I've got 30 min / an hour / an afternoon"). Rows glide into place as you filter.
- Award medals that flip in 3D to reveal each category.
- Rebecca's card tilts in 3D with a moving glare.
- A marquee of review themes (pauses on hover).
- Lenis smooth scrolling; GSAP + ScrollTrigger for the text reveals (word-by-word brightening, letter-by-letter chapter titles, counters).

### Fallbacks and accessibility

- `prefers-reduced-motion`: no smooth scroll, cursor, splitting or morphing. The chrysalis renders once as a still and fades as you scroll.
- No WebGL: a pre-rendered still of the chrysalis (`assets/img/poster.webp`) takes its place.
- No JavaScript: all content, including all 20 treatments, is visible. A CSS failsafe reveals the hero if the script fails to load.
- Keyboard: skip link, visible focus, menu focus trap with Escape, filter chips and medals are real buttons with `aria-pressed`.
- Performance: pixel ratio is capped and drops automatically if the first seconds run slowly; rendering pauses in background tabs. About 185 KB gzipped of JS, mostly Three.js.

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

## Images

There is no stock photography on the site. All the visuals are rendered
in real time. Real photos are still needed for:

| Where | What's there now | Replace with |
|---|---|---|
| Rebecca's card | Gold "RJ" monogram | A portrait (commented `<img>` is in place) |
| The work | Link to Facebook (`js/gallery.js` is empty) | Genuine photos of the salon's own work, with consent |
| Share image / no-WebGL still | Rendered from the scene | Re-render with `node tools/render-og.mjs http://localhost:8000/` after changes |

## Files

```
chrysalis/
  index.html          page
  css/chrysalis.css   layout, type, glass, cursor, fallbacks
  src/main.js         scroll → scene states, smooth scroll, reveals
  src/scene.js        the WebGL world (chrysalis, dust, shaders)
  src/shapes.js       particle formations (shell, cloud, brow, lashes, drop, crown)
  src/ui.js           cursor, magnetic, status, filters, medals, menu, gallery
  js/app.js           built bundle (npm run build)
  js/gallery.js       gallery photo list
  assets/fonts/       Bodoni Moda, Hanken Grotesk (OFL)
  assets/img/         og.jpg, poster.webp, favicon, touch icon
  tools/render-og.mjs re-renders og.jpg / poster.webp from the live scene
```
