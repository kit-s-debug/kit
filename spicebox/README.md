# The Spice Box, Haverfordwest

A one-page website for The Spice Box, a spice and world-food grocery at 27 Dew Street,
Haverfordwest. It's plain HTML, CSS and JavaScript, with no build step and no dependencies.

```
cd spicebox && python3 -m http.server 8000   # then open http://localhost:8000
```

## Files

| Path | What it is |
|---|---|
| `index.html` | The page: hero, Our Story, product explorer, shelf search, gallery, Why visit, Find Us, closing CTA, footer |
| `privacy.html` | A short privacy note (no cookies, no forms; Google Fonts, plus Google Maps on request) |
| `css/style.css` | All styles. Palette and type tokens are at the top. |
| `js/main.js` | Hero intro, sticky nav, mobile menu, scroll reveals, parallax, explorer tabs, search, lightbox, click-to-load map |
| `js/stock.js` | About 480 items read off the shop photographs. Edit this to add or remove items. |
| `photos/originals/` | All 48 shop photos as supplied |
| `photos/crops.py` | Cuts the 15 photos the site uses into `assets/img/*-sm.webp` / `*-lg.webp` (`python3 photos/crops.py`) |

## Design

- **Palette:** gold `#E7B52F`, saffron `#F4D16B`, forest `#173D2B`, almost-black `#11130F`, ivory `#F8F3E7`, olive `#77845A`.
- **Type:** Fraunces (display serif, italic for emphasis) and Instrument Sans (body).
- **Mark:** an eight-point star anise drawn in SVG. It's a placeholder wordmark, not an official logo.
- **Motion:** pure CSS transitions, triggered by IntersectionObserver. On load the hero image reveals behind a
  clip-path and the headline rises word by word. After that come image reveals, a light parallax on the hero and
  the closing CTA, and a clip-path wipe on the mobile menu. All of it turns off under `prefers-reduced-motion`.

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
5. **Ratings.** The Reviews section shows 4.7/5 from 162 reviews (Cylex) and food hygiene 4 (Good, 28 Jan 2026, FSA record 857091). Update these when they change. Real customer quotes can be pasted where the `OWNER:` comment says.
6. **Social image.** Once the site has a domain, change `og:image` to an absolute URL.
