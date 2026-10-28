// The Chrysalis Beautique: the WebGL world behind the page.
//
// A jade chrysalis hangs on a silk thread, ringed with gilt dots. As the
// visitor scrolls it shatters into gold dust, and the same dust re-forms as a
// brow arch, a fan of lashes, a dewdrop and finally the crown of seven gilt
// dots around the booking button. State comes from the page (see main.js);
// this module only draws.

import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Color, Vector2, Vector3,
  BufferGeometry, BufferAttribute, LatheGeometry, SphereGeometry, CylinderGeometry,
  ShaderMaterial, MeshBasicMaterial, Mesh, InstancedMesh, Object3D, Points,
  AdditiveBlending, NormalBlending, SRGBColorSpace, Clock, DoubleSide,
} from "three";
import { FORMATIONS, chrysalisRadius, CHRYSALIS_BOTTOM, CHRYSALIS_TOP, rng } from "./shapes.js";

const NOISE = /* glsl */ `
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float noise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(dot(hash3(i), f), dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
                   mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)), dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x), u.y),
               mix(mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)), dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
                   mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)), dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x), u.y), u.z);
  }
`;

const ROTATE = /* glsl */ `
  vec3 rotateAxis(vec3 v, vec3 axis, float a) {
    float s = sin(a), c = cos(a);
    return v * c + cross(axis, v) * s + axis * dot(axis, v) * (1.0 - c);
  }
`;

// ---------------------------------------------------------------- chrysalis
function buildChrysalisGeometry(quality) {
  const pts = [];
  const steps = quality > 0.6 ? 90 : 60;
  for (let i = 0; i <= steps; i++) {
    const y = CHRYSALIS_BOTTOM + (i / steps) * (CHRYSALIS_TOP - CHRYSALIS_BOTTOM);
    pts.push(new Vector2(Math.max(chrysalisRadius(y), 0.0001), y));
  }
  const lathe = new LatheGeometry(pts, quality > 0.6 ? 110 : 72);
  lathe.scale(1, 1, 0.86);
  const g = lathe.toNonIndexed();
  lathe.dispose();
  g.computeVertexNormals();

  // per-triangle data so each face can fly off on its own
  const pos = g.attributes.position.array;
  const n = pos.length / 9;
  const centroid = new Float32Array(pos.length);
  const axis = new Float32Array(pos.length);
  const rand = new Float32Array(pos.length / 3);
  const r = rng(7);
  for (let t = 0; t < n; t++) {
    const o = t * 9;
    const cx = (pos[o] + pos[o + 3] + pos[o + 6]) / 3;
    const cy = (pos[o + 1] + pos[o + 4] + pos[o + 7]) / 3;
    const cz = (pos[o + 2] + pos[o + 5] + pos[o + 8]) / 3;
    let ax = r() - 0.5, ay = r() - 0.5, az = r() - 0.5;
    const m = Math.hypot(ax, ay, az) || 1; ax /= m; ay /= m; az /= m;
    // faces near the crown band break first, so the change starts at the gold
    const band = Math.exp(-Math.pow((cy - 0.28) / 0.45, 2));
    const rv = Math.min(1, Math.max(0, r() * 0.75 + (1 - band) * 0.35));
    for (let v = 0; v < 3; v++) {
      centroid.set([cx, cy, cz], o + v * 3);
      axis.set([ax, ay, az], o + v * 3);
      rand[t * 3 + v] = rv;
    }
  }
  g.setAttribute("aCentroid", new BufferAttribute(centroid, 3));
  g.setAttribute("aAxis", new BufferAttribute(axis, 3));
  g.setAttribute("aRand", new BufferAttribute(rand, 1));
  return g;
}

function jadeMaterial(uniforms) {
  return new ShaderMaterial({
    uniforms,
    transparent: true,
    side: DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uExplode;
      uniform float uTime;
      attribute vec3 aCentroid;
      attribute vec3 aAxis;
      attribute float aRand;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vObj;
      varying float vFade;
      ${ROTATE}
      void main() {
        float p = clamp(uExplode * 1.45 - aRand * 0.45, 0.0, 1.0);
        p = p * p * (3.0 - 2.0 * p);
        vec3 local = position - aCentroid;
        local *= 1.0 - p * 0.85;
        local = rotateAxis(local, aAxis, p * 7.0);
        vec3 nrm = rotateAxis(normal, aAxis, p * 7.0);
        vec3 outward = normalize(vec3(aCentroid.x, aCentroid.y * 0.35, aCentroid.z) + aAxis * 0.35);
        vec3 c = aCentroid + outward * p * (1.6 + aRand * 3.2) + vec3(0.0, p * p * 0.8, 0.0);
        vec3 transformed = c + local;
        vec4 mv = modelViewMatrix * vec4(transformed, 1.0);
        vNormal = normalize(normalMatrix * nrm);
        vView = -mv.xyz;
        vObj = position;
        vFade = 1.0 - p;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uLight;
      uniform float uTime;
      uniform float uPulse;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vObj;
      varying float vFade;
      ${NOISE}
      void main() {
        if (vFade < 0.02) discard;
        vec3 N = normalize(vNormal);
        if (!gl_FrontFacing) N = -N;
        vec3 V = normalize(vView);
        vec3 L = normalize(uLight);
        vec3 H = normalize(L + V);
        float ndl = dot(N, L);
        float wrap = clamp((ndl + 0.45) / 1.45, 0.0, 1.0);
        float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);

        // mottled jade with fine vertical veins (the folded wing cases)
        float mott = noise(vObj * 3.2) * 0.5 + noise(vObj * 9.0) * 0.25;
        float ang = atan(vObj.z, vObj.x);
        float vein = smoothstep(0.975, 1.0, abs(sin(ang * 3.0 + vObj.y * 1.6 + noise(vObj * 2.0) * 0.8)));
        vec3 deep = vec3(0.07, 0.24, 0.17);
        vec3 jade = vec3(0.30, 0.58, 0.44);
        vec3 pale = vec3(0.74, 0.90, 0.78);
        vec3 col = mix(deep, jade, wrap + mott * 0.25);
        col = mix(col, pale, vein * 0.08);
        col *= 0.9 + 0.2 * smoothstep(0.9, -1.2, vObj.y);

        // translucency: light leaking through the rim on the shadow side
        col += pale * fres * (0.75 + 0.45 * (1.0 - wrap));
        // a soft inner light, as if lit from inside
        col += vec3(0.55, 0.85, 0.6) * pow(clamp(dot(N, V), 0.0, 1.0), 3.0) * 0.12 * (0.6 + noise(vObj * 1.5 + uTime * 0.1));
        // gold seam where the wing cases meet, just under the crown
        float seamY = 0.24 + 0.05 * cos(ang * 2.0);
        float seam = smoothstep(0.022, 0.0, abs(vObj.y - seamY));
        col = mix(col, vec3(0.06, 0.08, 0.05), seam * 0.75);
        float gilt = smoothstep(0.012, 0.0, abs(vObj.y - seamY - 0.035));
        col += vec3(0.95, 0.72, 0.30) * gilt * (0.6 + uPulse);

        // speckles of gold in the skin
        float fleck = smoothstep(0.78, 0.86, noise(vObj * 26.0));
        col += vec3(0.9, 0.7, 0.3) * fleck * 0.25 * (0.4 + wrap);

        float spec = pow(max(dot(N, H), 0.0), 160.0);
        col += vec3(1.0, 0.98, 0.92) * spec * 0.55;
        col += vec3(0.8, 1.0, 0.85) * pow(max(dot(N, H), 0.0), 8.0) * 0.08;

        gl_FragColor = vec4(col, smoothstep(0.02, 0.35, vFade));
      }
    `,
  });
}

// --------------------------------------------------------------- particles
function particleMaterial(uniforms) {
  return new ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uMorph;
      uniform float uTime;
      uniform float uSize;
      uniform float uPixelRatio;
      uniform vec3 uMouse;
      uniform float uMouseForce;
      attribute vec3 s0; attribute vec3 s1; attribute vec3 s2;
      attribute vec3 s3; attribute vec3 s4; attribute vec3 s5;
      attribute float aRand;
      varying float vTw;
      varying float vTone;
      void main() {
        // stagger each particle's journey, but land exactly on the formation
        float mi = floor(uMorph);
        float f = clamp((uMorph - mi - aRand * 0.35) / 0.65, 0.0, 1.0);
        float m = clamp(mi + f * f * (3.0 - 2.0 * f), 0.0, 5.0);
        float w0 = max(0.0, 1.0 - abs(m - 0.0));
        float w1 = max(0.0, 1.0 - abs(m - 1.0));
        float w2 = max(0.0, 1.0 - abs(m - 2.0));
        float w3 = max(0.0, 1.0 - abs(m - 3.0));
        float w4 = max(0.0, 1.0 - abs(m - 4.0));
        float w5 = max(0.0, 1.0 - abs(m - 5.0));
        vec3 p = s0 * w0 + s1 * w1 + s2 * w2 + s3 * w3 + s4 * w4 + s5 * w5;
        // in-between particles swirl rather than travel in straight lines
        float between = 1.0 - max(max(max(w0, w1), max(w2, w3)), max(w4, w5));
        float sw = between * 1.6;
        p += vec3(sin(aRand * 40.0 + uTime * 0.7), cos(aRand * 31.0 + uTime * 0.6), sin(aRand * 17.0)) * sw * 0.6;
        // drift: lively in the cloud, a whisper in the shapes
        float drift = 0.012 + w1 * 0.08;
        p += vec3(sin(uTime * 0.6 + aRand * 30.0), cos(uTime * 0.5 + aRand * 20.0), sin(uTime * 0.4 + aRand * 10.0)) * drift;
        // the cursor parts the dust
        vec3 d = p - uMouse;
        float dist = length(d.xy);
        p.xy += normalize(d.xy + 1e-4) * smoothstep(0.45, 0.0, dist) * 0.22 * uMouseForce;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        float size = uSize * (0.55 + aRand * 0.9) * (1.0 + between * 0.6);
        gl_PointSize = size * uPixelRatio * (6.0 / -mv.z);
        vTw = 0.55 + 0.45 * sin(uTime * (1.5 + aRand * 2.0) + aRand * 60.0);
        vTone = aRand;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vTw;
      varying float vTone;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        a = a * a;
        vec3 gold = mix(vec3(0.98, 0.78, 0.38), vec3(1.0, 0.95, 0.80), smoothstep(0.6, 1.0, vTone));
        gold = mix(gold, vec3(0.65, 0.92, 0.78), step(0.93, vTone) * 0.7);
        gl_FragColor = vec4(gold * (0.6 + a), a * uOpacity * vTw);
      }
    `,
  });
}

function dustMaterial(uniforms) {
  return new ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aRand;
      varying float vA;
      void main() {
        vec3 p = position;
        p.y += mod(uTime * (0.02 + aRand * 0.05) + aRand * 20.0, 12.0) - 6.0;
        p.x += sin(uTime * 0.2 + aRand * 12.0) * 0.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (1.0 + aRand * 2.2) * uPixelRatio * (8.0 / -mv.z);
        vA = 0.25 + 0.5 * aRand;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.1, d);
        gl_FragColor = vec4(0.85, 0.92, 0.82, a * vA * uOpacity);
      }
    `,
  });
}

function glowMaterial(uniforms) {
  return new ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      uniform float uGlow;
      varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float a = pow(max(0.0, 1.0 - d), 2.6);
        gl_FragColor = vec4(vec3(1.0, 0.82, 0.45) * a, a * uGlow);
      }
    `,
  });
}

// ------------------------------------------------------------------- scene
export function createScene(canvas, { mobile = false, reduced = false } = {}) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: !mobile, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return null;
  }
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  let maxDpr = mobile ? 1.5 : 1.75;
  let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  renderer.setPixelRatio(dpr);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.set(0, 0, 7.5);

  const world = new Group();
  scene.add(world);

  // --- chrysalis + gilt dots + thread
  const hero = new Group();
  hero.scale.setScalar(1.25);
  world.add(hero);
  const jadeU = {
    uExplode: { value: 0 }, uTime: { value: 0 }, uPulse: { value: 0 },
    uLight: { value: new Vector3(-0.6, 0.7, 0.8) },
  };
  const shellMesh = new Mesh(buildChrysalisGeometry(mobile ? 0.4 : 1), jadeMaterial(jadeU));
  hero.add(shellMesh);

  // gilt dots sit on the shell, mostly facing the viewer
  const dotGeo = new SphereGeometry(1, 20, 14);
  const dotMat = new ShaderMaterial({
    uniforms: { uLight: jadeU.uLight, uFade: { value: 1 }, uPulse: jadeU.uPulse },
    transparent: true,
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * mat3(instanceMatrix) * normal); vV = -mv.xyz;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uLight; uniform float uFade; uniform float uPulse;
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 N = normalize(vN), V = normalize(vV), L = normalize(uLight), H = normalize(L + V);
        float d = max(dot(N, L), 0.0);
        float s = pow(max(dot(N, H), 0.0), 40.0);
        float f = pow(1.0 - max(dot(N, V), 0.0), 2.0);
        vec3 c = mix(vec3(0.45, 0.30, 0.08), vec3(0.95, 0.74, 0.32), d) + vec3(1.0, 0.95, 0.8) * s + vec3(1.0, 0.8, 0.4) * f * 0.4;
        c += vec3(1.0, 0.85, 0.5) * uPulse * 0.8;
        gl_FragColor = vec4(c, uFade);
      }
    `,
  });
  const dotSpots = [];
  // the crown wraps all the way round, so it catches the light from any angle
  for (let i = 0; i < 16; i++) dotSpots.push({ y: 0.31 + 0.025 * Math.cos(i * 1.7), a: (i / 16) * Math.PI * 2, s: 0.032 + 0.008 * ((i * 37) % 3) });
  for (let i = 0; i < 6; i++) dotSpots.push({ y: -0.62, a: (i / 6) * Math.PI * 2 + 0.3, s: 0.021 });
  for (let i = 0; i < 4; i++) dotSpots.push({ y: 0.82, a: (i / 4) * Math.PI * 2, s: 0.019 });
  const dots = new InstancedMesh(dotGeo, dotMat, dotSpots.length);
  const dummy = new Object3D();
  const dotBase = dotSpots.map((d) => {
    const rad = chrysalisRadius(d.y) * 0.995;
    const ang = Math.PI / 2 - d.a; // a = 0 faces +z
    return new Vector3(Math.cos(ang) * rad, d.y, Math.sin(ang) * rad * 0.86);
  });
  hero.add(dots);

  const thread = new Mesh(new CylinderGeometry(0.004, 0.004, 6, 6), new MeshBasicMaterial({ color: 0xd9d2bd, transparent: true, opacity: 0.55 }));
  thread.position.y = CHRYSALIS_TOP + 3;
  hero.add(thread);
  const stem = new Mesh(new CylinderGeometry(0.03, 0.05, 0.12, 12), new MeshBasicMaterial({ color: 0x0c110e, transparent: true }));
  stem.position.y = CHRYSALIS_TOP + 0.03;
  hero.add(stem);

  // warm light that blooms out of the shell as it opens
  const glowU = { uGlow: { value: 0 } };
  const glow = new Mesh(new BufferGeometry(), glowMaterial(glowU));
  {
    const g = glow.geometry;
    g.setAttribute("position", new BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
    g.setAttribute("uv", new BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2));
    g.setIndex([0, 1, 2, 0, 2, 3]);
  }
  glow.scale.setScalar(3.2);
  world.add(glow);

  // --- morphing gold particles
  const COUNT = mobile ? 4200 : 9000;
  const pGeo = new BufferGeometry();
  FORMATIONS.forEach((fn, i) => {
    const arr = new Float32Array(COUNT * 3);
    fn(arr, COUNT);
    pGeo.setAttribute("s" + i, new BufferAttribute(arr, 3));
  });
  pGeo.setAttribute("position", pGeo.attributes.s0);
  const pr = new Float32Array(COUNT);
  const rr = rng(99);
  for (let i = 0; i < COUNT; i++) pr[i] = rr();
  pGeo.setAttribute("aRand", new BufferAttribute(pr, 1));
  pGeo.boundingSphere = null;
  const partU = {
    uMorph: { value: 0 }, uTime: { value: 0 }, uSize: { value: mobile ? 5.2 : 4.6 },
    uPixelRatio: { value: dpr }, uOpacity: { value: 0.15 },
    uMouse: { value: new Vector3(99, 99, 0) }, uMouseForce: { value: 0 },
  };
  const particles = new Points(pGeo, particleMaterial(partU));
  particles.frustumCulled = false;
  world.add(particles);

  // --- ambient dust through the whole volume
  const DUST = mobile ? 500 : 1300;
  const dGeo = new BufferGeometry();
  const dp = new Float32Array(DUST * 3), dr = new Float32Array(DUST);
  const r2 = rng(5);
  for (let i = 0; i < DUST; i++) {
    dp[i * 3] = (r2() - 0.5) * 16; dp[i * 3 + 1] = (r2() - 0.5) * 12; dp[i * 3 + 2] = (r2() - 0.5) * 10 - 2;
    dr[i] = r2();
  }
  dGeo.setAttribute("position", new BufferAttribute(dp, 3));
  dGeo.setAttribute("aRand", new BufferAttribute(dr, 1));
  const dustU = { uTime: partU.uTime, uPixelRatio: partU.uPixelRatio, uOpacity: { value: 0.8 } };
  const dust = new Points(dGeo, dustMaterial(dustU));
  dust.frustumCulled = false;
  scene.add(dust);

  // ------------------------------------------------------------- state
  const target = { explode: 0, morph: 0, x: 0, y: 0, scale: 1, dim: 1, glow: 0 };
  const cur = { ...target };
  const pointer = new Vector2(0, 0);
  const pointerSmooth = new Vector2(0, 0);
  let pointerActive = false;
  // drag-to-spin
  let spin = 0, spinVel = 0, dragging = false, lastDragX = 0;
  let pulse = 0;
  let width = 1, height = 1;

  function resize() {
    width = canvas.clientWidth || window.innerWidth;
    height = canvas.clientHeight || window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // keep the composition similar on tall phones
    camera.position.z = camera.aspect < 0.8 ? 9.6 : 7.5;
    camera.updateProjectionMatrix();
  }
  resize();

  // project the chrysalis to screen space for hit-testing (drag + cursor)
  const tmp = new Vector3();
  function chrysalisScreen() {
    tmp.set(0, -0.1, 0);
    hero.localToWorld(tmp);
    tmp.project(camera);
    const sx = (tmp.x * 0.5 + 0.5) * width;
    const sy = (-tmp.y * 0.5 + 0.5) * height;
    const top = new Vector3(0, CHRYSALIS_TOP, 0); hero.localToWorld(top); top.project(camera);
    const ry = Math.abs(((-top.y * 0.5 + 0.5) * height) - sy);
    return { x: sx, y: sy, rx: ry * 0.62, ry: ry * 1.12 };
  }

  const clock = new Clock();
  let running = false, raf = 0;
  let frames = 0, fpsStart = 0, adapted = false;

  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const k = 1 - Math.exp(-dt * (reduced ? 30 : 3.2));
    for (const key in target) cur[key] += (target[key] - cur[key]) * k;
    pointerSmooth.lerp(pointer, 1 - Math.exp(-dt * 4));

    // adaptive quality: drop resolution if the first seconds run slow
    if (!adapted) {
      frames++;
      if (!fpsStart) fpsStart = t;
      if (t - fpsStart > 2.5) {
        adapted = true;
        if (frames / (t - fpsStart) < 38 && dpr > 1) { dpr = 1; renderer.setPixelRatio(1); partU.uPixelRatio.value = 1; resize(); }
      }
    }

    partU.uTime.value = t;
    jadeU.uTime.value = t;
    jadeU.uExplode.value = cur.explode;
    partU.uMorph.value = cur.morph;
    // shimmer on the shell, full gold once it opens, softened behind reading
    partU.uOpacity.value = (0.18 + 0.82 * Math.min(1, cur.explode * 1.6)) * cur.dim;
    dustU.uOpacity.value = 0.55 + 0.45 * cur.dim;
    glowU.uGlow.value = cur.glow * cur.dim;
    pulse *= Math.exp(-dt * 2.5);
    jadeU.uPulse.value = pulse;

    // the chrysalis sways on its thread and can be spun by dragging
    if (!dragging) { spinVel *= Math.exp(-dt * 1.6); spin += spinVel * dt; }
    const idleSpin = reduced ? 0 : t * 0.18;
    hero.rotation.y = idleSpin + spin + pointerSmooth.x * 0.35;
    hero.rotation.z = reduced ? 0 : Math.sin(t * 0.7) * 0.035;
    hero.rotation.x = pointerSmooth.y * 0.12;
    const heroFade = Math.max(0, 1 - cur.explode * 1.3);
    hero.visible = cur.explode < 0.999;
    thread.material.opacity = 0.55 * heroFade;
    stem.material.opacity = heroFade;
    dotMat.uniforms.uFade.value = heroFade;
    for (let i = 0; i < dotBase.length; i++) {
      const b = dotBase[i];
      const fly = Math.max(0, Math.min(1, cur.explode * 1.6 - 0.1));
      dummy.position.copy(b).multiplyScalar(1 + fly * (1.5 + (i % 4)));
      dummy.position.y += fly * fly * 0.9;
      dummy.scale.setScalar(dotSpots[i].s * (1 + pulse * 0.6) * (1 - fly * 0.6));
      dummy.updateMatrix();
      dots.setMatrixAt(i, dummy.matrix);
    }
    dots.instanceMatrix.needsUpdate = true;

    // particles: slow rotation in the cloud, steady in the shapes
    const inShape = cur.morph > 1.5;
    particles.rotation.y = inShape ? Math.sin(t * 0.25) * 0.18 + pointerSmooth.x * 0.25 : t * 0.04 + pointerSmooth.x * 0.3;
    particles.rotation.x = pointerSmooth.y * -0.12;

    world.position.set(cur.x, cur.y, 0);
    world.scale.setScalar(cur.scale);
    glow.position.set(0, 0.1, 0.2);
    glow.lookAt(camera.position);

    // camera parallax + light follows the cursor
    camera.position.x = pointerSmooth.x * 0.35;
    camera.position.y = pointerSmooth.y * 0.22;
    camera.lookAt(cur.x * 0.15, 0, 0);
    jadeU.uLight.value.set(-0.5 + pointerSmooth.x * 1.2, 0.6 + pointerSmooth.y * 0.6, 0.8);
    dust.position.x = -pointerSmooth.x * 0.4;
    dust.position.y = -pointerSmooth.y * 0.25;

    // cursor in the particles' local space, on their plane
    if (pointerActive) {
      tmp.set(pointerSmooth.x, pointerSmooth.y, 0.5).unproject(camera).sub(camera.position).normalize();
      const dist = -camera.position.z / tmp.z;
      const hit = camera.position.clone().add(tmp.multiplyScalar(dist));
      particles.worldToLocal(hit);
      partU.uMouse.value.copy(hit);
      partU.uMouseForce.value += ((reduced ? 0 : 1) - partU.uMouseForce.value) * 0.1;
    } else {
      partU.uMouseForce.value *= 0.9;
    }

    renderer.render(scene, camera);
  }

  function start() { if (!running) { running = true; clock.getDelta(); frame(); } }
  function stop() { running = false; cancelAnimationFrame(raf); }

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  window.addEventListener("resize", resize);

  return {
    start, stop,
    renderOnce() { frame(); cancelAnimationFrame(raf); },
    setState(s) { Object.assign(target, s); },
    snap() { Object.assign(cur, target); },
    setCurrent(s) { Object.assign(cur, s); },
    setPointer(nx, ny) { pointer.set(nx, ny); pointerActive = true; },
    clearPointer() { pointerActive = false; },
    overChrysalis(px, py) {
      if (cur.explode > 0.25) return false;
      const c = chrysalisScreen();
      const dx = (px - c.x) / c.rx, dy = (py - c.y) / c.ry;
      return dx * dx + dy * dy < 1;
    },
    dragStart(px) { dragging = true; lastDragX = px; spinVel = 0; },
    dragMove(px) {
      if (!dragging) return;
      const d = (px - lastDragX) / width * 6;
      spin += d; spinVel = d * 60; lastDragX = px;
    },
    dragEnd() { dragging = false; },
    pulse() { pulse = 1; spinVel += 4; },
    get canvas() { return canvas; },
  };
}
