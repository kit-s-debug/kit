# ARK Marine website

A one-page site for a premium marine services company: exterior care, marine woodworking, interior and metal finishing, and specialist services (captain services, help buying and selling). ARK Marine is a working name. The brand is set in one place, so the company can be renamed easily (see below).

It's static HTML, CSS and JS with no framework and no runtime dependencies. A small Node build script fills the template from a config file.

```
cd marine
node tools/build.mjs          # src/ → index.html
python3 -m http.server 8000   # open http://localhost:8000
```

Deploy the `marine/` folder as a static site. On Vercel, set it as the project root; `vercel.json` sets the cache headers.

## ⚠ The photographs are placeholders

No photos of the client's own boats or work had been supplied yet. So every image on the site is a **rendered placeholder**, made in code with three.js (`tools/render/`): a blue-hour seascape with a yacht at anchor, a sunset horizon, a navy hull flank, teak decking and a stainless cleat. They set the mood and crops, but they are not real work and should be replaced before launch.

**To use real photos:**

1. Put the originals (JPG/PNG, any size, phone photos are fine) in one folder, named after the slot they replace, e.g. `hero-wide.jpg`, `hull-wide.jpg`.
2. `python3 -I tools/photos.py path/to/folder` makes responsive WebP sets (`name-640/960/1440/1920/2560.webp`) in `assets/img/photos/` and fixes phone rotation.
3. In `src/site.config.json → photos`, point each slot at its file and update `alt`. `focus` is the crop focal point (`"35% 50%"` = left of centre). `tall` is an optional portrait crop for phones.
4. `node tools/build.mjs`, and `node tools/og/shoot.mjs` to remake the share image.

| Slot | Where it appears | Best photo |
|---|---|---|
| `hero` (+ `tall`) | Full-screen opening | The best yacht shot, with calm space on the left for the headline |
| `about` | About, tall frame | A detail: a fitting, a finish, hands at work |
| `exterior` | Service 01 | Hull, polishing, washing |
| `wood` | Service 02 | Teak, varnished brightwork |
| `interior` | Service 03 | Interior, polished stainless |
| `break` (+ `tall`) | Full-width cinematic break | A wide, atmospheric vessel or seascape |

Service 04 uses an illustrated sea chart (generated SVG), so it needs no photo.

## Renaming the company

Edit `brand` in `src/site.config.json`, then run `node tools/build.mjs` and `node tools/og/shoot.mjs`:

```json
"brand": { "name": "NAVICREW", "descriptor": "Ltd", "legalName": "Navicrew Ltd", "tagline": "…" }
```

`name` is the large part of the wordmark and `descriptor` the small spaced word after the line. `legalName` is used in the page title, metadata, structured data, footer and every pre-filled WhatsApp message. The favicon uses the name's first letter. The contact details, the site URL and the form endpoint are in the same file.

## The enquiry form: what needs connecting

**As delivered, there is no form backend, and the form does not pretend to have one.** When a visitor submits, it validates the fields, then opens **WhatsApp** with the whole enquiry written out (name, email, phone, vessel, service, message), ready for them to press send. A second button, "or send it by email instead", does the same in their email app. The page tells them plainly that nothing is sent until they press send.

To have the form deliver directly to the inbox:

1. Create a free form at [Formspree](https://formspree.io) (or Getform / Web3Forms) using `rajabi.ark@gmail.com`.
2. Paste its endpoint into `src/site.config.json → form.endpoint`, e.g. `"https://formspree.io/f/abcdwxyz"`. For Web3Forms, use `https://api.web3forms.com/submit` and put the access key in `form.accessKey`.
3. Rebuild. The button becomes "Send enquiry", the form posts JSON, and the visitor sees a real success or failure message. On failure, the details stay in the form and the message offers WhatsApp and email instead.

There is also a hidden spam-trap field.

## Contact links

- WhatsApp: `https://wa.me/447931988951?text=…`. This works on phones (opens the app) and desktops (WhatsApp Desktop or Web). Each service has its own pre-filled message.
- Call: `tel:+447931988951`
- Email: `mailto:rajabi.ark@gmail.com`

## Design

| Token | Value | Use |
|---|---|---|
| `--navy-900` / `--ink` | `#0a1626` / `#050b14` | Main dark ground, footer |
| `--deep` | `#0a1d1c` | Dark ocean green: Our Approach and the cinematic break |
| `--ivory` | `#f3eee4` | Light sections (About, Values) and text on dark |
| `--champagne` + `--metal` | `#cdb88f` + gradient | Brushed-metal accents: italic headline words, rules, numerals |
| `--tide` | `#9cc0dc` | Focus states and form interaction |

- **Type:** Bodoni Moda (optical sizes; display, with italics for emphasis) and Jost (text, spaced uppercase labels). Both are self-hosted under the OFL.
- **Signature details:**
  - the wordmark rises out of its own "waterline"
  - *the passage*: a plotted-course progress line with waypoints on the left on wide screens, also usable as section navigation
  - a hand-drawn chart with depth soundings, contours, a compass rose and a printed neatline border; its course draws in
  - the Our Approach course line drawing between three waypoints as you scroll
  - faint soundings behind Approach and drifting contour lines behind Contact
- **Rhythm:** dark hero → ivory About → navy Services → green Approach → photographic break → ivory Values → navy Contact → ink footer.

## Motion (`js/main.js`)

- **Opening title:** first visit per session, about 1.8s. Then the hero image opens from an inset frame, and the headline rises line by line.
- **Scroll reveals:** lines rise from masks, photos are revealed by clip-path, and icon strokes draw. Some photos have parallax, and the cinematic frame opens to full bleed as it arrives.
- **Services (desktop):** a sticky frame changes as each discipline scrolls into focus or is hovered. Each frame has its own detail: a waterline, a metallic sheen, the chart course drawing. A slight cursor-led drift adds depth. **On phones and tablets**, each service shows its own image inline, so nothing depends on hover.
- **Our Approach (≥900px):** the section pins while the course draws through Understand → Refine → Protect. On phones it becomes a vertical line.
- **Nav:** turns from transparent to blurred navy, hides while scrolling down and returns on scroll up. It highlights the active section and has an animated full-screen mobile menu with a focus trap and Esc to close.
- **`prefers-reduced-motion`:** no intro, pinning, parallax or travel. All content shows immediately.

## Files

```
src/index.html          page template (edit this)
src/site.config.json    brand, contact, form endpoint, photo slots
index.html              built output (don't edit)
css/marine.css  js/main.js
assets/fonts  assets/img/photos  assets/img/icons  assets/img/og.jpg
tools/build.mjs         template → index.html, robots.txt (and sitemap.xml once site.url is set)
tools/photos.py         photos → responsive WebP sets
tools/og/               share card + favicons from the config
tools/render/           the placeholder photography (needs: cd tools/render && npm i)
tools/check/check.mjs   smoke test: console errors, broken images, dead anchors, overflow, screenshots
```

Once the domain is known, set `site.url` to enable the canonical URL, absolute share-image URLs and a sitemap.

## Content rules followed

No years in business, certifications, qualifications, client numbers or "industry-leading" claims are made anywhere. The copy is the client's own, with neutral connecting lines. The structured data lists only the name, phone, email and the services.
