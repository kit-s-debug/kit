# 04 — The Visual System

The goal is a film that happens to have been assembled from generated, archival and
graphic material — not a slideshow of AI images. Two principles do most of the work:

1. **Mixed sourcing.** No more than two AI-generated shots may run consecutively.
2. **One grade over everything.** Generated, archival and graphic material all pass through
   the same grain, halation and colour treatment, so they read as one piece of film.

---

## 1. Shot taxonomy and mix

Target proportions for a 12-minute video of roughly 90–110 shots:

| Type | Share | What it is |
|------|-------|-----------|
| **AI cinematic** | 25% | Atmospheric establishing shots, interiors, weather, landscapes, period texture |
| **Archival / public domain** | 25% | Real film, real photographs, newsreel, official imagery |
| **Documents & photographs** | 15% | Scans of reports, letters, logs, newspaper pages, ID photos |
| **Maps & diagrams** | 15% | Location, route, timeline, cutaway, scale comparison |
| **Typographic cards** | 10% | Record cards, act cards, quotations, timestamps |
| **Texture & abstract** | 10% | Water, smoke, grain, static, macro detail, out-of-focus light |

Rules on top of the mix:

- **Two AI shots maximum in a row.** Break with a document, a map, a card or a texture.
- **The three most important moments in the video should not be AI shots.** The rupture, the
  key evidence and the revelation should each be carried by a real document, a real
  photograph, a map, or a card. Real material at the emotional peaks is what makes the whole
  film feel real.
- **Every claim on screen has a visual that supports it.** If the narration says "the radio
  was tuned to 2182 kilohertz," show the frequency. If it says "six hundred miles off
  course," show the two points on a map.
- Average shot length 4–7 seconds. Something changes every 8 seconds at most.

---

## 2. Archival and public-domain sourcing

Build the habit of searching these before generating anything. Real material is faster,
free, and immeasurably better.

| Source | Best for |
|--------|----------|
| **Library of Congress** (loc.gov) | US photographs, newspapers (Chronicling America), maps, film |
| **US National Archives** (catalog.archives.gov) | Government records, military film, declassified documents |
| **Internet Archive** + **Prelinger Archives** | Public-domain film, ephemera, scanned books |
| **Wikimedia Commons** | Everything, with licence metadata attached — check each file |
| **NASA / USGS / NOAA** | Satellite imagery, terrain, aerial photography, ocean data |
| **Trove** (Australia) | Digitised Australian newspapers, superb for pre-1955 stories |
| **Papers Past** (NZ), **Gallica** (FR), **Europeana** (EU), **Delpher** (NL) | National newspaper and archive scans |
| **David Rumsey Map Collection** / **Old Maps Online** | Historical maps at high resolution |
| **British Newspaper Archive** (paid) / **Newspapers.com** (paid) | UK and US press. Worth one subscription once you are producing weekly |
| **National archives of the country in question** | Always check. Inquiry reports are often online and free |

**Rights discipline:** "old" does not mean public domain, and rules differ by country. Check
the licence on every file, log it in the shot list, and keep the source URL. When a licence
requires attribution, put it in the description. When you cannot establish rights, do not
use the asset — generate an equivalent instead and label it as a recreation.

**Ethical labelling:** if you recreate a document, a photograph or a scene with AI, put a
small mono `RECREATION` tag in the corner of that shot. Non-negotiable. It costs nothing and
it is the difference between a documentary and a forgery.

---

## 3. AI imagery — the method

### Stills first, motion second

Do not generate video from text. Generate a **still image** you fully control, then animate
it. Three reasons: you can iterate on a still for pennies, you avoid the temporal artefacts
that scream "AI," and you keep a consistent look across a hundred shots.

Animate by:
- **2.5D parallax** — cut the still into 3–4 depth layers and move them at different rates.
  This is the workhorse and it looks better than most generated video.
- **Slow push / drift** — 2–4% over 8 seconds.
- **Image-to-video**, 3–5 seconds only, for shots that genuinely need motion (water, smoke,
  fabric, crowd). Cut away before the model drifts.
- **Overlay real elements** — real film grain, real dust, real light leaks, real rain plates
  composited over generated stills. This single trick does more for believability than a
  better prompt.

### The look-bible suffix

Append the same block to every image prompt. This is what creates channel-level consistency.

```
Shot on 35mm film, anamorphic, shallow depth of field, natural available light only,
heavily desaturated cold palette, single warm amber practical light source, lifted
shadows, soft halation on highlights, fine film grain, slight lens vignette,
documentary photography, no text, no watermark, no people looking at camera.
```

Add per-shot: subject, location, time of day, weather, camera position, lens length.

Lock your style using the tool's consistency feature (style reference image, `--sref`, style
codes, or seed locking depending on the model) and reuse the same reference across every
episode. Save it in `assets/style-ref/`.

### The AI-human problem

Generated humans are the loudest tell in the medium. Rules:

- **No AI-generated close-ups of faces. Ever.**
- People appear as: backs of heads, silhouettes, figures at distance, hands only, obscured
  by weather or window glass, out of focus in the foreground, or as period-correct
  photographic *artefacts* (a damaged portrait, a passport photo with the face degraded).
- Crowds only in silhouette or heavy blur — count the fingers and the faces in any crowd
  shot before you use it.
- When you need a real person's face, use their real photograph. If none exists, use an
  empty chair, their signature, their file card, or their name on a card. Absence is more
  powerful than a fabricated face anyway.

### Per-story prompt sets

Build eight reusable prompt templates once (see `templates/prompt-library.md`):
establishing landscape, interior room, object macro, weather/atmosphere, vehicle/vessel,
aerial, corridor/approach, and abstract texture. Every episode fills in the variables. This
turns 90 minutes of prompting into 25.

---

## 4. Maps and diagrams

Maps are the channel's most under-priced asset. They are cheap, they are unmistakably real,
they carry information, and no AI artefact can appear in them.

**Build one template and reuse it forever:**

- Basemap in `#161B1E`, landmass in `#0A0C0D`, coastline hairline in `#3A464C`
- Contours and graticule in `#3A464C` at 30% opacity
- Labels in JetBrains Mono, bone, uppercase, wide tracking
- A single amber marker per map, and an amber route line that draws on over 2–3 seconds
- A scale bar and a north arrow on every map. Always. It reads as rigour

**Tools:**
- **Google Earth Studio** — free, browser-based, keyframes real satellite terrain into
  cinematic flyovers with an After Effects export. For any story with a location, this is
  the highest-value tool on the list. Learn it in an afternoon.
- **QGIS** — for historical coastlines, bathymetry, terrain, and anything that needs real
  data plotted.
- **Mapbox Studio** — custom-styled slippy maps matching the palette exactly.
- **Blender** — terrain from elevation data, for the flagship videos.

**Diagram types to keep in the library:** ship/aircraft cutaway with labelled compartments,
site plan with numbered find locations, timeline strip, search-area overlay with concentric
rings, signal waveform, cross-section of terrain, and a simple scale comparison.

---

## 5. Documents and newspaper graphics

- Prefer real scans, at the highest resolution available. Show the paper — the fold, the
  foxing, the stamp.
- Present them on a base-colour field with a soft drop shadow, slightly rotated (0.5–1.5°),
  with one line highlighted in amber and a mono source caption bottom-left with archive and
  reference number.
- Animate as a slow drift plus a highlight drawing on under the key line, timed to the
  narration hitting that word.
- For newspaper-style graphics that must be built rather than found, use a text-capable
  image model, then composite the type yourself in a real typesetting tool so it is legible
  and correct — generated text in images is unreliable and misspelled headlines destroy
  credibility instantly.
- Translations: show the original, then dissolve to a clean typeset English version. Never
  fake a foreign-language document.

---

## 6. Typographic system

| Element | Spec |
|---------|------|
| **Record card** | Full-bleed base. JetBrains Mono, bone, 14–18pt equivalent. Left-aligned block: `PLACE / DATE / TIME / COORDINATES`. Held 3s with a sub-bass hit |
| **Act card** | Archivo Bold, bone, single word or short phrase, centred, 2.5s |
| **Lower-third source** | JetBrains Mono, cold mid, 60% opacity, bottom-left, always present when a document or quote is on screen |
| **Epistemic tag** | JetBrains Mono, bone at 70%, bottom-left: `RECORD` / `REPORTED` / `THEORY` / `UNKNOWN` |
| **Pull quote** | Newsreader Italic, bone, max 14 words, on base colour, 4s |
| **Timestamp** | JetBrains Mono, amber, top-right, small |
| **Subtitles** | Inter Medium, bone, subtle shadow, 2 lines maximum, always burned-in as an option plus a real `.srt` upload |

Never animate type with easing bounces, character-by-character typewriter effects, or slide-ins
from off-screen. Type appears with a 6-frame fade or a wipe under a rule. That is the whole
vocabulary.

---

## 7. Sound design

| Layer | Content | Level |
|-------|---------|-------|
| Narration | The voice | −16 LUFS short-term |
| Drone | One sustained low tone, changing once per act | −28 to −26 LUFS |
| Texture | Room tone, wind, water, tape hiss, matched to the location | −34 LUFS |
| Pulse | Slow rhythmic element, **only** during Escalation | −30 LUFS |
| Hits | Sub-bass on act cards | Peak −8 dBTP, one per act |

- Real room tone under interior shots. Real wind under exteriors. Even at −34 LUFS the brain
  registers it and the shot stops feeling like a picture.
- Duck the bed 10–12 dB under narration with a slow release.
- **Two seconds of total silence, once per video, at the final line.**
- Master to −14 LUFS integrated, true peak below −1 dBTP.
- Music sourced from a library the niche does not saturate. If you recognise the track from
  another channel, do not use it.

---

## 8. The per-episode asset checklist

- [ ] Shot list complete, every shot typed and sourced
- [ ] Archival search run on at least four archives before any generation
- [ ] AI shot count under 30% of total, no runs of three
- [ ] Zero AI-generated faces in close-up
- [ ] All recreations tagged `RECREATION`
- [ ] At least two original maps or diagrams
- [ ] At least three real documents or photographs
- [ ] Rights and source URL logged for every non-generated asset
- [ ] Grade, grain and halation applied to the full timeline, including graphics
- [ ] Epistemic tags placed
- [ ] Loudness checked at −14 LUFS integrated
