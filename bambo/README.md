# Bambo — Vape Shop, Haverfordwest

A static site (plain HTML/CSS/JS, no build step) in Bambo's red-and-white identity.

```
cd bambo && python3 -m http.server 8000   # then open http://localhost:8000
```

Pages: `index.html` (home), `shop.html` (catalogue with filters, product detail and a
collection list), `visit.html` (hours, directions, Challenge 25, recycling, FAQ).

## Brand system

| Token | Value | Use |
|---|---|---|
| `--red` | `#C8102E` | CTAs, active nav, selected chips, key headline words, the slot mark |
| `--white` | `#FFFFFF` | Page background |
| `--ink` | `#1D1D1F` | Text, the compliance strip, button hover fill |
| `--grey` / `--line` | `#F4F4F2` / `#E2E2DF` | Product stages, secondary bands, dividers |

- **One typeface:** Archivo variable (self-hosted, OFL). Headlines are set at 112–125% width
  and 860–900 weight, in uppercase. Body copy is set at normal width.
- **One motif, the "slot":** a vertical red pill, taken from the window on a pod. It's the
  logo mark, list bullets and the favicon. On the hero and visit pages, the shop photo is framed inside it.
- **Motion:** the hero lines rise into place and the red slot grows upward. Images reveal
  with a clip-path, red rules draw themselves in, and buttons fill with charcoal on hover.
  All of it switches off under `prefers-reduced-motion`.

## Photography

All imagery is real shop photography. The originals are in `photos/originals/`.
`photos/crops.py` cuts them into the web images in `assets/photos/`: the hero, the category
tiles, the gallery and one 4:5 card per product. To add or swap a photo, drop it in
`photos/originals/`, add or edit a line in `CROPS`, then run `python3 photos/crops.py`.

The crops avoid the green LED strips and leave out paraphernalia (bongs, grinders, CBD) so
that the site stays on brand.

## Online orders (click & collect)

Customers add products to a basket, choosing a flavour, strength and quantity. On
`checkout.html` they give their name, mobile and collection day, confirm they're 18+, and
place the order. They pay and show ID at the counter. The basket lives in the
visitor's browser.

**Switching it on:** in `js/config.js`, fill in one of the following. Until you do, checkout
runs in preview mode, and orders aren't sent anywhere.

- `orderWhatsApp`: the shop's mobile number (e.g. `447700900123`). Pressing "Place order"
  opens WhatsApp with the order typed out, and the customer presses send.
- `orderEmail`: the order opens in the customer's email app, addressed to the shop.
- `orderEndpoint`: currently FormSubmit (`formsubmit.co/ajax/rajab.ark@gmail.com`), which emails each order to the shop
  automatically, without the customer pressing send. This is the most reliable option.
  It needs a free account.

`holdHours` sets how long orders are held (shown at checkout). Collection days come from
the opening-hours table in `checkout.html`, so keep it in step with the other pages.

## Moving to delivery (Shopify)

`node tools/shopify-export.mjs https://your-live-site > shopify-products.csv` writes
every product as a Shopify import file, with one variant per flavour and strength.
Unpriced products are exported as drafts. To take nicotine orders for delivery you also
need:

- a vape-friendly card provider (Shopify Payments, Stripe and PayPal don't allow vapes)
- an age-verification app at checkout
- a delivery option where the courier checks ID

Gas lighters can't be posted, so keep them collection-only.

## Video

`assets/video/walkthrough.{webm,mp4}` is a muted, looping 22-second walk-through from the
shop (`photos/originals/walkthrough.mov`) and the first tile in the "Inside Bambo" gallery.
It plays only while on screen, has a pause button, and doesn't autoplay for visitors who
prefer reduced motion. To re-encode it:

```
ffmpeg -i photos/originals/walkthrough.mov -an -c:v libx264 -crf 31 -preset veryslow -movflags +faststart assets/video/walkthrough.mp4
ffmpeg -i photos/originals/walkthrough.mov -an -c:v libvpx-vp9 -crf 46 -b:v 0 assets/video/walkthrough.webm
```

## Before going live: check these

- **Prices and offers** in `js/products.js` were read off shelf labels in the photos. Lines
  with `price: null` show "Ask in store".
- **Opening hours** in `index.html` and `visit.html` are placeholders. The address (3 Castle Square, Haverfordwest) is confirmed; add the postcode to the address blocks and the JSON-LD in `index.html` once known. The
  `data-open` and `data-close` attributes drive the "Open now" status. The directions link
  searches Google Maps for "Bambo Shop, 3 Castle Square, Haverfordwest".

## Compliance notes (UK)

- An 18+ age check runs on first visit, and the Challenge 25 notice appears on every page.
- Single-use vapes have been banned in the UK since 1 June 2025. Confirm that every kit listed is a compliant rechargeable version.
- Nicotine-containing products show the statutory nicotine warning. Copy is factual product
  information rather than promotion. Have the final wording checked against the TRPR
  advertising rules.
- There is no online checkout. The collection list is stored in the visitor's browser and
  shared with the shop via the share sheet or clipboard.
