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
  logo mark, list bullets, the shape behind the hero products and the favicon.
- **Motion:** the hero lines rise into place and the red slot grows upward. Images reveal
  with a clip-path, red rules draw themselves in, and buttons fill with charcoal on hover.
  All of it switches off under `prefers-reduced-motion`.

## Before going live: replace the placeholders

These are stand-ins, not facts about the shop:

- **Product photography.** Every image in `assets/img/` is a 3D studio render made in
  `tools/product-studio/`, not a photo of real stock. Swap in real photography at the same
  aspect ratios: 4:5 for products, 1:1 for category tiles, 1100×1400 for the hero. Use a
  plain light background so the photos match `--grey`.
- **Products, prices and offers** in `js/products.js`, including product names, the "3 for
  £10" nic salt offer and the specs.
- **Address and opening hours** in `index.html` and `visit.html`. The `data-open` and
  `data-close` attributes drive the "Open now" status. The directions link is a Google Maps
  search for "Bambo Vape Shop Haverfordwest".
- **Service claims:** free coil fitting, set-up in store and recycling drop-off. Keep only
  the ones the shop actually offers.

## Compliance notes (UK)

- An 18+ age check runs on first visit, and the Challenge 25 notice appears on every page.
- No disposable vapes are listed (single-use vapes have been banned in the UK since 1 June 2025).
- Nicotine-containing products show the statutory nicotine warning. Copy is factual product
  information rather than promotion. Have the final wording checked against the TRPR
  advertising rules.
- There is no online checkout. The collection list is stored in the visitor's browser and
  shared with the shop via the share sheet or clipboard.

## Re-rendering product images

`tools/product-studio/` builds the products in three.js and photographs them in headless Chromium:
`npm i three@0.160.0 playwright`, then `node shoot.mjs [shot-name ...]`. This writes 2× PNGs to `out/`.
Downscale them to WebP into `assets/img/`.
