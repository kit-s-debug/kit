# Samuel's Quality Sandwiches, Haverfordwest

A one-page site for Samuel's Quality Sandwiches, 42 Bridge Street, Haverfordwest. It's plain HTML, CSS and JS with no build step.

```
python3 -m http.server 8000        # from the repo root
open http://localhost:8000/samuels/
```

To deploy on Vercel, set the project's root directory to `samuels/`. `vercel.json` sets the cache headers.

## Creative concept: "the deli counter"

The site is built like the shop's own printed matter: deli paper, order tickets, a street sign and a stamp. The food is drawn as layered illustrations, so the page can assemble a baguette piece by piece.

| Token | Value | Use |
|---|---|---|
| `--tomato` / `--tomato-bright` | `#C4301A` / `#D7381E` | Wordmark, primary buttons, the hot-baguette section. Use `--tomato` behind cream text, which keeps it AA-legible. |
| `--cream` / `--paper` | `#F6ECD8` / `#FBF5E9` | Deli-paper backgrounds |
| `--mustard` | `#F2B230` | The sub section, stamps, highlights and focus rings |
| `--olive` | `#2F3A1F` | Ticker and soup section |
| `--ink` | `#1E1A15` | Text, the "build" and "why" sections, and the hard print shadows |

- **Type:** Bricolage Grotesque, condensed to 75% width at weight 800, for the shouting. Instrument Serif italic for the hand-lettered asides ("filled to the edges."). DM Mono for ticket labels. All three are self-hosted (OFL).
- **Motifs:** sticker buttons with a hard offset shadow that press into it, dashed order tickets with punched notches, the rotating "Call ahead" stamp, the olive ticker band, and the 42 Bridge Street sign.

## Sections

1. **Nav.** It sits transparent over the hero and turns solid paper on scroll. A scroll-spy underline tracks the current section. On phones there's a call button and a full-screen tomato drawer that opens with a circular wipe. The drawer has a focus trap, closes on Esc and returns focus when it closes.
2. **Hero.** The SAMUEL'S letters rise, the baguette slides in, and its fillings drop into place before the top crust bounces on. On scroll, the type and the food move at different speeds, and the lid lifts to show the fillings.
3. **Ticker.** The verified product range.
4. **About.** The founding year 1993 fills with tomato as you scroll.
5. **Build (pinned).** A scroll-scrubbed sequence: open bread, then heat, then the fillings land and the lid closes. Each of the three steps lights up in turn.
6. **Our food.** Three different compositions: hot baguettes (giant type sliding behind an oversized baguette), the BBQ chicken sub (a tomato disc swells and the sub swings in), and mugs of soup (animated steam).
7. **Menu.** An editorial list with sticky category tabs that follow your scroll. The three core categories are large, and the other five sit in a compact two-column block.
8. **Photo wall.** Built but hidden until real photos are supplied. It includes a lightbox (see below).
9. **Why people come back.** Themes from public reviews, plus the official hygiene rating.
10. **Getting your lunch.** At the counter, or on the phone.
11. **Find us.** Address, directions, the call link, hours (pending), Facebook, and a map that loads only when the visitor taps it.
12. **Footer.** The sub's lid closes as the page ends, under the line "See you at the counter."

All motion uses GSAP and ScrollTrigger (vendored in `assets/vendor/`, under GreenSock's no-charge licence). With `prefers-reduced-motion`, or if the scripts fail to load, every section renders complete and static. The build section then shows the finished baguette and all three steps at once.

## Verified facts used

| Fact | Source |
|---|---|
| Name: Samuel's Quality Sandwiches. Facebook calls it "Samuels Quality Sandwiches and Baguettes", and the FSA lists it as "Samuels Sandwich Bar". | Directories, Facebook, Food Standards Agency |
| 42 Bridge Street, Haverfordwest SA61 2AD | Consistent across every directory and the FSA |
| 01437 760304 | Consistent across every directory |
| Established 1993, family-run, food made to order | The shop's own Facebook page |
| Known for sandwiches and hot baguettes, "generously filled" | Discover Pembrokeshire listing |
| Also sells mugs of soup, salad pots, jacket potatoes, cakes, sweet things and drinks | A customer review (2016), so these need re-confirming |
| A BBQ chicken sub and a homemade vegetable soup are mentioned by customers | Reviews quoted on Restaurant Guru, and a Cylex review summary |
| Friendly, chatty staff; variety; decent-sized meals for the price | Recurring themes in public reviews |
| Food hygiene rating 5, all areas "Very good", inspected 8 October 2025 | [FSA record 856983](https://ratings.food.gov.uk/business/856983) |
| Facebook page | facebook.com/p/Samuels-Quality-Sandwiches-and-Baguettes-100062815069994 |

The site deliberately leaves out the following:

- **Star ratings.** The aggregator scores conflict: Restaurant Guru shows 2/5 next to a Google 4.9.
- **Review quotes.** The original wording couldn't be checked first-hand.
- **Pulled-pork baguettes.** No source confirmed them.
- **Opening hours.** The directories disagree: 9–5 Mon–Sat in some, 9–4 in others, and evening sessions in one.
- **Online ordering, delivery or catering.** None of these was confirmed. One directory mentions delivery, but it's unverified.

## Needs the owner's confirmation before launch

- [ ] **Opening hours.** Replace the "being confirmed" note in `#visit` with the `<dl class="hours-list">` shown in the HTML comment. Also add `openingHoursSpecification` to the JSON-LD.
- [ ] **The menu.** Add the real filling lists and prices. The HTML comment above the menu has a copy-paste item template, and the price is hidden while it's empty. Confirm that jackets, soup, salad pots, cakes and drinks are all still sold, and delete any category that isn't.
- [ ] **Signature dishes.** Confirm the BBQ chicken sub and the homemade vegetable soup, plus anything else to feature, such as the pulled pork.
- [ ] **Phone orders and ordering ahead.** The "On the phone" ticket invites people to ask about ordering ahead. Change that line if the shop doesn't take advance orders. If there's catering, or a real online ordering link, add it to that section.
- [ ] **Logo.** The nav and footer use an interim wordmark in Instrument Serif italic. Swap in the real signage or logo if there is one.
- [ ] **Domain.** Once it's known, make `og:image` an absolute URL, add `<link rel="canonical">` and a `url` in the JSON-LD, and add a `sitemap.xml`.
- [ ] Check the address and number one last time, and that the Facebook page is still the right one to link.

## Photography (temporary artwork to replace)

No photographs of Samuel's could be fetched while this was built, so there are no stock or borrowed food photos. Every food image is an original illustration generated by `tools/art.mjs`: baguette, BBQ chicken sub, soup mug, jacket potato, sandwich, salad pot, cake and drink. The illustrations are intended to stay as brand graphics, but real photography should be added.

| Where | Current | Replace with |
|---|---|---|
| Photo wall (`#gallery`, hidden) | — | 6–10 photos of the food, counter and shopfront: close-ups of fillings and cut baguettes, ideally shot in daylight from one consistent angle |
| Hot baguettes feature | Baguette illustration | A wide shot of a real hot baguette. Leave room on the left for the text panel. |
| BBQ chicken sub feature | Sub illustration (inline SVG) | A cut-out of the real sub, or a square photo inside the tomato disc |
| Soup feature | Mug illustration | A photo of a mug of soup |
| Menu thumbnails | Category illustrations | Optional. The illustrations work as menu icons. |
| Social image | `assets/img/og-image.jpg` (wordmark and illustration) | Optional: a real hero photo. Edit `tools/og.html` and re-render. |

**Adding photos:** export them as WebP with the long edge around 1600px for the wall, plus 2400px versions for the lightbox. Put them in `assets/photos/`, then follow the steps in the HTML comment above `#gallery`: add the figures, remove `hidden`, and add "Gallery" to both navs.

## Files

```
index.html            page (the layered SVG art is injected between <!-- art:NAME --> markers)
css/samuels.css       all styles
js/samuels.js         nav, drawer, scroll-spy, map, lightbox, GSAP choreography
assets/img/art/       generated illustrations
assets/img/           favicon, icons, grain texture, og image
assets/fonts/         self-hosted woff2 (OFL)
assets/vendor/        gsap 3.13 + ScrollTrigger
tools/art.mjs         regenerates the illustrations: node tools/art.mjs
tools/render-images.mjs, tools/og.html   regenerate favicon PNGs and the og image
```
