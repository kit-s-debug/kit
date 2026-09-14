/**
 * The beat library.
 *
 * Every beat here is generated in the browser from the patterns in
 * `services/audio/patterns.ts`, so there is no sample clearance question and
 * nothing to download before a session starts. To add a licensed instrumental
 * later, drop the file in /public/beats and change `source` to
 * `{ kind: 'file', url: '/beats/your-loop.mp3' }` — the transport already
 * handles both.
 */

import type { Beat, BeatCategory } from '@/types';

export const BEAT_CATEGORIES: Array<{ id: BeatCategory; label: string; blurb: string }> = [
  { id: 'boom-bap', label: 'Boom Bap', blurb: 'Swung drums, room to think' },
  { id: 'trap', label: 'Trap', blurb: 'Rolling hats, heavy low end' },
  { id: 'drill', label: 'Drill', blurb: 'Sliding 808s, dark and sparse' },
  { id: 'chill', label: 'Chill', blurb: 'Slow, warm, easy to sit behind' },
  { id: 'freestyle', label: 'Freestyle', blurb: 'Plain loops that stay out of the way' },
  { id: 'old-school', label: 'Old School', blurb: 'Straight-ahead, bright, classic' },
];

export const BEATS: Beat[] = [
  {
    id: 'basement-tape',
    name: 'Basement Tape',
    bpm: 88,
    category: 'boom-bap',
    mood: 'Dusty, patient',
    duration: 300,
    source: { kind: 'synth', pattern: 'boom-bap' },
    hue: 28,
    description: 'Swung hats and a lazy kick. The easiest pocket to find if you are warming up.',
  },
  {
    id: 'fire-escape',
    name: 'Fire Escape',
    bpm: 94,
    category: 'boom-bap',
    mood: 'Nocturnal, steady',
    duration: 300,
    source: { kind: 'synth', pattern: 'boom-bap' },
    hue: 12,
    description: 'A touch quicker, with a snare that pushes you to keep moving.',
  },
  {
    id: 'night-shift',
    name: 'Night Shift',
    bpm: 140,
    category: 'trap',
    mood: 'Cold, spacious',
    duration: 300,
    source: { kind: 'synth', pattern: 'trap' },
    hue: 268,
    description: 'Half-time feel. Counts fast, sits slow — plenty of room between the claps.',
  },
  {
    id: 'low-ceiling',
    name: 'Low Ceiling',
    bpm: 146,
    category: 'trap',
    mood: 'Tense, rolling',
    duration: 300,
    source: { kind: 'synth', pattern: 'trap' },
    hue: 292,
    description: 'Hat rolls and a restless 808. Rewards short, punched phrases.',
  },
  {
    id: 'blue-hour',
    name: 'Blue Hour',
    bpm: 142,
    category: 'drill',
    mood: 'Dark, sliding',
    duration: 300,
    source: { kind: 'synth', pattern: 'drill' },
    hue: 214,
    description: 'Sliding bass and an off-grid snare. Hardest pocket here, and the most fun once you find it.',
  },
  {
    id: 'quiet-carriage',
    name: 'Quiet Carriage',
    bpm: 78,
    category: 'chill',
    mood: 'Warm, unhurried',
    duration: 300,
    source: { kind: 'synth', pattern: 'chill' },
    hue: 168,
    description: 'Soft rimshot and a mellow chord loop. Good for writing out loud.',
  },
  {
    id: 'open-window',
    name: 'Open Window',
    bpm: 84,
    category: 'chill',
    mood: 'Light, airy',
    duration: 300,
    source: { kind: 'synth', pattern: 'chill' },
    hue: 142,
    description: 'The gentlest beat in the library. Nothing in it will push you off balance.',
  },
  {
    id: 'plain-loop',
    name: 'Plain Loop',
    bpm: 92,
    category: 'freestyle',
    mood: 'Neutral, open',
    duration: 300,
    source: { kind: 'synth', pattern: 'freestyle' },
    hue: 196,
    description: 'Kick, snare, hats and almost nothing else. Built to stay out of your way.',
  },
  {
    id: 'cypher-ninety',
    name: 'Cypher Ninety',
    bpm: 98,
    category: 'freestyle',
    mood: 'Direct, driving',
    duration: 300,
    source: { kind: 'synth', pattern: 'freestyle' },
    hue: 44,
    description: 'The pace most cyphers settle on. Fast enough to push, slow enough to think.',
  },
  {
    id: 'park-jam',
    name: 'Park Jam',
    bpm: 104,
    category: 'old-school',
    mood: 'Bright, bouncing',
    duration: 300,
    source: { kind: 'synth', pattern: 'old-school' },
    hue: 56,
    description: 'Busy hats and a forward snare. Classic tempo, plenty of energy.',
  },
];

export const DEFAULT_BEAT_ID = 'plain-loop';

export function getBeat(id: string | null | undefined): Beat {
  return BEATS.find((beat) => beat.id === id) ?? BEATS.find((b) => b.id === DEFAULT_BEAT_ID)!;
}

export function beatsByCategory(category: BeatCategory | 'all'): Beat[] {
  if (category === 'all') return BEATS;
  return BEATS.filter((beat) => beat.category === category);
}

export function categoryLabel(category: BeatCategory): string {
  return BEAT_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}
