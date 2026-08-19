# Prompt Library

## The look-bible suffix — append to every image prompt

```
Shot on 35mm film, anamorphic, shallow depth of field, natural available light only,
heavily desaturated cold palette, single warm amber practical light source, lifted
shadows, soft halation on highlights, fine film grain, slight lens vignette,
documentary photography, no text, no watermark, no people looking at camera.
```

Plus your locked style reference. Save it at `assets/style-ref/`.

## Eight shot templates

1. **Establishing landscape** — `[LOCATION], [SEASON], [TIME OF DAY], [WEATHER], wide, camera at [HEIGHT], horizon low in frame, no people` + suffix
2. **Interior** — `Interior of [SPACE], [ERA] period-correct fittings, [LIGHT SOURCE] as only light, empty, objects left mid-use, wide 24mm` + suffix
3. **Object macro** — `Macro of [OBJECT] on [SURFACE], raking amber light from left, black background, extreme detail, product-photography sharpness` + suffix
4. **Weather / atmosphere** — `[WEATHER] over [TERRAIN], no subject, long lens compression, visibility [X] metres` + suffix
5. **Vehicle / vessel** — `[VEHICLE], [ERA], [CONDITION], three-quarter view at distance, [ENVIRONMENT], no people visible` + suffix
6. **Aerial** — `Aerial looking down at [SUBJECT], [ALTITUDE], overcast flat light, survey-photography framing, no lens flare` + suffix
7. **Corridor / approach** — `Looking down [PASSAGE] towards [DESTINATION], single light source at far end, symmetrical, deep focus` + suffix
8. **Abstract texture** — `Extreme close-up of [MATERIAL], shallow focus, amber rim light, abstract, fills frame` + suffix

**Human figures:** back of head · silhouette · at distance · hands only · obscured by
weather or glass · out of focus foreground. Never a generated close-up face.

## Research sweep

> I'm researching [EVENT/PLACE] for a documentary. Give me, with a source URL for each:
> (1) a dated chronology; (2) every named person and their role; (3) every official
> investigation and its stated finding; (4) the competing explanations and who proposed
> each; (5) which primary documents exist and where they are held; (6) **claims that
> appear widely online but which you cannot trace to a primary source.** Mark anything
> you are uncertain about. Do not fill gaps with plausible detail — say "no record found."

## Script draft

> You are drafting narration for a documentary channel. Follow the attached standards
> document exactly. Write **only beat [N]** of the attached beat sheet, to [N] words.
> Use only facts from the attached dossier. Average sentence length under 15 words. No
> adjective stacking. No rhetorical questions. Mark any claim that is a theory rather
> than a record. If a fact you need isn't in the dossier, write `[NEEDS FACT: ...]`
> rather than inventing it.

## Fact-check — extraction

> Read this script. Output every factual claim as a numbered list — dates, names,
> numbers, quotations, causal statements, physical descriptions. Verbatim. Do not
> summarise, comment, or assess.

## Fact-check — adversarial

> For each numbered claim: rate your confidence 1–5, state what source would verify it,
> and flag it if (a) it is commonly repeated but poorly sourced, (b) it is an inference
> presented as a record, or (c) it is a number that tends to inflate in retellings.
> Assume the script is wrong and try to prove it.

## Titles

> Generate 12 title options for a documentary about [PREMISE]. Rules: state a real
> strange fact and stop; must still feel true after watching; under 60 characters where
> possible; a concrete noun in the first three words; no question mark unless the video
> answers it; no "vanished", "chilling", "shocking", "you won't believe". Prefer two
> short sentences over one long one. Then rank them and explain your top three.

## Thumbnail concepts

> Propose 3 thumbnail concepts for [PREMISE]: one image-led, one artefact/document-led,
> one text-led. Constraints: one dominant image; 3–5 words of text max; a single amber
> accent marking the anomaly; no faces reacting, no arrows, no outlined heads; must be
> legible at 210×118 pixels. For each, name the exact image and where the amber goes.
