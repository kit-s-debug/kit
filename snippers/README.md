# Snippers Hairdressers, Haverfordwest

A one-page website for Snippers, 57 Portfield, Haverfordwest: a **3D walk into the salon**. You start on the street outside the shopfront. As you scroll, the door swings open and the camera walks you past reception, the styling chairs, the colour bar and the wash basins, then turns back to look out at Portfield. The page content appears on cards at each stop. A booking section and footer follow.

It's static HTML, CSS and JS with no build step. three.js r170 is vendored in `assets/vendor/three/`.

```
cd snippers && python3 -m http.server 8000   # then open http://localhost:8000
```

> **The 3D salon is an illustration, not the real salon.** No photos of the real interior or shopfront could be found or downloaded. The page says so twice: a line under the hero, and in the footer. Once real photos exist, the stills can be swapped (see below), or the scene can be re-dressed to match the real salon.

## Design

| Token | Value | Use |
|---|---|---|
| `--cream` / `--linen` | `#f7f1ea` / `#efe5da` | Page and stage backgrounds |
| `--blush` | `#ecd3c9` | Booking section, notes, chairs |
| `--rose` | `#9a564d` | Accent text: italics, links on hover (5.6:1 on cream) |
| `--brass` | `#b4884b` | Hairlines, small labels, fittings in the scene |
| `--espresso` | `#2d211e` | Text, dark buttons, shopfront, footer |
| `--sage` | `#93a28b` | Plants, tiles, the sofa |

- **Type:** Cormorant Garamond for display and Jost for body and UI. Both are self-hosted under the OFL in `assets/fonts/`.
- **Buttons:** pills, filling from below on hover.
- **Cards:** soft cream with a fine brass edge.
- **Scene materials:** terrazzo floor, fluted blush panelling, arched brass mirrors, blush velvet chairs, sage zellige tiles behind the basins, opal globe pendants and a "hello, gorgeous" neon. Every texture is generated in code (`js/salon3d.js`); nothing is downloaded.

## How it works

- `js/salon3d.js` builds the whole scene with three.js:
  - the street, the shopfront and the opening door
  - reception, the waiting sofa, three styling stations, the colour bar with a swatch rail, two backwash units, plants
  - the buildings across the road
  - a one-off cube capture so the mirrors reflect the room
  - ACES tone mapping and a light bloom on the lamps
- **Camera:** eight stations. The page's scroll position drives it, with easing, so it dwells at each stop. Tall phone screens get their own street framing and a wider lens.
- **Rendering:** frames are only drawn while the camera is moving. Phones use lower resolution and smaller shadow maps.
- **`js/main.js` handles:**
  - working out where each stop sits on the page and feeding scroll progress to the camera
  - showing each stop's card
  - the side index of stops
  - the nav and mobile menu, the map loader and opening hours
- **Fallbacks.** If WebGL isn't available, or the visitor prefers reduced motion, the stage crossfades between pre-rendered stills of each stop (`assets/img/stills/`). The street still is also the first paint while the 3D loads, so the page never opens blank.
- **Remaking the images:**
  - The stills come from `node tools/stills/shoot.mjs` (start the local server first). Re-run it after changing the scene.
  - The social image and icons come from `node tools/og/shoot.mjs`.

## Content and facts

**Verified, consistent across several listings:**
- 57 Portfield, Haverfordwest SA61 1BS
- 01437 762114
- the Facebook page
- booking by phone (Fresha shows "Call to book")

These are the only facts in the structured data.

**From directory listings, please confirm with the salon:**
- **Likely:** women's, men's and children's cuts; colour; balayage; blow-dries and styling.
- **Marked `data-confirm` in the page:** wedding and occasion hair, and keratin treatments and extensions.
- **Colour correction** (lifting home box dye to softer blonde): from 2026 posts seen on a site that copies the salon's Facebook. Likely, but confirm.

**Deliberately left out:**
- **Opening hours:** listings disagree. Add confirmed hours to `js/config.js` and they render automatically.
- **Prices:** none found.
- **Staff names:** only found in an AI-written summary.
- **Reviews and ratings.**
- **The Hakin salon:** Snippers Salon Ltd at 47 Waterloo Road (01646 696944) may be related, but this wasn't verified.

## Checked

Run locally in Chromium (software WebGL) at 320, 390, 768, 1280, 1440 and 1920px wide:

- No horizontal overflow and no console errors.
- Every tour stop was screenshotted on desktop and phone.
- Reduced-motion and no-WebGL modes show the stills.
- The mobile menu opens, closes, traps focus and closes on link tap.
- Phone and directions links are correct.
- The map loads only when asked.

**Not checked:** real phones and real GPUs. Frame rate and battery use need a look on an actual iPhone and Android. The Google Maps embed and Facebook links couldn't be reached from the build sandbox.

## Before publishing

1. Confirm the `data-confirm` services, the colour-correction copy and the opening hours with the salon.
2. Get real photos of the salon. The 3D scene is the site's visual identity, but a "the real salon" strip or a gallery would add trust.
3. Choose a domain. Then add `<link rel="canonical">`, absolute `og:url` and `og:image` URLs, `"url"` in the JSON-LD, and a sitemap.
4. Check the copy with the owner.
5. Deploy with `snippers/` as the project root. `vercel.json` sets caching for `assets/`.
