# Pembroke Dock test routes

A static site for learning 15 driving routes around Pembroke Dock before a
practical test. Plain HTML, CSS and JavaScript with no build step. Leaflet is
bundled in `vendor/`.

## Run it

```
cd pembroke-dock
python3 -m http.server 8000
```

Open `http://localhost:8000`. To use it on an iPhone, host the folder anywhere
static (GitHub Pages, Netlify, Vercel), then in Safari choose Share → Add to
Home Screen.

## Keys and services

| Service | Used for | Needs |
| --- | --- | --- |
| OpenStreetMap tiles | The map | Nothing |
| OSRM demo server | Editor: joining points along real roads | Nothing (light use) |
| Nominatim | Editor: place search | Nothing (light use) |
| Google Maps URLs | Opening Street View at a junction | Nothing |
| Google Maps Embed API | Street View inside the page | Optional API key. Needs a Google Cloud project with billing turned on; Embed requests aren't charged. |

Put the key in `js/config.js`, or paste it on the Setup page (saved in that
browser only). Restrict the key to the Maps Embed API and to your site's
address.

## Adding the routes

`js/routes-data.js` starts with 15 empty routes. Nothing is invented: a route
gets steps only from the map, screenshots or directions supplied for it.

1. Open a route and go to **Edit route**.
2. Tap **Add points**, then tap the map in order at the start, at each
   junction, roundabout and feature, and at the finish. Type the wording from
   the source for each one.
3. **Snap to roads** joins the points along OpenStreetMap roads. If the line
   takes the wrong road, add a *Shape point* on the right road and snap again.
   Or import a GPX track instead.
4. **Export route file** and paste the JSON into `js/routes-data.js` to make it
   permanent for every device.

Drafts and notes live in the browser's localStorage until then.

## Stages

1. **Done:** map, route list, overview, Street View at every direction, notes, route editor.
2. **Next:** guided drive mode (follows the route in order with upcoming directions, pause, restart, jump to a junction, repeat a section).
3. **Then:** practice mode that holds back directions.
