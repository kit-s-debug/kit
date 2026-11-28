# Speedy Cabs & Minibus, Haverfordwest: demo website

A premium one-page website prepared as a sales demo for Speedy Cabs & Minibus, 48 Portfield, Haverfordwest. It is built around real photography of Haverfordwest and Pembrokeshire: a full-screen slideshow of the Western Cleddau in Haverfordwest, Pembroke Castle, Tenby and Whitesands Bay, with photo cards for each service and destination town.

**Stack:** Next.js 15 (static export), React 19, TypeScript, Tailwind CSS 4, Framer Motion.

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
- **No vehicle photos.** No photos of the company's own cars were available, so the site shows places, not vehicles. Nothing implies a particular fleet.
- **The map is illustrative.** It has a hand-simplified coastline and approximate town positions, and it is captioned "not to scale, not live tracking".

## How the booking works

The form validates the pickup, destination, date and time (no past dates or times), passengers (1 to 16), name and a UK phone number. **Request a Booking** shows a review step. Nothing is sent until the customer picks **WhatsApp**, **text message**, **call** or **copy details**. The WhatsApp and text options open the customer's own app with the full journey details already written. Every screen states that journeys are subject to confirmation by the operator. Service cards, the hero bar and the map all prefill the form.

## Photography

All 13 photos are from **Wikimedia Commons**, under Creative Commons licences (CC BY or CC BY-SA). Each is credited, with links to its source and licence, under "Photo credits" in the footer. Those credits are what the licences require, so keep them while the photos are in use.

- `src/lib/photos.ts` holds the caption, alt text and credit for each photo, and says which photos the hero, service cards, town cards and local section use.
- The files are in `public/photos/` as responsive WebP sizes (`<id>-<width>.webp`), 4.4 MB for all sizes together. Each visitor downloads only the size their screen needs.
- **To use the owner's own photos:** save new files under the same ids and widths, and update the entries in `photos.ts`. Photos of the real cars, drivers or office would make the site stronger still.

## Performance and accessibility

- The hero slideshow pauses for reduced-motion users and has a pause button. Each slide is labelled with its location.
- Images load lazily below the fold, with explicit dimensions so the layout doesn't shift.
- The page has semantic landmarks, a skip link, labelled controls, keyboard-operable everything, focus moved to the first invalid field, and live regions for status changes.
- First-load JS is 168 KB.
