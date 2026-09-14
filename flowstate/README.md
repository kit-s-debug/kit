# FLOWSTATE

**Never lose your flow.**

An AI freestyle partner that listens to your bars and helps you find your next
rhyme, idea and line in real time.

This is not a lyric generator. The loop is:

```
pick a beat → start → rap → mic listens → transcript → analysis
            → rhymes + ideas update → finish → scored breakdown
```

---

## Running it

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. No API keys are needed — see
[What needs a key](#what-needs-a-key).

Other scripts:

```bash
npm run build      # production build
npm start          # serve the production build
npm run lint       # eslint (flat config)
npm run typecheck  # tsc --noEmit
```

---

## What is actually running

### The rhyme engine is real, local and synchronous

`lib/rhyme/` is the heart of the product. It holds a curated lexicon of ~1,399
words across 208 rhyme families, where every family shares a rhyme key — the
phoneme run from the last stressed vowel to the end of the word (`make` →
`EY-K`, `money` → `AH-N-IY`). Grouping rather than storing a key per word means
every word in a family is a guaranteed perfect rhyme for every other.

For words the lexicon has never seen, `g2p.ts` derives a key from spelling. It
is stress-aware, which matters more than it sounds: naive rules put the stress
on the wrong syllable of `paper` and return rhymes for `-er`. It handles weak
suffixes (`-ing`, `-ed`, `-er`, `-y`), the orthographic doubling rule
(`letter` is short, `paper` is long), r-controlled vowels (`start` is `AA-R-T`,
never `AE-R-T`) and the patterns where English breaks its own rules (`grind` is
`AY-N-D`).

Keys are compared by forward alignment from the stressed vowel, which is how
English rhyme actually works — so `money` and `running` line up as
`AH-N-IY` / `AH-N-IH-NG` and register as a slant rhyme. A syllable-count
mismatch is penalised, so `paper` does not come back as a rhyme for `shape`.

The search also generates inflected forms: on an `-ing` ending it tries each
family through the transform, so `writing` returns `fighting`, `inviting`,
`igniting` rather than `fight`, `invite`, `ignite`.

Topic detection reads the recent transcript against a tagged vocabulary and
boosts on-subject rhymes, so "chasing money" leans towards work and risk
rather than returning a dictionary dump.

Every part of this runs in well under a millisecond, in the browser, with no
network. That is what lets suggestions land while the bar is still in the air.

### The beats are synthesised, not sampled

`services/audio/` generates every beat in the browser from step-sequenced
patterns — kick, snare, clap, hats, 808 and a melodic layer, scheduled with a
lookahead scheduler against the Web Audio clock. Three consequences:

- No sample clearance question at all, and no third-party audio.
- Nothing to download before a session starts.
- The beat grid is known to the millisecond, which is what makes the beat-timing
  score honest rather than decorative.

The transport also supports hosted audio files. To use a licensed instrumental
later, drop it in `public/beats/` and change the beat's `source` in
`lib/beats.ts` to `{ kind: 'file', url: '/beats/your-loop.mp3' }` — the
transport already handles both.

### The scores are measured, not invented

`lib/analysis/` segments the transcript onto the beat grid and computes each
component from something that happened:

| Score | Measured from |
| --- | --- |
| Rhyme Quality | How many bars resolve into a rhyme, and how cleanly, plus internal rhymes |
| Flow | Coefficient of variation of syllables per bar, and syllable density |
| Consistency | Proportion of bars containing speech |
| Vocabulary | Length-adjusted type-token ratio and content-word ratio |
| Creativity | Distinct rhyme sounds, multisyllabic rhymes, longest chain |
| Beat Timing | Circular variance of vocal onsets against the beat period |

Beat Timing deserves a note. Onsets come from the microphone analyser at frame
rate, independently of speech recognition. The metric is *pocket tightness* —
how consistently you land in the same place in the bar — rather than raw
distance from the beat, because a rapper who deliberately sits behind the beat
is in the pocket, not out of it. Without real onsets (Demo Mode) it falls back
to transcript chunk timings, which is weaker and labelled as a demo session.

---

## What needs a key

**Nothing, to use the app.** With no environment variables set, FLOWSTATE is
fully functional: beats, microphone, transcription, rhymes, ideas, scoring,
history, challenges, settings.

Setting `ANTHROPIC_API_KEY` upgrades exactly two things:

1. **Line ideas during a session** (Full Assist only) — the model writes short
   lines ending on rhymes the local engine already found. Rhymes themselves stay
   local, because a network round trip cannot keep up with a bar.
2. **The written observations on the results screen** — replacing the
   rule-derived ones.

Both degrade silently to the local engine on timeout, error or rate limit.
The key is read server-side only, in `app/api/ai/`, and is never sent to the
browser. Settings shows which provider is answering.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | No | Enables model-written line ideas and session observations |
| `FLOWSTATE_AI_MODEL` | No | Overrides the model (default: `claude-haiku-4-5-20251001`) |

See `.env.example`. Copy it to `.env.local`.

### Adding a different provider

`services/ai/types.ts` defines the `AIProvider` interface. Implement it, add one
branch to `getAIProvider()` in `services/ai/index.ts`, and nothing else in the
app changes — no component knows which provider is answering.

---

## Speech recognition, honestly

Transcription uses the browser's Web Speech API. Its real limitations:

- **Browser support is uneven.** Chrome, Edge and Safari have it; Firefox does
  not. Where it is missing, the app says so and runs in Demo Mode.
- **Chrome and Edge process audio on the vendor's servers.** That transfer is
  made by the browser, not by FLOWSTATE, but users deserve to know — it is
  stated on the privacy page and in Settings.
- **It ends itself after a stretch of silence.** The wrapper restarts it
  automatically, with a ceiling so a broken service cannot loop forever.
- **It can report support and then return nothing** — offline, blocked, or an
  unkeyed browser build. A watchdog catches this: if the microphone is picking
  up sound but no text has arrived, the session offers a one-tap switch to Demo
  Mode rather than saying "Listening" forever.
- **Accuracy is ordinary English accuracy.** It mishears slang and fast
  delivery, and scores move with it. Stated on the terms page.
- **No word-level timing.** Phrase starts are approximated from when interim
  results first appear, which is why beat timing is measured from audio onsets
  instead.

`services/speech/types.ts` defines a `SpeechEngine` interface with two
implementations behind it. Swapping in a streaming server-side transcriber is a
provider change, not a UI change.

---

## Demo Mode

Demo Mode runs a scripted transcript so the whole product can be demonstrated
on a browser with no speech recognition, or with no microphone at all.

It is never disguised:

- Every surface that can show scripted text is labelled **DEMO MODE**.
- The transcript panel is marked **SCRIPTED**.
- The microphone is not opened at all in forced Demo Mode.
- The visualiser follows the *beat*, not a voice, and the label says so — it
  never animates to fake input it is not receiving.
- Sessions are stored with `demoMode: true`, so history and scores stay truthful.

It engages when: the browser has no speech recognition, the microphone is denied
or missing, the user ticks "Run in Demo Mode", or the watchdog above fires and
the user accepts the switch.

---

## Architecture

```
app/                      Next.js App Router pages and API routes
  api/ai/                 Server-side AI endpoints (validated, rate-limited)
components/
  freestyle/              The live stage, setup, orb, transcript
  beat-player/            Library, cards, previews, beat pulse
  ai-suggestions/         Rhyme and idea panels
  analysis/               Score dial, breakdown, results, session detail
  dashboard/              History, challenges, settings, profile
  landing/  nav/  ui/  system/
services/
  ai/                     Provider interface, local engine, hosted provider, client pipeline
  audio/                  Beat transport, drum synthesis, patterns, mic analyser
  speech/                 Web Speech wrapper, demo engine, engine selection
lib/
  rhyme/                  Phonetics, g2p, lexicon, search, topics, ideas
  analysis/               Bar segmentation and scoring
  freestyle/              Session controller
  store/                  App state and live session state (zustand)
  storage/                SessionRepository interface + localStorage implementation
  api/                    Request validation and rate limiting
  hooks/  beats.ts  challenges.ts  gamification.ts
types/                    Shared domain model
```

### Latency

The suggestion pipeline (`services/ai/client.ts`) is ordered deliberately:

1. Run the local engine synchronously and paint.
2. Only if the rhyme *anchor* changed, consider a network call — a new word in
   the same phrase is not a new request.
3. Debounce it (900ms), rate-cap it (2.6s minimum interval), abort the previous
   one, time it out at 4s, and drop any response whose revision has been
   superseded.

Nothing here can block the beat or the transcript.

### Rendering

Live session state is a separate store from app state, and components subscribe
to single fields — a new interim word re-renders the transcript line and nothing
else. Anything updating at frame rate does not go through React at all: the
waveform draws to a canvas from the analyser, and the beat pulse writes to the
DOM from a `requestAnimationFrame` loop.

### Persistence

Sessions go through the `SessionRepository` interface in `lib/storage/`. The
current implementation is localStorage. Connecting a database means writing one
more implementation and changing one line in `getSessionRepository()`.

---

## Privacy

- The microphone is opened when a freestyle starts and released when it ends.
  It is never opened on any other page, and never in forced Demo Mode.
- No audio is recorded, saved or uploaded by FLOWSTATE.
- Rhymes, topic detection and all scoring run in the browser.
- With no provider key, no transcript text leaves the device.
- With a key, transcript slices are sent for line ideas and the session review
  only. Audio is never sent.
- Sessions live in localStorage. No accounts, no analytics, no trackers.
- Settings can switch off transcript storage, delete history, or delete
  everything.

`/privacy` and `/terms` are honest placeholders describing what this build
actually does. They are not legal advice and should be reviewed before launch.

---

## Known limits

- History is per-device: localStorage, no sync.
- Rate limiting is in-process, so it is per-instance behind several instances.
- The lexicon is British/American English only.
- Line ideas from the local engine are template-built. They are grammatical and
  end on the right rhyme, but they are scaffolding rather than writing — this is
  the part a provider key most improves.
- Demo Mode's beat-timing score is derived from scripted chunk timings, not real
  onsets.
