# Sage Psychotherapy & Counselling

The website and booking flow for Lyndsay Gent, an Adlerian psychotherapist and
counsellor working from her home in Milford Haven, Pembrokeshire.

Built with Next.js 15 (App Router), TypeScript and Tailwind v4. Static-first:
every page is prerendered except the enquiry route handler. No database, no
cookies, no tracking that reads the form.

---

## The one thing to do before launch

All three photographs — the room, the portrait and the logo — are now
Lyndsay's real assets. `check:assets` passes clean and the placeholder manifest
has been removed.

```
npm run check:assets
```

See **Photography** and **Going live** below.

---

## Running it

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

Useful scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run test` | Matcher, enquiry-schema and colour-contrast checks |
| `npm run check:contrast` | Every colour pair against WCAG AA, day and evening |
| `npm run check:assets` | Warns while stand-in artwork is still in place |
| `npm run images` | Regenerates the stand-in artwork (not needed once real photos land) |
| `npm run verify` | test + lint + build + assets, all in one |

---

## Editing the words

**All copy lives in one file: [`content/site.ts`](content/site.ts).** Change the
words there and the site follows — no component contains copy. It is plain,
typed and commented; you do not need to touch React to reword anything.

Anything still awaiting a real value (the street address, the social links, the
opening hours) is marked in that file with `status: "TO CONFIRM"`. Those render
on the page with a small "to confirm" tag so they cannot ship by accident.
Change the status to `"confirmed"` once the real value is in and the tag
disappears.

### Swapping in the real social links

In `content/site.ts`, find `practice.socials` and replace each `href` with the
real Facebook and Instagram URLs, then set each `status` to `"confirmed"`. They
already appear in the header and the footer.

---

## Environment variables

Copy `.env.example` to `.env.local` for development, and set the same keys in
Vercel for production. See the file itself for the annotated list. In short:

- `NEXT_PUBLIC_SITE_URL` — the canonical origin (Vercel sets this for you in
  production; needed locally and for a custom domain).
- `NEXT_PUBLIC_CAL_LINK` — Lyndsay's Cal.com booking link. Blank is fine; the
  booking step then shows her phone number instead of a calendar.
- `RESEND_API_KEY`, `ENQUIRY_TO`, `ENQUIRY_FROM` — email delivery for the
  enquiry form.

---

## Cal.com setup (the booking calendar)

The booking flow embeds a real Cal.com calendar so appointment data never
touches this site. Cal.com's free tier is enough.

1. Create a free account at [cal.com](https://cal.com).
2. Connect Lyndsay's own calendar (Google, Outlook or Apple) so it only offers
   times she is genuinely free. **Availability → connect calendar.**
3. Create an **event type**:
   - **Title:** Free 15-minute call
   - **URL slug:** `free-call`
   - **Duration:** 15 minutes
   - **Location:** Phone call — Cal.com collects the number and she rings them.
   - **Before/after buffers:** 15 minutes each, so calls never stack.
   - **Minimum notice:** a few hours, so nobody books the next ten minutes.
   - **Working hours:** match `practice.hours` in `content/site.ts`.
   - Turn on **email reminders** and allow **reschedules**.
4. The public link is `https://cal.com/<username>/free-call`. Put the
   `<username>/free-call` part in `NEXT_PUBLIC_CAL_LINK`.

The embed is lazy-loaded — it never runs until someone reaches the "pick a time"
step, so it never slows the first paint.

---

## Resend setup (the enquiry email)

The enquiry form emails Lyndsay and stores nothing — no database, no logs of the
contents.

1. Create an account at [resend.com](https://resend.com).
2. **Verify her sending domain** (Domains → add domain → add the DNS records it
   gives you). This is what lets mail arrive from `@sagepsychotherapy.co.uk`
   rather than being marked as spam.
3. Create an **API key** and set `RESEND_API_KEY`.
4. Set `ENQUIRY_TO` to her inbox and `ENQUIRY_FROM` to an address on the
   verified domain, e.g. `Sage Psychotherapy <enquiries@sagepsychotherapy.co.uk>`.

If these are not set the form fails gracefully: the visitor is shown her phone
number instead. Nothing is ever lost silently.

### What the form deliberately does not collect

By design there is **no field for symptoms, a diagnosis, medical history, a date
of birth or an address** — only what is needed to ring someone back. The schema
in `lib/enquiry.ts` is the boundary; keep it that way. A honeypot field and an
IP rate limiter (`lib/rate-limit.ts`) deter bots. Form contents are never
written to a log.

For strict, cross-instance rate limiting on a busy site, swap the in-memory
limiter in `lib/rate-limit.ts` for Upstash Ratelimit behind the same
`rateLimit(key)` signature — nothing else needs to change.

---

## Photography

The design is built to lean on **type, colour and layout**, not a photo gallery,
so it works with only three images. Those three are the room, Lyndsay's portrait
and her logo.

All three assets are real:

- `public/images/room.jpg` — her front room (the hero).
- `public/images/portrait.jpg` — her portrait (the welcome and About page).
- `public/images/logo.png` — her hand-painted olive-branch logo, with the white
  ground knocked out to transparency so it sits on the dark footer. The header
  keeps the drawn olive-leaf mark, which is crisp at small sizes and adapts to
  the evening palette; the full wreath appears once, in the footer.

Both photos are phone shots, so higher-resolution versions would sharpen the
full-bleed hero and the portrait further whenever she has them.
2. Replace the drawn logo. The mark is currently drawn in
   `components/leaf.tsx` (`Wordmark`). Drop her watercolour olive-branch logo in
   as an image there, and keep using the `Leaf` component for the small leaf
   accents and section seams.
3. Regenerate the social share image if you like: it is `public/og.jpg`, cropped
   from the room.
4. Delete `public/images/PLACEHOLDERS.json` once every image is real, so
   `check:assets` stops warning.

`next/image` handles AVIF/WebP, sizing and blur placeholders automatically, so
no manual optimisation is needed — just drop the files in.

### Adding the six extra photos later

The client has a shot list for six more photos (the two chairs, the window, the
front door, a detail, the room from the doorway, and Lyndsay in the room). The
layout is built so these **strengthen the site without a redesign**:

- The **Arriving** section (`components/arriving.tsx`) is the natural home for
  the front-door and doorway shots — add them beside the step-by-step "what
  arriving is like" list.
- The **Sessions** panels can take the chairs/window shots per format.
- Each is a `next/image` with descriptive `alt`; follow the existing pattern.

---

## The two things that set the site apart

- **Quick exit** (`components/quick-exit.tsx`) — a persistent "Leave this site
  quickly" control, and pressing **Escape twice**, send the browser to a weather
  forecast and replace the history entry so Back doesn't return here. For clients
  in abusive situations. It cannot clear history; the footer says so plainly.
- **Calm mode** (`components/preferences.tsx`) — stops all motion, opens up
  spacing and collapses to one column, for neurodivergent visitors. Persists in
  `localStorage`.
- **Evening mode** — the palette shifts to a warm, dim version after dark
  (respecting `prefers-color-scheme`, with a manual Day/Evening/Auto toggle).
  Chosen before first paint by a tiny inline script, so there is no flash.

---

## Accessibility and standards

- WCAG 2.1 AA: contrast is script-verified in both palettes
  (`npm run check:contrast`); axe reports zero violations on every page in both
  themes. Visible focus everywhere, logical tab order, labelled fields, error
  messages that say what to fix.
- Fully readable and usable **without JavaScript**: the enquiry form posts to
  the route handler and lands on `/thanks`; "Finding the words" falls back to
  the grouped list; the session selector is a CSS-only radiogroup.
- British English throughout.

---

## Deploying to Vercel

1. Push this repository to GitHub and **import it into Vercel**. It detects
   Next.js; no build settings needed.
2. Add the environment variables from `.env.example` under
   **Settings → Environment Variables**.
3. Add the custom domain under **Settings → Domains** and point the DNS as
   Vercel instructs.
4. Deploy. There is no analytics package and no cookie banner, because the
   site sets no cookies and loads nothing third-party. If you ever add
   measurement, the privacy page has to change in the same commit — it
   currently states, as fact, that this site tracks nobody.

   Under **Settings → Analytics**, leave Web Analytics **off** for the same
   reason: enabling it injects a script and makes that sentence untrue.

`robots.txt`, `sitemap.xml`, Open Graph tags and `LocalBusiness` / `Person`
structured data are generated automatically.

---

## Project shape

```
app/                 routes, layout, fonts, the enquiry route handler
  api/enquiry/       the one dynamic endpoint — validates and emails, stores nothing
components/          one file per section, plus header/footer/safety controls
content/site.ts      ALL copy and practice details (edit here)
lib/                 the matcher, the enquiry schema, the rate limiter, the boot script
scripts/             tests and the contrast / asset checks
public/images/       the three assets (stand-in until real photos land)
```
