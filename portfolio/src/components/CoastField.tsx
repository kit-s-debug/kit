"use client";
import { useEffect, useRef } from "react";

/* ---------------------------------------------------------------------------
   The moving field behind the hero: an animated contour map, the way the coast
   is drawn on an Admiralty chart. Written directly against WebGL2 rather than
   pulling in a 3D library, because it is one full-screen fragment shader and
   Three.js would have cost ~600kB for a single quad.

   It draws one static frame under prefers-reduced-motion, stops when the tab is
   hidden or the hero scrolls away, and simply never appears if WebGL2 is
   missing (the CSS gradient behind it carries the section on its own).
--------------------------------------------------------------------------- */

const VERT = `#version 300 es
in vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uRes;
uniform float uT;
uniform vec2 uP;
uniform float uReveal;

float hash21(vec2 p){
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);
float fbm3(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){ s += a * vnoise(p); p = ROT * p * 2.03; a *= 0.5; }
  return s;
}
float fbm2(vec2 p){
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 2; i++){ s += a * vnoise(p); p = ROT * p * 2.03; a *= 0.5; }
  return s;
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * uRes) / uRes.y;
  vec2 uv = frag / uRes;

  float t = uT * 0.035;
  vec2 q = p * 1.35 + vec2(0.0, t * 0.30);
  float w = fbm2(q + vec2(t * 0.55, -t * 0.22));
  float h = fbm3(q * 1.12 + vec2(w * 0.9, -w * 0.55));

  /* The cursor lifts the land under it, so the contour rings tighten around
     the pointer instead of a glow being pasted on top. */
  float d = length(p - uP);
  h += 0.09 * exp(-d * d * 7.0);

  float bands = h * 19.0;
  float f = abs(fract(bands) - 0.5);
  float aa = fwidth(bands) * 0.85;
  float line = smoothstep(aa + 0.012, 0.0, f);

  /* Higher ground reads brighter, which stops the field looking like wallpaper. */
  line *= 0.42 + 0.58 * smoothstep(0.18, 0.82, h);

  vec3 base = vec3(0.031, 0.035, 0.043);
  vec3 cold = vec3(0.46, 0.55, 0.64);
  vec3 warm = vec3(0.82, 0.33, 0.17);
  float glow = clamp(exp(-d * d * 4.6), 0.0, 1.0);
  vec3 col = base + line * mix(cold * 0.26, warm * 0.52, glow);

  col *= 1.0 - 0.62 * smoothstep(0.34, 1.06, length(p * vec2(0.82, 1.25)));
  col *= smoothstep(0.0, 0.16, uv.y) * smoothstep(1.0, 0.80, uv.y) * 0.55 + 0.45;

  outColor = vec4(mix(base, col, uReveal), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export function CoastField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!gl) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const maxDpr = coarse ? 1 : 1.5;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uT = gl.getUniformLocation(prog, "uT");
    const uP = gl.getUniformLocation(prog, "uP");
    const uReveal = gl.getUniformLocation(prog, "uReveal");

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width * dpr));
      h = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* Pointer is smoothed toward its target each frame, so the swell follows
       the cursor with a little weight instead of snapping to it. */
    const target = { x: 0.6, y: 0.02 };
    const current = { x: 0.6, y: 0.02 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left - r.width / 2) / r.height;
      target.y = -((e.clientY - r.top - r.height / 2) / r.height);
    };
    if (!reduce && !coarse) window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let visible = true;
    let start = performance.now();
    let reveal = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const t = (now - start) / 1000;
      current.x += (target.x - current.x) * 0.045;
      current.y += (target.y - current.y) * 0.045;
      reveal = Math.min(1, reveal + 0.02);
      gl.uniform1f(uT, t);
      gl.uniform2f(uP, current.x, current.y);
      gl.uniform1f(uReveal, reveal);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduce) {
      gl.uniform1f(uT, 12);
      gl.uniform2f(uP, 0.6, 0.02);
      gl.uniform1f(uReveal, 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
      });
      io.observe(canvas);
      raf = requestAnimationFrame(frame);
      return () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        gl.deleteProgram(prog);
        gl.deleteBuffer(buf);
      };
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
