# The Spice Box, Haverfordwest

A one-page website for The Spice Box, a spice and world-food grocery at 27 Dew Street,
Haverfordwest. It's plain HTML, CSS and JavaScript, with no build step and no dependencies.

```
cd spicebox && python3 -m http.server 8000   # then open http://localhost:8000
```

## Files

| Path | What it is |
|---|---|
| `index.html` | The page: dabba hero, manifesto, shelf rail, Our Story, the aisles, shelf search, gallery, Why visit, reviews, Find Us, closing, footer |
| `privacy.html` | A short privacy note |
| `css/style.css` | All styles. Palette and type tokens are at the top. |
| `js/flow.js` | Spice confetti (canvas), the spice trail that draws itself down the page, bouncy "pop" entrances |
| `js/main.js` | Smooth scroll, scroll scenes, cursor, magnetic buttons, tilt, menu, search, lightbox, click-to-load map |
| `js/stock.js` | About 480 items read off the shop photographs. Edit this to add or remove items. |
| `js/vendor/` | GSAP 3.12.5, ScrollTrigger and Lenis 1.1.13, self-hosted so the site doesn't depend on a CDN |
| `art/dabba.py`, `art/render.mjs` | Draw the masala dabba and its lid (SVG), then render them to `assets/img/dabba*.webp` and `lid*.webp` |
| `photos/originals/`, `photos/crops.py` | The shop photos as supplied, and the script that crops the ones the site uses |

## Design

- **Concept:** the masala dabba, the round steel spice tin the shop is named after. The page opens on one. As you
  scroll, the lid lifts off, the seven spices are labelled, and the view dives into the turmeric and comes out
  into a gold section. At the end of the page the lid goes back on.
- **Details from the actual shop:** the green shelf-edge rails, yellow price stickers and handwritten labels
  (set in Kalam), the green sign, and the handwritten "curry leaves" and "dried red chilli" labels.
- **Palette:** gold `#E7B52F`, saffron `#F4D16B`, forest `#173D2B`, almost-black `#11130F`, ivory `#F8F3E7`,
  olive `#77845A`, with chilli red for emphasis.
- **Type:** Rozha One (display, from the Indian Type Foundry), Kalam (handwriting) and Hanken Grotesk (body).
- **Motion:**
  - Scrolling: a mouse wheel moves the page about 40% as far per notch, with a short ease (settles in about 0.3s). Touch scrolling is native. Scroll-linked scenes follow the scroll with a light 0.4s ease, and timed animations run at 0.8x speed.
  - Pinned scroll scenes: the dabba opening, the aisles moving sideways, and the gallery zooming out from one
    full-screen photo.
  - Scroll-linked effects: parallax spice illustrations, words lighting up as you read, and a shelf rail that
    speeds up and reverses with your scroll.
  - On hover: magnetic buttons, 3D card tilt and a custom cursor.
  - **Connecting the page:** a dotted trail of seeds with a star anise on its tip draws itself through every
    section. Sections join with scalloped label edges, and handwritten "next" notes lead into the following section.
  - **Moments of joy:** spice confetti at four moments only: when the lid comes off, when you tap a bowl (each
    bowl throws its own spice), when the rating finishes counting and when the lid goes back on. Stickers and tags bounce onto the screen, and cards wobble when you hover.
  - Under `prefers-reduced-motion`, or if the scripts fail to load, everything is static and fully readable.

## Verified facts used

- **Name, address and phone:** The Spice Box, 27 Dew Street, Haverfordwest SA61 1ST, 01437 765791. These come
  from the shop sign, Yell, Cylex and 192.com. Companies House lists The Spice Box (Haverfordwest) Ltd at the same
  address.
- **What the shop is:** "Retailers & Wholesalers" and "Spices and Oriental Foods" are taken from the sign. The
  structured data is marked `GroceryStore`, not a restaurant.

## Needs confirming by the owner (search the HTML for `OWNER:`)

1. **Opening hours.** The listings disagree. Cylex has Mon–Fri 11:00–19:30, Sat 10:30–19:30, closed Sunday.
   Yell has different times, and Zmenu has 10:30–19:30 Mon–Sat. The site asks visitors to call instead. Once the
   hours are confirmed, add them in `index.html` (Find Us) and as `openingHoursSpecification` in the JSON-LD.
2. **27 or 27A Dew Street.** The Food Standards Agency and some directories list 27A.
3. **Our Story.** The copy only describes what's visible in the shop. A line on the shop's history would help.
4. **Halal.** The site says "including the halal freezer", based on the HALAL sign on one freezer.
   Please check that the wording is right.
5. **Parking.** The Find Us section mentions the pay & display car park on Dew Street, plus Rifleman's Field and Castle Lake (from Parkopedia and the council's car park list). Please check this is still right.
6. **Ratings.** The Reviews section shows 4.7/5 from 162 reviews (Cylex) and food hygiene 4 (Good, 28 Jan 2026, FSA record 857091). Update these when they change. Real customer quotes can be pasted where the `OWNER:` comment says.
7. **Social image.** Once the site has a domain, change `og:image` to an absolute URL.

## Going live

The site is ready to host as static files, with no build step.

- **Vercel:** create a project from this repo and set **Root Directory** to `spicebox`. `vercel.json` adds cache
  and security headers, and `.vercelignore` keeps `photos/` and `art/` (source material, about 29MB) off the live site.
  `404.html` is served automatically for unknown URLs.
- **After adding the domain, do these once:**
  1. In `index.html`, make `og:image` (and the `"image"` in the JSON-LD) a full URL, e.g. `https://example.co.uk/assets/img/og.jpg`.
     Add `<link rel="canonical" href="https://example.co.uk/">` in the `<head>`.
  2. In `robots.txt`, uncomment the `Sitemap:` line, and add a `sitemap.xml` listing the home page.
  3. Add the domain in Google Search Console and submit the sitemap.
- **Checked before launch (October 2026):**
  - six screen sizes from 360px to 1920px wide: no console errors, no failed requests, no sideways scroll;
  - all 26 in-page links, every search filter, all five lightbox photos and the map;
  - keyboard tab order and reduced motion;
  - with JavaScript off, and with the animation scripts blocked.
