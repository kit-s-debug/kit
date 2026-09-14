/**
 * Drum and bass voices built from Web Audio primitives.
 *
 * Synthesising the beats has three advantages over shipping audio files: there
 * is no licensing question at all, nothing to download before a session can
 * start, and the grid is known to the millisecond — which is what makes the
 * beat-timing score in the analysis honest rather than decorative.
 */

export interface VoiceContext {
  ctx: AudioContext;
  destination: AudioNode;
  /** Shared noise buffer; generating it once keeps scheduling cheap. */
  noise: AudioBuffer;
}

export function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * 2);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function noiseSource(v: VoiceContext, when: number, duration: number): AudioBufferSourceNode {
  const src = v.ctx.createBufferSource();
  src.buffer = v.noise;
  src.loop = true;
  const offset = Math.random() * (v.noise.duration - duration - 0.01);
  src.start(when, Math.max(0, offset));
  src.stop(when + duration);
  return src;
}

function env(
  ctx: AudioContext,
  when: number,
  peak: number,
  attack: number,
  decay: number,
): GainNode {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), when + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + attack + decay);
  return gain;
}

export function kick(v: VoiceContext, when: number, gainValue = 1): void {
  const osc = v.ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, when);
  osc.frequency.exponentialRampToValueAtTime(44, when + 0.09);
  const amp = env(v.ctx, when, 0.9 * gainValue, 0.004, 0.32);
  osc.connect(amp).connect(v.destination);
  osc.start(when);
  osc.stop(when + 0.4);

  // Beater click so the kick reads on phone speakers.
  const click = noiseSource(v, when, 0.02);
  const hp = v.ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;
  const clickAmp = env(v.ctx, when, 0.12 * gainValue, 0.001, 0.02);
  click.connect(hp).connect(clickAmp).connect(v.destination);
}

export function sub(v: VoiceContext, when: number, semitone: number, gainValue = 1): void {
  const freq = 55 * Math.pow(2, semitone / 12);
  const osc = v.ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq * 1.6, when);
  osc.frequency.exponentialRampToValueAtTime(freq, when + 0.12);
  const amp = env(v.ctx, when, 0.72 * gainValue, 0.008, 0.55);
  const lp = v.ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 220;
  osc.connect(lp).connect(amp).connect(v.destination);
  osc.start(when);
  osc.stop(when + 0.7);
}

export function snare(v: VoiceContext, when: number, gainValue = 1): void {
  const body = v.ctx.createOscillator();
  body.type = 'triangle';
  body.frequency.setValueAtTime(190, when);
  body.frequency.exponentialRampToValueAtTime(120, when + 0.08);
  const bodyAmp = env(v.ctx, when, 0.3 * gainValue, 0.002, 0.1);
  body.connect(bodyAmp).connect(v.destination);
  body.start(when);
  body.stop(when + 0.15);

  const noise = noiseSource(v, when, 0.2);
  const bp = v.ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1900;
  bp.Q.value = 0.7;
  const noiseAmp = env(v.ctx, when, 0.5 * gainValue, 0.002, 0.16);
  noise.connect(bp).connect(noiseAmp).connect(v.destination);
}

export function clap(v: VoiceContext, when: number, gainValue = 1): void {
  // Three fast bursts read as a clap rather than a noise blip.
  [0, 0.011, 0.023].forEach((offset, index) => {
    const noise = noiseSource(v, when + offset, 0.14);
    const bp = v.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 1500;
    bp.Q.value = 1.2;
    const amp = env(
      v.ctx,
      when + offset,
      (index === 2 ? 0.5 : 0.24) * gainValue,
      0.001,
      index === 2 ? 0.16 : 0.03,
    );
    noise.connect(bp).connect(amp).connect(v.destination);
  });
}

export function hat(v: VoiceContext, when: number, open: boolean, gainValue = 1): void {
  const duration = open ? 0.24 : 0.045;
  const noise = noiseSource(v, when, duration + 0.02);
  const hp = v.ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = open ? 7000 : 8800;
  const amp = env(v.ctx, when, (open ? 0.16 : 0.13) * gainValue, 0.001, duration);
  noise.connect(hp).connect(amp).connect(v.destination);
}

export function rim(v: VoiceContext, when: number, gainValue = 1): void {
  const osc = v.ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(420, when);
  const bp = v.ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1700;
  bp.Q.value = 4;
  const amp = env(v.ctx, when, 0.26 * gainValue, 0.001, 0.05);
  osc.connect(bp).connect(amp).connect(v.destination);
  osc.start(when);
  osc.stop(when + 0.08);
}

/** A short plucked note for the melodic layer. */
export function pluck(
  v: VoiceContext,
  when: number,
  midi: number,
  duration: number,
  gainValue = 1,
): void {
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const osc = v.ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = freq;
  const detune = v.ctx.createOscillator();
  detune.type = 'sine';
  detune.frequency.value = freq * 2.002;

  const lp = v.ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.setValueAtTime(2600, when);
  lp.frequency.exponentialRampToValueAtTime(700, when + duration);

  const amp = env(v.ctx, when, 0.16 * gainValue, 0.006, duration);
  const detuneAmp = v.ctx.createGain();
  detuneAmp.gain.value = 0.25;

  osc.connect(lp);
  detune.connect(detuneAmp).connect(lp);
  lp.connect(amp).connect(v.destination);

  osc.start(when);
  detune.start(when);
  osc.stop(when + duration + 0.1);
  detune.stop(when + duration + 0.1);
}

export function metronomeClick(v: VoiceContext, when: number, accent: boolean): void {
  const osc = v.ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = accent ? 1600 : 1050;
  const amp = env(v.ctx, when, accent ? 0.28 : 0.16, 0.001, 0.05);
  osc.connect(amp).connect(v.destination);
  osc.start(when);
  osc.stop(when + 0.08);
}
