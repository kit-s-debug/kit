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
function buildEddiesFrontage(ctx) {
  var T = ctx.THREE;
  var W = ctx.W, FH = ctx.FH, FRONT = ctx.FRONT;
  var pillarW = 0.5;
  ctx.box(ctx.mat.stone, pillarW, FH, 0.36, -W / 2 + pillarW / 2, FH / 2, FRONT, ctx.building);
  ctx.box(ctx.mat.stone, pillarW, FH, 0.36, W / 2 - pillarW / 2, FH / 2, FRONT, ctx.building);
  ctx.box(ctx.mat.brickDark, W, 0.66, 0.4, 0, FH - 0.33, FRONT, ctx.building);
  ctx.box(new T.MeshStandardMaterial({
    color: 0x0d0810, roughness: 0.1, metalness: 0.55, transparent: true, opacity: 0.42,
  }), W - pillarW * 2, FH - 0.66, 0.05, 0, (FH - 0.66) / 2, FRONT - 0.04, ctx.building);
  for (var i = -1; i <= 1; i += 2) {
    ctx.box(ctx.mat.metal, 0.07, FH - 0.7, 0.1, i * 1.55, (FH - 0.66) / 2, FRONT - 0.02, ctx.building);
  }
  ctx.box(ctx.mat.dark, 1.15, 2.05, 0.12, 0, 1.02, FRONT - 0.12, ctx.building);
  ctx.box(ctx.mat.metal, 0.06, 2.05, 0.14, -0.57, 1.02, FRONT - 0.06, ctx.building);
  ctx.box(ctx.mat.metal, 0.06, 2.05, 0.14, 0.57, 1.02, FRONT - 0.06, ctx.building);
  var awning = ctx.box(ctx.mat.brickDark, W - 0.4, 0.09, 1.15, 0, FH - 0.72, FRONT + 0.5, ctx.building);
  awning.rotation.x = -0.13;

  /* an illuminated fascia panel rather than a bare strip light, so it reads
     as signage over the door */
  ctx.box(ctx.mat.dark, 3.3, 0.62, 0.1, 0, FH - 0.36, FRONT + 0.2);
  ctx.box(ctx.emissive(C.copper, 0.85), 3.06, 0.42, 0.04, 0, FH - 0.36, FRONT + 0.27);
  for (var l = 0; l < 6; l++) {
    ctx.box(ctx.emissive(C.copperLit, 1.5), 0.2, 0.24, 0.03, -1.1 + l * 0.44, FH - 0.36, FRONT + 0.3);
  }
  ctx.glow(C.copperLit, 2.8, 0, FH - 0.36, FRONT + 0.5, 0.34);

  // the blade sign, the classic nightclub frontage detail
  ctx.box(ctx.mat.dark, 0.16, 2.1, 0.5, W / 2 - 0.1, FH + 1.1, FRONT + 0.3);
  ctx.box(ctx.emissive(C.pink, 2.6), 0.1, 1.85, 0.34, W / 2 - 0.02, FH + 1.1, FRONT + 0.3);
  ctx.glow(C.pink, 2.2, W / 2 - 0.02, FH + 1.1, FRONT + 0.55, 0.42);
}

mountVenue({
  canvasId: "venue-canvas",
  sectionId: "floors",
  scrollerId: "venue-scroller",
  stageId: "venue-stage",
  hoverLabelId: "venue-hover-label",
  palette: C,
  dims: { W: 7.2, D: 7.6, FH: 3.1 },
  fogDensity: 0.035,
  exposure: 1.05,
  buildExterior: buildEddiesFrontage,
  floors: [
    { num: "01", name: "The Forbidden Florist", build: buildFlorist, windowTone: C.copper },
    { num: "02", name: "Main Bar", build: buildMainBar, windowTone: C.copper },
    { num: "03", name: "RnB Bar", build: buildRnbBar, windowTone: C.magenta },
  ],
});
