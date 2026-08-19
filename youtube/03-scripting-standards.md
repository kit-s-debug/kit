# 03 — Scripting Standards

The house style guide. Every script is checked against this before it goes to voiceover.

---

## 1. Word budget

| Runtime | Words at 155 wpm | Use |
|---------|------------------|-----|
| 9 min | ~1,400 | A tight single-thread story |
| 12 min | ~1,860 | **The default** |
| 14 min | ~2,170 | A story with two locations or a real twist |
| 30 min | ~4,650 | Quarterly flagship only |

Write to the beat-sheet word counts in `02-content-formula.md`, not to a total. A script
that is 1,860 words but has a 600-word Setup is a broken script even though the total is
right.

---

## 2. Sentence craft

- **Average 10–15 words.** Count it. Most AI drafts average 22–26 and that is the single
  loudest tell.
- **Vary length deliberately.** Long, long, short. The short one carries the weight.
- **One clause per sentence most of the time.** Semicolons are for essays, not for speech.
- **Kill every subordinate clause that starts "which" or "that had been."** Split it into a
  new sentence.
- **No sentence may begin with the same word as the sentence before it.**
- **Read every line aloud.** If you run out of breath, or stumble, or hear yourself
  performing, rewrite it. This is not optional — it is the highest-yield thirty minutes in
  the whole process.

## 3. Diction

**Prefer:**

- Concrete nouns. "The gondola," not "the vessel's interior."
- Real numbers. "Fourteen miles," not "a considerable distance."
- Plain verbs. "Found," "left," "stopped," "wrote."
- Names. Use them. Repeat them. People remember people.

**Avoid:**

- Adjective stacking. One per idea, and only when it carries information.
- Intensifiers: very, extremely, incredibly, utterly, truly, completely.
- Hedged drama: "seemingly," "apparently" used as flavour rather than as an actual
  epistemic marker.
- Latinate verbs where a short one exists: "utilise," "commence," "ascertain," "delve."
- Any word from the forbidden list in `01-channel-strategy.md`.

## 4. The de-AI pass

Run this as a separate, explicit editing pass on every draft. These are the patterns to hunt:

| Tell | Fix |
|------|-----|
| Tricolon everywhere ("no motive, no witness, no answer") | Allowed once per script. Delete the rest |
| "Not just X, but Y" | Delete. Say Y |
| "It's important to note that" / "It's worth noting" | Delete the clause, keep the fact |
| Paragraphs that all run 3 sentences | Vary to 1, 5, 2, 4 |
| Every paragraph ending on a mini-cliffhanger | Two per script maximum |
| Symmetrical sentence pairs ("He never came back. She never stopped looking.") | One per script |
| Summary sentence at the end of each section | Delete all of them |
| "In many ways," "in a sense," "on some level" | Delete |
| Em-dash asides in nearly every paragraph | Cap at three per script |
| The word "ultimately" | Delete |
| Uniformly confident tone across facts and speculation | Apply the epistemic ladder |

### Before / after

**AI draft:**

> The discovery of the abandoned vessel sent shockwaves through the maritime community. What
> investigators found aboard the Joyita was nothing short of baffling — a ship that should
> have been impossible to abandon, yet its entire complement of twenty-five souls had
> seemingly vanished into thin air. It's important to note that the vessel was equipped with
> a cork-lined hull, making it virtually unsinkable. And yet, chillingly, not a single
> person was ever found.

**Rewritten:**

> The Joyita was found on the tenth of November, drifting six hundred miles from where she
> should have been. She was listing heavily to port. The deck was awash.
>
> Twenty-five people had been aboard. None of them were.
>
> [beat]
>
> This mattered because of how the ship was built. Her hull was lined with cork — a
> conversion from her days as a research vessel. Waterlogged, she would sit low and
> uncomfortable. She would not go down. The crew had every reason to stay with her.
>
> Nobody has ever been found.

Note what changed: 92 words to 96 — this is not about brevity. It is about replacing
commentary with facts, replacing "baffling" with the actual reason it is baffling, and
letting a four-word sentence do the emotional work.

---

## 5. Fact discipline

### Source tiers

| Tier | What it is | Rule |
|------|-----------|------|
| **T1** | Primary documents: inquiry reports, court records, ship logs, declassified files, contemporary newspaper scans, peer-reviewed papers, official databases | Always preferred. Cite on screen |
| **T2** | Reputable secondary: books with citations, national broadcaster documentaries and investigations, museum and archive publications, obituaries in papers of record | Usable. Prefer to trace back to T1 |
| **T3** | Popular retellings: mainstream articles without sourcing, encyclopaedia entries, other YouTube videos | **Never a sole source.** Leads only |
| **T4** | Forums, wikis, blogs, social posts | Leads only. Never cited, never repeated |

**The one-claim-one-source rule:** every factual claim in the script maps to a row in the
claims sheet with at least one T1 or T2 source. If a claim cannot be sourced above T3, it
is either cut or explicitly labelled as unverified in the narration.

### Things that get you caught

- **A detail that only exists downstream of one 2011 blog post.** This niche is riddled with
  them. When every source repeats the same sentence with the same phrasing, they are all
  copying one another. Find the original or drop the detail.
- **Numbers that grow.** Casualty figures, distances and durations inflate as stories are
  retold. Go to the inquiry.
- **Quotes with no attributable origin.** If you cannot find who recorded the quote and
  when, do not use it.
- **Photographs of the wrong thing.** Widely-circulated "photos of X" are frequently photos
  of something else entirely. Verify the image, not just the fact.

### The three "do not cover" categories

1. **Stories with no primary record.** If the entire evidentiary basis is a magazine article
   from the 1950s and everything since is a retelling of it, the honest episode is *"here is
   how this story was manufactured"* — which is a great episode — but never present it as
   an unexplained event.
2. **Stories whose central details are known fabrications.** Do not build episodes on them.
   They are, however, excellent *subjects* when the story is the hoax itself.
3. **Anything requiring you to speculate about a living named private individual's guilt.**
   Legal risk and ethical risk, for no gain.

A worked example of the right treatment: several famous "ghost ship" and "man from a country
that doesn't exist" stories have no traceable primary source. The channel does not present
them as mysteries. If they appear at all, they appear in an episode about how untraceable
stories propagate.

---

## 6. Labelling speculation on screen

Narration alone is not enough. Use a persistent mono tag in the lower-left corner:

- `RECORD` — documented, sourced on screen
- `REPORTED` — contemporary account, unverified
- `THEORY` — an explanation, attributed to whoever proposed it
- `UNKNOWN` — no record exists

This costs nothing, takes ten seconds per shot in the edit, and is the most visible signal
that this channel is not the other channels. Viewers screenshot it. It becomes part of the
brand.

---

## 7. Handling death, crime and tragedy

The subject matter demands this section. Two goals: treat real people decently, and stay
fully monetised. They point the same direction.

**Editorial:**
- Name victims. Use their names, not "the victim."
- Never describe injuries in forensic detail. State cause of death plainly and move on.
- No crime-scene photographs of identifiable human remains, ever. Use the exterior, the
  road, the empty room.
- Do not speculate about the last moments of a real person's life beyond what the record
  supports.
- Where families are still living, assume they may watch. Write accordingly.

**Monetisation-safe phrasing** (these keep the video fully eligible without softening
anything factual):
- "He died" / "she was killed" rather than graphic verbs.
- State the manner of death once, clinically, and do not return to it.
- Keep the first 30 seconds free of the most sensitive terms — the opening seconds carry
  disproportionate weight in automated classification.
- No sensitive terminology in the title or the thumbnail text.
- Frame the video as an investigation of a record, which is what it is.

Self-certify honestly in the upload flow. A video correctly marked and carefully written
generally comes through fine; a video that tries to hide its subject matter and gets caught
does worse.

---

## 8. Originality

- **Never work from another YouTube video.** Not as a source, not as a structure, not as a
  starting point. Watch competitors *after* you have written, only to check you have not
  accidentally converged, and only after the script is locked.
- Build every episode from the document set up. If your research dossier contains only
  secondary retellings, you do not yet have an episode.
- Quotations from copyrighted books: brief, attributed on screen, and rewritten into your
  own narration wherever the quote is not itself the point.
- Your structure, your sequencing decisions and your prose are the product. The facts are
  everybody's.

---

## 9. The pre-voiceover checklist

Do not record until every box is ticked.

- [ ] Read aloud start to finish, out loud, with a timer
- [ ] Average sentence length under 16 words
- [ ] Zero forbidden phrases
- [ ] De-AI pass complete
- [ ] Every claim mapped in the claims sheet, no T3-only claims
- [ ] Epistemic ladder used at least four times; "nobody knows" appears at least once
- [ ] Withheld detail planted in Setup and paid off in Revelation
- [ ] Pivot line placed once at ~40%
- [ ] Direct address used exactly once
- [ ] Cold open holds no context and no channel name
- [ ] Ending contains no summary
- [ ] Pronunciation list built for every name, place and foreign-language term
- [ ] Runtime estimate within 60 seconds of target
