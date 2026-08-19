/* ==========================================================================
   Eddie Rocks — the building, in three dimensions.

   Three storeys on Quay Street. The shared engine in venue3d.js owns the
   shell, the camera journey and the render loop; this file supplies only
   what makes it Eddie's: the warm copper palette, the shopfront and signage,
   and the contents of the three rooms.
   ========================================================================== */

import { mountVenue } from "./venue3d.js";

var C = {
  night: 0x140c11,
  brick: 0x2a1a23,
  brickDark: 0x1d1219,
  stone: 0x3a2733,
  interiorDark: 0x120a0f,
  metal: 0x8a6a55,
  silhouette: 0x0d0709,
  street: 0x150d12,
  neighbourWindow: 0xb08a6a,
  ambient: 0x3a2632,
  lamp: 0xffcf9a,
  skyFill: 0x7c6a8e,
  envTop: "#3a2733", envMid: "#1d1219", envBottom: "#0a0507",
  hazeA: 0xe2895e, hazeB: 0xc85c7e, mote: 0xf6c9a0,
  // brand
  copper: 0xe2895e,
  copperLit: 0xf6c9a0,
  magenta: 0xc85c7e,
  pink: 0xff4fa3,
  leaf: 0x4a7a52,
  blush: 0xe8a0b4,
  // taken off the photograph of the frontage: the uplighters are magenta
  // and violet, the entrance recess is lit cold, and the parapet LED bar
  // cycles blue/red/white
  upMagenta: 0xd63f9e,
  violet: 0x8f5cd6,
  entryBlue: 0x4fd8ff,
  ledBlue: 0x2f6cff,
  ledRed: 0xff2d4a,
  ledWhite: 0xdfe8ff,
};

/* ---------------------------------------------------- 01 Forbidden Florist
   Warm and low-lit, dressed with planting rather than a rig: the room that
   sets the tone before the stairs. */
function buildFlorist(ctx, room, y) {
  var T = ctx.THREE;
  var warm = new T.PointLight(C.copperLit, 12, 9, 2);
  warm.position.set(-1.2, y + 2.2, 0.4);
  room.add(warm);
  var blush = new T.PointLight(C.blush, 7, 8, 2);
  blush.position.set(1.6, y + 1.9, -1.0);
  room.add(blush);
  ctx.pulseLights.push({ light: warm, base: 12, speed: 0.6, amp: 0.06, floor: 0 });

  // bar along the back with a lit bottle shelf behind it
  ctx.box(new T.MeshStandardMaterial({ color: 0x2f5f42, roughness: 0.5, metalness: 0.25 }),
    4.2, 0.95, 0.7, 0.5, y + 0.48, -2.95, room);
  ctx.box(ctx.mat.metal, 4.26, 0.07, 0.78, 0.5, y + 0.98, -2.95, room);
  ctx.box(ctx.emissive(C.copperLit, 0.5), 3.9, 0.55, 0.05, 0.5, y + 1.75, -3.6, room);
  for (var b = 0; b < 9; b++) {
    ctx.cyl(new T.MeshStandardMaterial({
      color: b % 3 === 0 ? 0x7a4a2e : 0x35543f, roughness: 0.3, metalness: 0.3,
    }), 0.05, 0.3, -1.3 + b * 0.42, y + 1.68, -3.5, room);
  }

  // café tables with a bloom on each
  for (var t = 0; t < 3; t++) {
    var tx = -2.5 + t * 1.35;
    ctx.cyl(ctx.mat.metal, 0.05, 0.72, tx, y + 0.36, 0.1, room);
    ctx.cyl(new T.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.6 }), 0.32, 0.06, tx, y + 0.74, 0.1, room);
    var bloom = new T.Mesh(new T.IcosahedronGeometry(0.11, 0),
      new T.MeshStandardMaterial({ color: C.blush, roughness: 0.7, emissive: C.blush, emissiveIntensity: 0.25 }));
    bloom.position.set(tx, y + 0.86, 0.1);
    room.add(bloom);
  }

  // planting and the hanging canopy of blooms, the florist's signature
  var leafGeo = new T.IcosahedronGeometry(0.3, 0);
  var leafMat = new T.MeshStandardMaterial({ color: C.leaf, roughness: 0.85 });
  for (var p = 0; p < 16; p++) {
    var m = new T.Mesh(leafGeo, leafMat);
    var ang = (p / 16) * Math.PI * 2;
    m.position.set(
      Math.cos(ang) * (2.4 + Math.random() * 0.5),
      y + 2.35 + Math.sin(p * 1.7) * 0.16,
      Math.sin(ang) * (2.4 + Math.random() * 0.6) - 0.9
    );
    m.scale.setScalar(0.55 + Math.random() * 0.7);
    room.add(m);
  }
  for (var q = 0; q < 12; q++) {
    var fl = new T.Mesh(leafGeo, new T.MeshStandardMaterial({
      color: q % 3 === 0 ? C.blush : C.leaf, roughness: 0.8,
    }));
    fl.position.set(-1.9 + q * 0.5, y + 2.66 - Math.random() * 0.28, -2.7);
    fl.scale.setScalar(0.4 + Math.random() * 0.4);
    room.add(fl);
  }
  for (var s = 0; s < 9; s++) {
    var bx = -2.9 + s * 0.74;
    var by = y + 2.42 + Math.sin(s * 0.7) * 0.08;
    ctx.box(ctx.emissive(C.copperLit, 3), 0.05, 0.05, 0.05, bx, by, -0.4, room);
    ctx.glow(C.copperLit, 0.55, bx, by, -0.4, 0.5, room);
  }
  ctx.crowd(6, 4.6, y + 0.02, -1.5, room, 0.95);
}

/* ------------------------------------------------------------ 02 Main Bar
   The room that started it all: full rig, moving spotlights, the densest
   crowd in the building. */
function buildMainBar(ctx, room, y) {
  var T = ctx.THREE;
  var key = new T.PointLight(C.copper, 16, 10, 2);
  key.position.set(0, y + 2.3, -0.4);
  room.add(key);
  var side = new T.PointLight(C.magenta, 9, 9, 2);
  side.position.set(-2.2, y + 1.6, 1.0);
  room.add(side);
  ctx.pulseLights.push({ light: key, base: 16, speed: 3.4, amp: 0.4, floor: 1 });
  ctx.pulseLights.push({ light: side, base: 9, speed: 2.6, amp: 0.5, floor: 1 });

  // DJ booth flanked by speaker stacks with visible drivers
  ctx.box(ctx.mat.dark, 2.1, 1.05, 0.8, 0, y + 0.52, -3.0, room);
  ctx.box(ctx.emissive(C.copperLit, 0.9), 1.95, 0.12, 0.04, 0, y + 0.92, -2.58, room);
  for (var sp = -1; sp <= 1; sp += 2) {
    ctx.box(ctx.mat.dark, 0.68, 1.9, 0.6, sp * 2.0, y + 0.95, -2.9, room);
    for (var d = 0; d < 3; d++) {
      var cone = ctx.cyl(new T.MeshStandardMaterial({ color: 0x241820, roughness: 0.7 }),
        0.2, 0.06, sp * 2.0, y + 0.45 + d * 0.56, -2.58, room);
      cone.rotation.x = Math.PI / 2;
    }
  }

  // bar down the side, and a dancefloor lit from beneath
  ctx.box(new T.MeshStandardMaterial({ color: 0x33202b, roughness: 0.45, metalness: 0.3 }),
    0.75, 1.0, 4.4, -2.95, y + 0.5, -0.4, room);
  ctx.box(ctx.mat.metal, 0.83, 0.07, 4.46, -2.95, y + 1.03, -0.4, room);
  ctx.box(ctx.emissive(C.copper, 0.45), 0.04, 0.6, 4.0, -3.36, y + 1.8, -0.4, room);
  ctx.box(ctx.emissive(C.copper, 0.1), 4.2, 0.03, 4.0, 0.4, y + 0.11, -1.0, room);

  var beamMat = new T.MeshBasicMaterial({
    color: C.copperLit, transparent: true, opacity: 0.14,
    blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide,
  });
  var beamGeo = new T.ConeGeometry(0.42, 2.3, 10, 1, true);
  for (var bm = 0; bm < 4; bm++) {
    var beam = new T.Mesh(beamGeo, beamMat.clone());
    if (bm % 2) beam.material.color.setHex(C.magenta);
    beam.position.set(-2.1 + bm * 1.4, y + 1.6, -1.3);
    room.add(beam);
    ctx.box(ctx.mat.dark, 0.18, 0.18, 0.18, -2.1 + bm * 1.4, y + 2.82, -1.3, room);
    ctx.beams.push({ beam: beam, phase: bm * 1.4, swing: 0.42, tilt: 0.22, min: 0.1, range: 0.12 });
    ctx.glow(bm % 2 ? C.magenta : C.copperLit, 0.8, -2.1 + bm * 1.4, y + 2.7, -1.3, 0.5, room);
  }
  ctx.box(ctx.emissive(C.copperLit, 0.7), ctx.W - 1.0, 0.05, 0.05, 0, y + ctx.FH - 0.24, 3.0, room);
  ctx.crowd(18, 5.0, y + 0.12, -1.9, room, 1);
}

/* ------------------------------------------------------------- 03 RnB Bar
   Darker and slower, built around a back-lit bar and booth seating. */
function buildRnbBar(ctx, room, y) {
  var T = ctx.THREE;
  var key = new T.PointLight(C.magenta, 13, 9, 2);
  key.position.set(0.4, y + 2.2, -0.6);
  room.add(key);
  var pink = new T.PointLight(C.pink, 8, 8, 2);
  pink.position.set(-1.8, y + 1.5, 0.9);
  room.add(pink);
  ctx.pulseLights.push({ light: key, base: 13, speed: 2.2, amp: 0.32, floor: 2 });
  ctx.pulseLights.push({ light: pink, base: 8, speed: 1.7, amp: 0.4, floor: 2 });

  ctx.box(new T.MeshStandardMaterial({ color: 0x2a1824, roughness: 0.4, metalness: 0.35 }),
    4.0, 1.0, 0.7, -0.5, y + 0.5, -2.95, room);
  ctx.box(ctx.mat.metal, 4.06, 0.07, 0.8, -0.5, y + 1.03, -2.95, room);
  ctx.box(ctx.emissive(C.pink, 0.65), 3.8, 0.95, 0.04, -0.5, y + 1.8, -3.6, room);
  for (var b = 0; b < 11; b++) {
    ctx.cyl(new T.MeshStandardMaterial({ color: 0x3a2430, roughness: 0.25, metalness: 0.4 }),
      0.045, 0.3, -2.2 + b * 0.36, y + 1.66, -3.5, room);
  }

  for (var s = 0; s < 3; s++) {
    var bx = -2.4 + s * 2.4;
    ctx.box(new T.MeshStandardMaterial({ color: 0x3d2430, roughness: 0.8 }), 1.7, 0.42, 0.68, bx, y + 0.22, 2.4, room);
    ctx.box(new T.MeshStandardMaterial({ color: 0x46293a, roughness: 0.8 }), 1.7, 0.68, 0.16, bx, y + 0.74, 2.76, room);
    ctx.cyl(ctx.mat.metal, 0.3, 0.05, bx, y + 0.46, 1.7, room);
  }

  ctx.box(ctx.mat.dark, 1.7, 0.95, 0.65, 2.3, y + 0.48, -2.1, room);
  ctx.box(ctx.emissive(C.pink, 0.8), 1.55, 0.1, 0.04, 2.3, y + 0.86, -1.78, room);

  var beamGeo = new T.ConeGeometry(0.5, 2.2, 10, 1, true);
  for (var bm = 0; bm < 3; bm++) {
    var beam = new T.Mesh(beamGeo, new T.MeshBasicMaterial({
      color: bm === 1 ? 0x8a5cc8 : C.pink, transparent: true, opacity: 0.12,
      blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide,
    }));
    beam.position.set(-1.9 + bm * 1.9, y + 1.65, -0.9);
    room.add(beam);
    ctx.beams.push({ beam: beam, phase: bm * 2.1, swing: 0.32, speed: 0.55, min: 0.08, range: 0.1, flicker: 1.5 });
  }
  ctx.box(ctx.emissive(C.pink, 0.6), ctx.W - 1.2, 0.05, 0.05, 0, y + ctx.FH - 0.26, 2.9, room);
  ctx.crowd(11, 4.6, y + 0.12, -1.9, room, 1);
}

/* ---- the street elevation: a shopfront under two storeys of windows ---- */
/* ------------------------------------------------------- the real frontage
   Modelled from a photograph of the building on Quay Street rather than
   invented: two storeys of pale render under a segmented LED bar, EDDIE
   ROCKS in raised letters across the upper facade, a deep entrance recess
   lit cold blue, red double doors to one side and, to the other, the steps
   down to the Forbidden Florist. The whole face is washed magenta and
   violet from uplighters at pavement level, which is what actually gives
   the building its colour at night. */

var ledSegments = [];

/* The name is drawn to a canvas rather than built from geometry — it is the
   one element that has to be read as type, and Anton is already loaded for
   the page. Fonts may not be ready on the first frame, so it redraws once
   they are. */
function wordmarkTexture(T) {
  var c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  var g = c.getContext("2d");
  function draw() {
    g.clearRect(0, 0, c.width, c.height);
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = "190px Anton, Impact, sans-serif";
    // a pale edge above a dark face, so the letters read as raised even
    // though this is one flat plane
    g.fillStyle = "#efe2ea";
    g.fillText("EDDIE ROCKS", c.width / 2, c.height / 2 + 4);
    g.fillStyle = "#2a1620";
    g.fillText("EDDIE ROCKS", c.width / 2, c.height / 2 + 10);
    tex.needsUpdate = true;
  }
  var tex = new T.CanvasTexture(c);
  tex.anisotropy = 4;
  draw();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  return tex;
}

function buildEddiesFrontage(ctx) {
  var T = ctx.THREE;
  var W = ctx.W, FH = ctx.FH, FRONT = ctx.FRONT, ROOF = ctx.ROOF;
  var B = ctx.building;

  // ---- render face, in the pale stone the uplighters wash magenta
  var render = new T.MeshStandardMaterial({ color: 0x6d5566, roughness: 0.86 });
  var doorRed = new T.MeshStandardMaterial({ color: 0x7c2029, roughness: 0.55 });

  var DOOR_X = 2.3, DOOR_W = 1.5;          // red doors, right of the entrance
  var STAIR_X = -2.5, STAIR_W = 1.9;       // steps down, left of the entrance
  var OPEN_W = 1.9;                        // the entrance the camera flies through

  // piers either side of the opening, and the wall above it
  ctx.box(render, (W - OPEN_W) / 2, FH, 0.34, -(OPEN_W + (W - OPEN_W) / 2) / 2, FH / 2, FRONT, B);
  ctx.box(render, (W - OPEN_W) / 2, FH, 0.34, (OPEN_W + (W - OPEN_W) / 2) / 2, FH / 2, FRONT, B);

  // ---- the entrance recess: a deep dark reveal, ceiling lit cold blue
  var RECESS = 1.5;
  ctx.box(ctx.mat.interiorDark, OPEN_W, FH, 0.05, 0, FH / 2, FRONT - RECESS, B);
  ctx.box(ctx.mat.brickDark, 0.12, FH, RECESS, -OPEN_W / 2, FH / 2, FRONT - RECESS / 2, B);
  ctx.box(ctx.mat.brickDark, 0.12, FH, RECESS, OPEN_W / 2, FH / 2, FRONT - RECESS / 2, B);
  ctx.box(ctx.mat.brickDark, OPEN_W, 0.14, RECESS, 0, FH - 0.07, FRONT - RECESS / 2, B);
  for (var d = 0; d < 6; d++) {
    var dx = -0.6 + (d % 3) * 0.6;
    var dz = FRONT - 0.45 - Math.floor(d / 3) * 0.7;
    ctx.box(ctx.emissive(C.entryBlue, 2.2), 0.16, 0.03, 0.16, dx, FH - 0.16, dz, B);
    ctx.glow(C.entryBlue, 0.85, dx, FH - 0.22, dz, 0.5, B);
  }
  ctx.glow(C.entryBlue, 3.0, 0, FH * 0.55, FRONT - RECESS + 0.1, 0.34, B);

  // ---- red double doors
  ctx.box(doorRed, DOOR_W, FH - 0.5, 0.12, DOOR_X, (FH - 0.5) / 2, FRONT + 0.1, B);
  ctx.box(ctx.mat.brickDark, 0.06, FH - 0.5, 0.14, DOOR_X, (FH - 0.5) / 2, FRONT + 0.17, B);
  ctx.box(render, DOOR_W + 0.3, 0.18, 0.3, DOOR_X, FH - 0.4, FRONT + 0.12, B);

  // ---- the steps down to the Forbidden Florist, behind a rail
  ctx.box(ctx.mat.interiorDark, STAIR_W, 0.9, 0.9, STAIR_X, -0.45, FRONT + 0.55, B);
  for (var s = 0; s < 5; s++) {
    ctx.box(ctx.mat.stone, STAIR_W, 0.08, 0.26, STAIR_X, -0.12 - s * 0.17, FRONT + 0.92 - s * 0.16, B);
  }
  ctx.box(ctx.mat.metal, 0.05, 0.05, 1.5, STAIR_X + STAIR_W / 2, 0.55, FRONT + 0.6, B);
  ctx.cyl(ctx.mat.metal, 0.04, 1.1, STAIR_X + STAIR_W / 2, 0.0, FRONT + 1.2, B);
  ctx.cyl(ctx.mat.metal, 0.04, 1.1, STAIR_X + STAIR_W / 2, 0.35, FRONT + 0.1, B);
  // the lit poster board on the wall beside the steps
  ctx.box(ctx.mat.dark, 0.7, 1.0, 0.08, STAIR_X - 0.5, 1.35, FRONT + 0.18, B);
  ctx.box(ctx.emissive(C.copperLit, 1.1), 0.6, 0.88, 0.03, STAIR_X - 0.5, 1.35, FRONT + 0.23, B);
  ctx.glow(C.copperLit, 1.3, STAIR_X - 0.5, 1.35, FRONT + 0.4, 0.3, B);

  // ---- EDDIE ROCKS, raised across the upper facade
  var signH = 0.86;
  var sign = new T.Mesh(
    new T.PlaneGeometry(W * 0.92, signH),
    new T.MeshStandardMaterial({
      map: wordmarkTexture(T), transparent: true, roughness: 0.7,
      color: 0xffffff, emissive: 0x3b2130, emissiveIntensity: 0.9,
    })
  );
  // clear of the sill band the storey above draws at this height, which is
  // 0.3 deep — at +0.06 the letters were inside the wall
  sign.position.set(0, FH + 0.62, FRONT + 0.24);
  B.add(sign);

  // ---- the LED bar along the parapet: the signature of the real building
  ctx.box(ctx.mat.brickDark, W + 0.5, 0.34, 0.75, 0, ROOF - 0.05, FRONT + 0.3, B);
  var LED_N = 15;
  for (var i = 0; i < LED_N; i++) {
    var lx = -W / 2 + 0.25 + (i / (LED_N - 1)) * (W - 0.5);
    var mat = ctx.emissive(C.ledWhite, 2.4);
    ctx.box(mat, 0.34, 0.12, 0.06, lx, ROOF - 0.16, FRONT + 0.66, B);
    ledSegments.push({
      mat: mat,
      sprite: ctx.glow(C.ledWhite, 1.0, lx, ROOF - 0.16, FRONT + 0.78, 0.5, B),
      i: i,
    });
  }
  ctx.glow(C.entryBlue, 6.5, 0, ROOF - 0.1, FRONT + 1.0, 0.16, B);

  // ---- hanging baskets, one each side, at first-floor level
  [-1, 1].forEach(function (side) {
    var bx = side * (W / 2 - 0.55);
    ctx.box(ctx.mat.metal, 0.06, 0.5, 0.06, bx, FH + 1.5, FRONT + 0.2, B);
    ctx.box(ctx.mat.metal, 0.06, 0.06, 0.5, bx, FH + 1.72, FRONT + 0.4, B);
    var leaves = new T.Mesh(
      new T.SphereGeometry(0.34, 10, 8),
      new T.MeshStandardMaterial({ color: C.leaf, roughness: 1 })
    );
    leaves.position.set(bx, FH + 1.16, FRONT + 0.42);
    leaves.scale.set(1, 0.8, 1);
    B.add(leaves);
    ctx.glow(C.blush, 0.7, bx, FH + 1.1, FRONT + 0.5, 0.4, B);
  });

  // ---- pavement uplighters: what actually colours the building at night
  [-2.6, 0, 2.6].forEach(function (ux, n) {
    ctx.box(ctx.mat.metal, 0.22, 0.06, 0.22, ux, 0.03, FRONT + 1.05, B);
    ctx.glow(n === 1 ? C.violet : C.upMagenta, 3.4, ux, 0.5, FRONT + 1.0, 0.28, B);
    ctx.glow(n === 1 ? C.violet : C.upMagenta, 5.0, ux, FH * 0.9, FRONT + 0.8, 0.13, B);
  });
}

/* The LED bar chases along the parapet the way the real one does — one
   moving band of colour rather than every segment blinking at once. */
function frontageFrame(ctx, t) {
  var TONE = [C.ledBlue, C.ledRed, C.ledWhite];
  for (var i = 0; i < ledSegments.length; i++) {
    var seg = ledSegments[i];
    var phase = t * 1.6 - seg.i * 0.35;
    var tone = TONE[Math.floor(Math.abs(phase / 2.2)) % 3];
    var lit = 0.55 + Math.sin(phase) * 0.45;
    seg.mat.emissive.setHex(tone);
    seg.mat.emissiveIntensity = 0.8 + lit * 2.6;
    seg.sprite.material.color.setHex(tone);
    seg.sprite.material.opacity = 0.25 + lit * 0.45;
  }
}

mountVenue({
  canvasId: "venue-canvas",
  sectionId: "floors",
  scrollerId: "venue-scroller",
  stageId: "venue-stage",
  hoverLabelId: "venue-hover-label",
  palette: C,
  // two storeys over a basement, as the building actually stands: the
  // Forbidden Florist is underground, down the steps beside the entrance
  dims: { W: 7.2, D: 7.6, FH: 3.1, BASEMENTS: 1 },
  fogDensity: 0.035,
  exposure: 1.05,
  buildExterior: buildEddiesFrontage,
  onFrame: frontageFrame,
  /* The building is only that colour at night because of these. Sprites
     alone left the render nearly black — these actually throw light up it. */
  uplights: [
    { x: -2.7, color: C.upMagenta, intensity: 26, distance: 15 },
    { x: 0, color: C.violet, intensity: 20, distance: 14 },
    { x: 2.7, color: C.upMagenta, intensity: 26, distance: 15 },
    { x: 0, y: 2.9, z: -0.9, color: C.entryBlue, intensity: 10, distance: 7 },
  ],
  floors: [
    // underground, so its hover target is the stairwell on the pavement
    { num: "01", name: "The Forbidden Florist", build: buildFlorist, windowTone: C.copper,
      hover: { x: -2.5, y: 0.7, z: 0.7, w: 2.4, h: 2.0, d: 1.8 } },
    { num: "02", name: "Main Bar", build: buildMainBar, windowTone: C.copper },
    { num: "03", name: "RnB Bar", build: buildRnbBar, windowTone: C.magenta },
  ],
});
