/* ==========================================================================
   Shared engine for the venue buildings.

   Both Eddie Rocks and Labyrinth are stylised miniatures of a real building
   with a scroll-driven camera that flies in through a window and travels
   down through the floors. Everything that is the same for both — renderer
   setup, the modelling helpers, the shell, the camera journey, the scroll
   binding, hover picking and the render loop — lives here. Each venue
   supplies only its palette, its floor list, its exterior detailing and the
   contents of its rooms.

   The constraints that keep this shippable are enforced here too: no shadow
   maps, no post-processing, glow faked with additive sprites, shared
   geometry, instanced crowds, a capped pixel ratio, a reduced mobile tier
   and a render loop gated by an IntersectionObserver.
   ========================================================================== */

/* Three.js is 650KB and it draws a section well down the page that a
   visitor may never reach — on a static import every phone that bounced off
   the hero still paid to download and parse all of it. Fetching it when the
   section comes near instead takes it off the critical path completely. The
   scene was already built lazily; only the library was not. */
var THREE;
function loadThree() {
  if (THREE) return Promise.resolve();
  return import("../assets/vendor/three.module.min.js").then(function (m) { THREE = m; });
}

export function mountVenue(config) {
  var canvas = document.getElementById(config.canvasId);
  var section = document.getElementById(config.sectionId);
  var scroller = document.getElementById(config.scrollerId);
  var stage = document.getElementById(config.stageId);
  if (!canvas || !section || !scroller || !stage) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 900px)").matches;

  /* WebGL probe. If this fails the illustrated fallback stays in place —
     the section is authored so the fallback is what's there until the 3D
     scene declares itself ready. */
  var hasGL = (function () {
    try {
      var t = document.createElement("canvas");
      return !!(t.getContext("webgl2") || t.getContext("webgl"));
    } catch (e) {
      return false;
    }
  })();
  if (!hasGL || reducedMotion) return;

  /* Build lazily. A WebGL context is expensive and a phone will happily
     kill one under memory pressure — which shows up as a permanently black
     canvas, not an error. Waiting until the section is actually near the
     viewport means a page carrying two venues only ever holds one context
     for the venue you are looking at. */
  var started = false;
  function start() {
    if (started) return;
    started = true;
    /* The scroller is display:none until this class lands, and a hidden
       element measures zero, so the renderer has to be sized afterwards. */
    section.classList.add("is-3d-ready");
    loadThree().then(build, function () {
      /* the illustrated fallback never left the page, so a library that
         fails to arrive simply leaves it showing */
      section.classList.remove("is-3d-ready");
    });
  }
  if ("IntersectionObserver" in window) {
    /* This section sits right after the hero, and the hero is close enough
       to a full viewport tall that the section's top edge already sits at
       the fold on load, before any scrolling. A positive rootMargin — this
       used to carry 150%, meant as "a viewport and a half of warning" —
       only ever pushes the trigger boundary further past a section that is
       already there, so the fetch, parse and full room build fired the
       moment the page loaded on every visitor, scrolled or not. That is
       the page's own load competing with the busiest thing on it.

       A negative bottom margin instead requires the section to have
       genuinely scrolled up into view: shrinking the root by 35% of the
       viewport from the bottom means the top of the section has to cross
       into the upper 65% before this counts as intersecting, which cannot
       happen without the visitor actually scrolling towards it. */
    var boot = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { boot.disconnect(); start(); }
    }, { rootMargin: "0px 0px -35% 0px" });
    boot.observe(section);
  } else {
    start();
  }

  function build() {
    var C = config.palette;
    var W = config.dims.W;
    var D = config.dims.D;
    var FH = config.dims.FH;
    var FRONT = D / 2;
    var BACK = -D / 2;
    /* Floors are listed bottom-up. BASEMENTS says how many of them are below
       the pavement, so street level is the top of floor index BASE - Eddie's
       Forbidden Florist is underground, reached by the stairs beside the
       entrance, not a room behind the shopfront. */
    var BASE = config.dims.BASEMENTS || 0;
    var FLOORS = config.floors.map(function (f, i) {
      return { num: f.num, name: f.name, y: FH * (i - BASE) };
    });
    var N = FLOORS.length;
    /* Storeys above the top room. Labyrinth is a three-storey terrace but
       only two of them are the venue, and a building that stops at its top
       bar reads as a model rather than a street. */
    var ATTIC = config.dims.ATTIC || 0;
    var ROOF = FH * (N - BASE + ATTIC);

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
    renderer.toneMappingExposure = config.exposure || 1.05;
    renderer.setClearColor(C.night, 1);

    /* A lost context is the difference between "paused" and "black forever".
       preventDefault lets the browser hand it back, and three.js re-uploads
       what it needs on the next frame, so rendering just resumes. */
    var contextLost = false;
    canvas.addEventListener("webglcontextlost", function (e) {
      e.preventDefault();
      contextLost = true;
    }, false);
    canvas.addEventListener("webglcontextrestored", function () {
      contextLost = false;
      resize();
    }, false);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(C.night, config.fogDensity || 0.035);

    var camera = new THREE.PerspectiveCamera(54, 1, 0.1, 120);
    var camTarget = new THREE.Vector3();

    // ------------------------------------------------------------- textures
    /* one radial-gradient sprite, reused for every glow, haze puff and light
       bloom — generated rather than loaded so there's no extra request */
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

    /* a cheap gradient standing in for a sky/street environment map, so metal
       and glass have something to reflect without loading an HDR */
    (function () {
      var c = document.createElement("canvas");
      c.width = 2;
      c.height = 128;
      var ctx = c.getContext("2d");
      var g = ctx.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, C.envTop);
      g.addColorStop(0.5, C.envMid);
      g.addColorStop(1, C.envBottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 2, 128);
      var t = new THREE.CanvasTexture(c);
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      scene.environment = t;
    })();

    // ------------------------------------------------------------- materials
    var mat = {
      brick: new THREE.MeshStandardMaterial({ color: C.brick, roughness: 0.92, metalness: 0.02 }),
      brickDark: new THREE.MeshStandardMaterial({ color: C.brickDark, roughness: 0.95, metalness: 0.02 }),
      stone: new THREE.MeshStandardMaterial({ color: C.stone, roughness: 0.8, metalness: 0.05 }),
      dark: new THREE.MeshStandardMaterial({ color: C.interiorDark, roughness: 0.85 }),
      metal: new THREE.MeshStandardMaterial({ color: C.metal, roughness: 0.35, metalness: 0.9 }),
      silhouette: new THREE.MeshBasicMaterial({ color: C.silhouette }),
    };

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

    function box(material, w, h, d, x, y, z, parent) {
      var m = new THREE.Mesh(BOX, material);
      m.scale.set(w, h, d);
      m.position.set(x, y, z);
      (parent || scene).add(m);
      return m;
    }
    function cyl(material, r, h, x, y, z, parent) {
      var m = new THREE.Mesh(CYL, material);
      m.scale.set(r * 2, h, r * 2);
      m.position.set(x, y, z);
      (parent || scene).add(m);
      return m;
    }
    function glow(color, size, x, y, z, opacity, parent) {
      var s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: glowTex,
        color: color,
        transparent: true,
        opacity: opacity === undefined ? 0.75 : opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }));
      s.scale.set(size, size, 1);
      s.position.set(x, y, z);
      (parent || scene).add(s);
      return s;
    }

    // ------------------------------------------------ animated registries
    var pulseLights = [];   // {light, base, speed, amp, floor}
    var beams = [];         // {beam, phase, swing, speed}
    var litWindows = [];    // {mesh, floor, speed}
    var windowGlows = [];   // {sprite, floor, speed}
    var crowds = [];
    var dummy = new THREE.Object3D();

    /* The crowd is the densest thing in either scene. As individual meshes it
       was the bulk of the draw calls, so bodies and heads are one InstancedMesh
       per room and the dance is written into the instance matrices. */
    var CROWD_BODY = new THREE.CylinderGeometry(0.115, 0.115, 1, 8);
    var CROWD_HEAD = new THREE.SphereGeometry(0.085, 7, 5);

    function crowd(count, spread, baseY, z, parent, scale) {
      var sc = scale || 1;
      var bodies = new THREE.InstancedMesh(CROWD_BODY, mat.silhouette, count);
      var heads = new THREE.InstancedMesh(CROWD_HEAD, mat.silhouette, count);
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

    // =====================================================================
    //  SHELL — the parts every venue's building has
    // =====================================================================
    var building = new THREE.Group();
    scene.add(building);

    var WIN_W = 1.3, WIN_H = 1.62, WIN_SILL = 0.8;
    var winCentres = [-W * 0.29, 0, W * 0.29];
    var pierW = (W - WIN_W * 3) / 4;
    var pierCentres = [
      -W / 2 + pierW / 2,
      -W * 0.29 + WIN_W / 2 + pierW / 2,
      W * 0.29 - WIN_W / 2 - pierW / 2,
      W / 2 - pierW / 2,
    ];

    /* A storey's street elevation. The centre opening is left unglazed
       because that is the gap the camera actually flies through. */
    function frontWallWithWindows(baseY, tone) {
      box(mat.brick, W, WIN_SILL, 0.3, 0, baseY + WIN_SILL / 2, FRONT, building);
      var lintelY = baseY + WIN_SILL + WIN_H;
      box(mat.brick, W, FH - WIN_SILL - WIN_H, 0.3, 0, lintelY + (FH - WIN_SILL - WIN_H) / 2, FRONT, building);
      for (var i = 0; i < pierCentres.length; i++) {
        box(mat.brick, pierW, WIN_H, 0.3, pierCentres[i], baseY + WIN_SILL + WIN_H / 2, FRONT, building);
      }
      box(mat.stone, W + 0.16, 0.14, 0.42, 0, baseY + 0.05, FRONT, building);

      var floorIndex = Math.round(baseY / FH) + BASE;
      for (var w = 0; w < winCentres.length; w++) {
        if (w === 1) continue;                       // the way in
        var wy = baseY + WIN_SILL + WIN_H / 2;
        // dark reflective pane, with an emissive card behind it so light spills out
        box(new THREE.MeshStandardMaterial({
          color: 0x0b0609, roughness: 0.12, metalness: 0.6, transparent: true, opacity: 0.55,
        }), WIN_W, WIN_H, 0.04, winCentres[w], wy, FRONT - 0.02, building);
        var lit = box(emissive(tone, 2.4), WIN_W * 0.92, WIN_H * 0.9, 0.02, winCentres[w], wy, FRONT - 0.16, building);
        litWindows.push({ mesh: lit, floor: floorIndex, speed: 2.2 + floorIndex * 0.6 });
        windowGlows.push({
          sprite: glow(tone, 2.6, winCentres[w], wy, FRONT + 0.35, 0.34, building),
          floor: floorIndex,
          speed: 2.2 + floorIndex * 0.6,
        });
      }
    }

    // upper storeys get windows; the ground floor is the venue's own frontage
    for (var f = BASE + 1; f < N; f++) {
      frontWallWithWindows(FLOORS[f].y, config.floors[f].windowTone);
    }
    // anything below the pavement is walled in on the street side
    for (var b = 0; b < BASE; b++) {
      box(mat.brickDark, W, FH, 0.3, 0, FLOORS[b].y + FH / 2, FRONT, building);
    }
    // storeys above the top room: elevation and shell, but no room inside
    for (var a = 0; a < ATTIC; a++) {
      var ay = FLOORS[N - 1].y + FH * (a + 1);
      frontWallWithWindows(ay, config.floors[N - 1].windowTone);
      box(mat.brickDark, 0.3, FH, D, -W / 2, ay + FH / 2, 0, building);
      box(mat.brickDark, 0.3, FH, D, W / 2, ay + FH / 2, 0, building);
      box(mat.brickDark, W, FH, 0.3, 0, ay + FH / 2, BACK, building);
      box(mat.dark, W, 0.18, D, 0, ay, 0, building);
    }

    // side walls, back wall, slabs, roof deck and cornice
    for (var s = 0; s < N; s++) {
      var y0 = FLOORS[s].y;
      box(mat.brickDark, 0.3, FH, D, -W / 2, y0 + FH / 2, 0, building);
      box(mat.brickDark, 0.3, FH, D, W / 2, y0 + FH / 2, 0, building);
      box(mat.brickDark, W, FH, 0.3, 0, y0 + FH / 2, BACK, building);
      box(mat.dark, W, 0.18, D, 0, y0, 0, building);
    }
    box(mat.dark, W, 0.2, D, 0, ROOF, 0, building);
    box(mat.stone, W + 0.36, 0.3, D + 0.36, 0, ROOF + 0.14, 0, building);
    box(mat.brickDark, 1.1, 0.75, 1.1, -W * 0.26, ROOF + 0.6, -1.0, building);
    box(mat.metal, 0.36, 1.0, 0.36, W * 0.24, ROOF + 0.7, -0.7, building);

    // street and pavement. Laid as a frame around the building's footprint
    // rather than one slab, so a basement isn't sliced in half by the ground.
    var ground = new THREE.MeshStandardMaterial({ color: C.street, roughness: 0.95 });
    var HW = W / 2, HD = D / 2, REACH = 23;
    box(ground, 46, 0.2, REACH - HD, 0, -0.1, HD + (REACH - HD) / 2);
    box(ground, 46, 0.2, REACH - HD, 0, -0.1, -HD - (REACH - HD) / 2);
    box(ground, REACH - HW, 0.2, D, -HW - (REACH - HW) / 2, -0.1, 0);
    box(ground, REACH - HW, 0.2, D, HW + (REACH - HW) / 2, -0.1, 0);
    box(mat.stone, W + 5.5, 0.06, 2.6, 0, 0.02, FRONT + 1.4);

    /* Neighbouring terrace, so the venue reads as mid-terrace rather than a
       model on a table. Given a scatter of dim windows — as plain slabs they
       just read as two black walls. */
    (function neighbours() {
      var sides = [
        { x: -W / 2 - 2.9, w: 5.4, h: ROOF - FH * 0.7 },
        { x: W / 2 + 3.1, w: 5.8, h: ROOF - FH * 0.85 },
      ];
      var dimWin = emissive(C.neighbourWindow, 0.55);
      for (var n = 0; n < sides.length; n++) {
        var side = sides[n];
        box(mat.brickDark, side.w, side.h, D * 0.92, side.x, side.h / 2, -0.3);
        box(mat.stone, side.w + 0.2, 0.24, D * 0.96, side.x, side.h + 0.1, -0.3);
        for (var row = 0; row < 2; row++) {
          for (var col = 0; col < 3; col++) {
            if ((row + col + n) % 3 === 0) continue;
            box(dimWin, 0.62, 0.95, 0.06,
              side.x - side.w / 2 + 1.0 + col * (side.w - 2.0) / 2,
              1.5 + row * (side.h / 2.4), D * 0.46 - 0.3);
          }
        }
      }
    })();

    // ------------------------------------------------------------- ambience
    scene.add(new THREE.AmbientLight(C.ambient, 2.4));
    /* Without exterior light the facade is lit only by what leaks out of its
       own windows and reads as a black silhouette. A streetlamp one side, a
       soft sky fill the other. */
    var lamp = new THREE.PointLight(C.lamp, 90, 34, 2);
    lamp.position.set(-6.5, ROOF * 0.72, 9.5);
    scene.add(lamp);
    /* Uplighters, if the venue asks for them. Sprites fake a glow but light
       nothing; the facade only reads like the photograph if something is
       actually throwing colour up the wall. */
    (config.uplights || []).forEach(function (u) {
      var up = new THREE.PointLight(u.color, u.intensity, u.distance || 16, 2);
      up.position.set(u.x, u.y === undefined ? 0.4 : u.y, FRONT + (u.z === undefined ? 1.0 : u.z));
      scene.add(up);
    });

    var skyFill = new THREE.DirectionalLight(C.skyFill, 0.85);
    skyFill.position.set(7, 12, 8);
    scene.add(skyFill);
    cyl(mat.metal, 0.06, ROOF * 0.7, -6.5, ROOF * 0.35, 9.5);
    glow(C.lamp, 2.6, -6.5, ROOF * 0.72, 9.5, 0.6);

    /* haze: a few large additive puffs. Cheap, and it does more for the
       nightclub read than any amount of extra geometry. */
    var hazePuffs = [];
    var hazeCount = isMobile ? 8 : 16;
    for (var h = 0; h < hazeCount; h++) {
      var puff = new THREE.Sprite(new THREE.SpriteMaterial({
        map: hazeTex,
        color: h % 3 === 0 ? C.hazeB : C.hazeA,
        transparent: true, opacity: 0.05,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }));
      var size = 3 + Math.random() * 4;
      puff.scale.set(size, size, 1);
      puff.position.set((Math.random() - 0.5) * 12, Math.random() * (ROOF + 1), (Math.random() - 0.5) * 10 + 2);
      scene.add(puff);
      hazePuffs.push({ s: puff, phase: Math.random() * 6.28, baseY: puff.position.y });
    }

    var moteCount = isMobile ? 90 : 220;
    var motePos = new Float32Array(moteCount * 3);
    for (var mi = 0; mi < moteCount; mi++) {
      motePos[mi * 3] = (Math.random() - 0.5) * 16;
      motePos[mi * 3 + 1] = Math.random() * (ROOF + 2);
      motePos[mi * 3 + 2] = (Math.random() - 0.5) * 12 + 1;
    }
    var moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
    var motes = new THREE.Points(moteGeo, new THREE.PointsMaterial({
      color: C.mote, size: 0.035, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(motes);

    // =====================================================================
    //  VENUE-SPECIFIC CONTENT
    // =====================================================================
    var ctx = {
      THREE: THREE, scene: scene, building: building,
      // so a frontage can dress the openings the shell already cut
      winCentres: winCentres, WIN_W: WIN_W, WIN_H: WIN_H, WIN_SILL: WIN_SILL, ATTIC: ATTIC,
      mat: mat, emissive: emissive, box: box, cyl: cyl, glow: glow, crowd: crowd,
      pulseLights: pulseLights, beams: beams,
      C: C, W: W, D: D, FH: FH, FRONT: FRONT, BACK: BACK, ROOF: ROOF,
      isMobile: isMobile,
    };

    if (config.buildExterior) config.buildExterior(ctx);

    var rooms = [];
    for (var r = 0; r < N; r++) {
      var room = new THREE.Group();
      scene.add(room);
      rooms.push(room);
      config.floors[r].build(ctx, room, FLOORS[r].y, r);
    }

    // =====================================================================
    //  CAMERA JOURNEY — generated from the floor count
    // =====================================================================
    /* Approach the building, fly in through the top storey's centre window,
       work down a floor at a time, then pull back out onto the street. */
    var EYE = 1.5;
    var ENTER_AT = 0.20;
    var EXIT_AT = 0.90;
    var SLICE = (EXIT_AT - ENTER_AT) / N;

    var KEYS = [
      /* Both venues are two storeys, so the approach is frontal and slightly
         low — the way you actually see the building from the pavement
         opposite — rather than the high oblique a taller block wanted. */
      { t: 0.00, pos: [W * 0.92, ROOF * 0.38, D * 2.3], look: [0, ROOF * 0.46, 0] },
      { t: 0.10, pos: [W * 0.5, ROOF * 0.5, D * 1.8], look: [0, ROOF * 0.5, 0] },
      { t: ENTER_AT * 0.95, pos: [W * 0.44, ROOF + 0.5, D * 1.45], look: [0, FLOORS[N - 1].y + 1.5, 0] },
    ];
    for (var k = 0; k < N; k++) {
      var idx = N - 1 - k;                 // top floor first, then downwards
      var y = FLOORS[idx].y;
      var t0 = ENTER_AT + k * SLICE;
      var side = k % 2 ? -1 : 1;           // alternate which way we look
      if (k === 0) {
        // in through the window
        KEYS.push({ t: t0 + SLICE * 0.1, pos: [0, y + EYE, FRONT + 1.2], look: [0, y + 1.4, BACK] });
      } else {
        // drop down the stairwell into the next room
        KEYS.push({ t: t0 + SLICE * 0.02, pos: [side * 1.9, y + EYE + 1.4, FRONT - 1.6], look: [side * 0.2, y + 1.4, BACK] });
      }
      KEYS.push({ t: t0 + SLICE * 0.42, pos: [side * 1.7, y + EYE, FRONT - 1.1], look: [-side * 0.6, y + 1.25, BACK] });
      KEYS.push({ t: t0 + SLICE * 0.86, pos: [-side * 1.9, y + EYE, FRONT - 2.6], look: [side * 1.8, y + 1.15, BACK + 0.6] });
    }
    KEYS.push({ t: 0.93, pos: [1.2, 1.8, FRONT + 5.0], look: [0, ROOF * 0.3, 0] });
    KEYS.push({ t: 1.00, pos: [-W * 0.9, ROOF * 0.45, D * 2.0], look: [0, ROOF * 0.48, 0] });

    function smoothstep(x) { return x * x * (3 - 2 * x); }

    var tmpA = new THREE.Vector3();
    var tmpB = new THREE.Vector3();
    function sampleCamera(p) {
      var i = 0;
      while (i < KEYS.length - 2 && p > KEYS[i + 1].t) i++;
      var a = KEYS[i], b = KEYS[i + 1];
      var span = b.t - a.t;
      var q = span <= 0 ? 0 : smoothstep(Math.min(Math.max((p - a.t) / span, 0), 1));
      tmpA.set(a.pos[0], a.pos[1], a.pos[2]);
      tmpB.set(b.pos[0], b.pos[1], b.pos[2]);
      camera.position.lerpVectors(tmpA, tmpB, q);
      tmpA.set(a.look[0], a.look[1], a.look[2]);
      tmpB.set(b.look[0], b.look[1], b.look[2]);
      camTarget.lerpVectors(tmpA, tmpB, q);
    }

    /* Stage 0 is the exterior; a floor's stage number is its index + 1, so the
       markup can label panels by the floor they describe. */
    function stageFor(p) {
      if (p < ENTER_AT + SLICE * 0.08) return 0;
      if (p >= EXIT_AT) return 0;
      var k = Math.min(Math.floor((p - ENTER_AT) / SLICE), N - 1);
      return (N - 1 - k) + 1;
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
    /* Measured against the tall scroller holding the sticky stage, not the
       whole section — the intro and fallback sit outside the pinned range. */
    function readScroll() {
      var rect = scroller.getBoundingClientRect();
      var travel = scroller.offsetHeight - window.innerHeight;
      if (travel <= 0) return 0;
      return Math.min(Math.max(-rect.top / travel, 0), 1);
    }

    var progress = readScroll();
    var targetProgress = progress;
    var scrollTicking = false;
    /* named so it can be unbound again if the scene stands down */
    function onScroll() {
      if (!scrollTicking) {
        window.requestAnimationFrame(function () {
          targetProgress = readScroll();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    /* Scroll position stays the source of truth: picking a floor scrolls the
       page to the point in the sequence where that floor is on screen, so the
       camera and the scrollbar can never disagree. */
    function gotoFloor(idx, behavior) {
      var k = N - 1 - idx;
      var anchor = ENTER_AT + k * SLICE + SLICE * 0.5;
      var travel = scroller.offsetHeight - window.innerHeight;
      var top = scroller.getBoundingClientRect().top + window.scrollY + travel * anchor;
      window.scrollTo({ top: top, behavior: behavior || "smooth" });
    }
    section.querySelectorAll("[data-goto-floor]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        gotoFloor(Number(btn.dataset.gotoFloor));
      });
    });

    /* Each floor is addressable by its own name — #rewind, #main-bar — so a
       link from the other venue's header can land on the room it names
       rather than the top of the building. The scroll position is still the
       only source of truth; this just picks the right one. */
    function slug(s) {
      return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    function floorFromHash() {
      var h = window.location.hash.slice(1);
      if (!h) return -1;
      for (var i = 0; i < config.floors.length; i++) {
        if (slug(config.floors[i].name) === h) return i;
      }
      return -1;
    }
    function jumpToHash(behavior) {
      var idx = floorFromHash();
      if (idx >= 0) gotoFloor(idx, behavior);
    }
    window.addEventListener("hashchange", function () { jumpToHash(); });
    /* On a cold load the scroller has only just been shown, so let layout
       settle before measuring it. */
    if (floorFromHash() >= 0) requestAnimationFrame(function () { jumpToHash("auto"); });

    // ------------------------------------------------------------ hover focus
    /* Raycast invisible slabs, one per floor, so hovering the building lights
       that floor and names it. Pointer-fine only — on touch the buttons under
       the canvas do this job. */
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var pickTargets = [];
    var hoverBoost = [];
    for (var pf = 0; pf < N; pf++) {
      /* A basement can't be hovered on the facade — it isn't on the facade.
         A floor can name its own target instead, so the Forbidden Florist
         answers to the steps you'd actually go down to reach it. */
      var h = config.floors[pf].hover;
      var slab = new THREE.Mesh(
        new THREE.BoxGeometry(h ? h.w : W, h ? h.h : FH, h ? h.d : D),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      if (h) slab.position.set(h.x, h.y, FRONT + h.z);
      else slab.position.set(0, FLOORS[pf].y + FH / 2, 0);
      slab.userData.floor = pf;
      scene.add(slab);
      pickTargets.push(slab);
      hoverBoost.push(0);
    }
    var hoverFloor = -1;
    var hoverLabel = document.getElementById(config.hoverLabelId);
    if (canHover) {
      var ray = new THREE.Raycaster();
      var ndc = new THREE.Vector2();
      canvas.addEventListener("mousemove", function (e) {
        var rect = canvas.getBoundingClientRect();
        ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        ray.setFromCamera(ndc, camera);
        var hits = ray.intersectObjects(pickTargets, false);
        var next = hits.length ? hits[0].object.userData.floor : -1;
        if (currentStage !== 0) next = -1;   // only meaningful from outside
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
            "translate(" + (e.clientX - rect.left) + "px," + (e.clientY - rect.top) + "px)";
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

    /* rootMargin keeps the loop alive a little past the scroller's edges: at
       exactly the end of the pin a zero-margin observer can report "not
       intersecting" and freeze the camera mid-move. */
    var visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
      }, { threshold: 0, rootMargin: "300px 0px" }).observe(scroller);
    }

    /* A machine that cannot draw this fast enough is worse off with it than
       without it: the scene keeps its shape but the whole page scrolls at
       the speed of the slowest frame. WebGL support is not the same question
       as WebGL speed, and nothing in the feature test catches a software
       rasteriser, an old integrated chip or a laptop throttling on battery.

       So the first rendered frames are timed, and if the median is far past
       a frame's budget the scene is taken down and the illustrated fallback
       — which never left the page — takes over. Measured on rendered frames
       only, after a couple of warm-up frames, and it can only ever fire
       once. On anything that can hold a frame this never runs.

       What is timed is the gap between frames, not the work inside one:
       render() only queues commands and returns, so the cost of a frame the
       machine cannot afford lands in the wait before the next one. Timing
       the call itself reads near zero on a machine that is drowning. */
    var SLOW_FRAME_MS = 90;          // ~5x a 60fps budget: not marginal, broken
    var probe = [];
    var probed = false;
    var lastFrameAt = 0;
    var deadlineTimer = null;
    /* Requiring 18 whole frames before a verdict is fine on a machine near
       60fps — that is a third of a second — but the wait scales with
       exactly the problem it exists to catch. A machine drawing this at
       650-930ms a frame, the case that motivated the check in the first
       place, needs 12-17 real seconds to produce 18 of them, and every one
       of those seconds is spent inside the slow thing before the verdict
       that removes it.

       A verdict that only gets checked once each frame finishes cannot
       outrun that either: if a frame itself takes seconds under the load
       being measured, several such frames stack up before the check even
       gets a turn to look at the clock, because nothing runs between them.
       setTimeout does not have that problem — it queues independently of
       the render loop, so it gets a turn as soon as whichever frame is
       currently in flight finishes, not after however many more it takes
       the loop to notice on its own. Past this many milliseconds without a
       verdict, the delay itself is already the answer, so this decides on
       whatever rendered so far rather than waiting for the loop to catch up. */
    var PROBE_DEADLINE_MS = 1200;

    function verdict(samples) {
      /* Six warm-up frames are thrown away on the normal path — shader
         compilation, texture upload and whatever else the page is still
         doing all land in the first few — and the verdict is the median of
         the rest, so one busy moment cannot take the scene down.

         The deadline does not get that luxury: a machine that triggers it
         has, by definition, not produced enough frames to spare six as
         warm-up without emptying the sample entirely, which would leave
         nothing to judge and — worse than never deciding — silently never
         stand down at all. So at most one frame's width less than it has is
         kept, always leaving something to judge: a machine already this far
         behind is not going to be rescued by one more frame of patience. */
      var keepFrom = Math.min(6, Math.max(0, samples.length - 1));
      var s = samples.slice(keepFrom).sort(function (a, b) { return a - b; });
      return s.length > 0 && s[Math.floor(s.length / 2)] > SLOW_FRAME_MS;
    }

    function onDeadline() {
      if (probed) return;
      probed = true;
      if (verdict(probe)) standDown();
    }

    function tooSlowToBeWorthIt() {
      if (probed || probe.length < 18) return false;
      probed = true;
      clearTimeout(deadlineTimer);
      return verdict(probe);
    }

    function standDown() {
      running = false;
      section.classList.remove("is-3d-ready");
      window.removeEventListener("scroll", onScroll);
      try { renderer.dispose(); } catch (e) {}
      /* The fallback was display:none while the scene was up, so anything in
         it waiting to fade in on scroll has never had a box to intersect. If
         it is on screen the moment it appears, there may be no further scroll
         to trigger it — so it is simply shown. */
      Array.prototype.forEach.call(
        section.querySelectorAll(".reveal"),
        function (el) { el.classList.add("is-visible"); }
      );
    }

    // ------------------------------------------------------------- the loop
    var clock = new THREE.Clock();
    var elapsed = 0;
    var running = true;

    function frame() {
      if (running) requestAnimationFrame(frame);
      if (!visible || contextLost) return;
      /* one delta per frame, accumulated by hand — Clock.getElapsedTime()
         internally calls getDelta() again, so mixing the two is fragile */
      var dt = Math.min(clock.getDelta(), 0.1);
      elapsed += dt;
      var t = elapsed;

      /* Damping is exponential in real time rather than per-frame, otherwise
         the camera falls behind the scrollbar on anything below 60fps. */
      var damp = 1 - Math.pow(0.0045, dt);
      progress += (targetProgress - progress) * damp;
      if (Math.abs(targetProgress - progress) < 0.0005) progress = targetProgress;
      sampleCamera(progress);
      setStage(stageFor(progress));

      // a slow orbital drift outside, so the exterior is never static
      if (progress < ENTER_AT) {
        var drift = (ENTER_AT - progress) / ENTER_AT;
        camera.position.x += Math.sin(t * 0.18) * 1.5 * drift;
        camera.position.y += Math.cos(t * 0.14) * 0.5 * drift;
      }
      camera.lookAt(camTarget);

      for (var i = 0; i < N; i++) {
        hoverBoost[i] += ((hoverFloor === i ? 1 : 0) - hoverBoost[i]) * 0.12;
      }

      for (var l = 0; l < pulseLights.length; l++) {
        var pl = pulseLights[l];
        pl.light.intensity =
          pl.base * (1 + Math.sin(t * pl.speed + l) * pl.amp) * (1 + hoverBoost[pl.floor] * 0.7);
      }
      for (var g = 0; g < windowGlows.length; g++) {
        var wg = windowGlows[g];
        wg.sprite.material.opacity = 0.3 + Math.sin(t * wg.speed + g) * 0.08 + hoverBoost[wg.floor] * 0.35;
      }
      for (var lw = 0; lw < litWindows.length; lw++) {
        var w2 = litWindows[lw];
        w2.mesh.material.emissiveIntensity =
          2.2 + Math.sin(t * w2.speed + lw) * 0.5 + hoverBoost[w2.floor] * 1.4;
      }
      for (var b = 0; b < beams.length; b++) {
        var bm = beams[b];
        bm.beam.rotation.z = Math.sin(t * (bm.speed || 0.9) + bm.phase) * (bm.swing || 0.42);
        if (bm.tilt) bm.beam.rotation.x = Math.cos(t * 0.7 + bm.phase) * bm.tilt;
        bm.beam.material.opacity = bm.min + Math.abs(Math.sin(t * (bm.flicker || 2.4) + bm.phase)) * bm.range;
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

      for (var hp = 0; hp < hazePuffs.length; hp++) {
        var pf2 = hazePuffs[hp];
        pf2.s.position.y = pf2.baseY + Math.sin(t * 0.14 + pf2.phase) * 0.5;
        pf2.s.material.opacity = 0.035 + Math.sin(t * 0.3 + pf2.phase) * 0.02;
      }
      motes.rotation.y = t * 0.012;

      if (config.onFrame) config.onFrame(ctx, t, progress);

      renderer.render(scene, camera);

      if (!probed) {
        var now = performance.now();
        if (lastFrameAt) {
          if (!probe.length) deadlineTimer = setTimeout(onDeadline, PROBE_DEADLINE_MS);
          probe.push(now - lastFrameAt);
        }
        lastFrameAt = now;
        if (tooSlowToBeWorthIt()) standDown();
      }
    }
    frame();
  }
}
