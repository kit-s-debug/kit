# Navicrew Ltd website

A one-page site for a premium marine services company: exterior care, marine woodworking, interior and metal finishing, and specialist services (captain services, help buying and selling). The brand is now **Navicrew Ltd**, matching the supplied logo; it started as the working name "ARK Marine". The brand is set in one place, so it can be changed easily (see below).

It's static HTML, CSS and JS with no framework and no runtime dependencies. A small Node build script fills the template from a config file.

```
cd marine
node tools/build.mjs          # src/ → index.html
python3 -m http.server 8000   # open http://localhost:8000
```

Deploy the `marine/` folder as a static site. On Vercel, set it as the project root; `vercel.json` sets the cache headers.

## Photography

The site uses the client's own photos of a navy-hulled sailing yacht in the yard. The originals are in `photos/originals/`. They were exported with `tools/photos.py --grade`, a light house grade: slightly calmer colour, a little more contrast, shadows nudged towards navy. There is no retouching, cropping or stretching.

| Slot | Photo | Where |
|---|---|---|
| `hero` | `bow`: bow-on, the polished topsides reflecting the sky | Opening. On desktop it's a tall panel on the right that the headline runs into; on phones it's full-bleed |
| `about` | `bow-sun`: looking up the bow into the sun | About frame |
| `exterior` | `hull-gloss`: glossy topsides above a hull prepared for antifouling | Service 01 |
| `interior` | `porthole`: stainless porthole surround | Service 03 |
| `break` | `yacht-side` (desktop) / `bow-straps` (phones) | Cinematic break |
| `wood` | `planks-wide`: **still a rendered placeholder**, because no woodwork photos were supplied | Service 02 |

Not used:
- The walkaround video (478×850, handheld, mostly the sanded hull bottom). It is too low-resolution and unsteady for a premium site.
- Photo 7 (wide yard shot). It's cluttered next to the others.
- Several photos and a second video that were Google Drive links in the email, not attachments. Those couldn't be downloaded here.

Steady, landscape, high-resolution footage of finished work would make a good hero video later.

**To add or swap photos:** put the originals in `photos/originals/`, named after the file set you want, then run `python3 -I tools/photos.py photos/originals assets/img/photos --grade`. Point the slot in `src/site.config.json → photos` at the file, set `alt`, `focus` and optionally `tall`, then run `node tools/build.mjs` and `node tools/og/shoot.mjs`.

## Logo

`assets/img/brand/emblem*.webp` is the supplied NAVICREW LTD emblem (crown, monogram and yacht), lifted off its black background. It appears in the nav, the opening title, the footer, the share image and the favicons. The text wordmark beside it is set in the site's typeface. The supplied logo is a 816×1301 JPEG, so a vector (SVG) or high-resolution PNG version would sharpen it on large screens.

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
