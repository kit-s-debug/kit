# The Spice Box Food Store, Haverfordwest

A one-page static site (plain HTML/CSS/JS, no build step) for the spice and world-food shop
on Dew Street.

```
cd spicebox && python3 -m http.server 8000   # then open http://localhost:8000
```

## Sections

- **Hero**: fresh chillies, okra and coriander under the seed shelves.
- **Walk the aisles**: twenty-three photo cards. They cover spices, fresh produce, herbs, oriental foods, poppadoms, Caribbean and
  African seasonings, noodles, sauces, pickles and tins, snacks, drinks, store cupboard, dried fish, rice, lentils and
  beans, Shan and Laziza mixes, flours, nuts, African staples, and Middle Eastern and Polish groceries.
- **Halal freezers**: halal meat portioned and labelled in the shop, whole frozen fish, frozen Thai veg and fruit, and frozen parathas and snacks.
- **Is it on the shelf?**: a searchable, filterable list of about 480 items read off the shop
  photos. It matches alternative names too (e.g. "saunf" finds fennel, "taro" finds eddoes).
  Edit the `STOCK` array in `js/spicebox.js` to add or remove items.
- **Retailers & wholesalers**: trade pitch with a call-to-order button.
- **Visit**: address, phone, payment, a link to Maps and the shopfront photo.

## Brand

The colours come from the shop sign: bottle green `#1f4d40` (deep `#133229`), saffron
`#e9a81b` for the lettering, cream `#fbf6ec`, and chilli red `#c0391f` as an accent.
Headings are set in Fraunces and body text in Figtree, both loaded from Google Fonts.

## Photography

The originals are in `photos/originals/`. `photos/crops.py` cuts them into `assets/photos/*.webp`.
To add or change a crop, edit `CROPS` and run `python3 photos/crops.py`.

## To confirm before launch

- **Opening hours**: not known, so the page says "Please ring before you travel". Search
  for `TODO` in `index.html`.
- **Address**: 27 Dew Street, Haverfordwest SA61 1ST comes from web directory listings and
  matches the "27" on the sign. Please confirm.
- **Payment**: the Visa/Mastercard and American Express stickers in the window suggest
  card and Amex are accepted.
- **Wholesale wording**: the sign says "Retailers & Wholesalers". The trade copy (restaurants,
  takeaways, ordering in) is a reasonable reading of that and should be checked with the owner.
