/* ==========================================================================
   Labrinth — the building, in three dimensions.

   Two storeys, and the two of them do genuinely different jobs: the Main Bar
   upstairs with a live DJ, and Rewind downstairs where the 90s and 00s get
   sung back. The shared engine in venue3d.js owns the shell, the camera
   journey and the render loop; this file supplies the cold ink palette, the
   frontage and the contents of the two rooms.
   ========================================================================== */

import { mountVenue } from "./venue3d.js";

var C = {
  night: 0x080f11,
  brick: 0x1b2a2c,
  brickDark: 0x121e21,
  stone: 0x24383a,
  interiorDark: 0x0c1416,
  metal: 0x6f8a86,
  silhouette: 0x060c0d,
  street: 0x0d1618,
  neighbourWindow: 0x8fa89a,
  ambient: 0x2c4548,
  lamp: 0xd8f0e6,
  skyFill: 0x5f7f8c,
  envTop: "#24383a", envMid: "#121e21", envBottom: "#05090a",
  hazeA: 0x3fbfa4, hazeB: 0xc85c9e, mote: 0x7fe6cb,
  // brand
  jade: 0x3fbfa4,
  jadeLit: 0x7fe6cb,
  magenta: 0xc85c9e,
  violet: 0x8a5cc8,
  amber: 0xe0a45c,
  hotPink: 0xff4fa3,
};

/* --------------------------------------------------------------- 01 Rewind
   Downstairs: 90s and 00s classics, sung on your own or in a group. So the
   room is built around a small stage — mic stands, a lyric screen and a
   mirror ball — with booths facing it rather than a dancefloor. */
function buildRewind(ctx, room, y) {
  var T = ctx.THREE;

  var stageKey = new T.PointLight(C.magenta, 18, 10, 2);
  stageKey.position.set(0, y + 2.3, -2.2);
  room.add(stageKey);
  var warmFill = new T.PointLight(C.amber, 13, 9, 2);
  warmFill.position.set(-2.0, y + 1.8, 1.2);
  room.add(warmFill);
  ctx.pulseLights.push({ light: stageKey, base: 18, speed: 1.6, amp: 0.3, floor: 0 });
  ctx.pulseLights.push({ light: warmFill, base: 13, speed: 0.9, amp: 0.16, floor: 0 });

  // the stage, raised a step off the floor
  ctx.box(new T.MeshStandardMaterial({ color: 0x1d2b2e, roughness: 0.7 }),
    4.4, 0.26, 1.9, 0, y + 0.13, -2.7, room);
  ctx.box(ctx.emissive(C.magenta, 0.5), 4.4, 0.05, 0.06, 0, y + 0.28, -1.78, room);

  /* the lyric screen: the thing that makes this room a singalong room and
     not just another bar */
  ctx.box(ctx.mat.dark, 3.0, 1.5, 0.12, 0, y + 1.75, -3.62, room);
  var screen = ctx.box(ctx.emissive(C.jadeLit, 0.5), 2.76, 1.26, 0.03, 0, y + 1.75, -3.53, room);
  screen.name = "lyric-screen";
  // lines of "lyrics" reading as text at this distance
  for (var l = 0; l < 4; l++) {
    var wide = l % 2 === 0 ? 2.1 : 1.5;
    ctx.box(ctx.emissive(0x06171a, 1.0), wide, 0.16, 0.02, (l % 2 ? 0.2 : -0.1), y + 2.16 - l * 0.32, -3.5, room);
  }
  ctx.glow(C.jadeLit, 2.6, 0, y + 1.75, -3.2, 0.2, room);

  // two mic stands — on your own, or as a group
  for (var m = -1; m <= 1; m += 2) {
    ctx.cyl(ctx.mat.metal, 0.028, 1.5, m * 0.75, y + 1.01, -2.6, room);
    var head = ctx.cyl(new T.MeshStandardMaterial({ color: 0x2c3c3e, roughness: 0.5, metalness: 0.6 }),
      0.055, 0.17, m * 0.75, y + 1.8, -2.6, room);
    head.rotation.z = m * 0.28;
    ctx.cyl(ctx.mat.dark, 0.22, 0.04, m * 0.75, y + 0.28, -2.6, room);
  }

  // a mirror ball over the stage, because of course
  var ball = new T.Mesh(new T.IcosahedronGeometry(0.28, 1),
    new T.MeshStandardMaterial({ color: 0xdfeeea, roughness: 0.32, metalness: 0.85, flatShading: true, emissive: 0x2b4a45, emissiveIntensity: 0.6 }));
  ball.position.set(0, y + 2.55, -1.9);
  room.add(ball);
  ctx.glow(C.jadeLit, 1.5, 0, y + 2.55, -1.9, 0.4, room);
  ctx.cyl(ctx.mat.metal, 0.012, 0.35, 0, y + 2.88, -1.9, room);

  // booths facing the stage, for the groups
  for (var s = 0; s < 3; s++) {
    var bx = -2.4 + s * 2.4;
    ctx.box(new T.MeshStandardMaterial({ color: 0x2a3f42, roughness: 0.85 }), 1.8, 0.44, 0.7, bx, y + 0.23, 1.5, room);
    ctx.box(new T.MeshStandardMaterial({ color: 0x30494c, roughness: 0.85 }), 1.8, 0.72, 0.16, bx, y + 0.78, 1.88, room);
    ctx.cyl(ctx.mat.metal, 0.32, 0.05, bx, y + 0.5, 0.72, room);
    // a drink on each table
    ctx.cyl(ctx.emissive(C.amber, 0.5), 0.05, 0.17, bx + 0.12, y + 0.6, 0.72, room);
  }

  // side bar
  ctx.box(new T.MeshStandardMaterial({ color: 0x213234, roughness: 0.45, metalness: 0.3 }),
    0.75, 1.0, 3.4, -3.0, y + 0.5, -0.6, room);
  ctx.box(ctx.mat.metal, 0.83, 0.07, 3.46, -3.0, y + 1.03, -0.6, room);
  ctx.box(ctx.emissive(C.amber, 0.4), 0.04, 0.6, 3.0, -3.4, y + 1.8, -0.6, room);

  // warm festoon along the ceiling, softer than the floor above
  for (var fst = 0; fst < 8; fst++) {
    var fx = -2.9 + fst * 0.83;
    var fy = y + ctx.FH - 0.42 + Math.sin(fst * 0.8) * 0.07;
    ctx.box(ctx.emissive(C.amber, 2.4), 0.05, 0.05, 0.05, fx, fy, 0.6, room);
    ctx.glow(C.amber, 0.5, fx, fy, 0.6, 0.45, room);
  }

  ctx.crowd(12, 4.4, y + 0.12, -0.6, room, 1);
}

/* ------------------------------------------------------------- 02 Main Bar
   Upstairs: the live DJ floor. Booth, rig, moving light, and the room's
   magenta and violet, which is what the venue's own footage actually looks
   like. */
function buildLabMainBar(ctx, room, y) {
  var T = ctx.THREE;

  var key = new T.PointLight(C.magenta, 16, 10, 2);
  key.position.set(0, y + 2.3, -0.6);
  room.add(key);
  var violet = new T.PointLight(C.violet, 10, 9, 2);
  violet.position.set(-2.2, y + 1.7, 1.0);
  room.add(violet);
  var jadeKick = new T.PointLight(C.jade, 6, 7, 2);
  jadeKick.position.set(2.4, y + 1.4, 0.6);
  room.add(jadeKick);
  ctx.pulseLights.push({ light: key, base: 16, speed: 3.6, amp: 0.42, floor: 1 });
  ctx.pulseLights.push({ light: violet, base: 10, speed: 2.8, amp: 0.5, floor: 1 });
  ctx.pulseLights.push({ light: jadeKick, base: 6, speed: 4.2, amp: 0.6, floor: 1 });

  // DJ booth with the decks lit, and a live-tonight sign over it
  ctx.box(ctx.mat.dark, 2.3, 1.05, 0.85, 0, y + 0.52, -3.0, room);
  ctx.box(ctx.emissive(C.jadeLit, 1.0), 2.1, 0.12, 0.04, 0, y + 0.92, -2.55, room);
  // a pair of platters, so the booth reads as decks rather than a table
  for (var p = -1; p <= 1; p += 2) {
    var platter = ctx.cyl(new T.MeshStandardMaterial({ color: 0x18262a, roughness: 0.4, metalness: 0.5 }),
      0.22, 0.05, p * 0.62, y + 1.08, -2.85, room);
    platter.rotation.x = 0;
    ctx.cyl(ctx.emissive(C.magenta, 0.9), 0.06, 0.055, p * 0.62, y + 1.11, -2.85, room);
  }
  ctx.box(ctx.mat.dark, 1.9, 0.34, 0.08, 0, y + 2.42, -3.5, room);
  ctx.box(ctx.emissive(C.hotPink, 2.2), 1.66, 0.2, 0.03, 0, y + 2.42, -3.44, room);
  ctx.glow(C.hotPink, 2.0, 0, y + 2.42, -3.2, 0.42, room);

  // speaker stacks
  for (var sp = -1; sp <= 1; sp += 2) {
    ctx.box(ctx.mat.dark, 0.66, 1.85, 0.6, sp * 2.15, y + 0.93, -2.9, room);
    for (var d = 0; d < 3; d++) {
      var cone = ctx.cyl(new T.MeshStandardMaterial({ color: 0x162225, roughness: 0.7 }),
        0.19, 0.06, sp * 2.15, y + 0.44 + d * 0.55, -2.58, room);
      cone.rotation.x = Math.PI / 2;
    }
  }

  // bar down the side and a lit floor
  ctx.box(new T.MeshStandardMaterial({ color: 0x24373a, roughness: 0.45, metalness: 0.3 }),
    0.75, 1.0, 4.2, -2.95, y + 0.5, -0.2, room);
  ctx.box(ctx.mat.metal, 0.83, 0.07, 4.26, -2.95, y + 1.03, -0.2, room);
  ctx.box(ctx.emissive(C.jade, 0.45), 0.04, 0.6, 3.8, -3.36, y + 1.8, -0.2, room);
  ctx.box(ctx.emissive(C.magenta, 0.1), 4.2, 0.03, 3.8, 0.3, y + 0.11, -0.9, room);

  var beamGeo = new T.ConeGeometry(0.44, 2.3, 10, 1, true);
  var tones = [C.magenta, C.violet, C.hotPink, C.jade];
  for (var bm = 0; bm < 4; bm++) {
    var beam = new T.Mesh(beamGeo, new T.MeshBasicMaterial({
      color: tones[bm], transparent: true, opacity: 0.14,
      blending: T.AdditiveBlending, depthWrite: false, side: T.DoubleSide,
    }));
    beam.position.set(-2.1 + bm * 1.4, y + 1.6, -1.2);
    room.add(beam);
    ctx.box(ctx.mat.dark, 0.18, 0.18, 0.18, -2.1 + bm * 1.4, y + 2.82, -1.2, room);
    ctx.beams.push({ beam: beam, phase: bm * 1.3, swing: 0.46, tilt: 0.24, min: 0.1, range: 0.13, flicker: 2.8 });
    ctx.glow(tones[bm], 0.8, -2.1 + bm * 1.4, y + 2.7, -1.2, 0.5, room);
  }
  ctx.box(ctx.emissive(C.jadeLit, 0.7), ctx.W - 1.0, 0.05, 0.05, 0, y + ctx.FH - 0.24, 2.9, room);
  ctx.crowd(17, 5.0, y + 0.12, -1.8, room, 1);
}

/* ---- the street elevation: a single glazed frontage under one storey ---- */
function buildLabrinthFrontage(ctx) {
  var T = ctx.THREE;
  var W = ctx.W, FH = ctx.FH, FRONT = ctx.FRONT;
  var pillarW = 0.52;
  ctx.box(ctx.mat.stone, pillarW, FH, 0.36, -W / 2 + pillarW / 2, FH / 2, FRONT, ctx.building);
  ctx.box(ctx.mat.stone, pillarW, FH, 0.36, W / 2 - pillarW / 2, FH / 2, FRONT, ctx.building);
  ctx.box(ctx.mat.brickDark, W, 0.7, 0.4, 0, FH - 0.35, FRONT, ctx.building);
  ctx.box(new T.MeshStandardMaterial({
    color: 0x081215, roughness: 0.1, metalness: 0.55, transparent: true, opacity: 0.4,
  }), W - pillarW * 2, FH - 0.7, 0.05, 0, (FH - 0.7) / 2, FRONT - 0.04, ctx.building);
  for (var i = -1; i <= 1; i += 2) {
    ctx.box(ctx.mat.metal, 0.07, FH - 0.74, 0.1, i * 1.62, (FH - 0.7) / 2, FRONT - 0.02, ctx.building);
  }

  // doorway with a rope line outside it
  ctx.box(ctx.mat.dark, 1.2, 2.1, 0.12, 0, 1.05, FRONT - 0.12, ctx.building);
  ctx.box(ctx.mat.metal, 0.06, 2.1, 0.14, -0.6, 1.05, FRONT - 0.06, ctx.building);
  ctx.box(ctx.mat.metal, 0.06, 2.1, 0.14, 0.6, 1.05, FRONT - 0.06, ctx.building);
  for (var post = -1; post <= 1; post += 2) {
    ctx.cyl(ctx.mat.metal, 0.055, 0.95, post * 1.25, 0.48, FRONT + 1.5);
    ctx.cyl(ctx.emissive(C.jadeLit, 0.8), 0.07, 0.06, post * 1.25, 0.98, FRONT + 1.5);
  }

  // fascia sign
  ctx.box(ctx.mat.dark, 3.5, 0.66, 0.1, 0, FH - 0.35, FRONT + 0.2);
  ctx.box(ctx.emissive(C.jade, 0.8), 3.24, 0.44, 0.04, 0, FH - 0.35, FRONT + 0.27);
  for (var l = 0; l < 8; l++) {
    ctx.box(ctx.emissive(C.jadeLit, 1.6), 0.19, 0.26, 0.03, -1.42 + l * 0.4, FH - 0.35, FRONT + 0.3);
  }
  ctx.glow(C.jadeLit, 3.0, 0, FH - 0.35, FRONT + 0.5, 0.34);

  // blade sign, in the venue's magenta rather than Eddie's pink
  ctx.box(ctx.mat.dark, 0.16, 2.0, 0.5, W / 2 - 0.1, FH + 1.0, FRONT + 0.3);
  ctx.box(ctx.emissive(C.magenta, 2.6), 0.1, 1.76, 0.34, W / 2 - 0.02, FH + 1.0, FRONT + 0.3);
  ctx.glow(C.magenta, 2.2, W / 2 - 0.02, FH + 1.0, FRONT + 0.55, 0.42);
}

mountVenue({
  canvasId: "lab-venue-canvas",
  sectionId: "lab-floors",
  scrollerId: "lab-venue-scroller",
  stageId: "lab-venue-stage",
  hoverLabelId: "lab-venue-hover-label",
  palette: C,
  dims: { W: 7.2, D: 7.6, FH: 3.1 },
  fogDensity: 0.034,
  exposure: 1.18,
  buildExterior: buildLabrinthFrontage,
  floors: [
    { num: "01", name: "Rewind", build: buildRewind, windowTone: C.amber },
    { num: "02", name: "Main Bar", build: buildLabMainBar, windowTone: C.magenta },
  ],
});
