# Llangwm RFC — The Wasps

The club website. Plain HTML, CSS and JavaScript: no build step, no
dependencies, no database. Upload the folder to any host and it works.

```
llangwm/
├── index.html              the club site, one page
├── privacy.html            privacy policy
├── accessibility.html      accessibility statement
├── 404.html                shown for a page that does not exist
├── robots.txt              ← needs the live domain
├── sitemap.xml             ← needs the live domain
├── css/llangwm.css         all styling
├── js/club-data.js         ← THE FILE THE CLUB EDITS
├── js/llangwm.js           behaviour (you should not need to touch this)
└── assets/
    ├── brand/              the crest
    ├── fonts/              Anton + Public Sans, self-hosted (SIL OFL)
    ├── photos/             club photographs go here
    └── sponsors/           partner logos go here
```

## Keeping the site up to date

Nearly everything is in **`js/club-data.js`**. Open it in any text editor,
change the words between the quote marks, save, upload. The file is
commented throughout and every value that still needs confirming is
marked `// CHECK`.

You can edit:

| What | Where in `club-data.js` |
|---|---|
| Address, phone, links | `club` |
| Instagram / Facebook | `social` |
| Fixtures and results | `fixtures.firstXV` / `fixtures.juniors` |
| News and match reports | `news` |
| Coaches and committee | `team` |
| Photographs | `gallery` |
| Junior age groups, training times | `juniors` |
| Club shop links | `shop` |
| Sponsors | `sponsors` |
| WRU accreditation | `accreditation` |

Two rules: keep the punctuation exactly as it is, and if you do not have
something yet, leave it as `""` or `[]`. Empty sections show a tidy
panel rather than a broken one.

The **history timeline** and the **archive cards** are written directly in
`index.html` (search for `id="history"` and `id="archive"`). They are
historical and rarely change, so they live in one place rather than two.

### Adding a fixture

```js
fixtures: {
  firstXV: [
    {
      date: "2026-10-03",        // always YYYY-MM-DD
      opponent: "Narberth RFC Athletic",
      venue: "home",             // "home" or "away"
      kickOff: "14:30",
      ground: "The Green, Llangwm",
      competition: "League",
      result: ""                 // "" until played, then e.g. "W 24-17"
    }
  ],
```

Upcoming games appear under **Next up**; once a fixture has a `result`, or
its date has passed, it moves down into **Recent results** automatically.

This is the club's own fixture list now — there is no other site to fall back
to — so it is worth keeping up to date. While it is empty the section shows a
short panel pointing supporters at Instagram instead of anything broken.

### Adding photographs

Drop the files into `assets/photos/`, then list them:

```js
gallery: [
  { src: "assets/photos/matchday-01.jpg",
    alt: "Llangwm RFC First XV drive for the line at The Green",
    category: "Matchday" }
],
```

Categories become filter buttons on their own. Please write a real `alt`
description — it is what a blind supporter hears, and what Google reads.
Save photographs at about 1600px wide; anything larger just slows the
site down.

The same applies to `team` — put a filename in a person's `photo` and the
card becomes a portrait instead of a monogram.

## Assets

`assets/brand/` holds two versions of the badge, both cut from the artwork
the club supplied:

- **`llangwm-rfc-logo.png`** — the full badge, wasp and banner. Used in the
  hero, the club panel and as the background watermark.
- **`llangwm-rfc-icon.png`** — the wasp on its own. Used in the header, the
  mobile menu, the footer, the archive cards and as the favicon, because the
  banner lettering is unreadable below about 90px.

If the club has the badge as vector artwork (`.svg`, `.ai` or `.eps`), it is
worth dropping in: the supplied file is 300px, which is fine everywhere it is
used now but limits how large it can ever be printed on screen.

`assets/photos/` holds the club's own photography: the home shirt (cut out
so it sits on the dark background), the clubhouse, and the six headshots.
`assets/photos/archive/` holds the eighteen archive images: seventeen
historical team photographs and one placeholder (see below).
Three of them (1937, 1938 and 1946-47) were recovered from screenshots of the
Society's pages rather than supplied as files, so they are a little softer
than the rest; if better copies turn up, overwrite them under the same names.

## Things still to confirm before launch

These are marked `// CHECK` in `club-data.js`:

1. **The 1958-59 card is a placeholder.** Its photograph was never found, so
   it currently shows a real but undated Llangwm side, flagged "Placeholder
   image" on the card and called out at the top of its caption. To finish it:
   put the real photograph in `assets/photos/archive/`, point the card's two
   image paths at it (`data-lb-src` and `src`), delete the
   `<span class="plate-flag">` and delete the placeholder sentence from the
   start of the caption. Everything else on that card is already correct.
2. **Team photographs.** The six headshots were cropped from the club's own
   "Meet the Team" graphic, which is the only copy available here. They look
   fine at card size, but if the original photographs still exist, replacing
   the files in `assets/photos/` with them will sharpen the section
   noticeably. Same filenames, same 4:5 shape, and nothing else changes.
3. **The clubhouse address and phone number.** Both match the club's public
   Google listing. The playing ground is recorded separately from the
   clubhouse (Pill Parks Way), so decide which address supporters should be
   given for matchdays and update `club.mapQuery` to match.
4. **Opening hours.** `club.openingHours` is empty, because no hours are
   published on the club's Google listing and guessing them would be worse
   than leaving them out. Add them as a list of lines and a row appears under
   Find Us automatically.
5. **The Facebook page.** Confirm it is the club's own, or set
   `social.facebook` to `""` to remove every Facebook link.
6. **Sponsors.** Only Loche Bros is listed, taken from the front of the
   current playing shirt. Add the rest of the season's partners, and a logo
   file and website for each, in `sponsors`.
7. **WRU accreditation.** `accreditation.show` is `true` and the level is set
   to Gold. Confirm the club's current level, and add the official WRU badge
   artwork as `assets/brand/wru-accreditation.png` (set `accreditation.badge`
   to that path). Set `show: false` to hide the section entirely.
8. **Club shop URLs** for RCS and KJ Prints. Until a `url` is filled in,
   those buttons send people to the contact section rather than nowhere.
9. **Gallery photographs.** The gallery is built and empty. Matchday, junior
   section and clubhouse pictures all drop straight in.
10. **An email address for privacy enquiries.** The privacy policy currently
   gives the clubhouse phone number and postal address as the route for
   privacy questions, which is honest but slow. If the club has an address it
   is happy to publish, there is a commented-out block in `privacy.html` marking
   exactly where it goes.
11. **Fixtures and news.** Both lists ship empty. They were previously seeded
   from the club's old website, which this site replaces, so they now need
   filling in here.

## Historical material

The history and archive sections are drawn from the
[Llangwm Local History Society](https://llangwmlocalhistorysociety.org.uk/llangwmrugbyclub.html),
whose pages reproduce photographs and records from Richard Howells'
*Llangwm RFC: A Hundred Years of Rugby 1885–1985*, now out of print.

The sixteen photographs in the archive are reproduced here with the club's
say-so, each one captioned with the names as the Society records them, and
the credit block under the grid names both the author and the Society. The
four cards without a photograph link back to the Society's own pages.

If the Society or the author ever ask for one to come down, delete the file
from `assets/photos/archive/` and change that card back to a ghost plate —
the caption and names can stay.

The season on the 1959-60 card was confirmed by the club rather than read
off the page: the caption was obscured in the source.

## The other pages

`privacy.html`, `accessibility.html` and `404.html` are plain pages sharing the
same stylesheet. They do not load the site script — they only need the year in
the footer, which is one inline line — so they are about half the weight of the
home page.

The privacy policy describes what the site **actually** does, which is very
little: no forms, no accounts, no analytics, no advertising, and **no cookies
of any kind**. Nothing is written to the browser. That is why there is no
cookie banner: there would be nothing to consent to. The one exception is the
map, which is not loaded until a visitor presses *Show map*, and the policy
says so.

If you ever add a contact form, analytics, or an embedded Instagram feed, the
privacy policy stops being true. Update it before the change goes live, and
change the date at the top.

## Deploying

It is a static site. Any of these work with no configuration:

- Drag the `llangwm` folder onto Netlify or Cloudflare Pages
- GitHub Pages, serving this folder
- Upload by FTP to any web host

Everything is relative, so it works from a domain root or a subfolder.

Three things to do once there is a live domain:

- **Replace `REPLACE-WITH-YOUR-DOMAIN`** in `sitemap.xml` (three times) and
  uncomment the `Sitemap:` line in `robots.txt`. A sitemap needs absolute
  URLs, so it does nothing until that is done.

- Add the full URL in front of the Open Graph image path in `index.html`
  (there is a comment marking the spot) so link previews show the crest.
- Check the address in the structured data block at the bottom of `<head>`
  matches whatever was decided above.

Netlify, Cloudflare Pages and GitHub Pages all serve `404.html` automatically
for a missing page, and all of them will serve `privacy.html` at `/privacy` as
well as `/privacy.html`. The footer links use the `.html` form so they also
work from a plain folder or a local file.

## Accessibility and performance notes

Please keep these if the site is edited:

- Every image needs an `alt` description.
- Animations are disabled automatically for anyone who has asked their
  device to reduce motion. Do not add animation that ignores that.
- Fonts are self-hosted, the map only loads when somebody asks for it, and
  there are no trackers or third-party scripts. The whole site, photographs
  included, is around half a megabyte.
