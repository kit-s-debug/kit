# Speedy Cabs & Minibus, Haverfordwest: demo website

A premium one-page website prepared as a sales demo for Speedy Cabs & Minibus, 48 Portfield, Haverfordwest. It opens on an interactive 3D scene: an illustrated dark saloon with a lit roof sign, parked on a wet clifftop road on the Pembrokeshire coast at dusk.

**Stack:** Next.js 15 (static export), React 19, TypeScript, Tailwind CSS 4, Framer Motion, three.js with React Three Fiber and drei.

```bash
cd speedy-cabs
npm install
npm run dev      # http://localhost:3000
npm run build    # static site written to ./out (host anywhere)
```

To deploy on Vercel, import the repository and set **Root Directory** to `speedy-cabs`.

## Editing business details

Everything factual lives in **`src/lib/business.ts`**: phone numbers, address, links, services, towns, WhatsApp, reviews, rating and claims. Change it and rebuild.

### Before launch (`demoMode`)

`demoMode: true` turns on:

- a dismissible "Demo" note (it appears once you scroll past the hero),
- † markers beside claims the owner hasn't confirmed,
- `noindex` metadata and a `robots.txt` that blocks indexing.

To launch:

1. Confirm or correct each claim in `claims` (24/7, card payments) and set `confirmed: true`. Anything left unconfirmed is **hidden automatically** once `demoMode` is false.
2. Confirm that WhatsApp is used on the booking number (`whatsapp.confirmed`), or set `whatsapp.enabled: false`. The form then offers text message and phone only.
3. Optional: set `rating.verified: true` with the current figures. Add `reviews` only if they are copied word for word from a verified source.
4. Set `openingHours.confirmed` if the hours should appear in search-engine structured data.
5. Set `demoMode: false` and replace `public/robots.txt` with an allow-all version.

## What is and isn't claimed

- **Taken from the brief:** the name, both phone numbers, the address, the Google profile link, the services and the towns.
- **Marked †, owner to confirm:** 24/7 service, card payments, and WhatsApp on 07587 549017. The existing website advertises the first two. It could not be reached from the build environment, so nothing was copied from it.
- **Deliberately left out:** prices, fleet models, vehicle capacities, licensing, driver details, the review rating (the sources disagree), and all testimonials.
- **The vehicle is an illustration.** It is built in code, unbranded, and does not represent a company car. The site says so in the demo note and in the footer.
- **The map is illustrative.** It has a hand-simplified coastline and approximate town positions, and it is captioned "not to scale, not live tracking".

## How the booking works

The form validates the pickup, destination, date and time (no past dates or times), passengers (1 to 16), name and a UK phone number. **Request a Booking** shows a review step. Nothing is sent until the customer picks **WhatsApp**, **text message**, **call** or **copy details**. The WhatsApp and text options open the customer's own app with the full journey details already written. Every screen states that journeys are subject to confirmation by the operator. Service cards, the hero bar and the map all prefill the form.

## 3D, performance and accessibility

- `src/components/hero/HeroScene.tsx` contains the whole scene. The sky shader, sea glitter, cliffs, wet road reflections, cat's eyes, lighthouse, vehicle and reflection lighting are all generated in code. **Nothing is downloaded:** no models, textures or HDR files.
- The 3D bundle loads lazily after first paint. A still of the same scene (`public/hero-poster*.webp`, 54 KB and 26 KB) shows immediately and stays as the fallback when WebGL is missing or data saver is on.
- Small or low-core devices get a lighter scene, with no planar reflections and a lower pixel ratio. Rendering pauses while the hero is off screen.
- Reduced-motion users get a still scene and no entrance or scroll animation.
- The page has semantic landmarks, a skip link, labelled controls, keyboard-operable everything, focus moved to the first invalid field, and live regions for status changes.
- First-load JS is 168 KB. The 3D engine loads separately.

## Regenerating the posters

The posters and `public/og.jpg` are screenshots of the live scene. After you change the scene, run the dev server and capture new ones with Playwright at 1600×1000 (desktop) and 430×932 at 2× (portrait). Save them as WebP over the files in `public/`.
