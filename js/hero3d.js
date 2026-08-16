import * as THREE from "../assets/vendor/three.module.min.js";

var canvas = document.getElementById("hero3d");
var heroSection = document.getElementById("top");

if (canvas && heroSection && window.WebGLRenderingContext) {
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var isNarrow = window.innerWidth < 760;

  var supportsWebGL = (function () {
    try {
      var test = document.createElement("canvas");
      return !!(test.getContext("webgl2") || test.getContext("webgl") || test.getContext("experimental-webgl"));
    } catch (e) {
      return false;
    }
  })();

  if (supportsWebGL) {
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0x1b1116, 1);

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x1b1116, 0.125);

    var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    var baseCamPos = { x: 0.55, y: 0.05, z: 5.3 };
    camera.position.set(baseCamPos.x, baseCamPos.y, baseCamPos.z);

    // ---- lights: amber key, magenta rim, teal fill — the same trio the
    // building's disco-light windows use, so the hero reads as part of
    // the same lighting language as the rest of the site
    scene.add(new THREE.AmbientLight(0x2b1b24, 1.1));
    var keyLight = new THREE.PointLight(0xf3b98c, 46, 16, 2);
    keyLight.position.set(-2.6, 2, 3.4);
    scene.add(keyLight);
    var rimLight = new THREE.PointLight(0xc85c7e, 34, 16, 2);
    rimLight.position.set(3.4, -0.8, -2.2);
    scene.add(rimLight);
    var fillLight = new THREE.PointLight(0x4fa8a0, 16, 16, 2);
    fillLight.position.set(1.6, -2.2, 2.8);
    scene.add(fillLight);

    // ---- a cheap procedural gradient used as an equirect environment map
    // so the metallic object has something to reflect, without loading an
    // external HDR file
    function makeEnvTexture() {
      var c = document.createElement("canvas");
      c.width = 2;
      c.height = 256;
      var ctx = c.getContext("2d");
      var grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, "#f6c9a0");
      grad.addColorStop(0.28, "#c85c7e");
      grad.addColorStop(0.55, "#2b1b24");
      grad.addColorStop(1, "#0a0507");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2, 256);
      var tex = new THREE.CanvasTexture(c);
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }
    scene.environment = makeEnvTexture();

    // ---- the abstract metallic object
    var geometry = new THREE.TorusKnotGeometry(1.05, 0.34, isNarrow ? 140 : 220, 26, 2, 3);
    var material = new THREE.MeshPhysicalMaterial({
      color: 0x2b1b24,
      metalness: 1,
      roughness: 0.26,
      clearcoat: 0.6,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.4,
    });
    var knot = new THREE.Mesh(geometry, material);
    var knotBaseX = 0.85;
    knot.position.set(knotBaseX, -0.1, 0);
    scene.add(knot);

    // ---- ambient particles, like drifting haze/embers around the object
    var particleCount = isNarrow ? 150 : 300;
    var positions = new Float32Array(particleCount * 3);
    for (var i = 0; i < particleCount; i++) {
      var r = 2.2 + Math.random() * 3;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = knotBaseX + r * Math.sin(phi) * Math.cos(theta) * 0.65;
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55;
      positions[i * 3 + 2] = r * Math.cos(phi) * 0.65 - 1;
    }
    var particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    var particleMat = new THREE.PointsMaterial({
      color: 0xf3b98c,
      size: 0.026,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    var particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    function resize() {
      var w = heroSection.clientWidth;
      var h = heroSection.clientHeight;
      if (w <= 0 || h <= 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    var resizeTicking = false;
    window.addEventListener(
      "resize",
      function () {
        if (!resizeTicking) {
          window.requestAnimationFrame(function () {
            resize();
            resizeTicking = false;
          });
          resizeTicking = true;
        }
      },
      { passive: true }
    );

    // ---- mouse parallax: subtle rotation offset toward the cursor
    var targetRotX = 0, targetRotY = 0, curRotX = 0, curRotY = 0;
    if (canHover && !reducedMotion) {
      window.addEventListener(
        "mousemove",
        function (e) {
          var nx = e.clientX / window.innerWidth - 0.5;
          var ny = e.clientY / window.innerHeight - 0.5;
          targetRotY = nx * 0.5;
          targetRotX = ny * 0.3;
        },
        { passive: true }
      );
    }

    // ---- scroll-driven camera move: pulls back and drifts down as the
    // hero scrolls out, and fades the canvas so the handoff to the next
    // section feels deliberate rather than an abrupt cut
    var scrollProgress = 0;
    function updateScrollProgress() {
      var rect = heroSection.getBoundingClientRect();
      scrollProgress = Math.min(Math.max(-rect.top / rect.height, 0), 1);
    }
    updateScrollProgress();
    if (!reducedMotion) {
      var scrollTicking = false;
      window.addEventListener(
        "scroll",
        function () {
          if (!scrollTicking) {
            window.requestAnimationFrame(function () {
              updateScrollProgress();
              scrollTicking = false;
            });
            scrollTicking = true;
          }
        },
        { passive: true }
      );
    }

    // ---- pause rendering while the hero is off-screen to save battery
    // on a page with plenty of other scroll-driven motion below it
    var isVisible = true;
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          isVisible = entries[0].isIntersecting;
        },
        { threshold: 0 }
      );
      io.observe(heroSection);
    }

    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      if (!isVisible) return;
      var t = clock.getElapsedTime();

      curRotX += (targetRotX - curRotX) * 0.05;
      curRotY += (targetRotY - curRotY) * 0.05;

      knot.rotation.y = t * 0.16 + curRotY;
      knot.rotation.x = Math.sin(t * 0.12) * 0.12 + curRotX + scrollProgress * 0.55;
      knot.rotation.z = t * 0.05;

      particles.rotation.y = -t * 0.02;
      particles.rotation.x = t * 0.008;

      camera.position.x = baseCamPos.x - scrollProgress * 0.5;
      camera.position.y = baseCamPos.y - scrollProgress * 0.8;
      camera.position.z = baseCamPos.z + scrollProgress * 1.7;
      camera.lookAt(knotBaseX, -0.1 - scrollProgress * 0.25, 0);

      canvas.style.opacity = String(1 - scrollProgress * 0.85);

      renderer.render(scene, camera);
    }

    if (reducedMotion) {
      // a single settled frame, no autoplaying motion at all
      knot.rotation.set(0.18, 0.4, 0);
      camera.lookAt(knotBaseX, -0.1, 0);
      renderer.render(scene, camera);
    } else {
      animate();
    }
  }
}
