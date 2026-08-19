# Production Database Schema

One Notion/Airtable base. Five tables.

## Table 1 — Videos (main)
`ID · Working title · Status · Score /25 · Category · Publish date · Runtime · Word count ·
Dossier · Script · Claims sheet · Shot list · Asset folder · Thumbnail A/B/C · Title options ·
Chosen title · CTR 48h/7d/30d · AVD % · Retention @0:30 · Views 48h/7d/30d · Subs gained ·
Retention note · Repackaged? · Search or browse play?`

**Status pipeline:** Idea → Researching → Scripting → Fact-check → Shot list → Assets → VO →
Edit → Packaging → Scheduled → Live

## Table 2 — Idea bank
`Title · Category · Curiosity /5 · Sources /5 · Visuals /5 · Competition /5 · Ad safety /5 ·
Total /25 · One-line premise · Lead source · Notes · Commissioned?`

Only 18+ gets commissioned.

## Table 3 — Source library
`Source · Tier · Archive · URL · Topics covered · Used in episodes · Rights/licence`

Reusable across episodes — this is what makes episode 30 faster than episode 3.

## Table 4 — Asset library
`Asset · Type (map/texture/music/graphic/plate) · File · Built for · Reusable? · Notes`

## Table 5 — Retention log
See `retention-log.md`.

## Views to set up
- **This week** — status ≠ Live, sorted by publish date
- **Buffer count** — status = Scheduled, count must stay ≥ 3
- **Repackage queue** — Live, CTR < 4%, published > 30 days ago
- **Idea bank, commissionable** — score ≥ 18, not commissioned
