/* ==========================================================================
   Eddie Rocks — the building, in three dimensions

   A stylised miniature of the Quay Street venue: three storeys, each one
   modelled and lit as its own room, with a scroll-driven camera that flies
   in through a window and travels down through the floors.

   Deliberate constraints, because this ships on a real site:
   - no shadow maps and no post-processing. Both are the expensive parts of
     a Three.js scene; the glow is faked with additive sprites instead, which
     costs a few transparent quads rather than a second render pass.
   - lights are counted and capped. Every light multiplies shader work for
     every lit material, so the scene keeps one ambient plus a small set of
     point lights, and the mobile tier drops that further.
   - geometry is shared. Windows, crowd figures and bottles are instanced or
     reuse one geometry, so the whole building is a few dozen draw calls.
   ========================================================================== */

import * as THREE from "../assets/vendor/three.module.min.js";

var canvas = document.getElementById("venue-canvas");
var section = document.getElementById("floors");
var scroller = document.getElementById("venue-scroller");
var stage = document.getElementById("venue-stage");
if (canvas && section && scroller && stage) init();

function init() {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 900px)").matches;

  /* WebGL probe. If this fails we leave the CSS fallback facade in place —
     the section is authored so the illustrated building is what's there
     until the 3D scene declares itself ready. */
  var gl = (function () {
    try {
      var t = document.createElement("canvas");
      return !!(t.getContext("webgl2") || t.getContext("webgl"));
    } catch (e) {
      return false;
    }
  })();
  if (!gl || reducedMotion) return;

  /* Swap the illustrated fallback for the 3D stage up front: the scroller is
     display:none until this class lands, and a hidden element measures zero,
     so the renderer has to be sized after the stage is actually laid out. */
  section.classList.add("is-3d-ready");

  // ---------------------------------------------------------------- palette
  var C = {
    night: 0x140c11,
    brick: 0x2a1a23,
    brickDark: 0x1d1219,
    stone: 0x3a2733,
    copper: 0xe2895e,
    copperLit: 0xf6c9a0,
    magenta: 0xc85c7e,
    pink: 0xff4fa3,
    teal: 0x4fa8a0,
    gold: 0xc9a24b,
    leaf: 0x4a7a52,
    blush: 0xe8a0b4,
  };

  // ------------------------------------------------------------- dimensions
  var W = 7.2;         // building width
  var D = 7.6;         // building depth — deep enough to actually look down
  var FH = 3.1;        // floor height
  var FRONT = D / 2;   // front face sits at +Z
  var FLOORS = [
    { name: "The Forbidden Florist", num: "01", y: 0 },
    { name: "Main Bar", num: "02", y: FH },
    { name: "RnB Bar", num: "03", y: FH * 2 },
  ];
  var ROOF = FH * 3;

  // ---------------------------------------------------------------- renderer
  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: !isMobile,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(C.night, 1);

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(C.night, 0.035);

  var camera = new THREE.PerspectiveCamera(54, 1, 0.1, 120);
  var camTarget = new THREE.Vector3();

  // ------------------------------------------------------------- textures
  /* one radial-gradient sprite, reused for every glow, haze puff and light
     bloom in the scene — generated rather than loaded so there's no extra
     network request */
  function radialTexture(inner, outer) {
    var c = document.createElement("canvas");
    c.width = c.height = 128;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, inner);
    g.addColorStop(0.45, outer);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  var glowTex = radialTexture("rgba(255,255,255,1)", "rgba(255,255,255,0.28)");
  var hazeTex = radialTexture("rgba(255,255,255,0.5)", "rgba(255,255,255,0.14)");

  /* a cheap sky/street gradient used as the environment map so the metal and
     glass have something to reflect without loading an HDR */
  function envTexture() {
    var c = document.createElement("canvas");
    c.width = 2;
    c.height = 128;
    var ctx = c.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "#3a2733");
    g.addColorStop(0.5, "#1d1219");
    g.addColorStop(1, "#0a0507");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 2, 128);
    var t = new THREE.CanvasTexture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  scene.environment = envTexture();

  // ------------------------------------------------------------- materials
  var matBrick = new THREE.MeshStandardMaterial({ color: C.brick, roughness: 0.92, metalness: 0.02 });
  var matBrickDark = new THREE.MeshStandardMaterial({ color: C.brickDark, roughness: 0.95, metalness: 0.02 });
  var matStone = new THREE.MeshStandardMaterial({ color: C.stone, roughness: 0.8, metalness: 0.05 });
  var matDark = new THREE.MeshStandardMaterial({ color: 0x120a0f, roughness: 0.85 });
  var matMetal = new THREE.MeshStandardMaterial({ color: 0x8a6a55, roughness: 0.35, metalness: 0.9 });
  var matSilhouette = new THREE.MeshBasicMaterial({ color: 0x0d0709 });

  function emissive(color, intensity) {
    return new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: color,
      emissiveIntensity: intensity === undefined ? 1 : intensity,
      roughness: 1,
    });
  }

  // geometry reused everywhere; scale via mesh.scale rather than new geometry
  var BOX = new THREE.BoxGeometry(1, 1, 1);
  var CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);

  function box(mat, w, h, d, x, y, z, parent) {
    var m = new THREE.Mesh(BOX, mat);
    m.scale.set(w, h, d);
    m.position.set(x, y, z);
    (parent || scene).add(m);
    return m;
  }
  function cyl(mat, r, h, x, y, z, parent) {
    var m = new THREE.Mesh(CYL, mat);
    m.scale.set(r * 2, h, r * 2);
    m.position.set(x, y, z);
    (parent || scene).add(m);
    return m;
  }
  function glow(color, size, x, y, z, opacity, parent) {
    var s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: color,
        transparent: true,
        opacity: opacity === undefined ? 0.75 : opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    s.scale.set(size, size, 1);
    s.position.set(x, y, z);
    (parent || scene).add(s);
    return s;
  }

  // =====================================================================
  //  EXTERIOR
  // =====================================================================
  var building = new THREE.Group();
  scene.add(building);

  /* Window layout for the two upper floors. The centre window of each floor
     is the one the camera flies through, so it's left as a genuine opening
     in the wall rather than faked with a fade. */
  var WIN_W = 1.3, WIN_H = 1.62, WIN_SILL = 0.8;
  var winCentres = [-2.1, 0, 2.1];
  var pierCentres = [-3.15, -1.05, 1.05, 3.15];
  var PIER_W = 0.9;

  function frontWallWithWindows(baseY) {
    var g = new THREE.Group();
    // sill course below the windows and lintel course above
    box(matBrick, W, WIN_SILL, 0.3, 0, baseY + WIN_SILL / 2, FRONT, g);
    var lintelY = baseY + WIN_SILL + WIN_H;
    box(matBrick, W, FH - WIN_SILL - WIN_H, 0.3, 0, lintelY + (FH - WIN_SILL - WIN_H) / 2, FRONT, g);
    // the piers between the openings
    for (var i = 0; i < pierCentres.length; i++) {
      box(matBrick, PIER_W, WIN_H, 0.3, pierCentres[i], baseY + WIN_SILL + WIN_H / 2, FRONT, g);
    }
    // a stone band marking the floor line, the sort of detail a real terrace has
    box(matStone, W + 0.16, 0.14, 0.42, 0, baseY + 0.05, FRONT, g);
    building.add(g);
    return g;
  }

  /* Glazing: a dark reflective pane set back from the opening, plus an
     emissive card behind it so light spills out of the window at night. */
  function glazing(x, y, color, intensity, w, h) {
    var g = new THREE.Group();
    box(
      new THREE.MeshStandardMaterial({
        color: 0x0b0609, roughness: 0.12, metalness: 0.6,
        transparent: true, opacity: 0.55,
      }),
      w, h, 0.04, x, y, FRONT - 0.02, g
    );
    var lit = box(emissive(color, intensity), w * 0.92, h * 0.9, 0.02, x, y, FRONT - 0.16, g);
    building.add(g);
    return lit;
  }

  var litWindows = [];   // animated: these flicker with the room behind them
  var windowGlows = [];

  for (var f = 1; f < 3; f++) {
    var baseY = FLOORS[f].y;
    frontWallWithWindows(baseY);
    var tone = f === 2 ? C.magenta : C.copper;
    for (var w2 = 0; w2 < winCentres.length; w2++) {
      // the centre opening on each floor stays clear — it's the way in
      if (w2 === 1) continue;
      var wy = baseY + WIN_SILL + WIN_H / 2;
      litWindows.push(glazing(winCentres[w2], wy, tone, 2.4, WIN_W, WIN_H));
      windowGlows.push(glow(tone, 2.6, winCentres[w2], wy, FRONT + 0.35, 0.34, building));
    }
  }

  // --- ground floor: a shopfront, not a repeat of the upper storeys
  (function shopfront() {
    var g = new THREE.Group();
    var pillarW = 0.5;
    box(matStone, pillarW, FH, 0.36, -W / 2 + pillarW / 2, FH / 2, FRONT, g);
    box(matStone, pillarW, FH, 0.36, W / 2 - pillarW / 2, FH / 2, FRONT, g);
    // fascia above the shopfront carrying the name
    box(matBrickDark, W, 0.66, 0.4, 0, FH - 0.33, FRONT, g);
    // the glazed front, split by slim mullions
    var glassW = W - pillarW * 2;
    box(
      new THREE.MeshStandardMaterial({
        color: 0x0d0810, roughness: 0.1, metalness: 0.55, transparent: true, opacity: 0.42,
      }),
      glassW, FH - 0.66, 0.05, 0, (FH - 0.66) / 2, FRONT - 0.04, g
    );
    for (var i = -1; i <= 1; i++) {
      if (i === 0) continue; // leave the middle clear so the doorway reads
      box(matMetal, 0.07, FH - 0.7, 0.1, i * 1.55, (FH - 0.66) / 2, FRONT - 0.02, g);
    }
    // doorway, recessed
    box(matDark, 1.15, 2.05, 0.12, 0, 1.02, FRONT - 0.12, g);
    box(matMetal, 0.06, 2.05, 0.14, -0.57, 1.02, FRONT - 0.06, g);
    box(matMetal, 0.06, 2.05, 0.14, 0.57, 1.02, FRONT - 0.06, g);
    // awning over the pavement
    var awning = box(matBrickDark, W - 0.4, 0.09, 1.15, 0, FH - 0.72, FRONT + 0.5, g);
    awning.rotation.x = -0.13;
    building.add(g);
  })();

  // --- shell: side walls, back wall, floor slabs, ceilings, roof
  for (var s = 0; s < 3; s++) {
    var y0 = FLOORS[s].y;
    box(matBrickDark, 0.3, FH, D, -W / 2, y0 + FH / 2, 0, building);
    box(matBrickDark, 0.3, FH, D, W / 2, y0 + FH / 2, 0, building);
    box(matBrickDark, W, FH, 0.3, 0, y0 + FH / 2, -D / 2, building);
    box(matDark, W, 0.18, D, 0, y0, 0, building);          // slab
  }
  box(matDark, W, 0.2, D, 0, ROOF, 0, building);            // roof deck
  box(matStone, W + 0.36, 0.3, D + 0.36, 0, ROOF + 0.14, 0, building); // cornice
  // roof clutter, so the top isn't a bare lid
  box(matBrickDark, 1.1, 0.75, 1.1, -1.9, ROOF + 0.6, -1.0, building);
  box(matMetal, 0.36, 1.0, 0.36, 1.7, ROOF + 0.7, -0.7, building);

  // --- street
  var street = box(
    new THREE.MeshStandardMaterial({ color: 0x150d12, roughness: 0.95 }),
    46, 0.2, 46, 0, -0.1, 0
  );
  box(matStone, W + 5.5, 0.06, 2.6, 0, 0.02, FRONT + 1.4); // pavement

  /* Neighbouring terrace, so the venue reads as mid-terrace rather than a
     model on a table. Kept lower than Eddie's and given a scatter of dim
     windows — as plain slabs they just read as two black walls. */
  (function neighbours() {
    var sides = [
      { x: -W / 2 - 2.9, w: 5.4, h: FH * 2.3 },
      { x: W / 2 + 3.1, w: 5.8, h: FH * 2.15 },
    ];
    var dimWin = emissive(0xb08a6a, 0.55);
    for (var n = 0; n < sides.length; n++) {
      var side = sides[n];
      box(matBrickDark, side.w, side.h, D * 0.92, side.x, side.h / 2, -0.3);
      box(matStone, side.w + 0.2, 0.24, D * 0.96, side.x, side.h + 0.1, -0.3);
      for (var row = 0; row < 2; row++) {
        for (var col = 0; col < 3; col++) {
          if ((row + col + n) % 3 === 0) continue;   // some windows stay dark
          box(dimWin, 0.62, 0.95, 0.06,
            side.x - side.w / 2 + 1.0 + col * (side.w - 2.0) / 2,
            1.5 + row * (side.h / 2.4), D * 0.46 - 0.3);
        }
      }
    }
  })();

  // --- signage above the door
  (function signage() {
    var signGroup = new THREE.Group();
    /* An illuminated fascia panel rather than a bare strip light: a dark
       plate with a softly lit face, so it reads as signage over the door
       instead of a fluorescent tube. */
    box(matDark, 3.3, 0.62, 0.1, 0, FH - 0.36, FRONT + 0.2, signGroup);
    box(emissive(C.copper, 0.85), 3.06, 0.42, 0.04, 0, FH - 0.36, FRONT + 0.27, signGroup);
    // letter-shaped blocks reading as a wordmark at this distance
    for (var i = 0; i < 6; i++) {
      box(emissive(C.copperLit, 1.5), 0.2, 0.24, 0.03,
        -1.1 + i * 0.44, FH - 0.36, FRONT + 0.3, signGroup);
    }
    glow(C.copperLit, 2.8, 0, FH - 0.36, FRONT + 0.5, 0.34, signGroup);
    // a vertical blade sign, the classic nightclub frontage detail
    box(matDark, 0.16, 2.1, 0.5, W / 2 - 0.1, FH + 1.1, FRONT + 0.3, signGroup);
    var blade = box(emissive(C.pink, 2.6), 0.1, 1.85, 0.34, W / 2 - 0.02, FH + 1.1, FRONT + 0.3, signGroup);
    blade.name = "blade";
    glow(C.pink, 2.2, W / 2 - 0.02, FH + 1.1, FRONT + 0.55, 0.42, signGroup);
    scene.add(signGroup);
  })();

  // =====================================================================
  //  INTERIORS — each floor is dressed as its own room
  // =====================================================================
  var pulseLights = [];   // {light, base, speed, phase}
  var spinners = [];      // {obj, speed}

  /* The crowd is the densest thing in the scene — 35 figures across three
     floors. As individual meshes that was ~70 draw calls on its own, so
     bodies and heads are each one InstancedMesh per floor and the dance is
     written straight into the instance matrices. */
  var CROWD_BODY = new THREE.CylinderGeometry(0.115, 0.115, 1, 8);
  var CROWD_HEAD = new THREE.SphereGeometry(0.085, 7, 5);
  var crowds = [];
  var dummy = new THREE.Object3D();

  function crowd(count, spread, baseY, z, parent, scale) {
    var sc = scale || 1;
    var bodies = new THREE.InstancedMesh(CROWD_BODY, matSilhouette, count);
    var heads = new THREE.InstancedMesh(CROWD_HEAD, matSilhouette, count);
    bodies.frustumCulled = false;
    heads.frustumCulled = false;
    var people = [];
    for (var i = 0; i < count; i++) {
      people.push({
        x: (Math.random() - 0.5) * spread,
        z: z + (Math.random() - 0.5) * 2.4,
        h: (0.62 + Math.random() * 0.22) * sc,
        sc: sc,
        phase: Math.random() * 6.28,
        amp: 0.05 + Math.random() * 0.08,
      });
    }
    parent.add(bodies);
    parent.add(heads);
    crowds.push({ bodies: bodies, heads: heads, people: people, baseY: baseY });
  }

  // ---------------------------------------------------- 01 Forbidden Florist
  var floristRoom = new THREE.Group();
  scene.add(floristRoom);
  (function florist() {
    var y = FLOORS[0].y;
    var warm = new THREE.PointLight(C.copperLit, 12, 9, 2);
    warm.position.set(-1.2, y + 2.2, 0.4);
    floristRoom.add(warm);
    var warm2 = new THREE.PointLight(C.blush, 7, 8, 2);
    warm2.position.set(1.6, y + 1.9, -1.0);
    floristRoom.add(warm2);
    pulseLights.push({ light: warm, base: 12, speed: 0.6, amp: 0.06 });

    // bar counter along the back, with a lit bottle shelf behind it
    box(new THREE.MeshStandardMaterial({ color: 0x2f5f42, roughness: 0.5, metalness: 0.25 }),
      4.2, 0.95, 0.7, 0.5, y + 0.48, -2.95, floristRoom);
    box(matMetal, 4.26, 0.07, 0.78, 0.5, y + 0.98, -2.95, floristRoom);
    box(emissive(C.copperLit, 0.5), 3.9, 0.55, 0.05, 0.5, y + 1.75, -3.6, floristRoom);
    for (var b = 0; b < 9; b++) {
      cyl(new THREE.MeshStandardMaterial({
        color: b % 3 === 0 ? 0x7a4a2e : 0x35543f, roughness: 0.3, metalness: 0.3,
      }), 0.05, 0.3, -1.3 + b * 0.42, y + 1.68, -3.5, floristRoom);
    }

    // tables with small blooms on them
    for (var t = 0; t < 3; t++) {
      var tx = -2.5 + t * 1.35;
      cyl(matMetal, 0.05, 0.72, tx, y + 0.36, 0.1, floristRoom);
      cyl(new THREE.MeshStandardMaterial({ color: 0x6b4a33, roughness: 0.6 }),
        0.32, 0.06, tx, y + 0.74, 0.1, floristRoom);
      var bloom = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 0),
        new THREE.MeshStandardMaterial({ color: C.blush, roughness: 0.7, emissive: C.blush, emissiveIntensity: 0.25 }));
      bloom.position.set(tx, y + 0.86, 0.1);
      floristRoom.add(bloom);
    }

    // planting: clustered low-poly foliage rather than modelled leaves
    var leafMat = new THREE.MeshStandardMaterial({ color: C.leaf, roughness: 0.85 });
    var leafGeo = new THREE.IcosahedronGeometry(0.3, 0);
    for (var p = 0; p < 16; p++) {
      var m = new THREE.Mesh(leafGeo, leafMat);
      var ang = (p / 16) * Math.PI * 2;
      m.position.set(
        Math.cos(ang) * (2.4 + Math.random() * 0.5),
        y + 2.35 + Math.sin(p * 1.7) * 0.16,
        Math.sin(ang) * (2.4 + Math.random() * 0.6) - 0.9
      );
      m.scale.setScalar(0.55 + Math.random() * 0.7);
      floristRoom.add(m);
    }
    // a hanging canopy of blooms over the bar, the florist's signature
    for (var q = 0; q < 12; q++) {
      var fl = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({
        color: q % 3 === 0 ? C.blush : C.leaf, roughness: 0.8,
      }));
      fl.position.set(-1.9 + q * 0.5, y + 2.66 - Math.random() * 0.28, -2.7);
      fl.scale.setScalar(0.4 + Math.random() * 0.4);
      floristRoom.add(fl);
    }
    // festoon lights
    for (var s2 = 0; s2 < 9; s2++) {
      var bx = -2.9 + s2 * 0.74;
      var by = y + 2.42 + Math.sin(s2 * 0.7) * 0.08;
      box(emissive(C.copperLit, 3), 0.05, 0.05, 0.05, bx, by, -0.4, floristRoom);
      glow(C.copperLit, 0.55, bx, by, -0.4, 0.5, floristRoom);
    }
    crowd(6, 4.6, y + 0.02, -1.5, floristRoom, 0.95);
  })();

  // ------------------------------------------------------------ 02 Main Bar
  var mainRoom = new THREE.Group();
  scene.add(mainRoom);
  var mainBeams = [];
  (function mainBar() {
    var y = FLOORS[1].y;
    var key = new THREE.PointLight(C.copper, 16, 10, 2);
    key.position.set(0, y + 2.3, -0.4);
    mainRoom.add(key);
    var side = new THREE.PointLight(C.magenta, 9, 9, 2);
    side.position.set(-2.2, y + 1.6, 1.0);
    mainRoom.add(side);
    pulseLights.push({ light: key, base: 16, speed: 3.4, amp: 0.4 });
    pulseLights.push({ light: side, base: 9, speed: 2.6, amp: 0.5 });

    // DJ booth at the back, flanked by speaker stacks
    box(matDark, 2.1, 1.05, 0.8, 0, y + 0.52, -3.0, mainRoom);
    box(emissive(C.copperLit, 0.9), 1.95, 0.12, 0.04, 0, y + 0.92, -2.58, mainRoom);
    for (var sp = -1; sp <= 1; sp += 2) {
      box(matDark, 0.68, 1.9, 0.6, sp * 2.0, y + 0.95, -2.9, mainRoom);
      // driver cones, so a speaker stack reads as a speaker stack
      for (var d = 0; d < 3; d++) {
        var cone = cyl(new THREE.MeshStandardMaterial({ color: 0x241820, roughness: 0.7 }),
          0.2, 0.06, sp * 2.0, y + 0.45 + d * 0.56, -2.58, mainRoom);
        cone.rotation.x = Math.PI / 2;
      }
    }
    // bar down the side
    box(new THREE.MeshStandardMaterial({ color: 0x33202b, roughness: 0.45, metalness: 0.3 }),
      0.75, 1.0, 4.4, -2.95, y + 0.5, -0.4, mainRoom);
    box(matMetal, 0.83, 0.07, 4.46, -2.95, y + 1.03, -0.4, mainRoom);
    box(emissive(C.copper, 0.45), 0.04, 0.6, 4.0, -3.36, y + 1.8, -0.4, mainRoom);

    // dancefloor: an emissive slab that reads as lit from beneath
    box(emissive(C.copper, 0.1), 4.2, 0.03, 4.0, 0.4, y + 0.11, -1.0, mainRoom);

    // moving spotlights, built as thin cones from the ceiling
    var beamMat = new THREE.MeshBasicMaterial({
      color: C.copperLit, transparent: true, opacity: 0.14,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    var beamGeo = new THREE.ConeGeometry(0.42, 2.3, 10, 1, true);
    for (var bm = 0; bm < 4; bm++) {
      var beam = new THREE.Mesh(beamGeo, bm % 2 ? beamMat.clone() : beamMat);
      if (bm % 2) beam.material.color.setHex(C.magenta);
      beam.position.set(-2.1 + bm * 1.4, y + 1.6, -1.3);
      mainRoom.add(beam);
      var head = box(matDark, 0.18, 0.18, 0.18, -2.1 + bm * 1.4, y + 2.82, -1.3, mainRoom);
      mainBeams.push({ beam: beam, head: head, phase: bm * 1.4 });
      glow(bm % 2 ? C.magenta : C.copperLit, 0.8, -2.1 + bm * 1.4, y + 2.7, -1.3, 0.5, mainRoom);
    }
    // LED strip round the ceiling line
    box(emissive(C.copperLit, 0.7), W - 1.0, 0.05, 0.05, 0, y + FH - 0.24, 3.0, mainRoom);
    crowd(18, 5.0, y + 0.12, -1.9, mainRoom, 1);
  })();

  // ------------------------------------------------------------- 03 RnB Bar
  var rnbRoom = new THREE.Group();
  scene.add(rnbRoom);
  var rnbBeams = [];
  (function rnbBar() {
    var y = FLOORS[2].y;
    var key = new THREE.PointLight(C.magenta, 13, 9, 2);
    key.position.set(0.4, y + 2.2, -0.6);
    rnbRoom.add(key);
    var pinkLight = new THREE.PointLight(C.pink, 8, 8, 2);
    pinkLight.position.set(-1.8, y + 1.5, 0.9);
    rnbRoom.add(pinkLight);
    pulseLights.push({ light: key, base: 13, speed: 2.2, amp: 0.32 });
    pulseLights.push({ light: pinkLight, base: 8, speed: 1.7, amp: 0.4 });

    // back-lit bar: the dominant feature of the top floor
    box(new THREE.MeshStandardMaterial({ color: 0x2a1824, roughness: 0.4, metalness: 0.35 }),
      4.0, 1.0, 0.7, -0.5, y + 0.5, -2.95, rnbRoom);
    box(matMetal, 4.06, 0.07, 0.8, -0.5, y + 1.03, -2.95, rnbRoom);
    box(emissive(C.pink, 0.65), 3.8, 0.95, 0.04, -0.5, y + 1.8, -3.6, rnbRoom);
    for (var b = 0; b < 11; b++) {
      cyl(new THREE.MeshStandardMaterial({ color: 0x3a2430, roughness: 0.25, metalness: 0.4 }),
        0.045, 0.3, -2.2 + b * 0.36, y + 1.66, -3.5, rnbRoom);
    }

    // lounge seating: booths along the window side
    for (var s3 = 0; s3 < 3; s3++) {
      var bx2 = -2.4 + s3 * 2.4;
      box(new THREE.MeshStandardMaterial({ color: 0x3d2430, roughness: 0.8 }),
        1.7, 0.42, 0.68, bx2, y + 0.22, 2.4, rnbRoom);
      box(new THREE.MeshStandardMaterial({ color: 0x46293a, roughness: 0.8 }),
        1.7, 0.68, 0.16, bx2, y + 0.74, 2.76, rnbRoom);
      cyl(matMetal, 0.3, 0.05, bx2, y + 0.46, 1.7, rnbRoom);
    }

    // compact DJ setup
    box(matDark, 1.7, 0.95, 0.65, 2.3, y + 0.48, -2.1, rnbRoom);
    box(emissive(C.pink, 0.8), 1.55, 0.1, 0.04, 2.3, y + 0.86, -1.78, rnbRoom);

    var beamMat2 = new THREE.MeshBasicMaterial({
      color: C.pink, transparent: true, opacity: 0.12,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    });
    var beamGeo2 = new THREE.ConeGeometry(0.5, 2.2, 10, 1, true);
    for (var bm2 = 0; bm2 < 3; bm2++) {
      var beam2 = new THREE.Mesh(beamGeo2, beamMat2.clone());
      beam2.material.color.setHex(bm2 === 1 ? 0x8a5cc8 : C.pink);
      beam2.position.set(-1.9 + bm2 * 1.9, y + 1.65, -0.9);
      rnbRoom.add(beam2);
      rnbBeams.push({ beam: beam2, phase: bm2 * 2.1 });
    }
    box(emissive(C.pink, 0.6), W - 1.2, 0.05, 0.05, 0, y + FH - 0.26, 2.9, rnbRoom);
    crowd(11, 4.6, y + 0.12, -1.9, rnbRoom, 1);
  })();

  // --------------------------------------------------------------- ambience
  scene.add(new THREE.AmbientLight(0x3a2632, 2.4));
  /* Two exterior sources. Without them the facade is lit only by what leaks
     out of its own windows and the brickwork reads as a black silhouette —
     a streetlamp from one side and a soft sky fill from the other give it
     enough shape to read as a building. */
  var streetLamp = new THREE.PointLight(0xffcf9a, 90, 34, 2);
  streetLamp.position.set(-6.5, 6.5, 9.5);
  scene.add(streetLamp);
  var skyFill = new THREE.DirectionalLight(0x7c6a8e, 0.85);
  skyFill.position.set(7, 12, 8);
  scene.add(skyFill);
  // the lamp itself, so the light has a visible source on the street
  cyl(matMetal, 0.06, 6.4, -6.5, 3.2, 9.5);
  glow(0xffcf9a, 2.6, -6.5, 6.5, 9.5, 0.6);

  /* haze: a handful of large additive puffs. Cheap, and it does more for the
     nightclub read than any amount of extra geometry. */
  var hazePuffs = [];
  var hazeCount = isMobile ? 8 : 16;
  for (var h2 = 0; h2 < hazeCount; h2++) {
    var puff = new THREE.Sprite(new THREE.SpriteMaterial({
      map: hazeTex, color: h2 % 3 === 0 ? C.magenta : C.copper,
      transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    var size = 3 + Math.random() * 4;
    puff.scale.set(size, size, 1);
    puff.position.set((Math.random() - 0.5) * 12, Math.random() * 10, (Math.random() - 0.5) * 10 + 2);
    scene.add(puff);
    hazePuffs.push({ s: puff, phase: Math.random() * 6.28, baseY: puff.position.y });
  }

  // drifting motes, denser near the building
  var moteCount = isMobile ? 90 : 220;
  var motePos = new Float32Array(moteCount * 3);
  for (var mi = 0; mi < moteCount; mi++) {
    motePos[mi * 3] = (Math.random() - 0.5) * 16;
    motePos[mi * 3 + 1] = Math.random() * 11;
    motePos[mi * 3 + 2] = (Math.random() - 0.5) * 12 + 1;
  }
  var moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
  var motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
    color: C.copperLit, size: 0.035, transparent: true, opacity: 0.5,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  }));
  scene.add(motes);

  // =====================================================================
  //  CAMERA JOURNEY
  // =====================================================================
  /* Keyframes along scroll progress. Positions are chosen so the move into
     each floor passes through that floor's centre window opening, which is
     why the middle window is left unglazed on the upper storeys. */
  var yF = [FLOORS[0].y, FLOORS[1].y, FLOORS[2].y];
  var EYE = 1.5;          // eye height within a floor
  var BACK = -D / 2;      // rear wall
  var KEYS = [
    { t: 0.00, pos: [11.0, 6.0, 18.0], look: [0, 4.6, 0] },
    { t: 0.10, pos: [7.0, 7.2, 16.0], look: [0, 4.8, 0] },
    { t: 0.19, pos: [3.2, 9.2, 11.0], look: [0, yF[2] + 1.5, 0] },
    // in through the top-floor centre window, which is left unglazed
    { t: 0.27, pos: [0, yF[2] + EYE, FRONT + 1.2], look: [0, yF[2] + 1.4, BACK] },
    { t: 0.33, pos: [0.1, yF[2] + EYE, FRONT - 1.3], look: [-1.9, yF[2] + 1.3, BACK] },
    { t: 0.43, pos: [1.6, yF[2] + EYE, FRONT - 2.4], look: [-2.4, yF[2] + 1.15, BACK + 0.4] },
    // down a floor into the main bar
    { t: 0.51, pos: [1.9, yF[1] + EYE + 1.4, FRONT - 1.6], look: [0.2, yF[1] + 1.4, BACK] },
    { t: 0.59, pos: [1.7, yF[1] + EYE, FRONT - 1.0], look: [-0.4, yF[1] + 1.25, BACK] },
    { t: 0.69, pos: [-1.9, yF[1] + EYE, FRONT - 2.6], look: [1.6, yF[1] + 1.15, BACK + 0.6] },
    // down again into the florist
    { t: 0.77, pos: [-1.9, yF[0] + EYE + 1.5, FRONT - 1.2], look: [0, yF[0] + 1.3, BACK] },
    { t: 0.85, pos: [-1.4, yF[0] + EYE, FRONT - 0.8], look: [1.0, yF[0] + 1.15, BACK + 0.5] },
    // back out onto Quay Street
    { t: 0.92, pos: [1.2, yF[0] + 1.8, FRONT + 5.0], look: [0, 2.6, 0] },
    { t: 1.00, pos: [-9.5, 6.4, 16.0], look: [0, 4.5, 0] },
  ];

  function smoothstep(x) { return x * x * (3 - 2 * x); }

  var tmpA = new THREE.Vector3();
  var tmpB = new THREE.Vector3();
  function sampleCamera(p) {
    var i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].t) i++;
    var a = KEYS[i], b = KEYS[i + 1];
    var span = b.t - a.t;
    var k = span <= 0 ? 0 : smoothstep(Math.min(Math.max((p - a.t) / span, 0), 1));
    tmpA.set(a.pos[0], a.pos[1], a.pos[2]);
    tmpB.set(b.pos[0], b.pos[1], b.pos[2]);
    camera.position.lerpVectors(tmpA, tmpB, k);
    tmpA.set(a.look[0], a.look[1], a.look[2]);
    tmpB.set(b.look[0], b.look[1], b.look[2]);
    camTarget.lerpVectors(tmpA, tmpB, k);
  }

  /* Which stage of the story we're in, used to swap the overlay copy. The
     bands match the keyframe timings above. */
  var STAGE_BOUNDS = [0.22, 0.48, 0.74, 0.92];
  function stageFor(p) {
    if (p < STAGE_BOUNDS[0]) return 0;   // exterior
    if (p < STAGE_BOUNDS[1]) return 3;   // RnB
    if (p < STAGE_BOUNDS[2]) return 2;   // Main
    if (p < STAGE_BOUNDS[3]) return 1;   // Florist
    return 0;
  }

  var copyPanels = Array.prototype.slice.call(stage.querySelectorAll("[data-stage]"));
  var currentStage = -1;
  function setStage(n) {
    if (n === currentStage) return;
    currentStage = n;
    copyPanels.forEach(function (el) {
      el.classList.toggle("is-active", Number(el.dataset.stage) === n);
    });
    stage.setAttribute("data-current-stage", String(n));
  }

  // ------------------------------------------------------- scroll progress
  var progress = 0;
  var targetProgress = 0;
  var overrideUntil = 0;      // set while a floor-picker flight is in charge
  var overrideTarget = 0;

  /* Progress is measured against the tall scroller that holds the sticky
     stage, not the whole section — the intro and the fallback block sit
     outside the pinned range and would skew it. */
  function readScroll() {
    var rect = scroller.getBoundingClientRect();
    var travel = scroller.offsetHeight - window.innerHeight;
    if (travel <= 0) return 0;
    return Math.min(Math.max(-rect.top / travel, 0), 1);
  }

  var scrollTicking = false;
  window.addEventListener("scroll", function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        targetProgress = readScroll();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });
  targetProgress = readScroll();
  progress = targetProgress;

  // --------------------------------------------------- floor picker buttons
  /* Scroll position stays the source of truth: picking a floor scrolls the
     page to the point in the sequence where that floor is on screen, so the
     camera and the scrollbar never disagree with each other. */
  var FLOOR_ANCHOR = [0.86, 0.62, 0.38];   // florist, main, rnb
  document.querySelectorAll("[data-goto-floor]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = Number(btn.dataset.gotoFloor);
      var travel = scroller.offsetHeight - window.innerHeight;
      var top = scroller.getBoundingClientRect().top + window.scrollY + travel * FLOOR_ANCHOR[idx];
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  // ------------------------------------------------------------ hover focus
  /* Raycast against three invisible slabs, one per floor, so hovering the
     building lights that floor and names it. Pointer-fine only — on touch the
     buttons below the canvas do this job. */
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var pickTargets = [];
  for (var pf = 0; pf < 3; pf++) {
    var slab = new THREE.Mesh(
      new THREE.BoxGeometry(W, FH, D),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    slab.position.set(0, FLOORS[pf].y + FH / 2, 0);
    slab.userData.floor = pf;
    scene.add(slab);
    pickTargets.push(slab);
  }
  var hoverFloor = -1;
  var hoverBoost = [0, 0, 0];
  var hoverLabel = document.getElementById("venue-hover-label");
  if (canHover) {
    var ray = new THREE.Raycaster();
    var ndc = new THREE.Vector2();
    canvas.addEventListener("mousemove", function (e) {
      var r = canvas.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ndc, camera);
      var hits = ray.intersectObjects(pickTargets, false);
      var next = hits.length ? hits[0].object.userData.floor : -1;
      // only meaningful while we're looking at the outside of the building
      if (currentStage !== 0) next = -1;
      if (next !== hoverFloor) {
        hoverFloor = next;
        if (hoverLabel) {
          if (next >= 0) {
            hoverLabel.querySelector(".venue-hover-num").textContent = FLOORS[next].num;
            hoverLabel.querySelector(".venue-hover-name").textContent = FLOORS[next].name;
            hoverLabel.classList.add("is-visible");
          } else {
            hoverLabel.classList.remove("is-visible");
          }
        }
      }
      if (hoverLabel && next >= 0) {
        hoverLabel.style.transform =
          "translate(" + (e.clientX - r.left) + "px," + (e.clientY - r.top) + "px)";
      }
    });
    canvas.addEventListener("mouseleave", function () {
      hoverFloor = -1;
      if (hoverLabel) hoverLabel.classList.remove("is-visible");
    });
  }

  // ------------------------------------------------------------------ sizing
  function resize() {
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    if (w <= 0 || h <= 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  var resizeTicking = false;
  window.addEventListener("resize", function () {
    if (!resizeTicking) {
      window.requestAnimationFrame(function () { resize(); resizeTicking = false; });
      resizeTicking = true;
    }
  }, { passive: true });

  // ---------------------------------------------------- visibility gating
  var visible = true;
  if ("IntersectionObserver" in window) {
    /* rootMargin keeps the loop alive a little past the scroller's edges:
       at exactly the end of the pin, a zero-margin observer can report
       "not intersecting" and freeze the camera mid-move */
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }, { threshold: 0, rootMargin: "300px 0px" }).observe(scroller);
  }

  // ------------------------------------------------------------- the loop
  var clock = new THREE.Clock();
  var elapsed = 0;
  var roomGroups = [floristRoom, mainRoom, rnbRoom];

  function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    /* one delta per frame, accumulated by hand — Clock.getElapsedTime()
       internally calls getDelta() again, so mixing the two is fragile */
    var dt = Math.min(clock.getDelta(), 0.1);
    elapsed += dt;
    var t = elapsed;

    /* Ease toward the scroll target so fast flicks don't snap the camera.
       Damping is exponential in real time rather than per-frame, otherwise
       the camera falls behind the scrollbar on anything below 60fps. */
    var damp = 1 - Math.pow(0.0045, dt);
    progress += (targetProgress - progress) * damp;
    if (Math.abs(targetProgress - progress) < 0.0005) progress = targetProgress;
    sampleCamera(progress);

    var stageNow = stageFor(progress);
    setStage(stageNow);

    // a slow orbital drift while we're outside, so the exterior is never static
    if (progress < 0.2) {
      var drift = (0.2 - progress) / 0.2;
      camera.position.x += Math.sin(t * 0.18) * 1.5 * drift;
      camera.position.y += Math.cos(t * 0.14) * 0.5 * drift;
    }
    camera.lookAt(camTarget);

    // hover lift: the hovered floor's room brightens
    for (var i = 0; i < 3; i++) {
      var want = hoverFloor === i ? 1 : 0;
      hoverBoost[i] += (want - hoverBoost[i]) * 0.12;
    }

    // lights pulse as if to a beat; the florist's breathes far more slowly
    for (var l = 0; l < pulseLights.length; l++) {
      var pl = pulseLights[l];
      var floorIdx = pl.light.position.y < FH ? 0 : pl.light.position.y < FH * 2 ? 1 : 2;
      pl.light.intensity =
        pl.base * (1 + Math.sin(t * pl.speed + l) * pl.amp) * (1 + hoverBoost[floorIdx] * 0.7);
    }

    // window glow tracks the room behind it
    for (var g2 = 0; g2 < windowGlows.length; g2++) {
      var fi = g2 < 2 ? 1 : 2;
      windowGlows[g2].material.opacity =
        0.3 + Math.sin(t * (fi === 2 ? 2.2 : 3.4) + g2) * 0.08 + hoverBoost[fi] * 0.35;
    }
    for (var lw = 0; lw < litWindows.length; lw++) {
      var fi2 = lw < 2 ? 1 : 2;
      litWindows[lw].material.emissiveIntensity =
        2.2 + Math.sin(t * (fi2 === 2 ? 2.2 : 3.4) + lw) * 0.5 + hoverBoost[fi2] * 1.4;
    }

    // club spotlights sweep
    for (var mb = 0; mb < mainBeams.length; mb++) {
      var m2 = mainBeams[mb];
      m2.beam.rotation.z = Math.sin(t * 0.9 + m2.phase) * 0.42;
      m2.beam.rotation.x = Math.cos(t * 0.7 + m2.phase) * 0.22;
      m2.beam.material.opacity = 0.1 + Math.abs(Math.sin(t * 2.4 + m2.phase)) * 0.12;
    }
    for (var rb = 0; rb < rnbBeams.length; rb++) {
      var r2 = rnbBeams[rb];
      r2.beam.rotation.z = Math.sin(t * 0.55 + r2.phase) * 0.32;
      r2.beam.material.opacity = 0.08 + Math.abs(Math.sin(t * 1.5 + r2.phase)) * 0.1;
    }

    // the crowd moves: each figure bobs on its own phase
    for (var ci = 0; ci < crowds.length; ci++) {
      var cr = crowds[ci];
      for (var pi = 0; pi < cr.people.length; pi++) {
        var pr = cr.people[pi];
        var bob = Math.sin(t * 3.1 + pr.phase) * pr.amp;
        var hh = pr.h * (1 + bob * 0.35);
        dummy.position.set(pr.x, cr.baseY + hh / 2, pr.z);
        dummy.rotation.set(0, Math.sin(t * 0.8 + pr.phase) * 0.4, 0);
        dummy.scale.set(pr.sc, hh, pr.sc);
        dummy.updateMatrix();
        cr.bodies.setMatrixAt(pi, dummy.matrix);

        dummy.position.set(pr.x, cr.baseY + hh + 0.06 * pr.sc, pr.z);
        dummy.scale.set(pr.sc, pr.sc, pr.sc);
        dummy.updateMatrix();
        cr.heads.setMatrixAt(pi, dummy.matrix);
      }
      cr.bodies.instanceMatrix.needsUpdate = true;
      cr.heads.instanceMatrix.needsUpdate = true;
    }

    // haze breathes and drifts
    for (var hp = 0; hp < hazePuffs.length; hp++) {
      var pf2 = hazePuffs[hp];
      pf2.s.position.y = pf2.baseY + Math.sin(t * 0.14 + pf2.phase) * 0.5;
      pf2.s.material.opacity = 0.035 + Math.sin(t * 0.3 + pf2.phase) * 0.02;
    }
    motes.rotation.y = t * 0.012;

    renderer.render(scene, camera);
  }

  frame();
}
