# Kit Ryder

Personal site for Kit Ryder, web designer and developer in Pembrokeshire.
One page, built to make a local business owner think "this is the person I
want building mine" inside five seconds.

## The colour system

The page runs on two grounds, not one, and alternates between them: ink,
bone, ink, bone, tint, ink, bone, ink, bone, ink. Sections declare which
ground they are on with a single class (`s-light`, `s-tint`, `s-dark`), and
that class sets local tokens (`--fg`, `--fg-2`, `--line`, `--accent`,
`--btn-bg`, `--field-line`). Components read those tokens, so the same
button, rule or field works on either ground without a `dark:` variant
anywhere. The navigation reads the ground passing under it and inverts.

The accent is the red of the Old Red Sandstone the Pembrokeshire cliffs are
cut from, in two values: a darker one for text on bone, a lighter one for
text on ink, so both clear WCAG AA.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type check, then build to dist/
npm run preview    # serve the built site
```

Deploy `dist/` to any static host. On Vercel or Netlify, set the project root
to `portfolio`, the build command to `npm run build`, and the output directory
to `dist`.

## What to edit

Almost everything you will want to change lives in **`src/content.ts`**.
Copy, projects, services, reasons, contact details and social links are all
there, and the places worth replacing are marked `EDIT`. You should not need
to open a component to change words.

The things to change first:

| What | Where |
| --- | --- |
| Email address | `SITE.email` in `src/content.ts` |
| Social links | `SITE.socials` (anything left empty is not rendered) |
| Availability line | `SITE.availability` |
| Projects | `PROJECTS` plus the images in `public/work/` |
| Your photo | drop a file at `public/kit.jpg`, set `ABOUT.portrait` to `/kit.jpg` |
| Domain, page title, description | `index.html` (title, meta, canonical, JSON-LD) |

### The featured build

Eddie Rocks is real work and the case study links to the real thing.
`scripts/link-eddies.mjs` copies the site from the repo root into
`public/eddie-rocks/` before dev and before build, so "View the live site"
goes somewhere. The copy is gitignored, so the site is never duplicated in
version control.

The scroll-through video was recorded from that site with Playwright and
encoded to VP8 (`public/work/eddies-scroll.webm`, 640kB, 16s). On a pointer
device the scroll scrubs it, eased in a frame loop so a fast flick does not
become a stack of seeks. On touch it plays as an ordinary muted loop,
because seeking by finger is unreliable on iOS. Without WebM support the
poster image renders instead of a dead video element.

### The other projects

The other five projects are **placeholders**. The businesses are invented and the
previews are design concepts, not client work. Replace them as you ship real
sites: change the copy in `PROJECTS`, and drop a screenshot into `public/work/`
using the same file name. Set `aspect` to whatever ratio you export ("3 / 2"
by default) and the grid and the case study both follow it. Add `liveUrl` and
a "Visit live site" link appears in the case study.

### The contact form

With no endpoint configured the form validates, then hands the message to the
visitor's own email client, so it works on day one. To collect submissions
properly, create a form endpoint (Formspree, Basin, Netlify Forms, Web3Forms)
and set it as an environment variable at build time:

```
VITE_FORM_ENDPOINT=https://formspree.io/f/yourid
```

The form posts JSON with `name`, `email`, `business`, `projectType` and
`message`.

## How it is built

React 19, TypeScript, Vite and Tailwind v4, with Motion for animation. No UI
kit, no component library, no page builder.

- **Fonts** are self-hosted variable fonts (Archivo for display, Geist for
  text), preloaded, latin subset only. Archivo's width axis is what gives the
  headings their wide, set-in-stone feel without adding a second family.
- **The hero background** is a single WebGL2 fragment shader in
  `src/components/CoastField.tsx`: an animated contour field, drawn the way a
  coast is drawn on a chart, that tightens under the cursor. It is written
  against the raw WebGL API rather than Three.js because it is one full-screen
  quad and a 3D library would have cost around 600kB for it. It renders a
  single static frame under `prefers-reduced-motion`, stops when the tab is
  hidden or the hero scrolls away, and is simply absent if WebGL2 is missing.
- **The map** is the real Pembrokeshire coastline, not an illustration. It is
  extracted at build time from Natural Earth 1:10m land polygons into a static
  path in `src/data/pembrokeshire.ts`, so the site ships no mapping library
  and makes no runtime request. Regenerate with `npm run map`.
- **Motion** is driven by motion values and `whileInView`, never by scroll
  listeners, and every animation collapses under `prefers-reduced-motion`.

### Regenerating the placeholder previews

The work previews in `public/work/` and the social card `public/og.png` are
rendered from the mock designs in `mocks/`. That needs Playwright, which is
not a dependency of the site itself:

```bash
npm i -D playwright && npx playwright install chromium
npm run previews
```

Once you have real screenshots you can delete `mocks/` entirely.

## Accessibility and performance notes

- One dark theme, locked. Text runs at 7:1 or better against its background,
  form field boundaries clear 3:1, and focus rings are visible everywhere.
- The case study opens as a modal dialog with a focus trap, Escape to close,
  and focus returned to the button that opened it.
- The map is decorative to a screen reader; the town names beside it are real
  text and are the accessible control for it.
- Largest paint is text, not an image, so the page is readable before any
  preview has loaded. Previews are lazy loaded and sized ahead of time, so
  nothing shifts.
