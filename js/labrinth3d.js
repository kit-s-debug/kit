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
  // off the photograph of the frontage: cobalt trim on white render
  trimBlue: 0x2f6fae,
  trimDeep: 0x1b4a7a,
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
/* ------------------------------------------------------- the real frontage
   Modelled from a photograph of the building: a narrow three-storey terrace
   in white render with heavy cobalt trim — stepped quoins running up the
   party wall, chunky surrounds on every sash, a blue shopfront, and the
   tiled LABYRINTH logo both on the fascia and on a projecting banner. Only
   two of the three storeys are the venue; the top one is still drawn,
   because a building that stops at its top bar reads as a model. */

/* the logo's colour blocks, read off the sign */
var TILES = [0xe8542a, 0xf3a52c, 0xf2d13c, 0x6fbf4a, 0x2f9bd4, 0x8e4fa8];

/* The name, drawn to a canvas. Same approach as Eddie's mark: it has to be
   read as type, and Anton is already loaded for the page. */
function labelTexture(T, text, vertical) {
  var c = document.createElement("canvas");
  c.width = vertical ? 256 : 1024;
  c.height = vertical ? 1024 : 256;
  var g = c.getContext("2d");
  function draw() {
    g.clearRect(0, 0, c.width, c.height);
    g.save();
    g.translate(c.width / 2, c.height / 2);
    if (vertical) g.rotate(Math.PI / 2);
    g.fillStyle = "#16324a";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = (vertical ? 150 : 168) + "px Anton, Impact, sans-serif";
    g.fillText(text, 0, 0);
    g.restore();
    tex.needsUpdate = true;
  }
  var tex = new T.CanvasTexture(c);
  tex.anisotropy = 4;
  draw();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  return tex;
}

function buildLabrinthFrontage(ctx) {
  var T = ctx.THREE;
  var W = ctx.W, FH = ctx.FH, FRONT = ctx.FRONT, ROOF = ctx.ROOF;
  var B = ctx.building;

  var render = new T.MeshStandardMaterial({ color: 0xcfd4d8, roughness: 0.9 });
  var trim = new T.MeshStandardMaterial({ color: C.trimBlue, roughness: 0.6 });
  var trimDark = new T.MeshStandardMaterial({ color: C.trimDeep, roughness: 0.5 });
  var white = new T.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.85 });

  // ---- ground floor: blue shopfront either side of the way in
  var OPEN_W = 1.6;
  var sideW = (W - OPEN_W) / 2;
  var leftX = -(OPEN_W + sideW) / 2;
  var rightX = (OPEN_W + sideW) / 2;

  ctx.box(render, sideW, FH, 0.34, leftX, FH / 2, FRONT, B);
  ctx.box(render, sideW, FH, 0.34, rightX, FH / 2, FRONT, B);

  // the shop window, blue framed, papered with posters
  ctx.box(trim, sideW, FH - 0.5, 0.4, rightX, (FH - 0.5) / 2, FRONT + 0.04, B);
  ctx.box(new T.MeshStandardMaterial({
    color: 0x0a1418, roughness: 0.12, metalness: 0.55,
  }), sideW - 0.4, FH - 1.25, 0.06, rightX, (FH - 0.5) / 2, FRONT + 0.26, B);
  for (var pz = 0; pz < 4; pz++) {
    ctx.box(ctx.emissive(0xd8e2e8, 0.5), 0.3, 0.42, 0.02,
      rightX - 0.75 + pz * 0.5, 1.5 - (pz % 2) * 0.5, FRONT + 0.3, B);
  }

  // recessed dark entrance — the gap the camera flies through
  ctx.box(ctx.mat.interiorDark, OPEN_W, FH, 0.05, 0, FH / 2, FRONT - 1.2, B);
  ctx.box(trimDark, 0.16, FH, 1.2, -OPEN_W / 2, FH / 2, FRONT - 0.6, B);
  ctx.box(trimDark, 0.16, FH, 1.2, OPEN_W / 2, FH / 2, FRONT - 0.6, B);
  ctx.box(trimDark, OPEN_W, 0.16, 1.2, 0, FH - 0.08, FRONT - 0.6, B);
  ctx.glow(C.jadeLit, 2.2, 0, FH * 0.45, FRONT - 1.0, 0.3, B);

  // the blue door, with the pale oval panel it actually carries
  ctx.box(trimDark, 0.95, FH - 0.85, 0.14, leftX + 0.35, (FH - 0.85) / 2, FRONT + 0.1, B);
  ctx.box(white, 0.34, 0.5, 0.04, leftX + 0.35, FH * 0.52, FRONT + 0.19, B);
  ctx.box(trimDark, 0.2, 0.3, 0.05, leftX + 0.35, FH * 0.52, FRONT + 0.22, B);

  // ---- stepped quoins up the party wall, the building's signature
  var qh = 0.42;
  for (var q = 0; q * qh < ROOF; q++) {
    var wide = q % 2 === 0;
    ctx.box(trim, wide ? 0.62 : 0.4, qh - 0.05, 0.36,
      -W / 2 + (wide ? 0.31 : 0.2), q * qh + qh / 2, FRONT, B);
  }

  // ---- chunky blue surrounds on every opening the shell cut
  var rows = [];
  for (var f = 1; f < 2 + ctx.ATTIC; f++) rows.push(FH * f);
  rows.forEach(function (baseY) {
    ctx.winCentres.forEach(function (cx, i) {
      if (i === 1) return;                       // the way in stays open
      var wy = baseY + ctx.WIN_SILL + ctx.WIN_H / 2;
      ctx.box(trim, ctx.WIN_W + 0.44, 0.2, 0.42, cx, wy + ctx.WIN_H / 2 + 0.1, FRONT + 0.06, B);
      ctx.box(trim, ctx.WIN_W + 0.5, 0.16, 0.46, cx, wy - ctx.WIN_H / 2 - 0.08, FRONT + 0.08, B);
      ctx.box(trim, 0.22, ctx.WIN_H, 0.4, cx - ctx.WIN_W / 2 - 0.11, wy, FRONT + 0.06, B);
      ctx.box(trim, 0.22, ctx.WIN_H, 0.4, cx + ctx.WIN_W / 2 + 0.11, wy, FRONT + 0.06, B);
      // glazing bars, so they read as sashes rather than holes
      ctx.box(trim, ctx.WIN_W, 0.05, 0.06, cx, wy, FRONT + 0.02, B);
      ctx.box(trim, 0.05, ctx.WIN_H, 0.06, cx, wy, FRONT + 0.02, B);
    });
  });

  // ---- fascia over the shopfront: the tiled logo, then the name
  ctx.box(white, W - 0.2, 0.62, 0.14, 0, FH - 0.3, FRONT + 0.2, B);
  TILES.forEach(function (tone, i) {
    var col = i % 3, rowi = Math.floor(i / 3);
    ctx.box(ctx.emissive(tone, 1.6), 0.15, 0.15, 0.05,
      -W / 2 + 0.42 + col * 0.17, FH - 0.22 - rowi * 0.17, FRONT + 0.29, B);
  });
  var fascia = new T.Mesh(
    new T.PlaneGeometry(W * 0.62, 0.44),
    new T.MeshStandardMaterial({ map: labelTexture(T, "LABRINTH", false), transparent: true, roughness: 0.8 })
  );
  fascia.position.set(0.5, FH - 0.3, FRONT + 0.29);
  B.add(fascia);
  ctx.glow(0xffffff, 2.4, 0, FH - 0.3, FRONT + 0.5, 0.2, B);

  /* The projecting banner. It hangs off the wall on a bracket, so the panel
     is thin across X and reads edge-on from straight ahead — the faces that
     carry the artwork are the two planes on either side of it. */
  var armY = FH + 1.35;
  var armX = -W / 2 + 0.45;
  ctx.box(ctx.mat.metal, 0.05, 0.05, 1.0, armX, armY + 1.0, FRONT + 0.5, B);
  ctx.box(ctx.mat.metal, 0.04, 1.0, 0.04, armX, armY + 0.5, FRONT + 0.95, B);
  ctx.box(white, 0.07, 1.7, 1.0, armX, armY, FRONT + 0.95, B);
  [-1, 1].forEach(function (face) {
    var fx = armX + face * 0.045;
    TILES.forEach(function (tone, i) {
      var col = i % 2, rowi = Math.floor(i / 2);
      ctx.box(ctx.emissive(tone, 1.9), 0.02, 0.26, 0.26,
        fx, armY + 0.52 - rowi * 0.3, FRONT + 0.79 + col * 0.3, B);
    });
    var banner = new T.Mesh(
      new T.PlaneGeometry(0.85, 0.34),
      new T.MeshStandardMaterial({ map: labelTexture(T, "LABRINTH", true), transparent: true, roughness: 0.8 })
    );
    banner.position.set(fx + face * 0.005, armY - 0.55, FRONT + 0.95);
    banner.rotation.y = face * Math.PI / 2;
    B.add(banner);
  });
  ctx.glow(0xffffff, 1.8, armX, armY, FRONT + 0.95, 0.26, B);

  // ---- eaves and a chimney, as the terrace has
  ctx.box(white, W + 0.3, 0.22, 0.5, 0, ROOF - 0.1, FRONT + 0.16, B);
}

mountVenue({
  canvasId: "lab-venue-canvas",
  sectionId: "lab-floors",
  scrollerId: "lab-venue-scroller",
  stageId: "lab-venue-stage",
  hoverLabelId: "lab-venue-hover-label",
  palette: C,
  // a narrow three-storey terrace, not a wide block: two storeys are the
  // venue and the third is drawn but empty
  dims: { W: 5.6, D: 7.2, FH: 3.0, ATTIC: 1 },
  fogDensity: 0.034,
  exposure: 1.18,
  buildExterior: buildLabrinthFrontage,
  /* Pale render reads as a grey slab at night without something on it. A
     cool wash plus the warmth spilling from the doorway, rather than the
     venue's interior magenta, which isn't what the street sees. */
  uplights: [
    { x: -1.9, color: 0xbcd8f0, intensity: 12, distance: 14 },
    { x: 1.9, color: 0xbcd8f0, intensity: 12, distance: 14 },
    { x: 0, y: 2.4, z: -0.6, color: C.jadeLit, intensity: 9, distance: 7 },
  ],
  floors: [
    { num: "01", name: "Rewind", build: buildRewind, windowTone: C.amber },
    { num: "02", name: "Main Bar", build: buildLabMainBar, windowTone: C.magenta },
  ],
});
