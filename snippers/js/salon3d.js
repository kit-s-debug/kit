/*
  Snippers: the 3D salon.

  Everything here is built in code (no downloaded models or photos): the
  shopfront on Portfield at dusk, then reception, the styling stations,
  the colour bar and the wash area. It is an illustration of a salon,
  not a survey of the real one; the page says so.

  createSalon(canvas, { quality }) returns:
    setProgress(p, stops)  p = 0..1 through the tour; stops = keyframe
                           positions (0..1) for each camera station
    setPointer(x, y)       -1..1, a little look-around
    resize()
    renderNow()
    dispose()
*/
import * as THREE from "three";
import { RoundedBoxGeometry } from "../assets/vendor/three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "../assets/vendor/three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "../assets/vendor/three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "../assets/vendor/three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../assets/vendor/three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "../assets/vendor/three/addons/postprocessing/OutputPass.js";

/* ------------------------------------------------------------------ */
/* Palette (matches css/snippers.css)                                  */
/* ------------------------------------------------------------------ */
const C = {
  cream: "#f3ebe1",
  plaster: "#efe4d7",
  blush: "#e6c2b6",
  blushDeep: "#cf9c90",
  velvet: "#d7a196",
  brass: "#c59a5c",
  espresso: "#2d211e",
  sage: "#93a28b",
  sageDeep: "#6f8068",
  ceramic: "#f7f3ee",
  stone: "#d9d2c6",
};

/* deterministic randomness so every visit builds the same salon */
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Canvas textures                                                     */
/* ------------------------------------------------------------------ */
function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (opts.srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = opts.aniso || 8;
  if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(opts.repeat[0], opts.repeat[1]); }
  return t;
}

function terrazzoTex() {
  const r = rng(7);
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#efe6da"; g.fillRect(0, 0, w, h);
    const cols = ["#d8a69a", "#b5bfac", "#c9a066", "#8d7b71", "#faf6ef", "#e2c3b2", "#c48c80"];
    for (let i = 0; i < 2600; i++) {
      const x = r() * w, y = r() * h, s = 2 + Math.pow(r(), 3) * 16;
      g.fillStyle = cols[(r() * cols.length) | 0];
      g.globalAlpha = .55 + r() * .45;
      g.beginPath();
      const n = 5 + (r() * 3 | 0);
      for (let k = 0; k < n; k++) {
        const a = k / n * Math.PI * 2 + r() * .6, rr = s * (.6 + r() * .5);
        g[k ? "lineTo" : "moveTo"](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      g.fill();
    }
    g.globalAlpha = 1;
  }, { repeat: [3, 5] });
}

function plasterTex(base, seed = 3) {
  const r = rng(seed);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = r() * w, y = r() * h, s = 20 + r() * 80;
      const grd = g.createRadialGradient(x, y, 0, x, y, s);
      const light = r() > .5;
      grd.addColorStop(0, light ? "rgba(255,255,255,.035)" : "rgba(120,90,70,.025)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd; g.fillRect(x - s, y - s, s * 2, s * 2);
    }
  }, { repeat: [3, 1.5] });
}

function flutingTex(base) {
  return canvasTex(512, 64, (g, w, h) => {
    const n = 16, sw = w / n;
    for (let i = 0; i < n; i++) {
      const grd = g.createLinearGradient(i * sw, 0, (i + 1) * sw, 0);
      grd.addColorStop(0, "#00000022");
      grd.addColorStop(.18, base);
      grd.addColorStop(.5, "#ffffff33");
      grd.addColorStop(.82, base);
      grd.addColorStop(1, "#00000026");
      g.fillStyle = base; g.fillRect(i * sw, 0, sw, h);
      g.fillStyle = grd; g.fillRect(i * sw, 0, sw, h);
    }
  }, { repeat: [6, 1] });
}

function tileTex() {
  const r = rng(11);
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#e9e1d4"; g.fillRect(0, 0, w, h);
    const n = 10, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const l = 52 + r() * 10, sat = 10 + r() * 8, hue = 98 + r() * 14;
      const x = i * s + 3, y = j * s + 3, ts = s - 6;
      const grd = g.createLinearGradient(x, y, x + ts, y + ts);
      grd.addColorStop(0, `hsl(${hue} ${sat}% ${l + 6}%)`);
      grd.addColorStop(1, `hsl(${hue} ${sat}% ${l - 5}%)`);
      g.fillStyle = grd; g.fillRect(x, y, ts, ts);
      g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(x + ts * .1, y + ts * .1, ts * .35, ts * .2);
    }
  }, { repeat: [2, 1.2] });
}

function pavingTex() {
  const r = rng(5);
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#8f8a82"; g.fillRect(0, 0, w, h);
    const n = 4, s = w / n;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const l = 62 + r() * 8;
      g.fillStyle = `hsl(35 6% ${l}%)`;
      g.fillRect(i * s + 4, j * s + 4, s - 8, s - 8);
      for (let k = 0; k < 140; k++) {
        g.fillStyle = `rgba(0,0,0,${r() * .06})`;
        g.fillRect(i * s + r() * s, j * s + r() * s, 3, 3);
      }
    }
  }, { repeat: [6, 2] });
}

function asphaltTex() {
  const r = rng(9);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#3d3a38"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) {
      g.fillStyle = `rgba(${r() > .5 ? "255,255,255" : "0,0,0"},${r() * .12})`;
      g.fillRect(r() * w, r() * h, 2, 2);
    }
  }, { repeat: [8, 4] });
}

function skyTex() {
  return canvasTex(16, 512, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, "#8f8fae");
    grd.addColorStop(.42, "#c7a9b4");
    grd.addColorStop(.7, "#efc3ac");
    grd.addColorStop(1, "#f6d8c2");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });
}

function signTex() {
  return canvasTex(2048, 300, (g, w, h) => {
    g.fillStyle = C.espresso; g.fillRect(0, 0, w, h);
    const grd = g.createLinearGradient(0, 40, 0, 260);
    grd.addColorStop(0, "#f1d49d"); grd.addColorStop(.5, "#c59a5c"); grd.addColorStop(1, "#9c7440");
    g.fillStyle = grd;
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = '500 190px "Cormorant Garamond", Georgia, serif';
    if ("letterSpacing" in g) g.letterSpacing = "38px";
    g.fillText("SNIPPERS", w / 2 + 19, h / 2 + 8);
    g.strokeStyle = "rgba(197,154,92,.6)"; g.lineWidth = 3;
    g.strokeRect(22, 22, w - 44, h - 44);
  }, { aniso: 16 });
}

function windowDecalTex() {
  return canvasTex(1024, 768, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(255,248,238,.92)";
    g.textAlign = "center";
    g.font = 'italic 500 150px "Cormorant Garamond", Georgia, serif';
    g.fillText("Snippers", w / 2, 300);
    g.font = '500 34px "Jost", sans-serif';
    if ("letterSpacing" in g) g.letterSpacing = "10px";
    g.fillText("HAIRDRESSERS", w / 2, 372);
    g.font = '400 30px "Jost", sans-serif';
    g.fillText("CALL TO BOOK · 01437 762114", w / 2, 440);
  });
}

function neonTex() {
  return canvasTex(1024, 320, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = 'italic 500 190px "Cormorant Garamond", Georgia, serif';
    g.shadowColor = "#ff9f9a"; g.shadowBlur = 40;
    g.strokeStyle = "#ffd6d0"; g.lineWidth = 7;
    g.strokeText("hello, gorgeous", w / 2, h / 2);
    g.shadowBlur = 12; g.strokeStyle = "#fff4f1"; g.lineWidth = 3;
    g.strokeText("hello, gorgeous", w / 2, h / 2);
  });
}

function stripeTex(a, b, n = 10) {
  return canvasTex(512, 64, (g, w, h) => {
    for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * w / n, 0, w / n, h); }
  });
}

function hairTex() {
  const r = rng(21);
  return canvasTex(256, 1024, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) {
      const x = w * .06 + r() * w * .88, a = .35 + r() * .6;
      const l = 70 + r() * 30;
      g.strokeStyle = `rgba(${l * 2.55 | 0},${l * 2.55 | 0},${l * 2.55 | 0},${a})`;
      g.lineWidth = .6 + r() * 1.4;
      g.beginPath(); g.moveTo(x, 0);
      const sway = (r() - .5) * 18, end = h * (.82 + r() * .18);
      g.bezierCurveTo(x + sway, h * .3, x - sway, h * .6, x + sway * .5 + (x - w / 2) * -.25, end);
      g.stroke();
    }
    // a soft highlight band
    const grd = g.createLinearGradient(0, h * .2, 0, h * .4);
    grd.addColorStop(0, "rgba(255,255,255,0)"); grd.addColorStop(.5, "rgba(255,255,255,.25)"); grd.addColorStop(1, "rgba(255,255,255,0)");
    g.globalCompositeOperation = "source-atop"; g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });
}

function shadowTex() {
  return canvasTex(128, 128, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grd.addColorStop(0, "rgba(40,25,20,.55)"); grd.addColorStop(.6, "rgba(40,25,20,.18)"); grd.addColorStop(1, "rgba(40,25,20,0)");
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });
}

function rugTex() {
  return canvasTex(512, 512, (g, w, h) => {
    const rings = ["#e9d2c5", "#f4e9dd", "#d7a99d", "#f4e9dd", "#c9a066", "#efe2d4"];
    for (let i = 0; i < rings.length; i++) {
      g.fillStyle = rings[i]; g.beginPath(); g.arc(w / 2, h / 2, w / 2 * (1 - i * .15), 0, Math.PI * 2); g.fill();
    }
  });
}

function artTex(seed) {
  const r = rng(seed);
  return canvasTex(512, 680, (g, w, h) => {
    g.fillStyle = "#f6efe6"; g.fillRect(0, 0, w, h);
    const cols = [C.blush, C.sage, C.brass, C.blushDeep, "#e9dccb"];
    for (let i = 0; i < 4; i++) {
      g.fillStyle = cols[(r() * cols.length) | 0];
      const x = 60 + r() * (w - 120), y = 80 + r() * (h - 160), s = 70 + r() * 140;
      g.beginPath();
      if (r() > .5) { g.arc(x, y, s, 0, Math.PI * 2); }
      else { g.moveTo(x - s, y + s); g.lineTo(x - s, y); g.arc(x, y, s, Math.PI, 0); g.lineTo(x + s, y + s); g.closePath(); }
      g.globalAlpha = .85; g.fill(); g.globalAlpha = 1;
    }
    g.strokeStyle = "#2d211e"; g.lineWidth = 2;
    g.beginPath(); g.moveTo(w * .2, h * .85); g.bezierCurveTo(w * .4, h * .2, w * .6, h * .9, w * .85, h * .15); g.stroke();
  });
}

/* ------------------------------------------------------------------ */
/* Builders                                                            */
/* ------------------------------------------------------------------ */
export function createSalon(canvas, options = {}) {
  const quality = options.quality || "high"; // "high" | "low"
  const hi = quality === "high";

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: !!options.capture });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, hi ? 1.75 : 1.4));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .82;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = skyTex();
  scene.fog = new THREE.Fog("#e9c9bb", 18, 46);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .32;

  const camera = new THREE.PerspectiveCamera(42, 1, .05, 120);

  const geoCache = new Map();
  const box = (w, h, d, r = .02, seg = 3) => {
    const k = `b${w}|${h}|${d}|${r}`;
    if (!geoCache.has(k)) geoCache.set(k, new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2)));
    return geoCache.get(k);
  };
  const std = (color, roughness = .8, metalness = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });

  const M = {
    wall: std(C.plaster, .95, 0, { map: plasterTex(C.plaster) }),
    ceiling: std("#f6efe6", 1),
    floor: std("#ffffff", .42, 0, { map: terrazzoTex() }),
    terrazzo: std("#ffffff", .3, 0, { map: terrazzoTex() }),
    blush: std(C.blush, .75),
    blushFlute: std("#ffffff", .7, 0, { map: flutingTex(C.blush) }),
    sageFlute: std("#ffffff", .7, 0, { map: flutingTex(C.sage) }),
    velvet: new THREE.MeshPhysicalMaterial({ color: C.velvet, roughness: .85, sheen: 1, sheenRoughness: .45, sheenColor: new THREE.Color("#ffe1d8") }),
    velvetSage: new THREE.MeshPhysicalMaterial({ color: C.sage, roughness: .85, sheen: 1, sheenRoughness: .5, sheenColor: new THREE.Color("#e7f0df") }),
    brass: std(C.brass, .28, 1),
    chrome: std("#dcdcdc", .12, 1),
    espresso: std(C.espresso, .55),
    espressoGloss: std(C.espresso, .25),
    mirror: std("#aeb6b8", .03, 1, { envMapIntensity: 1.0 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: C.ceramic, roughness: .18, clearcoat: .7, clearcoatRoughness: .1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: "#e8f0ee", roughness: .04, metalness: 0, transparent: true, opacity: .16, envMapIntensity: 1.6, depthWrite: false }),
    tile: std("#ffffff", .22, 0, { map: tileTex() }),
    leaf: std("#6f8a62", .6, 0, { side: THREE.DoubleSide }),
    leafLight: std("#88a479", .6, 0, { side: THREE.DoubleSide }),
    pot: std("#d8cfc2", .9),
    towel: std("#f4ede4", 1),
    towelSage: std("#b8c3ae", 1),
    globe: new THREE.MeshStandardMaterial({ color: "#fff3e2", emissive: "#ffcf9a", emissiveIntensity: 1.5, roughness: .3 }),
    bulb: new THREE.MeshStandardMaterial({ color: "#fff", emissive: "#ffd8a8", emissiveIntensity: 5 }),
    cord: std("#2b2522", .6),
    contact: new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false }),
  };

  const root = new THREE.Group();
  scene.add(root);
  const add = (mesh, parent = root) => { mesh.castShadow = hi; mesh.receiveShadow = true; parent.add(mesh); return mesh; };
  const mesh = (geo, mat, x = 0, y = 0, z = 0, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return add(m, parent); };
  const contact = (x, z, sx, sz, parent = root, o = 1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sx, sz), M.contact);
    m.material = M.contact; m.rotation.x = -Math.PI / 2; m.position.set(x, .004, z); m.renderOrder = 1;
    if (o !== 1) { m.material = M.contact.clone(); m.material.opacity = o; }
    parent.add(m); return m;
  };
  const lathe = (pts, mat, segs = 48) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), segs), mat);

  // Room extents
  const X0 = -3.6, X1 = 2.4, Z1 = -11, H = 3.3;
  const W = X1 - X0, D = -Z1;

  /* ---------------- Street & facade ---------------- */
  const paving = mesh(new THREE.PlaneGeometry(26, 4.2), std("#ffffff", .85, 0, { map: pavingTex() }), 0, 0, 2.1);
  paving.rotation.x = -Math.PI / 2;
  const kerb = mesh(new THREE.BoxGeometry(26, .14, .3), std("#b9b2a8", .8), 0, .07, 4.25);
  const road = mesh(new THREE.PlaneGeometry(40, 14), std("#ffffff", .9, 0, { map: asphaltTex() }), 0, -.02, 11.2);
  road.rotation.x = -Math.PI / 2;
  const line = mesh(new THREE.PlaneGeometry(14, .12), std("#e9e2d2", .8), 0, -.01, 5.0); line.rotation.x = -Math.PI / 2;
  const line2 = mesh(new THREE.PlaneGeometry(14, .12), std("#e9e2d2", .8), 0, -.01, 5.25); line2.rotation.x = -Math.PI / 2;

  // facade: a shape with the window and the door cut out
  const winX0 = -3.15, winX1 = .45, winY0 = .62, winY1 = 2.55;
  const doorX0 = .85, doorX1 = 1.95, doorY1 = 2.5;
  {
    const s = new THREE.Shape();
    s.moveTo(X0 - .35, 0); s.lineTo(X1 + .35, 0); s.lineTo(X1 + .35, H + .1); s.lineTo(X0 - .35, H + .1); s.closePath();
    const w = new THREE.Path(); w.moveTo(winX0, winY0); w.lineTo(winX1, winY0); w.lineTo(winX1, winY1); w.lineTo(winX0, winY1); w.closePath();
    const d = new THREE.Path(); d.moveTo(doorX0, 0); d.lineTo(doorX1, 0); d.lineTo(doorX1, doorY1); d.lineTo(doorX0, doorY1); d.closePath();
    s.holes.push(w, d);
    const g = new THREE.ExtrudeGeometry(s, { depth: .28, bevelEnabled: false });
    const f = mesh(g, std(C.espresso, .6), 0, 0, -.28);
    f.castShadow = true;
  }
  // stallriser panel under the window, with fluting
  mesh(box(winX1 - winX0, .02, .3, .01), M.brass, (winX0 + winX1) / 2, winY0, .02);
  // window mullion and frame
  for (const x of [winX0 + .02, (winX0 + winX1) / 2, winX1 - .02]) mesh(box(.06, winY1 - winY0, .1, .01), M.espressoGloss, x, (winY0 + winY1) / 2, -.12);
  mesh(box(winX1 - winX0, .06, .1, .01), M.espressoGloss, (winX0 + winX1) / 2, winY1 - .03, -.12);
  const winGlass = mesh(new THREE.PlaneGeometry(winX1 - winX0, winY1 - winY0), M.glass, (winX0 + winX1) / 2, (winY0 + winY1) / 2, -.13);
  winGlass.castShadow = false;
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.27), new THREE.MeshBasicMaterial({ map: windowDecalTex(), transparent: true, depthWrite: false, toneMapped: false }));
  decal.position.set((winX0 + winX1) / 2 - .9, 1.6, -.11); root.add(decal);
  decal.material.color.setScalar(.92);
  // fascia sign
  const sign = mesh(new THREE.BoxGeometry(X1 - X0 + .5, .62, .12), [std(C.espresso), std(C.espresso), std(C.espresso), std(C.espresso), std("#ffffff", .5, .2, { map: signTex() }), std(C.espresso)], (X0 + X1) / 2, H - .28, .08);
  mesh(box(X1 - X0 + .7, .06, .26, .02), M.brass, (X0 + X1) / 2, H + .02, .08);
  mesh(box(X1 - X0 + .7, .05, .22, .02), M.brass, (X0 + X1) / 2, H - .62, .08);
  // pilasters
  for (const x of [X0 - .2, X1 + .2]) {
    mesh(box(.42, H - .6, .34, .03), std(C.espresso, .5), x, (H - .6) / 2, .02);
    mesh(box(.5, .14, .4, .03), M.brass, x, .07, .02);
  }
  // awning over the window: cream and blush stripes
  {
    const aw = new THREE.Mesh(new THREE.PlaneGeometry(winX1 - winX0 + .3, 1.0), std("#ffffff", .9, 0, { map: stripeTex("#f4ebe0", C.blush, 14), side: THREE.DoubleSide }));
    aw.position.set((winX0 + winX1) / 2, 2.62, .44); aw.rotation.x = -Math.PI / 2 + .62; add(aw); aw.castShadow = false;
    const valance = new THREE.Mesh(new THREE.PlaneGeometry(winX1 - winX0 + .3, .2), aw.material);
    valance.position.set((winX0 + winX1) / 2, 2.28, .85); add(valance); valance.castShadow = false;
    mesh(box(winX1 - winX0 + .34, .04, .04, .01), M.brass, (winX0 + winX1) / 2, 2.38, .86);
  }
  // wall lanterns
  const lanterns = [];
  for (const x of [X0 - .2, X1 + .2]) {
    const g = new THREE.Group(); g.position.set(x, 2.15, .32); root.add(g);
    mesh(box(.1, .22, .08, .02), M.brass, 0, 0, -.06, g);
    const gl = mesh(new THREE.SphereGeometry(.09, 24, 16), M.globe, 0, -.04, .08, g); gl.castShadow = false;
    lanterns.push(g);
  }
  // planters with topiary balls either side of the door
  for (const x of [doorX0 - .32, doorX1 + .32]) {
    const p = lathe([[0, 0], [.2, 0], [.24, .36], [.26, .4], [0, .4]], std(C.espresso, .4));
    p.position.set(x, 0, .35); add(p);
    const bg = new THREE.SphereGeometry(.27, 64, 48), bp = bg.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < bp.count; i++) { v.fromBufferAttribute(bp, i); v.multiplyScalar(1 + (Math.sin(v.x * 40) + Math.sin(v.y * 37) + Math.sin(v.z * 43)) * .012); bp.setXYZ(i, v.x, v.y, v.z); }
    bg.computeVertexNormals();
    mesh(bg, std("#5f7656", .95), x, .68, .35);
    contact(x, .35, .8, .8);
  }
  // A-board
  {
    const g = new THREE.Group(); g.position.set(doorX1 + 1.15, 0, 1.3); g.rotation.y = -.35; root.add(g);
    const face = std("#ffffff", .8, 0, { map: canvasTex(400, 600, (c, w, h) => {
      c.fillStyle = C.espresso; c.fillRect(0, 0, w, h);
      c.strokeStyle = C.brass; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28);
      c.fillStyle = "#f6ece2"; c.textAlign = "center";
      c.font = 'italic 500 84px "Cormorant Garamond", Georgia, serif'; c.fillText("Snippers", w / 2, 150);
      c.font = '500 26px "Jost", sans-serif'; if ("letterSpacing" in c) c.letterSpacing = "6px";
      c.fillText("COME ON IN", w / 2, 230);
      c.fillStyle = "#e6c2b6"; c.font = '400 30px "Jost", sans-serif';
      c.fillText("CUTS · COLOUR", w / 2, 330); c.fillText("STYLING", w / 2, 378);
      c.fillStyle = "#f6ece2"; c.font = '500 34px "Jost", sans-serif'; c.fillText("01437 762114", w / 2, 500);
    }) });
    for (const s of [-1, 1]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(.6, .9, .03), [M.espresso, M.espresso, M.espresso, M.espresso, s > 0 ? face : M.espresso, s < 0 ? face : M.espresso]);
      b.position.set(0, .45, s * .13); b.rotation.x = s * -.15; add(b, g);
    }
    contact(0, 0, .9, .6, g);
  }
  // neighbouring buildings and the upper floor
  {
    const upper = std("#efe5d8", .95, 0, { map: plasterTex("#efe5d8", 9) });
    mesh(new THREE.BoxGeometry(X1 - X0 + .9, 4.4, .4), upper, (X0 + X1) / 2, H + .25 + 2.2, -.2);
    const sash = (x, y, parent = root) => {
      mesh(box(.9, 1.3, .08, .01), std("#f7f2ea", .6), x, y, .02, parent);
      const gl = mesh(new THREE.PlaneGeometry(.78, 1.18), std("#4d4a55", .08, .4, { envMapIntensity: 1.5 }), x, y, .065, parent); gl.castShadow = false;
      mesh(box(.8, .03, .03, .005), std("#f7f2ea", .6), x, y, .08, parent);
      mesh(box(1.0, .06, .14, .01), std("#e6ddcf", .8), x, y - .68, .06, parent);
    };
    sash(-2.2, 5.1); sash(-.3, 5.1); sash(1.5, 5.1);
    // left neighbour: sage-grey render
    const left = new THREE.Group(); left.position.set(X0 - 3.5, 0, -.1); root.add(left);
    mesh(new THREE.BoxGeometry(6, 7.9, .5), std("#c9cbbf", .95, 0, { map: plasterTex("#c9cbbf", 13) }), 0, 3.95, -.25, left);
    sash(-1.5, 1.7, left); sash(.6, 1.7, left); sash(-1.5, 5.1, left); sash(.6, 5.1, left);
    mesh(box(1.25, 2.45, .08, .02), std("#f2ece2", .6), 2.1, 1.22, .0, left);
    mesh(box(1.05, 2.3, .1, .02), std("#3e4c56", .45), 2.1, 1.15, .02, left);
    for (const [py, ph] of [[1.65, .8], [.6, .8]]) for (const px of [-.24, .24]) mesh(box(.36, ph, .04, .01), std("#4a5964", .45), 2.1 + px, py, .07, left);
    mesh(new THREE.SphereGeometry(.035, 16, 12), M.brass, 2.5, 1.15, .1, left);
    // right neighbour: stone
    const right = new THREE.Group(); right.position.set(X1 + 3.4, 0, -.1); root.add(right);
    mesh(new THREE.BoxGeometry(6, 8.4, .5), std("#d8cbb9", .95, 0, { map: plasterTex("#d8cbb9", 17) }), 0, 4.2, -.25, right);
    sash(-1.2, 1.8, right); sash(1.2, 1.8, right); sash(-1.2, 5.3, right); sash(1.2, 5.3, right);
    // roofs
    mesh(new THREE.BoxGeometry(X1 - X0 + .9, .3, 1), std("#5d5856", .8), (X0 + X1) / 2, 7.95, -.4);
  }

  /* ---------------- Door ---------------- */
  const door = new THREE.Group(); door.position.set(doorX0 + .03, 0, -.14); root.add(door);
  {
    const w = doorX1 - doorX0 - .06;
    const frame = std(C.espresso, .35);
    mesh(box(.08, doorY1 - .04, .06, .01), frame, .04, (doorY1 - .04) / 2, 0, door);
    mesh(box(.08, doorY1 - .04, .06, .01), frame, w - .04, (doorY1 - .04) / 2, 0, door);
    mesh(box(w, .08, .06, .01), frame, w / 2, doorY1 - .08, 0, door);
    mesh(box(w, .28, .06, .01), frame, w / 2, .14, 0, door);
    const g = mesh(new THREE.PlaneGeometry(w - .14, doorY1 - .44), M.glass, w / 2, (doorY1 - .12 + .28) / 2, 0, door); g.castShadow = false;
    const bar = mesh(new THREE.CylinderGeometry(.015, .015, .7, 16), M.brass, w - .16, 1.05, .07, door);
    mesh(box(.03, .03, .07, .01), M.brass, w - .16, 1.38, .035, door);
    mesh(box(.03, .03, .07, .01), M.brass, w - .16, .72, .035, door);
    // "open" plaque
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(.34, .12), new THREE.MeshBasicMaterial({ map: canvasTex(340, 120, (c, cw, ch) => {
      c.fillStyle = "#f4ebe0"; c.fillRect(0, 0, cw, ch); c.fillStyle = C.espresso; c.textAlign = "center";
      c.font = '500 46px "Jost", sans-serif'; if ("letterSpacing" in c) c.letterSpacing = "12px"; c.fillText("OPEN", cw / 2 + 6, 78);
    }), toneMapped: false }));
    plaque.position.set(w / 2, 1.62, .035); plaque.material.color.setScalar(.85); door.add(plaque);
  }
  // doormat
  { const m = mesh(new THREE.PlaneGeometry(1.1, .7), std("#8c7a6c", 1), (doorX0 + doorX1) / 2, .006, -.7); m.rotation.x = -Math.PI / 2; }

  /* ---------------- Interior shell ---------------- */
  const floor = mesh(new THREE.PlaneGeometry(W, D), M.floor, (X0 + X1) / 2, 0, Z1 / 2); floor.rotation.x = -Math.PI / 2;
  const ceil = mesh(new THREE.PlaneGeometry(W, D), M.ceiling, (X0 + X1) / 2, H, Z1 / 2); ceil.rotation.x = Math.PI / 2;
  const lw = mesh(new THREE.PlaneGeometry(D, H), M.wall, X0, H / 2, Z1 / 2); lw.rotation.y = Math.PI / 2;
  const rw = mesh(new THREE.PlaneGeometry(D, H), M.wall, X1, H / 2, Z1 / 2); rw.rotation.y = -Math.PI / 2;
  // back wall: green zellige behind the basins
  mesh(new THREE.PlaneGeometry(W, H), M.tile, (X0 + X1) / 2, H / 2, Z1);
  // inside face of the front wall
  { const f = mesh(new THREE.PlaneGeometry(W, H), M.wall, (X0 + X1) / 2, H / 2, -.29); f.rotation.y = Math.PI; f.visible = false; }
  // blush fluted wainscot on the left wall, sage on the right
  { const p = mesh(new THREE.BoxGeometry(.04, 1.05, D - 4.2), M.blushFlute, X0 + .02, .525, -1.2 - (D - 4.2) / 2);
    M.blushFlute.map.repeat.set(30, 1); }
  mesh(box(.06, .04, D - 4.2, .01), M.brass, X0 + .04, 1.06, -1.2 - (D - 4.2) / 2);
  // skirting
  mesh(new THREE.BoxGeometry(.03, .1, D), std(C.blushDeep, .6), X1 - .015, .05, Z1 / 2);
  // cornice
  for (const [x, ry] of [[X0 + .03, 0], [X1 - .03, 0]]) mesh(new THREE.BoxGeometry(.06, .08, D), std("#f7f1e8", .9), x, H - .04, Z1 / 2);

  /* ---------------- Lighting ---------------- */
  scene.add(new THREE.HemisphereLight("#fff3e6", "#c99d8f", .28));
  const sun = new THREE.DirectionalLight("#ffc89a", 2.2);
  sun.position.set(-7, 6.5, 9); sun.target.position.set(-.5, 0, -4); scene.add(sun.target);
  sun.castShadow = true;
  sun.shadow.mapSize.set(hi ? 2048 : 1024, hi ? 2048 : 1024);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -6, near: 1, far: 34 });
  sun.shadow.bias = -.0004; sun.shadow.normalBias = .02; sun.shadow.radius = 4;
  scene.add(sun);
  const warm = (x, y, z, i = 3, dist = 7) => { const l = new THREE.PointLight("#ffc08a", i, dist, 1.6); l.position.set(x, y, z); scene.add(l); return l; };

  // pendants: a cord, a brass cap and an opal globe
  const pendant = (x, z, drop = 1.05, r = .17) => {
    const g = new THREE.Group(); g.position.set(x, H, z); root.add(g);
    mesh(new THREE.CylinderGeometry(.006, .006, drop, 6), M.cord, 0, -drop / 2, 0, g).castShadow = false;
    mesh(new THREE.CylinderGeometry(.03, .05, .08, 24), M.brass, 0, -drop, 0, g).castShadow = false;
    const gl = mesh(new THREE.SphereGeometry(r, 32, 20), M.globe, 0, -drop - r + .02, 0, g); gl.castShadow = false;
    mesh(new THREE.CylinderGeometry(.07, .07, .012, 24), M.brass, 0, H - .006 - H, 0, g).castShadow = false;
    return g;
  };

  /* ---------------- Reception ---------------- */
  {
    const g = new THREE.Group(); g.position.set(1.45, 0, -3.3); root.add(g);
    // pill-shaped fluted desk
    const s = new THREE.Shape(); const L = 1.7, R = .32;
    s.absarc(0, L / 2 - R, R, 0, Math.PI, false); s.absarc(0, -L / 2 + R, R, Math.PI, Math.PI * 2, false);
    const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .98, bevelEnabled: false, curveSegments: 32 }), M.blushFlute.clone());
    body.material.map = flutingTex(C.blush); body.material.map.repeat.set(26, 1);
    body.rotation.x = -Math.PI / 2; body.position.y = .04; add(body, g);
    const top = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .05, bevelEnabled: true, bevelSize: .03, bevelThickness: .015, bevelSegments: 3, curveSegments: 32 }), M.terrazzo);
    top.rotation.x = -Math.PI / 2; top.position.y = 1.02; add(top, g);
    const kick = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: .04, bevelEnabled: false, curveSegments: 32 }), M.brass);
    kick.rotation.x = -Math.PI / 2; kick.scale.set(.96, .97, 1); add(kick, g);
    contact(0, 0, 1.3, 2.3, g);
    // telephone
    const ph = new THREE.Group(); ph.position.set(-.08, 1.09, .25); ph.rotation.y = .4; g.add(ph);
    mesh(box(.22, .08, .18, .03), M.espressoGloss, 0, .03, 0, ph);
    mesh(new THREE.CapsuleGeometry(.025, .2, 6, 12), M.espressoGloss, 0, .1, 0, ph).rotation.z = Math.PI / 2;
    for (const sx of [-.11, .11]) mesh(box(.06, .04, .07, .015), M.espressoGloss, sx, .09, 0, ph);
    mesh(new THREE.CylinderGeometry(.045, .045, .012, 24), M.brass, 0, .075, .055, ph).rotation.x = .3;
    // a card: "Call to book"
    const card = new THREE.Mesh(new THREE.PlaneGeometry(.2, .13), new THREE.MeshStandardMaterial({ roughness: .9, map: canvasTex(400, 260, (c, w, h) => {
      c.fillStyle = "#fbf6ef"; c.fillRect(0, 0, w, h); c.fillStyle = C.espresso; c.textAlign = "center";
      c.font = 'italic 500 64px "Cormorant Garamond", Georgia, serif'; c.fillText("Call to book", w / 2, 110);
      c.font = '500 34px "Jost", sans-serif'; c.fillText("01437 762114", w / 2, 190);
    }) }));
    card.position.set(-.12, 1.12, -.12); card.rotation.set(-.35, -1.2, 0, "YXZ"); add(card, g);
    // vase with dried stems
    const v = lathe([[0, 0], [.06, 0], [.08, .1], [.05, .2], [.035, .26], [.04, .28], [0, .28]], M.ceramic);
    v.position.set(-.05, 1.08, -.55); add(v, g);
    const r = rng(4);
    for (let i = 0; i < 9; i++) {
      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3((r() - .5) * .15, .25, (r() - .5) * .15), new THREE.Vector3((r() - .5) * .35, .55 + r() * .15, (r() - .5) * .35)];
      const t = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, .004, 4), std("#c6a77f", .9));
      t.position.set(-.05, 1.33, -.55); add(t, g);
      const plume = mesh(new THREE.SphereGeometry(.018, 8, 6), std("#e6d3b8", 1), 0, 0, 0, g);
      plume.scale.set(1, 4.5, 1); plume.position.copy(pts[2]).add(new THREE.Vector3(-.05, 1.33, -.55));
    }
    // products behind reception
    for (let sIdx = 0; sIdx < 3; sIdx++) {
      const y = 1.25 + sIdx * .45;
      mesh(box(.3, .035, 1.8, .01), M.terrazzo, X1 - .15 - 1.45, y, 0, g);
      for (let i = 0; i < 7; i++) {
        const h2 = .16 + ((i * 7 + sIdx * 3) % 5) * .02;
        const col = [C.blush, "#f3ece4", C.sage, "#c9a77e", "#e3d5c6"][(i + sIdx) % 5];
        const b = lathe([[0, 0], [.035, 0], [.035, h2], [.015, h2 + .03], [.015, h2 + .05], [0, h2 + .05]], std(col, .35), 24);
        b.position.set(X1 - .15 - 1.45, y + .02, -.75 + i * .25); add(b, g);
        mesh(new THREE.CylinderGeometry(.017, .017, .03, 16), i % 2 ? M.brass : M.espressoGloss, X1 - .15 - 1.45, y + .02 + h2 + .065, -.75 + i * .25, g);
      }
    }
    pendant(1.45, -3.0, 1.0, .2);
    warm(1.3, 2.1, -3.0, 2.2, 6);
  }

  /* ---------------- Waiting nook by the window ---------------- */
  {
    const g = new THREE.Group(); g.position.set(-2.2, 0, -1.25); root.add(g);
    const rug = mesh(new THREE.CircleGeometry(1.15, 64), std("#ffffff", 1, 0, { map: rugTex() }), 0, .008, -.1, g); rug.rotation.x = -Math.PI / 2;
    // curved sage velvet sofa, back to the window
    const sofaShape = new THREE.Shape(); sofaShape.absarc(0, 0, 1.15, Math.PI * .15, Math.PI * .85, false); sofaShape.absarc(0, 0, .55, Math.PI * .85, Math.PI * .15, true);
    const seat = new THREE.Mesh(new THREE.ExtrudeGeometry(sofaShape, { depth: .42, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 4, curveSegments: 48 }), M.velvetSage);
    seat.rotation.x = -Math.PI / 2; seat.position.set(0, .05, -.55); seat.scale.set(1, -1, 1); add(seat, g);
    const backShape = new THREE.Shape(); backShape.absarc(0, 0, 1.18, Math.PI * .14, Math.PI * .86, false); backShape.absarc(0, 0, 1.0, Math.PI * .86, Math.PI * .14, true);
    const back = new THREE.Mesh(new THREE.ExtrudeGeometry(backShape, { depth: .78, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 4, curveSegments: 48 }), M.velvetSage);
    back.rotation.x = -Math.PI / 2; back.position.set(0, .05, -.55); back.scale.set(1, -1, 1); add(back, g);
    contact(0, -.9, 2.6, 1.4, g);
    // side table
    mesh(new THREE.CylinderGeometry(.28, .28, .03, 48), M.terrazzo, 1.15, .52, .45, g);
    mesh(new THREE.CylinderGeometry(.04, .14, .5, 32), M.brass, 1.15, .26, .45, g);
    mesh(box(.24, .02, .3, .005), std("#e9d6c9", .9), 1.12, .545, .45, g).rotation.y = .3;
    mesh(box(.22, .015, .28, .005), std("#b9c4b1", .9), 1.18, .565, .44, g).rotation.y = -.2;
  }

  /* ---------------- Plants ---------------- */
  const leafGeo = (() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.bezierCurveTo(.16, .05, .2, .25, 0, .42); s.bezierCurveTo(-.2, .25, -.16, .05, 0, 0);
    const g = new THREE.ShapeGeometry(s, 10);
    // cup the leaf a little
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, x * x * 1.6); }
    g.computeVertexNormals();
    return g;
  })();
  const plant = (x, z, scale = 1, seed = 1, parent = root) => {
    const r = rng(seed), g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(scale); parent.add(g);
    const pot = lathe([[0, 0], [.2, 0], [.25, .42], [.27, .46], [0, .46]], M.pot); add(pot, g);
    mesh(new THREE.CylinderGeometry(.24, .24, .02, 24), std("#4a3a30", 1), 0, .44, 0, g);
    for (let i = 0; i < 24; i++) {
      const a = r() * Math.PI * 2, h = .5 + r() * .9, lean = .25 + r() * .5;
      const tip = new THREE.Vector3(Math.cos(a) * lean * .6, .45 + h, Math.sin(a) * lean * .6);
      const stem = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, .45, 0), new THREE.Vector3(tip.x * .3, .45 + h * .8, tip.z * .3), tip), 8, .006, 4), std("#5f7a52", .7));
      add(stem, g);
      const leaf = new THREE.Mesh(leafGeo, r() > .5 ? M.leaf : M.leafLight);
      leaf.position.copy(tip); leaf.scale.setScalar(.9 + r() * .9);
      leaf.lookAt(tip.x * 3, tip.y + .4, tip.z * 3); leaf.rotateX(-Math.PI / 2 + .5);
      add(leaf, g);
    }
    contact(0, 0, .9, .9, g);
    return g;
  };
  plant(-3.15, -.75, 1.05, 2);
  plant(2.0, -1.0, .8, 5);
  plant(-3.1, -10.4, 1.25, 8);
  plant(1.95, -10.4, 1.1, 12);
  plant(1.95, -5.2, .8, 15);

  /* ---------------- Styling stations (left wall) ---------------- */
  const stationZ = [-4.3, -6.25, -8.2];
  const archFramePath = (w, h) => {
    const r = w / 2, s = new THREE.Shape();
    s.moveTo(-r, 0); s.lineTo(-r, h - r); s.absarc(0, h - r, r, Math.PI, 0, true); s.lineTo(r, 0); s.closePath();
    return s;
  };
  const chair = (parent) => {
    const g = new THREE.Group(); parent.add(g);
    mesh(new THREE.CylinderGeometry(.3, .32, .04, 48), M.chrome, 0, .02, 0, g);
    mesh(new THREE.CylinderGeometry(.045, .055, .36, 24), M.chrome, 0, .22, 0, g);
    mesh(new THREE.CylinderGeometry(.18, .12, .06, 32), M.chrome, 0, .41, 0, g);
    // seat and channel-tufted back
    mesh(box(.56, .16, .52, .07, 4), M.velvet, 0, .52, 0, g);
    for (let i = 0; i < 5; i++) {
      const p = mesh(box(.1, .62, .12, .05, 3), M.velvet, -.22 + i * .11, .9, -.26, g);
      p.rotation.x = -.12;
    }
    mesh(box(.6, .06, .16, .03), M.velvet, 0, 1.22, -.29, g).rotation.x = -.12;
    for (const sx of [-.3, .3]) {
      mesh(box(.08, .07, .46, .035), M.velvet, sx, .72, -.01, g);
      mesh(new THREE.CylinderGeometry(.012, .012, .18, 12), M.chrome, sx, .62, .1, g);
    }
    // footrest
    mesh(box(.42, .03, .14, .015), M.chrome, 0, .17, .36, g).rotation.x = .3;
    mesh(new THREE.CylinderGeometry(.01, .01, .3, 8), M.chrome, 0, .3, .27, g).rotation.x = .5;
    contact(0, 0, 1.0, 1.0, g);
    return g;
  };
  for (const z of stationZ) {
    const g = new THREE.Group(); g.position.set(X0, 0, z); root.add(g);
    // arched mirror with a brass frame
    const mw = 1.0, mh = 1.95;
    const mirror = new THREE.Mesh(new THREE.ShapeGeometry(archFramePath(mw, mh), 32), M.mirror);
    mirror.rotation.y = Math.PI / 2; mirror.position.set(.07, .95, 0); add(mirror, g);
    const framePts = archFramePath(mw + .06, mh + .03).getPoints(64).map(p => new THREE.Vector3(0, p.y, -p.x));
    const frame = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(framePts, true, "catmullrom", 0), 160, .022, 10, true), M.brass);
    frame.position.set(.075, .93, 0); add(frame, g);
    // console shelf
    mesh(box(.42, .04, 1.2, .015), M.terrazzo, .23, 1.0, 0, g);
    for (const dz of [-.5, .5]) mesh(new THREE.CylinderGeometry(.012, .012, 1.0, 12), M.brass, .38, .5, dz, g);
    // tools on the shelf: spray bottle, round brush, comb, dryer
    const sp = lathe([[0, 0], [.035, 0], [.035, .15], [.02, .17], [.02, .19], [0, .19]], std("#f3ece4", .25), 24); sp.position.set(.18, 1.02, -.35); add(sp, g);
    mesh(box(.03, .03, .05, .01), M.espressoGloss, .18, 1.23, -.34, g);
    const brush = mesh(new THREE.CylinderGeometry(.03, .03, .16, 16), std("#cfb7a0", .8), .25, 1.05, .1, g); brush.rotation.x = Math.PI / 2; brush.rotation.z = .3;
    mesh(new THREE.CylinderGeometry(.012, .012, .2, 12), M.espressoGloss, .25, 1.05, .28, g).rotation.x = Math.PI / 2;
    mesh(box(.02, .012, .2, .004), M.espressoGloss, .3, 1.028, -.1, g).rotation.y = .4;
    const dryer = new THREE.Group(); dryer.position.set(.2, 1.06, .42); dryer.rotation.y = 1.2; g.add(dryer);
    mesh(new THREE.CylinderGeometry(.045, .05, .2, 24), std(C.blushDeep, .4), 0, 0, 0, dryer).rotation.z = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(.022, .022, .14, 16), std(C.blushDeep, .4), .03, -.07, 0, dryer);
    // chair facing the mirror
    const c = chair(g); c.position.set(1.15, 0, 0); c.rotation.y = -Math.PI / 2;
    // wall art between mirrors
    pendant(X0 + 1.2, z, 1.15, .14);
  }
  // framed prints between stations
  [[-5.28, 1], [-7.22, 2]].forEach(([z, s]) => {
    const g = new THREE.Group(); g.position.set(X0 + .03, 1.75, z); g.rotation.y = Math.PI / 2; root.add(g);
    mesh(box(.5, .66, .03, .005), M.brass, 0, 0, 0, g);
    const art = new THREE.Mesh(new THREE.PlaneGeometry(.44, .6), std("#ffffff", .9, 0, { map: artTex(s * 7) }));
    art.position.z = .017; g.add(art);
  });
  warm(-2.3, 2.2, -5.2, 2.6, 7);
  warm(-2.3, 2.2, -8.0, 2.4, 7);

  /* ---------------- Colour bar (right wall) ---------------- */
  {
    const g = new THREE.Group(); g.position.set(X1, 0, -7.0); root.add(g);
    // counter with blush drawers and a terrazzo top
    mesh(box(.6, .88, 2.6, .02), M.blushFlute, -.32, .46, 0, g);
    mesh(box(.66, .05, 2.7, .015), M.terrazzo, -.33, .925, 0, g);
    for (let i = 0; i < 4; i++) mesh(box(.012, .025, .16, .008), M.brass, -.63, .78, -.95 + i * .63, g);
    // colour tubes on shelves
    const tubeCols = ["#1a1412", "#3a1e14", "#5b2a17", "#7b3a1d", "#9b5226", "#b8702f", "#cf9145", "#e0b36e", "#ead09a", "#f1e2bf", "#c98d86", "#a05a7a", "#7a8d6e"];
    for (let s = 0; s < 3; s++) {
      const y = 1.22 + s * .31;
      mesh(box(.26, .03, 2.4, .01), M.brass, -.13, y, 0, g);
      for (let i = 0; i < 18; i++) {
        const col = tubeCols[(i + s * 4) % tubeCols.length];
        const t = mesh(box(.05, .18, .05, .012), std("#efe9e2", .4), -.12, y + .105, -1.1 + i * .13, g);
        mesh(box(.052, .05, .052, .012), std(col, .35), -.12, y + .17, -1.1 + i * .13, g);
      }
    }
    // mixing bowls and tint brushes
    for (const [z, col] of [[-.7, C.blush], [-.3, C.sage], [.2, "#efe6db"]]) {
      const bowl = lathe([[0, 0], [.05, 0], [.1, .05], [.11, .07], [.1, .07], [0, .01]], std(col, .3), 32);
      bowl.position.set(-.35, .95, z); add(bowl, g);
      const br = mesh(box(.012, .012, .2, .004), M.espressoGloss, -.33, 1.03, z + .05, g); br.rotation.x = -.5;
    }
    // the swatch rail: from black box dye to toned blonde
    mesh(new THREE.CylinderGeometry(.012, .012, 2.5, 16), M.brass, -.12, 2.86, 0, g).rotation.x = Math.PI / 2;
    for (const dz of [-1.25, 1.25]) mesh(box(.12, .03, .03, .01), M.brass, -.06, 2.86, dz, g);
    const hairMap = hairTex();
    const swatchCols = ["#151110", "#2b1712", "#46200f", "#6a2a12", "#8e3a15", "#b25622", "#c97a32", "#d9a052", "#e3bd75", "#ecd39c", "#f0dfb8", "#efe2c8"];
    const swGeo = new THREE.PlaneGeometry(.17, .66, 1, 8);
    { const p = swGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), t = (.31 - y) / .62; p.setX(i, p.getX(i) * (1 - t * .5)); p.setZ(i, Math.sin(t * 3) * .02); } swGeo.computeVertexNormals(); }
    swatchCols.forEach((col, i) => {
      const m = new THREE.Mesh(swGeo, new THREE.MeshStandardMaterial({ color: col, map: hairMap, alphaMap: null, transparent: true, alphaTest: .15, roughness: .45, side: THREE.DoubleSide }));
      m.position.set(-.13, 2.5, -1.1 + i * .2); m.rotation.y = -Math.PI / 2; add(m, g);
      mesh(new THREE.CylinderGeometry(.022, .022, .04, 12), M.brass, -.13, 2.84, -1.1 + i * .2, g).rotation.x = Math.PI / 2;
    });
    warm(X1 - 1.0, 2.2, -7.0, 2, 5);
  }

  /* ---------------- Wash area (back) ---------------- */
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .69), new THREE.MeshBasicMaterial({ map: neonTex(), transparent: true, depthWrite: false, toneMapped: false, color: new THREE.Color(2.2, 1.7, 1.65) }));
  neon.position.set(-.6, 2.55, Z1 + .02); root.add(neon);
  for (const x of [-1.85, .55]) {
    const g = new THREE.Group(); g.position.set(x, 0, Z1 + .55); root.add(g);
    // cabinet and ceramic basin
    mesh(box(.75, .78, .5, .04), M.sageFlute, 0, .39, 0, g);
    M.sageFlute.map.repeat.set(4, 1);
    const basin = lathe([[0, 0], [.08, 0], [.22, .06], [.3, .16], [.31, .2], [.28, .2], [.2, .1], [.06, .05], [0, .05]], M.ceramic, 48);
    basin.scale.set(1, 1, .8); basin.position.set(0, .78, .05); add(basin, g);
    // tap
    mesh(new THREE.CylinderGeometry(.014, .014, .3, 12), M.chrome, 0, 1.05, -.2, g);
    const spout = new THREE.Mesh(new THREE.TorusGeometry(.08, .012, 10, 24, Math.PI), M.chrome);
    spout.position.set(0, 1.2, -.12); spout.rotation.y = Math.PI / 2; add(spout, g);
    // reclining wash chair
    const c = new THREE.Group(); c.position.set(0, 0, .85); g.add(c);
    mesh(box(.62, .38, .62, .05), M.blush, 0, .19, 0, c);
    mesh(box(.6, .14, .6, .07, 4), M.velvet, 0, .45, 0, c);
    const bk = mesh(box(.6, .12, .72, .06, 4), M.velvet, 0, .62, -.42, c); bk.rotation.x = .75;
    for (const sx of [-.33, .33]) mesh(box(.07, .16, .55, .035), M.velvet, sx, .58, 0, c);
    mesh(box(.56, .1, .5, .05), M.velvet, 0, .32, .55, c).rotation.x = -.35;
    contact(0, .4, 1.1, 2.0, g);
  }
  // towel shelf with rolled towels
  {
    const g = new THREE.Group(); g.position.set(X1 - .25, 0, Z1 + 1.8); root.add(g);
    for (let s = 0; s < 3; s++) {
      const y = .55 + s * .45;
      mesh(box(.42, .03, 1.1, .01), M.terrazzo, 0, y, 0, g);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2 - (i % 2 ? 1 : 0) + 1; j++) {
        const t = mesh(new THREE.CylinderGeometry(.075, .075, .36, 24), (i + j + s) % 3 ? M.towel : M.towelSage, 0, y + .09 + j * .14, -.4 + i * .26, g);
        t.rotation.z = Math.PI / 2;
      }
    }
    mesh(new THREE.CylinderGeometry(.012, .012, 1.6, 8), M.brass, .2, .8, -.57, g);
    mesh(new THREE.CylinderGeometry(.012, .012, 1.6, 8), M.brass, .2, .8, .57, g);
  }
  pendant(-1.85, Z1 + 1.2, .9, .16);
  pendant(.55, Z1 + 1.2, .9, .16);
  warm(-.6, 2.1, Z1 + 1.4, 2.6, 6);

  // a second, softer fill that keeps the room from going muddy
  const fill = new THREE.PointLight("#ffe2c6", 1.6, 12, 1.4); fill.position.set(-.6, 2.9, -2.0); scene.add(fill);
  const fill2 = new THREE.PointLight("#ffe2c6", 1.2, 12, 1.4); fill2.position.set(-.6, 2.9, -7.5); scene.add(fill2);

  /* ---------------- Across the road ---------------- */
  {
    const r = rng(41), tones = ["#d9cbb8", "#c8cdbf", "#e7d9c9", "#bfb3a6", "#d6c3b9", "#cfd2c6"];
    let x = -14;
    while (x < 14) {
      const w = 3.5 + r() * 2.5, h = 6 + r() * 3, col = tones[(r() * tones.length) | 0];
      const g = new THREE.Group(); g.position.set(x + w / 2, 0, 17.5); g.rotation.y = Math.PI; root.add(g);
      mesh(new THREE.BoxGeometry(w, h, .5), std(col, .95), 0, h / 2, 0, g);
      for (const wy of [1.7, 4.6]) for (let k = 0; k < Math.floor(w / 1.6); k++) {
        const wx = -w / 2 + .9 + k * 1.6;
        const lit = r() > .55;
        mesh(box(.8, 1.2, .06, .01), std("#f4eee4", .7), wx, wy, .27, g);
        const pane = new THREE.Mesh(new THREE.PlaneGeometry(.68, 1.08), lit ? new THREE.MeshStandardMaterial({ color: "#ffe3bf", emissive: "#ffc98f", emissiveIntensity: .9 }) : std("#4b4954", .1, .3));
        pane.position.set(wx, wy, .305); g.add(pane);
      }
      x += w + .05;
    }
    const pav = mesh(new THREE.PlaneGeometry(40, 3), std("#ffffff", .85, 0, { map: pavingTex() }), 0, .01, 16); pav.rotation.x = -Math.PI / 2;
  }

  /* ---------------- Mirror reflections ---------------- */
  // One cube capture from the middle of the room, used by the arched mirrors.
  {
    const rt = new THREE.WebGLCubeRenderTarget(hi ? 512 : 256, { type: THREE.HalfFloatType });
    const cubeCam = new THREE.CubeCamera(.1, 30, rt);
    cubeCam.position.set(-.6, 1.5, -6.2);
    scene.add(cubeCam);
    door.rotation.y = 1.65;
    const mirrors = []; root.traverse(o => { if (o.material === M.mirror) { mirrors.push(o); o.visible = false; } });
    cubeCam.update(renderer, scene);
    mirrors.forEach(o => { o.visible = true; });
    M.mirror.envMap = rt.texture;
    M.mirror.color.set("#d9dcdc");
    M.mirror.envMapIntensity = .9;
    M.mirror.needsUpdate = true;
  }

  /* ---------------- Post-processing ---------------- */
  let composer = null, bloom = null;
  const size = new THREE.Vector2();
  function buildComposer() {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .28, .5, .97);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }
  buildComposer();

  /* ---------------- Camera tour ---------------- */
  // Each station: where the camera stands, what it looks at, and its lens.
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const stations = [
    { pos: V(-2.1, 1.6, 8.9), look: V(-3.5, 1.95, 0), fov: 44,      // 0 the street (shopfront to the right, room for the headline)
      tall: { pos: V(-.6, 1.5, 8.4), look: V(-.6, -1.2, 0) } },        //   on tall screens: shopfront up top, pavement under the text     //   on tall screens: centred, sitting high
    { pos: V(1.4, 1.62, 1.55), look: V(1.25, 1.5, -3), fov: 50 },    // 1 at the door
    { pos: V(1.35, 1.62, -1.2), look: V(-2.2, 1.15, -6.0), fov: 54 }, // 2 inside: the salon
    { pos: V(-.55, 1.5, -1.55), look: V(1.45, 1.05, -3.45), fov: 46 },// 3 reception
    { pos: V(.95, 1.62, -4.4), look: V(-3.3, 1.25, -6.7), fov: 52 },  // 4 styling stations
    { pos: V(-.15, 1.75, -6.55), look: V(2.4, 2.15, -7.05), fov: 46 }, // 5 colour bar & swatch rail
    { pos: V(-.45, 1.7, -6.3), look: V(-.6, 1.45, -11), fov: 50 },    // 6 the wash area
    { pos: V(.4, 1.62, -9.4), look: V(.1, 1.45, 4), fov: 50 },        // 7 looking back out to Portfield
  ];
  const doorOpenAt = [.25, .95]; // within segment 0 -> 1

  let stopsP = stations.map((_, i) => i / (stations.length - 1));
  let target = 0, current = 0;
  const pointer = new THREE.Vector2(), pointerCur = new THREE.Vector2();
  const tmpPos = new THREE.Vector3(), tmpLook = new THREE.Vector3();
  const smoother = t => t * t * t * (t * (t * 6 - 15) + 10);

  function poseAt(p) {
    let i = 0;
    while (i < stopsP.length - 2 && p > stopsP[i + 1]) i++;
    const span = stopsP[i + 1] - stopsP[i] || 1;
    const raw = THREE.MathUtils.clamp((p - stopsP[i]) / span, 0, 1);
    const t = smoother(raw);
    const portrait = camera.aspect < 1;
    const pick = st => (portrait && st.tall) ? st.tall : st;
    const a = stations[i], b = stations[i + 1];
    tmpPos.lerpVectors(pick(a).pos, pick(b).pos, t);
    tmpLook.lerpVectors(pick(a).look, pick(b).look, t);
    // lift the path a touch mid-move so it feels like walking, not sliding
    tmpPos.y += Math.sin(raw * Math.PI) * .05;
    const fov = THREE.MathUtils.lerp(a.fov, b.fov, t);
    // door
    let open = 0;
    if (i === 0) open = THREE.MathUtils.clamp((raw - doorOpenAt[0]) / (doorOpenAt[1] - doorOpenAt[0]), 0, 1);
    else open = 1;
    return { fov, open };
  }

  let needs = true, raf = 0, disposed = false;
  function frame() {
    raf = 0;
    if (disposed) return;
    const dp = target - current;
    current += Math.abs(dp) < .0002 ? dp : dp * .085;
    pointerCur.lerp(pointer, .06);
    const { fov, open } = poseAt(current);
    door.rotation.y = smoother(open) * 1.65;
    camera.position.copy(tmpPos);
    tmpLook.x += pointerCur.x * .35; tmpLook.y += pointerCur.y * .2;
    camera.lookAt(tmpLook);
    // keep at least ~58 degrees across on tall phone screens
    const minV = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(58) / 2) / camera.aspect));
    const f = Math.min(80, Math.max(fov, minV));
    if (camera.fov !== f) { camera.fov = f; camera.updateProjectionMatrix(); }
    composer.render();
    const moving = Math.abs(target - current) > .00015 || pointerCur.distanceTo(pointer) > .001;
    if (moving || needs) { needs = false; raf = requestAnimationFrame(frame); }
  }
  const kick = () => { if (!raf && !disposed) raf = requestAnimationFrame(frame); };

  function resize() {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.getDrawingBufferSize(size);
    needs = true; kick();
  }

  resize();

  return {
    stations: stations.length,
    setProgress(p, stops) {
      if (stops && stops.length === stations.length) stopsP = stops;
      target = THREE.MathUtils.clamp(p, 0, 1);
      kick();
    },
    jump(p) { target = current = THREE.MathUtils.clamp(p, 0, 1); pointerCur.copy(pointer); needs = true; kick(); },
    setPointer(x, y) { pointer.set(x, y); kick(); },
    resize,
    renderNow() { needs = true; frame(); },
    dispose() { disposed = true; cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
