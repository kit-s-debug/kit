"use client";
import { useScroll, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";
import { COAST_SDF, COAST_SDF_SIZE } from "../data/pembrokeshire";

/* ---------------------------------------------------------------------------
   The landscape the whole page sits on.

   One WebGL2 mesh, fixed behind every section, flown over as you scroll. The
   height field starts as procedural relief and, at the point where the page
   starts talking about Pembrokeshire, morphs into the county's real shape:
   the shader samples a signed distance field baked from the same Natural Earth
   coastline the map section draws, so the land you are flying over is the
   actual coast.

   All the expensive work is per vertex, not per pixel. 36k vertices run four
   octaves of noise each; the fragment stage only draws contour lines and fog.
   That is what keeps it smooth on a phone, where a raymarched version of the
   same picture would not be.
--------------------------------------------------------------------------- */

const VERT = `#version 300 es
precision highp float;

in vec2 aGrid;                 // x in [-1,1], z in [0,1]
uniform mat4 uVP;
uniform float uTime;
uniform float uDrift;          // how far we have travelled over the land
uniform float uMorph;          // 0 procedural, 1 the real coastline
uniform sampler2D uCoast;

out float vHeight;
out vec2 vWorld;
out float vFog;
out float vShore;

const float SPAN_X = 9.0;
const float NEAR_Z = 2.0;
const float FAR_Z = -26.0;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}
const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);
float fbm(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ s += a * vnoise(p); p = ROT * p * 2.03; a *= 0.5; }
  return s;
}

void main(){
  vec2 world = vec2(aGrid.x * SPAN_X, mix(NEAR_Z, FAR_Z, aGrid.y));
  vec2 field = vec2(world.x, world.y - uDrift);

  /* Procedural relief: ridged enough to read as land, calm enough to sit
     behind body copy. */
  float ridged = fbm(field * 0.26);
  ridged = 1.0 - abs(ridged * 2.0 - 1.0);
  float open = fbm(field * 0.12 + 40.0);
  float noiseH = ridged * 0.55 * open + open * 0.35;

  /* The real coast. The distance field is centred on the stretch of terrain
     directly ahead so it arrives in frame as the camera lifts. */
  vec2 uv = vec2(world.x / (SPAN_X * 1.15) * 0.5 + 0.5,
                 (world.y + 20.0) / 24.0);
  float sdf = texture(uCoast, clamp(uv, 0.0, 1.0)).r * 2.0 - 1.0;
  float land = smoothstep(-0.015, 0.075, sdf);
  float coastH = land * (0.46 + 0.16 * fbm(field * 0.9)) - (1.0 - land) * 0.05;

  float h = mix(noiseH, coastH, uMorph);
  h += 0.012 * sin(uTime * 0.35 + world.x * 0.7 + world.y * 0.4) * (1.0 - uMorph);

  vHeight = h;
  vWorld = world;
  vShore = mix(0.0, 1.0 - smoothstep(0.0, 0.10, abs(sdf)), uMorph);

  vec4 pos = vec4(world.x, h, world.y, 1.0);
  gl_Position = uVP * pos;
  vFog = clamp((world.y - FAR_Z) / (NEAR_Z - FAR_Z), 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;

in float vHeight;
in vec2 vWorld;
in float vFog;
in float vShore;
out vec4 outColor;

uniform float uWarm;      // pointer driven warmth
uniform vec2 uPointer;
uniform float uMorph;

float band(float v, float scale){
  float s = v * scale;
  float f = abs(fract(s) - 0.5);
  return smoothstep(fwidth(s) * 0.9 + 0.02, 0.0, f);
}

void main(){
  vec3 ink = vec3(0.031, 0.035, 0.043);
  vec3 cold = vec3(0.46, 0.55, 0.64);
  vec3 warm = vec3(0.82, 0.33, 0.17);

  /* Contours across the relief, plus a slack chart grid along the axes. */
  float contour = band(vHeight, 26.0);
  float grid = max(band(vWorld.x, 0.5), band(vWorld.y, 0.5)) * 0.16;

  float lift = smoothstep(0.02, 0.55, vHeight);
  float ink_line = contour * (0.35 + 0.65 * lift) + grid;
  /* Let the far contours go, otherwise perspective packs them into moire. */
  ink_line *= (0.22 + 0.78 * vFog) * (1.0 + 1.15 * uMorph);

  float d = distance(vWorld * vec2(0.11, 0.055), uPointer);
  float glow = clamp(exp(-d * d * 2.2), 0.0, 1.0) * uWarm;

  cold *= 1.0 + 0.55 * uMorph;
  vec3 col = ink + ink_line * mix(cold * 0.34, warm * 0.72, glow * 0.85);
  col += vShore * warm * 0.42;

  /* Depth haze, and a soft dissolve at the far edge so the mesh has no rim. */
  float haze = pow(vFog, 1.6);
  col = mix(ink, col, 0.12 + 0.88 * haze);
  float edge = smoothstep(0.0, 0.16, vFog);
  outColor = vec4(mix(ink, col, edge), 1.0);
}`;

/* --- 4x4 matrix helpers, column major, just what a camera needs ----------- */
function perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ]);
}

function lookAt(eye: number[], at: number[]) {
  const z = norm([eye[0] - at[0], eye[1] - at[1], eye[2] - at[2]]);
  const x = norm(cross([0, 1, 0], z));
  const y = cross(z, x);
  // prettier-ignore
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ]);
}

const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: number[], b: number[]) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
function norm(v: number[]) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}
function mul(a: Float32Array, b: Float32Array) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
  return o;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("terrain shader:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

/* The camera path, keyed to how far down the page you are. Each stop is a
   section: the hero sits low on the deck, the middle of the page pulls up and
   back so the terrain stays out of the way of the reading, and the Pembrokeshire
   beat climbs into a chart view as the coastline resolves. */
const PATH = [
  { at: 0.0, eye: 1.05, look: 0.35, drift: 0 },
  { at: 0.15, eye: 1.9, look: 0.18, drift: 4 },
  { at: 0.45, eye: 3.4, look: -0.1, drift: 13 },
  { at: 0.7, eye: 4.0, look: -0.3, drift: 21 },
  { at: 1.0, eye: 3.2, look: -0.15, drift: 30 },
];

/* How much ink sits between the landscape and the words at a given point in
   the scroll: wide open under the hero, closed down for the reading. */
const VEIL = [
  { at: 0, v: 0.12 },
  { at: 0.1, v: 0.72 },
  { at: 0.55, v: 0.78 },
  { at: 1, v: 0.74 },
];
function veilAt(p: number) {
  let i = 0;
  while (i < VEIL.length - 2 && p > VEIL[i + 1].at) i++;
  const a = VEIL[i];
  const b = VEIL[i + 1];
  const t = Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at)));
  return a.v + (b.v - a.v) * (t * t * (3 - 2 * t));
}

function sample(p: number) {
  let i = 0;
  while (i < PATH.length - 2 && p > PATH[i + 1].at) i++;
  const a = PATH[i];
  const b = PATH[i + 1];
  const t = Math.min(1, Math.max(0, (p - a.at) / (b.at - a.at)));
  const e = t * t * (3 - 2 * t);
  return {
    eye: a.eye + (b.eye - a.eye) * e,
    look: a.look + (b.look - a.look) * e,
    drift: a.drift + (b.drift - a.drift) * e,
  };
}

export function Terrain({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollYProgress } = useScroll();
  const progress = useRef<MotionValue<number>>(scrollYProgress);
  progress.current = scrollYProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const COLS = coarse ? 110 : 190;
    const ROWS = coarse ? 120 : 210;
    const maxDpr = coarse ? 1 : 1.5;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("terrain link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    /* Grid, spaced so the rows bunch up in the distance where the perspective
       squeezes them and the contour lines would otherwise alias. */
    const verts = new Float32Array(COLS * ROWS * 2);
    let v = 0;
    for (let j = 0; j < ROWS; j++) {
      const t = j / (ROWS - 1);
      for (let i = 0; i < COLS; i++) {
        verts[v++] = (i / (COLS - 1)) * 2 - 1;
        verts[v++] = Math.pow(t, 1.35);
      }
    }
    const idx = new Uint32Array((COLS - 1) * (ROWS - 1) * 6);
    let k = 0;
    for (let j = 0; j < ROWS - 1; j++) {
      for (let i = 0; i < COLS - 1; i++) {
        const a = j * COLS + i;
        idx[k++] = a; idx[k++] = a + 1; idx[k++] = a + COLS;
        idx[k++] = a + 1; idx[k++] = a + COLS + 1; idx[k++] = a + COLS;
      }
    }

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aGrid");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

    /* The baked coastline, uploaded as a single channel height source. */
    const bytes = Uint8Array.from(atob(COAST_SDF), (c) => c.charCodeAt(0));
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, COAST_SDF_SIZE, COAST_SDF_SIZE, 0, gl.RED, gl.UNSIGNED_BYTE, bytes);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(prog, "uCoast"), 0);

    const uVP = gl.getUniformLocation(prog, "uVP");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uDrift = gl.getUniformLocation(prog, "uDrift");
    const uMorph = gl.getUniformLocation(prog, "uMorph");
    const uWarm = gl.getUniformLocation(prog, "uWarm");
    const uPointer = gl.getUniformLocation(prog, "uPointer");

    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.031, 0.035, 0.043, 1);

    let aspect = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      canvas.width = w;
      canvas.height = h;
      aspect = w / h;
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 1.6;
      target.y = (0.5 - e.clientY / window.innerHeight) * 0.9;
    };
    if (!reduce && !coarse) window.addEventListener("pointermove", onMove, { passive: true });

    /* How close the Pembrokeshire section is to the middle of the screen.
       Reading it from the element rather than a hard coded scroll percentage
       means the reveal stays locked to the copy however the page changes. */
    const coastNode = () => document.getElementById("where");
    const coastAmount = () => {
      const el = coastNode();
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      const mid = r.top + r.height / 2 - window.innerHeight / 2;
      const reach = window.innerHeight * 0.85;
      return Math.max(0, 1 - Math.abs(mid) / reach);
    };

    const draw = (p: number, time: number, morph: number) => {
      const s = sample(p);
      /* The camera climbs into a chart view for the reveal and settles back. */
      const eye = s.eye + morph * 4.4;
      const look = s.look - morph * 2.1;
      const proj = perspective((55 * Math.PI) / 180, aspect, 0.1, 44);
      const view = lookAt([0, eye, 1.4], [0, look, -9]);
      gl.uniformMatrix4fv(uVP, false, mul(proj, view));
      gl.uniform1f(uTime, time);
      gl.uniform1f(uDrift, s.drift);
      gl.uniform1f(uMorph, morph);
      gl.uniform1f(uWarm, reduce ? 0.35 : 1);
      gl.uniform2f(uPointer, cur.x, cur.y);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_INT, 0);
    };

    if (reduce) {
      /* One frame, no camera move on scroll. Flying a viewer over a landscape
         is exactly what reduced motion is asking us not to do. */
      draw(0, 8, 0);
      document.documentElement.style.setProperty("--veil", "0.7");
      return () => {
        ro.disconnect();
        gl.deleteProgram(prog);
      };
    }

    let raf = 0;
    let visible = true;
    let morph = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const start = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      cur.x += (target.x - cur.x) * 0.05;
      cur.y += (target.y - cur.y) * 0.05;
      morph += (coastAmount() - morph) * 0.1;
      const p = progress.current.get();
      document.documentElement.style.setProperty("--veil", (veilAt(p) * (1 - 0.55 * morph)).toFixed(3));
      draw(p, (now - start) / 1000, morph);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.deleteProgram(prog);
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(tex);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}

/* The veil between the landscape and the words. Its opacity is written by the
   terrain's own frame loop as a CSS variable, so the page opens up at exactly
   the moment the coastline arrives rather than at a guessed scroll percentage. */
export function Veil({ className = "" }: { className?: string }) {
  return <div aria-hidden style={{ opacity: "var(--veil, 0.7)" }} className={className} />;
}
