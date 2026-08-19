# 05 — The AI Production Workflow

**Target: a finished 12-minute documentary in 6–8 working hours, spread across four days.**

The first three videos will take 14–18 hours each. That is expected and it is not wasted —
you are building the template library, and the library is what buys the speed back. By video
six you should be at 8 hours. By video ten, 6.

Two principles govern the whole pipeline:

- **AI drafts, human decides.** Every AI output is an input to a human judgement, never a
  finished artefact. The two places this is absolutely inviolable are the fact-check and the
  final script pass.
- **Templates over effort.** Anything you do twice becomes a template. Speed comes from
  never solving a solved problem again.

---

## Stage 0 — The idea bank (ongoing, 30 min/week)

A running table in your production database. Never start a video from a blank page.

**Weekly sweep, 30 minutes, same slot:**
- One national archive's recent-releases page
- One newspaper archive, searching a period term ("inquiry found no explanation", "never
  identified", "abandoned vessel")
- Wikipedia category walks: unsolved deaths, unexplained disappearances, abandoned
  settlements, unidentified decedents, list of maritime incidents
- Recent papers: search Google Scholar and Nature/Science news for archaeology, ancient
  DNA, forensic identification. **This is where the best episodes come from** — a new
  scientific result on an old mystery gives you a genuine third-act reveal
- One long-form journalism outlet's archive

**Score every idea out of 25 before it can be commissioned:**

| Criterion | 1 | 5 |
|-----------|---|---|
| **Curiosity gap** | Everyone knows this | "How have I never heard of this?" |
| **Source depth** | Blog posts only | Primary documents, inquiry, papers |
| **Visual availability** | Nothing exists | Photographs, film, maps, documents |
| **Competition** | Three channels over 1M subs did it last year | Nobody has covered it properly |
| **Ad safety** | Graphic violence, children, current politics | Historical, non-graphic |

**Only build ideas scoring 18+.** A 16 that you love will underperform and you will blame
the algorithm.

---

## Stage 1 — Research (90 min)

**Output: a research dossier** (`templates/research-dossier.md`).

1. **AI sweep, 20 min.** Ask a search-enabled model for: a chronology, the named people, the
   official investigations and their findings, the competing explanations with their
   proponents, the disputed details, the primary documents that exist and where, and — this
   prompt matters — *"list the claims that appear widely online but that you cannot trace to
   a primary source."* That last list is your trap map.
2. **Primary document hunt, 40 min.** Go and get the actual inquiry report, the newspaper
   scans, the paper. Download them. Everything you find goes in a folder for this episode.
3. **Grounded synthesis, 20 min.** Load the documents you downloaded into a
   grounded-retrieval tool (NotebookLM is purpose-built for this) and interrogate *those
   documents only*. This is the step that eliminates hallucinated detail — the model can
   only answer from what you gave it.
4. **Write the open-questions list, 10 min.** What does nobody know? This list *is* your
   third act.

**Dossier must contain:** chronology with dated entries and sources · cast list with one
human detail each · geography note with coordinates · list of official findings · competing
explanations with attribution · disputed/untraceable claims · open questions · source table
with tiers · asset leads (which archive has what).

---

## Stage 2 — Script (90 min)

1. **Beat sheet first, 15 min.** Fill the eight beats from `02-content-formula.md` with one
   line each. Decide now: what is the withheld detail, where is the pivot, what is the last
   line. If you cannot fill the Revelation line, you do not have an episode yet — go back to
   research.
2. **AI draft against the beat sheet, 20 min.** Give the model the dossier, the beat sheet,
   the word budget per beat, and `03-scripting-standards.md`. Ask for the draft beat by beat,
   not all at once — you get better control and better prose.
3. **The human pass, 45 min.** This is the real work. Rewrite line by line. Cut 15%. Apply
   the de-AI checklist. Add the specific numbers and names. Fix the rhythm.
4. **Read aloud with a timer, 10 min.** Fix every stumble. Note the runtime.

**Never publish a script you have not rewritten by hand.** The AI draft's job is to defeat
the blank page and hold the structure. Everything an audience actually responds to — rhythm,
restraint, the choice of which detail to withhold — comes from the human pass.

---

## Stage 3 — Fact check (45 min)

Separate session. Fresh context. Ideally a different model from the one that wrote it.

1. **Extraction, 10 min.** Prompt: *"Read this script. Output every factual claim as a
   numbered list — dates, names, numbers, quotations, causal statements. Do not summarise.
   Do not comment."*
2. **Adversarial pass, 10 min.** Prompt: *"For each claim, rate your confidence 1–5 and state
   what source would verify it. Flag any claim that is commonly repeated but poorly sourced.
   Flag any claim that appears to be an inference rather than a record."*
3. **Human verification, 20 min.** Every claim rated 3 or below, and every flagged claim, gets
   checked against the primary documents in the episode folder. No exceptions, no "it's
   probably fine."
4. **Resolve, 5 min.** Each claim either gets a T1/T2 source, gets rewritten with an
   epistemic marker, or gets cut.

Fill `templates/factcheck-sheet.md`. Keep it — it is your defence if a claim is ever
challenged, and it makes the next episode on a related topic faster.

---

## Stage 4 — Shot list (30 min)

Split the locked script into 90–110 shots in a spreadsheet
(`templates/shot-list.csv`). Columns:

`shot_no · timecode · narration_line · shot_type · description · source_or_prompt · epistemic_tag · duration · status`

- Assign `shot_type` from the taxonomy and immediately check the mix percentages.
- For archival shots, write the actual search query and the archive to search.
- For AI shots, write the full prompt now, with the look-bible suffix appended.
- For maps, note which template and what data.
- Mark where each retention device fires.

Doing this as one focused pass means the edit becomes assembly rather than invention, which
is where most of the time saving lives.

---

## Stage 5 — Asset generation (60–90 min, mostly unattended)

Batch by type, not by chronology. Generate all AI stills in one run. Do all archive
downloads in one run. Build all maps in one session.

- Generate 2–3 variants per AI shot; pick in a single review pass, not one at a time.
- Name files `shot_014_interior.png` so the edit self-assembles.
- Run Google Earth Studio renders while you do something else.
- Log rights for everything downloaded, in the shot list, as you go.

---

## Stage 6 — Voiceover (30 min)

**If using AI narration:**
- Build the pronunciation list first — every name, place and foreign term, written
  phonetically. Feed it to the model or record those words separately.
- Render **paragraph by paragraph**, not the whole script at once. Paragraph-level renders
  let you re-roll a bad line without regenerating everything, and they keep the pacing from
  flattening out across a long file.
- Use punctuation and line breaks to control pace. Full stops for hard stops, ellipses
  sparingly, a blank line for a beat.
- Keep stability/similarity settings consistent across the whole channel and write them
  down. Voice drift between episodes is a brand problem.
- **Then edit the audio.** Extend the pauses at act breaks. Remove breaths that land in the
  wrong place, keep the ones that land right. Nudge the pace down on the final line of each
  act. Twenty minutes here is the difference between "AI narration" and "narration."

**If using a human:** a good voice actor costs roughly £80–200 per 2,000-word script. Buy
this as soon as the channel earns anything. Give them the pronunciation list, three
reference clips for tone, and explicit instruction to *under*-perform.

---

## Stage 7 — Edit (120–180 min)

Order of operations. Do not deviate — working out of order is what makes edits take a day.

1. **Lay the VO** on the timeline. Mark act boundaries with markers.
2. **Assembly:** drop every shot in order from the shot list against the narration. Do not
   adjust anything yet. 45 min.
3. **Timing pass:** set each cut on the narration beat. Extend or trim to the 4–7 second
   target. Add the push-ins. 30 min.
4. **Graphics pass:** record cards, act cards, lower-thirds, epistemic tags, highlights on
   documents. All from templates. 25 min.
5. **Sound pass:** drone, texture, pulse, hits, ducking, the one silence. 25 min.
6. **Grade pass:** one adjustment layer over everything — desaturation, lifted black,
   halation, grain, vignette. Applied globally so all source types match. 15 min.
7. **Captions:** auto-generate, then correct every proper noun. Export `.srt`. 15 min.
8. **Watch once, start to finish, without touching anything.** Note problems on paper. Then
   fix them. 20 min.

**The project template is everything.** Build one Resolve/Premiere project with the bins,
the adjustment layer, the grade, the title templates, the map template, the audio bus
structure and the export preset already configured. Duplicate it for every episode. This
single asset saves an hour a week forever.

---

## Stage 8 — Packaging (45 min)

Never an afterthought. In a browse-driven niche, packaging determines whether the film gets
watched at all.

1. **Thumbnail, 25 min.** Make **three**, genuinely different — not three colour variants.
   One image-led, one document/artefact-led, one text-led. Look at all three at 210×118
   pixels, which is roughly how they appear on a phone. Pick the one that survives.
2. **Title, 10 min.** Write five. Apply the tests in `06-video-slate.md`. Pick one.
3. **Description, 5 min.** First two lines are the only ones most people see and they feed
   search: a one-sentence premise plus the key proper nouns. Then chapters (with real
   chapter names, not "Part 2"), then a sources block listing your T1/T2 sources with links.
   **The visible source list is a trust signal and it is free.**
4. **Metadata, 5 min.** Chapters, end screen pointing at a deliberately chosen next video,
   the correct playlist, and honest self-certification for advertiser suitability.

---

## Stage 9 — Publish and the 48-hour loop (30 min + monitoring)

- Publish at the fixed slot. Do not premiere — premieres split the initial impression push
  for a channel this size.
- **Reply to every comment for the first four hours,** then twice daily for 48 hours. This is
  the highest-leverage growth activity available to a small channel and it takes minutes.
- Pin a comment containing a *real additional fact* that is not in the video, with its source.
  Not a subscribe request.
- **At 48 hours, read the retention graph** against the diagnostic table in
  `02-content-formula.md`. Write one line in `templates/retention-log.md` about what you will
  do differently. One change per video, tracked.
- **At 7 days and again at 30 days**, if click-through is below about 4%, swap the thumbnail
  for one of your other two. Old videos are inventory, not history — repackaging a video
  from month one during month six is one of the reliable ways small channels break out.

---

## The tool stack

The landscape moves quickly; these are the categories and current strong options. Total
running cost at the low end is roughly £40–70/month.

| Job | Primary | Alternatives | Notes |
|-----|---------|--------------|-------|
| Research sweep | A search-enabled frontier model | — | Always demand source URLs |
| Grounded synthesis | NotebookLM | Any RAG tool over your own PDFs | The anti-hallucination step |
| Scripting | Claude (long context, restrained prose) | — | Feed it the standards doc every time |
| Fact-check | A *different* model, fresh context | — | Adversarial prompt, not a review request |
| Voice | ElevenLabs | PlayHT, Speechify Studio; a human on Voices.com or Fiverr | Human voice = first paid upgrade |
| Stills | Midjourney (style refs = consistency) | Flux, Imagen, Nano Banana for edits | Lock one style reference for the channel |
| Text-in-image | Ideogram | — | Only for signage/headlines, then re-typeset by hand |
| Image→video | Runway, Kling, Luma, Veo | — | 3–5 second clips only |
| Maps (cinematic) | **Google Earth Studio** | — | Free. Highest value tool on this list |
| Maps (data) | QGIS | Mapbox Studio | Historical coastlines, bathymetry |
| 3D / terrain | Blender | — | Flagship videos only |
| Edit + grade | DaVinci Resolve (free tier is enough) | Premiere Pro | Fusion handles the motion graphics too |
| Motion graphics | After Effects | Resolve Fusion | Earth Studio exports straight to AE |
| Music & SFX | Epidemic Sound / Artlist | Free: YouTube Audio Library, Freesound | Avoid tracks the niche has saturated |
| Thumbnails | Photoshop / Affinity Photo | Figma, Photopea (free) | Build one layered template |
| Production DB | Notion or Airtable | A spreadsheet | Schema below |
| Analytics | YouTube Studio | vidIQ / TubeBuddy for title testing | Retention graph is the only number that matters early |

### Production database schema

One table, one row per video:

`ID · Working title · Status (Idea/Researching/Scripting/Fact-check/Assets/VO/Edit/Packaging/Scheduled/Live) · Score /25 · Category · Publish date · Runtime · Word count · Dossier link · Script link · Claims sheet link · Shot list link · Asset folder · Thumbnail variants · Title options · Chosen title · CTR · AVD % · Views 48h/7d/30d · Retention note · Repackaged?`

Linked tables: **Idea bank** (scored), **Source library** (reusable across episodes),
**Asset library** (maps, textures, music cues you can re-use), **Retention log**.

---

## The template library

Build these once, in a dedicated week before launch. This list *is* the efficiency plan.

**Editorial:** research dossier · beat sheet · script template with beat markers and word
counts · claims sheet · shot list CSV · packaging sheet · pronunciation list · retention log

**Prompts:** the eight visual prompt templates · the look-bible suffix · research sweep
prompt · script draft prompt · fact-check extraction prompt · fact-check adversarial prompt
· title generation prompt · thumbnail concept prompt

**Visual:** NLE project template · grade/grain adjustment layer · record card · act card ·
lower-third · epistemic tag · document plate · timeline strip · end card · map template ·
Earth Studio project template · thumbnail PSD

**Audio:** drone/texture/pulse pack · act hit · bus structure with ducking pre-configured ·
loudness export preset

---

## Four-day production week

| Day | Stages | Hours |
|-----|--------|-------|
| **Mon** | Idea sweep · Research · Beat sheet | 2.5 |
| **Tue** | Script draft · Human pass · Fact check | 2.5 |
| **Wed** | Shot list · Batch assets · Voiceover | 2.0 |
| **Thu** | Edit (all eight passes) | 3.0 |
| **Fri** | Package · Publish previous week's video · Comments | 1.5 |

**Batching upgrade, once you are comfortable:** run research and scripting for *two* videos
in a single Monday/Tuesday, then alternate a "writing week" with an "edit week." Context
switching is the hidden cost in this pipeline, and batching removes most of it. Same output,
noticeably less fatigue.
