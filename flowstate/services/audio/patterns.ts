/**
 * Drum patterns for the synthesised beats.
 *
 * Each voice is a string of 16 steps per bar (one bar per line-segment), read
 * left to right. `x` is a hit, `o` an accent, `-` a ghost note, `.` a rest.
 * Four bars make a loop. Writing them as text keeps the whole groove of a beat
 * visible in one place, which matters when tuning feel.
 */

export type VoiceName = 'kick' | 'snare' | 'clap' | 'hat' | 'openHat' | 'rim' | 'sub';

export interface DrumPattern {
  /** Steps per bar. 16 = sixteenth notes. */
  resolution: 16;
  bars: number;
  voices: Partial<Record<VoiceName, string>>;
  /** 0 = straight, 0.2 = noticeable swing on off-beat sixteenths. */
  swing: number;
  /** Semitone offsets for the bass line, one per bar. */
  bassline: number[];
  /** Root note as a MIDI number for the melodic layer. */
  root: number;
  /** Scale degrees (semitones) the melodic layer draws from. */
  scale: number[];
  /** Which sixteenths the melodic layer plays, per bar. */
  melody: string;
  melodyOctave: number;
  /** Low-pass cutoff in Hz for the whole mix's character. */
  tone: number;
  /** Vinyl/air noise level, 0-1. */
  texture: number;
}

const MINOR = [0, 2, 3, 5, 7, 8, 10];
const MINOR_PENT = [0, 3, 5, 7, 10];
const DORIAN = [0, 2, 3, 5, 7, 9, 10];

export const PATTERNS: Record<string, DrumPattern> = {
  'boom-bap': {
    resolution: 16,
    bars: 4,
    swing: 0.18,
    voices: {
      kick:    'x.......x..x....x.......x..x....x.......x..x....x.....x.x..x....',
      snare:   '....x.......x.......x.......x.......x.......x.......x.......x...',
      hat:     'x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-x-',
      openHat: '..............x...............x...............x...............x.',
      rim:     '................................................x...............',
    },
    bassline: [0, 0, -4, -2],
    root: 38,
    scale: MINOR,
    melody: 'x...x..x....x...x...x..x....x...x...x..x....x...x...x..x..x.x...',
    melodyOctave: 1,
    tone: 5200,
    texture: 0.1,
  },
  trap: {
    resolution: 16,
    bars: 4,
    swing: 0,
    voices: {
      kick:    'x.....x...x.....x.....x...x.....x.....x...x.....x.....x...x.x...',
      clap:    '........x...............x...............x...............x.......',
      hat:     'x.x.x.xxx.x.x.xxx.x.x.xxx.x.x.x.x.x.x.xxx.x.x.xxx.x.x.xxxxxxxxxx',
      sub:     'x.....x...x.....x.....x...x.....x.....x...x.....x.....x...x.x...',
    },
    bassline: [0, 0, 5, 3],
    root: 33,
    scale: MINOR_PENT,
    melody: 'x..x..x...x..x..x..x..x...x..x..x..x..x...x..x..x..x..x...x..x..',
    melodyOctave: 2,
    tone: 8000,
    texture: 0.04,
  },
  drill: {
    resolution: 16,
    bars: 4,
    swing: 0,
    voices: {
      kick:    'x.......x.x.....x.......x...x...x.......x.x.....x.....x.x.......',
      snare:   '..........x.......x.........x.......x.........x.......x.........',
      hat:     'x..x..x.x..x..x.x..x..x.x..x.xxxx..x..x.x..x..x.x..x..x.x.xxx.x.',
      sub:     'x.......x.x.....x.......x...x...x.......x.x.....x.....x.x.......',
    },
    bassline: [0, -2, -5, -3],
    root: 31,
    scale: MINOR,
    melody: 'x...x...x...x...x...x...x...x...x...x...x...x...x...x...x...x...',
    melodyOctave: 2,
    tone: 6000,
    texture: 0.06,
  },
  chill: {
    resolution: 16,
    bars: 4,
    swing: 0.22,
    voices: {
      kick:    'x.......x.......x.......x.....x.x.......x.......x.......x.......',
      rim:     '....x.......x.......x.......x.......x.......x.......x.......x...',
      hat:     '..x...x...x...x...x...x...x...x...x...x...x...x...x...x...x...x.',
    },
    bassline: [0, 3, -2, -4],
    root: 40,
    scale: DORIAN,
    melody: 'x.....x...x.....x...x.....x.....x.....x...x.....x...x.....x.....',
    melodyOctave: 1,
    tone: 3400,
    texture: 0.16,
  },
  freestyle: {
    resolution: 16,
    bars: 4,
    swing: 0.1,
    voices: {
      kick:    'x.......x.......x.......x.......x.......x.......x.......x...x...',
      snare:   '....x.......x.......x.......x.......x.......x.......x.......x...',
      hat:     'x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.x.',
      openHat: '..............x...............x...............x...............x.',
    },
    bassline: [0, 0, 3, -2],
    root: 36,
    scale: MINOR_PENT,
    melody: 'x...x...x...x...x...x...x...x...x...x...x...x...x...x...x...x...',
    melodyOctave: 1,
    tone: 6500,
    texture: 0.08,
  },
  'old-school': {
    resolution: 16,
    bars: 4,
    swing: 0.12,
    voices: {
      kick:    'x.....x.x.....x.x.....x.x.....x.x.....x.x.....x.x.....x.x...x.x.',
      snare:   '....x.......x.......x.......x.......x.......x.......x.......x...',
      hat:     'x.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xxx.xx',
      openHat: '......x.......x.......x.......x.......x.......x.......x.......x.',
      clap:    '....x.......x.......x.......x.......x.......x.......x.......x...',
    },
    bassline: [0, 0, 5, 5],
    root: 40,
    scale: MINOR_PENT,
    melody: 'x..x..x.x..x..x.x..x..x.x..x..x.x..x..x.x..x..x.x..x..x.x..x..x.',
    melodyOctave: 1,
    tone: 7000,
    texture: 0.14,
  },
};

export function patternFor(id: string): DrumPattern {
  return PATTERNS[id] ?? PATTERNS.freestyle!;
}
