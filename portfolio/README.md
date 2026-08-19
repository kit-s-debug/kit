# Kit Ryder

Personal site for Kit Ryder, web designer and developer in Pembrokeshire.
One page: hero, work, about, services, why me, service area, contact.

Dark, quiet, and built to make a local business owner think "this is the
person I want building mine" inside five seconds.

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

### Projects

The five projects are **placeholders**. The businesses are invented and the
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
