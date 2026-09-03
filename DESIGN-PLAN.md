# Sage Psychotherapy & Counselling — design plan

Written before any code. Reviewed at the end of this file against the question
"would I have produced this for any other therapy site?", with the parts that
failed that test rewritten.

---

## 1. The idea

The room is the brand. Not a clinic, not a wellness brand — a Victorian front
room with a navy-teal wall, a mustard chair, honey parquet and a lamp on.

So the organising idea is **light, not colour**. Nothing on this site is
"coloured in". Surfaces behave as though a single warm lamp is lighting them:
the hero comes up like a lamp being switched on, warmth pools where the type
sits, and evening mode is not a dark theme — it is the same room later, when
the lamp is the only light left.

Second organising idea: **rooms, not pages**. Scrolling moves between fields of
colour, each with its own floor. You do not scroll down a document; you walk
from one room into another. Sections never repeat a layout back-to-back.

Third: the **sash window** gives the geometry. A tall 3:5 proportion recurs, and
a hairline "sill line" set slightly off-centre marks the seam between rooms
instead of a rule across the full width.

---

## 2. Tokens

### Colour — day

| Token | Hex | Role |
|---|---|---|
| `ink` | `#1F3D47` | The feature wall. Grounding fields, headings on light. |
| `sage` | `#7E9B6F` | The logo's olive leaves. Marks, rules, small accents. Never a gradient. |
| `paper` | `#F5F1E8` | Page ground. |
| `ochre` | `#C08A2E` | The mustard chair and the lamp. **Interactive states only.** |
| `tan` | `#8C5A3C` | Leather. Illustrative fills, image treatment. |
| `near-black` | `#2B2B28` | Body text where teal goes soft. |

No sixth colour. No decorative gradients. Tints are produced only by
`color-mix()` against `paper` or `ink` so everything stays inside the six.

### Colour — evening

Same six, relit. `paper` drops to a warm dark, `ink` deepens toward it so the
dark fields still read as a different surface, and the accents lift so they
survive on dark. Contrast targets are deliberately **comfortable, not maximal**:
body copy lands ~9–11:1 rather than 15:1, muted text ≥ 4.5:1. Everything is
checked against AA by a script in the repo, in both modes.

| Token | Day | Evening |
|---|---|---|
| ground | `#F5F1E8` | `#1B1815` |
| raised surface | `#1F3D47` | `#16262C` |
| body text | `#2B2B28` | `#D2C9B9` |
| muted text | `#55534D` | `#9C9384` |
| sage | `#7E9B6F` | `#A3BC96` |
| ochre | `#C08A2E` | `#DCA84F` |
| tan | `#8C5A3C` | `#B9825E` |

Resolution order: manual override in `localStorage` → `prefers-color-scheme` →
local clock (evening from 20:00 to 07:00). Applied by a tiny blocking script in
`<head>` so there is no flash.

### Type

Two families, clearly different jobs.

- **Newsreader** (humanist serif, low contrast, warm, real italic) — headlines,
  pull lines, and any long-form copy. Not a Didone; it has ink in it.
- **Instrument Sans** (quiet grotesque) — labels, buttons, form fields, meta,
  the whole interface layer.

Both self-hosted through `next/font/local` from subset `.woff2` files committed
to the repo, `display: swap`, no runtime call to any font CDN.

Scale is fluid, `clamp()`-driven, one ratio per breakpoint (1.25 mobile →
1.333 desktop). Headlines are sentence case, tight (0.95–1.05 leading), and
large. Body sits at 60–72 characters — enforced by a `--measure` token, never a
full-width paragraph anywhere on the site.

### Space

A single 4px base with a named scale. Section rhythm is deliberately uneven:
tight sections (fees, credentials) run at 0.6× the vertical space of open ones
(hero pin, welcome), so the page breathes irregularly like rooms of different
sizes rather than evenly like a slide deck.

### The leaf mark

The logo's olive leaves are redrawn as a **single reusable SVG leaf pair**, used
at three sizes: a 16px mark before quiet labels, a 40px seam mark on the
"sill line" between two rooms, and one large low-contrast leaf as the only
decoration in the approach section. The full painted wreath appears exactly
twice: header lockup and footer. Never as wallpaper.

---

## 3. Wireframes

### Hero → pin (one continuous image, four beats)

```
┌──────────────────────────────────────────────────────────┐
│ Croeso  [leaf] Sage        Areas  Sessions  Fees  Book   │  header, transparent
│                            [calm] [evening]  [Leave ▸]   │  over image
│                                                          │
│                                                          │
│        ░░░░░░ THERAPY ROOM, FULL BLEED ░░░░░░            │
│        ░░ vignette lifts + warm light comes up ░░        │
│        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░            │
│                                                          │
│   Croeso. Therapy in a front room in                     │  Newsreader, ~64px
│   Milford Haven, in person or online.                    │  bottom-left, on the
│   ───────────────────────── sill line                    │  lit pool
│   Lyndsay Gent · Adlerian Psychotherapist, BACP          │  (small grotesque)
│                                                          │
│   ┌───────────────────────────────┐                      │
│   │  Book a free 15-minute call   │                      │  one CTA. no chevron.
│   └───────────────────────────────┘                      │
└──────────────────────────────────────────────────────────┘
        ↓ scroll — image PINS, three lines change over it
┌──────────────────────────────────────────────────────────┐
│        ░░░ same image, held, slowly warming ░░░          │
│                                                          │
│              It is not a clinic.            (beat 1)     │
│              It is her front room.          (beat 2)     │
│              You can ring first.            (beat 3)     │
│                                                          │
└──────────────────────────────────────────────────────────┘
        ↓ image releases upward into the ink field
```

### "Finding the words" (interactive, light room)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   What is going on, in your words?                       │  serif, large
│                                                          │
│   ┌────────────────────────────────────────┐ ┌────────┐  │
│   │ I keep snapping at my kids▏            │ │  Look  │  │  rotating placeholder
│   └────────────────────────────────────────┘ └────────┘  │
│   Nothing is sent or saved. This stays in your browser.  │  small, muted
│                                                          │
│   ─────────────────────────────────────── sill line      │
│                                                          │
│   That sounds like it might be about                     │
│                                                          │
│     Anger management                                     │  serif, large, ragged
│     Burnout                     Lyndsay works with all   │
│     Family issues               three of these.          │
│                                                          │
│     [ Book a free 15-minute call ]                       │
│                                                          │
│   ────────────────────────────────────────────────────   │
│   Or read the lot                                        │
│   ▸ Anxiety and panic                              6     │  bands, full width,
│   ▸ Low mood and self-worth                        6     │  hairline between.
│   ▸ Trauma and abuse                               7     │  NOT cards.
│   ▸ Addiction and compulsion                       5     │
│   ▸ Relationships and family                       8     │
│   ▸ Neurodiversity                                 4     │
│   ▸ Loss and life change                           5     │
└──────────────────────────────────────────────────────────┘
```

Works with no JavaScript: the input is a real `<form>` that lands on the
grouped list, and the bands are native `<details>`. Every clinical term is in
the DOM on first paint.

### Fees (dark room, deliberately the flattest thing on the page)

```
┌──────────────────────────────────────────────────────────┐
│ ██████████████ ink field, full bleed █████████████████   │
│                                                          │
│   Fees                                                   │  small grotesque
│                                                          │
│   £45                     The first call is free.        │  £45 at ~110px
│   a session               Fifteen minutes, no charge,    │  serif
│   50 minutes              nothing to prepare.            │
│                                                          │
│   ──────────────────────────────────────────             │
│                                                          │
│   A few places are held at a lower rate. If money is     │
│   the thing stopping you, tick the box in the form and   │  ≤ 60 words
│   she will sort it with you privately.                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Three principles for *this* practice

1. **Lit, not coloured.** Colour changes are light changes. This is why evening
   mode is a first-class state and not a toggle bolted on, and why the only
   expensive motion on the site is a lamp coming up.

2. **One short call is the only ask.** Every room ends within reach of the same
   single action — *Book a free 15-minute call* — and nothing else ever competes
   with it. No newsletter, no second CTA, no "learn more".

3. **Never make someone categorise themselves.** The site must not require a
   person to name a diagnosis, explain themselves, or admit anything to proceed.
   "Finding the words" reads what you type and never sends it. The free-text box
   is marked optional and says so twice. The concession request is a checkbox,
   not a conversation. Leaving is one key press.

---

## 5. Review — what I would have built for any therapy site, and what changed

I went back through the plan and marked everything that could have been lifted
onto any other counsellor's website. Each one is changed below.

| Generic thing | Changed to |
|---|---|
| Full-bleed hero photo, centred headline, dark scrim across the whole image | Type sits bottom-left on a **lit pool**; the vignette *lifts* on load rather than a scrim sitting there; and the image does not end at the fold — it carries into the pinned act, so one photograph does four jobs. |
| "Meet your therapist": portrait left, bio right, two columns | Portrait **bleeds off the left edge**, cropped tall, on a full `ink` field. No heading, no "Meet Lyndsay". Three lines, first person, set large and ragged on the right. |
| A 37-item accordion of clinical areas, or a card grid of specialisms | The **input** is primary; the list is secondary and collapsed. Clusters are full-width horizontal bands with a hairline and a count — no card, no shadow, no border radius. |
| Pricing card with a border, a shadow and a "Book now" button | One wide **flat field**, £45 set at display size, concessions given equal weight *inside the same field* rather than as an apologetic footnote. |
| A row of trust badges (BACP / PSA / DBS logos) | A **register**: plain rows, hairline rules, small grotesque, quiet facts with dates. Reads like a certificate list, not a trust bar. |
| Fade-and-slide-up on every section | **Two** motion moments only: the lamp coming up, and the hero pin. Elsewhere, a single hairline that draws itself down the arriving sequence. Everything off under `prefers-reduced-motion` and calm mode. |
| "In person · Online · Phone · Home visits" as a middle-dot meta string | Middle dots are banned. Formats are a **selector** that changes a panel — and home visits and phone are listed **first-class**, not last. |
| A map embed in the contact section | No third-party embed (it would also break the no-cookie-banner promise). Instead: the **walk from the car to the chair** as a short sequence, the address in full, and a plain directions link. |
| Inter + a serif | **Instrument Sans** + **Newsreader**. Inter is the default that makes a site look machine-made. |
| "Book a consultation" / "Get in touch" as the CTA | **"Book a free 15-minute call"**, the same words everywhere, because the low-commitment first step is the entire conversion strategy. |

One more, which is about content rather than layout: the usual therapy site
opens by describing the visitor's problem back at them. This one opens by
describing **the room**. The visitor is never told what they are feeling.
