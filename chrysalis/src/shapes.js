// Particle formations. Every function fills a Float32Array of xyz triples
// (count * 3) centred on the origin, roughly 3 units across, so the scene can
// morph the same particles from one formation to the next.

// Seeded random so the formations are identical on every load.
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// Silhouette of the chrysalis: radius at height y (y from -1.25 to 1.0).
// Broad shoulders, tapering to a soft point at the base.
export const CHRYSALIS_BOTTOM = -1.25;
export const CHRYSALIS_TOP = 1.0;
export function chrysalisRadius(y) {
  const t = (y - CHRYSALIS_BOTTOM) / (CHRYSALIS_TOP - CHRYSALIS_BOTTOM);
  if (t <= 0 || t >= 1) return 0;
  const u = Math.pow(t, 1.35);
  return 0.6 * Math.pow(Math.sin(Math.PI * u), 0.72);
}

// 0. on the chrysalis shell
export function shell(out, count, seed = 11) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    // sample by surface area so the narrow tips aren't crowded
    let y;
    do { y = CHRYSALIS_BOTTOM + r() * (CHRYSALIS_TOP - CHRYSALIS_BOTTOM); } while (r() * 0.6 > chrysalisRadius(y));
    const a = r() * Math.PI * 2;
    const rad = chrysalisRadius(y) * 1.01;
    out[i * 3] = Math.cos(a) * rad;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = Math.sin(a) * rad * 0.86;
  }
}

// 1. a slow spiral of gold dust filling the view
export function cloud(out, count, seed = 12) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const arm = i % 3;
    const d = Math.pow(r(), 0.6) * 4.2 + 0.4;
    const a = d * 1.15 + (arm * Math.PI * 2) / 3 + (r() - 0.5) * 0.9;
    const spread = 0.25 + d * 0.12;
    out[i * 3] = Math.cos(a) * d + (r() - 0.5) * spread;
    out[i * 3 + 1] = (r() - 0.5) * (0.6 + d * 0.35) + Math.sin(a) * 0.3;
    out[i * 3 + 2] = Math.sin(a) * d * 0.55 + (r() - 0.5) * spread - 0.6;
  }
}

// 2. a brow arch built from individual hairs: dense and upright at the inner
// end, peaking two thirds along, fine and flat toward the tail.
export function brow(out, count, seed = 13) {
  const r = rng(seed);
  const HAIRS = 420;
  const arch = (t) => 0.62 * Math.sin(Math.PI * Math.pow(t, 0.72)) - 0.18 * t - 0.3;
  const hairs = [];
  for (let h = 0; h < HAIRS; h++) {
    const t = Math.pow(r(), 0.9);
    const thick = 0.42 * Math.pow(1 - t, 0.75) + 0.05;
    const y0 = arch(t) - thick * 0.5 + r() * thick * 0.35;
    const lean = (1.25 - t * 1.0) + (r() - 0.5) * 0.25; // upright at the head, flat at the tail
    hairs.push({ x: -1.6 + t * 3.2, y: y0, len: thick * (0.8 + r() * 0.5), lean, z: (r() - 0.5) * 0.1 });
  }
  for (let i = 0; i < count; i++) {
    const h = hairs[i % HAIRS];
    const u = r();
    out[i * 3] = h.x + Math.cos(h.lean) * h.len * u + (r() - 0.5) * 0.008;
    out[i * 3 + 1] = h.y + Math.sin(h.lean) * h.len * u + (r() - 0.5) * 0.008;
    out[i * 3 + 2] = h.z;
  }
}

// 3. a fan of curled lashes rising from a lid line
export function lashes(out, count, seed = 14) {
  const r = rng(seed);
  const N = 34;
  const lid = (s) => [-1.55 + s * 3.1, -0.75 + 0.5 * Math.sin(Math.PI * s)];
  const lash = [];
  for (let k = 0; k < N; k++) {
    const s = (k + 0.5 + (r() - 0.5) * 0.4) / N;
    const [x, y] = lid(s);
    // lid normal, fanned further out toward the corners
    const slope = 0.5 * Math.PI * Math.cos(Math.PI * s) / 3.1;
    const ang = Math.PI / 2 + Math.atan(slope) * 1.0 - (s - 0.5) * 1.1;
    lash.push({ x, y, ang, len: (0.55 + 0.6 * Math.sin(Math.PI * s)) * (0.85 + r() * 0.3), dir: s < 0.5 ? 1 : -1 });
  }
  for (let i = 0; i < count; i++) {
    if (i % 6 === 0) {
      const s = r();
      const [x, y] = lid(s);
      out[i * 3] = x; out[i * 3 + 1] = y - 0.02 + (r() - 0.5) * 0.025; out[i * 3 + 2] = (r() - 0.5) * 0.04;
      continue;
    }
    const L = lash[i % N];
    const u = Math.pow(r(), 0.8);
    // curl: each lash turns upward toward its tip
    const a = L.ang - L.dir * u * u * 0.6;
    const len = L.len * u;
    out[i * 3] = L.x + Math.cos(a) * len + (r() - 0.5) * 0.006;
    out[i * 3 + 1] = L.y + Math.sin(a) * len + (r() - 0.5) * 0.006;
    out[i * 3 + 2] = u * 0.2 + (r() - 0.5) * 0.01;
  }
}

// 4. a dewdrop: a smooth teardrop surface with a faint inner glow
export function drop(out, count, seed = 15) {
  const r = rng(seed);
  for (let i = 0; i < count; i++) {
    const inner = i % 9 === 0;
    const u = r() * 2 - 1;
    const a = r() * Math.PI * 2;
    const s = Math.sqrt(1 - u * u);
    let x = s * Math.cos(a), y = u, z = s * Math.sin(a);
    // pull the top into a point
    const taper = y > 0 ? 1 - Math.pow(y, 1.6) * 0.92 : 1;
    x *= taper; z *= taper;
    y = y > 0 ? y * 1.55 : y;
    const k = inner ? Math.pow(r(), 0.5) * 0.7 : 1;
    out[i * 3] = x * 1.0 * k;
    out[i * 3 + 1] = (y - 0.2) * 1.0 * k;
    out[i * 3 + 2] = z * 1.0 * k;
  }
}

// 5. the crown: seven gilt orbs arched over the booking button, joined by a
// fine ring of dust that circles it
export const CROWN_RADIUS = 1.0;
export function crown(out, count, seed = 16) {
  const r = rng(seed);
  const R = CROWN_RADIUS;
  const orbs = [];
  for (let k = 0; k < 7; k++) {
    const ang = Math.PI * (1.12 - (k / 6) * 1.24); // from lower left, over the top, to lower right
    const rr = R + (k % 2 ? 0.0 : 0.07);
    orbs.push([Math.cos(ang) * rr, Math.sin(ang) * rr]);
  }
  for (let i = 0; i < count; i++) {
    if (i % 4 === 0) {
      const ang = r() * Math.PI * 2;
      const rr = R * (0.86 + r() * 0.03);
      out[i * 3] = Math.cos(ang) * rr; out[i * 3 + 1] = Math.sin(ang) * rr; out[i * 3 + 2] = (r() - 0.5) * 0.04;
      continue;
    }
    const [ox, oy] = orbs[i % 7];
    const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
    const rad = 0.13 * Math.cbrt(r());
    out[i * 3] = ox + s * Math.cos(a) * rad;
    out[i * 3 + 1] = oy + u * rad;
    out[i * 3 + 2] = s * Math.sin(a) * rad;
  }
}

export const FORMATIONS = [shell, cloud, brow, lashes, drop, crown];
