"use client";

/**
 * Cinematic hero scene: an original, stylised dark saloon with an illuminated
 * roof sign, parked on a wet clifftop road on the Pembrokeshire coast at dusk.
 *
 * The vehicle is a generic illustration built from code. It is deliberately
 * unbranded and does not represent the company's actual fleet.
 * Every texture, the sky and the reflections are generated in code, so the
 * scene downloads no images, models or HDR files.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial, RoundedBox } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type SceneQuality = "high" | "lite";

type Props = {
  quality: SceneQuality;
  animate: boolean;
  active: boolean;
  onReady?: () => void;
  /** Captures a still image of the scene (used to generate the static poster). */
  posterMode?: boolean;
};

/* ──────────────────────────────────────────────────────────────────────────
 * Shared helpers
 * ────────────────────────────────────────────────────────────────────────── */

const SUN_DIR = new THREE.Vector3(-0.42, 0.035, -1).normalize();

function glowTexture(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(0.25, outer);
  grd.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Road path: approaches from behind the camera, passes the car, then follows the clifftop to a headland. */
function useRoadCurve() {
  return useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(60, 0, 6),
          new THREE.Vector3(26, 0, 1.5),
          new THREE.Vector3(8, 0, 0),
          new THREE.Vector3(-8, 0, 0),
          new THREE.Vector3(-24, 0, -2.5),
          new THREE.Vector3(-44, 0, -10),
          new THREE.Vector3(-70, 0, -15),
          new THREE.Vector3(-105, 0, -14),
          new THREE.Vector3(-150, 0, -24),
          new THREE.Vector3(-210, 0, -46),
        ],
        false,
        "centripetal",
      ),
    [],
  );
}

/** Coastline: z position of the cliff edge for a given x. */
function cliffEdge(x: number) {
  return -21 - 5 * Math.sin(x * 0.045 + 0.6) - 2.2 * Math.sin(x * 0.13 + 1.7) - 0.8 * Math.sin(x * 0.41);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Sky: gradient dome with a low sun glow and slow-drifting cloud bands
 * ────────────────────────────────────────────────────────────────────────── */

function Sky({ animate }: { animate: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSun: { value: SUN_DIR.clone() },
    }),
    [],
  );
  useFrame((_, dt) => {
    if (animate && mat.current) mat.current.uniforms.uTime.value += dt;
  });
  return (
    <mesh scale={900} renderOrder={-10}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial
        ref={mat}
        side={THREE.BackSide}
        depthWrite={false}
        fog={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p.xyww;
          }`}
        fragmentShader={/* glsl */ `
          uniform float uTime;
          uniform vec3 uSun;
          varying vec3 vDir;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
          float noise(vec2 p){
            vec2 i = floor(p), f = fract(p);
            vec2 u = f*f*(3.0-2.0*f);
            return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
          }
          float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }
          void main() {
            vec3 d = normalize(vDir);
            float h = d.y;
            float sunAmt = max(dot(d, normalize(uSun)), 0.0);
            // Base vertical gradient: deep navy zenith -> dusty coastal blue -> warm horizon
            vec3 zenith  = vec3(0.010, 0.018, 0.048);
            vec3 upper   = vec3(0.028, 0.050, 0.110);
            vec3 mid     = vec3(0.090, 0.120, 0.190);
            vec3 horizon = vec3(0.520, 0.300, 0.190);
            vec3 col = mix(horizon, mid, smoothstep(-0.005, 0.045, h));
            col = mix(col, upper, smoothstep(0.05, 0.16, h));
            col = mix(col, zenith, smoothstep(0.14, 0.5, h));
            // Warm afterglow concentrated around the set sun
            float glow = pow(sunAmt, 10.0);
            col += vec3(1.00, 0.55, 0.22) * glow * 0.6 * (1.0 - smoothstep(0.0, 0.12, h));
            col += vec3(1.00, 0.78, 0.50) * pow(sunAmt, 90.0) * 0.9;
            // Cooler on the opposite side of the sky
            col = mix(col, col * vec3(0.62, 0.78, 1.1), (1.0 - pow(sunAmt, 2.0)) * 0.6);
            col *= 0.82;
            // Thin high cloud streaks catching the last light
            vec2 cp = d.xz / max(h + 0.12, 0.05) * 1.4;
            cp.x += uTime * 0.008;
            float c = fbm(cp * vec2(0.6, 2.6));
            c = smoothstep(0.55, 0.88, c) * smoothstep(0.015, 0.06, h) * (1.0 - smoothstep(0.2, 0.5, h));
            vec3 cloudCol = mix(vec3(0.20, 0.22, 0.32), vec3(0.95, 0.60, 0.40), pow(sunAmt, 3.0));
            col = mix(col, cloudCol, c * 0.4);
            // Below the horizon (hidden by sea) keep it dark
            col = mix(col, vec3(0.05, 0.08, 0.13), smoothstep(0.0, -0.08, h));
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`}
      />
    </mesh>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Sea with a sunset glitter path
 * ────────────────────────────────────────────────────────────────────────── */

function Sea({ animate }: { animate: boolean }) {
  const glitter = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame((_, dt) => {
    if (animate && glitter.current) glitter.current.uniforms.uTime.value += dt;
  });
  // The glitter strip runs from below the cliffs toward the setting sun.
  const angle = Math.atan2(SUN_DIR.x, SUN_DIR.z);
  return (
    <group position={[0, -9, 0]}>
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2400, 2400]} />
        <meshStandardMaterial color="#0d1d30" roughness={0.18} metalness={0.85} envMapIntensity={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, -angle + Math.PI]} position={[SUN_DIR.x * 300, 0.05, SUN_DIR.z * 300]}>
        <planeGeometry args={[120, 600]} />
        <shaderMaterial
          ref={glitter}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          uniforms={uniforms}
          vertexShader={/* glsl */ `
            varying vec2 vUv;
            void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={/* glsl */ `
            uniform float uTime;
            varying vec2 vUv;
            float hash(vec2 p){ return fract(sin(dot(p, vec2(41.3,289.1))) * 15731.743); }
            void main(){
              float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
              across = pow(max(across, 0.0), 2.2 + (1.0 - vUv.y) * 4.0);
              vec2 g = floor(vec2(vUv.x * 160.0, vUv.y * 900.0 + uTime * 1.5));
              float s = step(0.86, hash(g)) * (0.5 + 0.5 * sin(uTime * 2.0 + hash(g + 3.1) * 6.28));
              float fade = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
              vec3 col = vec3(1.0, 0.62, 0.30) * (across * 0.18 + s * across * 0.9) * fade;
              gl_FragColor = vec4(col, 1.0);
            }`}
        />
      </mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Land: clifftop heath with a rugged edge dropping to the sea
 * ────────────────────────────────────────────────────────────────────────── */

function Land() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    const x0 = -420;
    const x1 = 260;
    // Shape is built in (x, z) and rotated flat: shape y becomes world z.
    s.moveTo(x1, 320);
    s.lineTo(x0, 320);
    for (let x = x0; x <= x1; x += 2) s.lineTo(x, cliffEdge(x));
    s.lineTo(x1, 320);
    const g = new THREE.ExtrudeGeometry(s, { depth: 9.5, bevelEnabled: false, steps: 1 });
    g.rotateX(Math.PI / 2); // extrusion now points down
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} position={[0, -0.02, 0]} receiveShadow>
      <meshStandardMaterial color="#0c1316" roughness={1} metalness={0} envMapIntensity={0.05} />
    </mesh>
  );
}

/** Distant headlands and islands, softened by atmospheric haze. */
function Headlands({ animate }: { animate: boolean }) {
  const beam = useRef<THREE.Group>(null);
  const lamp = useRef<THREE.Sprite>(null);
  const glow = useMemo(() => glowTexture("rgba(255,240,210,1)", "rgba(255,190,110,0.35)"), []);
  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    if (beam.current) beam.current.rotation.y = t * 0.55;
    if (lamp.current) {
      // A slow, calm pulse, roughly matching a long-period light.
      const p = Math.pow(Math.max(0, Math.sin(t * 0.55 * 2)), 8);
      lamp.current.material.opacity = 0.35 + p * 0.65;
    }
  });

  const ridge = (pts: [number, number][], depth: number) => {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], 0);
    pts.forEach(([x, y]) => s.lineTo(x, y));
    s.lineTo(pts[pts.length - 1][0], 0);
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
    return g;
  };

  const far = useMemo(
    () =>
      ridge(
        [
          [-140, 0],
          [-110, 9],
          [-80, 15],
          [-40, 19],
          [0, 17],
          [30, 21],
          [60, 14],
          [90, 6],
          [110, 0],
        ],
        30,
      ),
    [],
  );
  const near = useMemo(
    () =>
      ridge(
        [
          [-60, 0],
          [-40, 7],
          [-15, 12],
          [5, 13],
          [25, 9],
          [40, 4],
          [52, 0],
        ],
        20,
      ),
    [],
  );
  const island = useMemo(
    () =>
      ridge(
        [
          [-14, 0],
          [-8, 4],
          [0, 5.5],
          [9, 3.5],
          [15, 0],
        ],
        14,
      ),
    [],
  );

  return (
    <group position={[0, -9, 0]}>
      <mesh geometry={far} position={[-260, 0, -470]} rotation-y={0.18}>
        <meshStandardMaterial color="#2a3346" roughness={1} envMapIntensity={0.2} />
      </mesh>
      <mesh geometry={near} position={[-150, 0, -250]} rotation-y={-0.25}>
        <meshStandardMaterial color="#1c2433" roughness={1} envMapIntensity={0.2} />
      </mesh>
      <mesh geometry={island} position={[40, 0, -330]}>
        <meshStandardMaterial color="#232b3c" roughness={1} envMapIntensity={0.2} />
      </mesh>
      {/* Lighthouse on the near headland */}
      <group position={[-138, 12.2, -246]}>
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.55, 0.8, 2.6, 12]} />
          <meshStandardMaterial color="#d9d4ca" roughness={0.6} />
        </mesh>
        <sprite ref={lamp} position={[0, 2.8, 0]} scale={[9, 9, 1]}>
          <spriteMaterial map={glow} transparent depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.6} fog={false} />
        </sprite>
        <group ref={beam} position={[0, 2.8, 0]}>
          <mesh position={[-28, 0, 0]} rotation-z={Math.PI / 2}>
            <coneGeometry args={[3.2, 56, 24, 1, true]} />
            <meshBasicMaterial
              color="#ffd9a0"
              transparent
              opacity={0.045}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              fog={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Road ribbon with wet reflections, painted lines and cat's eyes
 * ────────────────────────────────────────────────────────────────────────── */

function buildRibbon(curve: THREE.CatmullRomCurve3, width: number, segments: number, offset = 0) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const len = curve.getLength();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);
    const side = new THREE.Vector3().crossVectors(up, tan).normalize();
    const c = p.clone().addScaledVector(side, offset);
    const l = c.clone().addScaledVector(side, width / 2);
    const r = c.clone().addScaledVector(side, -width / 2);
    // Local XY plane (mesh is rotated -90° about X): local y = -world z
    pos.push(l.x, -l.z, 0, r.x, -r.z, 0);
    uv.push(0, t * len, 1, t * len);
    if (i < segments) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function Road({ quality }: { quality: SceneQuality }) {
  const curve = useRoadCurve();
  const road = useMemo(() => buildRibbon(curve, 7.4, 260), [curve]);
  const verge = useMemo(() => buildRibbon(curve, 10.5, 260), [curve]);
  const edgeL = useMemo(() => buildRibbon(curve, 0.12, 260, 3.35), [curve]);
  const edgeR = useMemo(() => buildRibbon(curve, 0.12, 260, -3.35), [curve]);

  // Asphalt roughness texture generated in code
  const roughMap = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const img = g.createImageData(256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 150 + Math.random() * 70;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    // Wet patches: darker (smoother) blotches
    for (let k = 0; k < 40; k++) {
      g.fillStyle = `rgba(60,60,60,${0.08 + Math.random() * 0.15})`;
      g.beginPath();
      g.ellipse(Math.random() * 256, Math.random() * 256, 10 + Math.random() * 40, 6 + Math.random() * 18, Math.random() * 3, 0, Math.PI * 2);
      g.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 0.08);
    return t;
  }, []);

  // Dashed centre line + cat's eyes as instanced meshes along the curve
  const { dashMatrices, eyeMatrices } = useMemo(() => {
    const len = curve.getLength();
    const dash: THREE.Matrix4[] = [];
    const eyes: THREE.Matrix4[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let d = 1; d < len; d += 4.5) {
      const t = d / len;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), tan);
      dash.push(new THREE.Matrix4().compose(p.clone().setY(0.012), q, new THREE.Vector3(1.6, 1, 1)));
      if (Math.round(d / 4.5) % 2 === 0) {
        const side = new THREE.Vector3().crossVectors(up, tan).normalize();
        eyes.push(new THREE.Matrix4().compose(p.clone().addScaledVector(side, 0).setY(0.03), q, new THREE.Vector3(1, 1, 1)));
      }
    }
    return { dashMatrices: dash, eyeMatrices: eyes };
  }, [curve]);

  const dashRef = useRef<THREE.InstancedMesh>(null);
  const eyeRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    dashMatrices.forEach((m, i) => dashRef.current?.setMatrixAt(i, m));
    eyeMatrices.forEach((m, i) => eyeRef.current?.setMatrixAt(i, m));
    if (dashRef.current) dashRef.current.instanceMatrix.needsUpdate = true;
    if (eyeRef.current) eyeRef.current.instanceMatrix.needsUpdate = true;
  }, [dashMatrices, eyeMatrices]);

  return (
    <group>
      {/* Gravel verge */}
      <mesh geometry={verge} rotation-x={-Math.PI / 2} position-y={0.002}>
        <meshStandardMaterial color="#1a1e24" roughness={1} envMapIntensity={0.1} />
      </mesh>
      {/* Wet asphalt */}
      <mesh geometry={road} rotation-x={-Math.PI / 2} position-y={0.006} receiveShadow>
        {quality === "high" ? (
          <MeshReflectorMaterial
            resolution={1024}
            mixBlur={1.4}
            mixStrength={2.6}
            blur={[420, 110]}
            mirror={0.6}
            depthScale={0.6}
            minDepthThreshold={0.3}
            maxDepthThreshold={1.4}
            color="#0d1118"
            metalness={0.5}
            roughness={0.7}
            roughnessMap={roughMap}
          />
        ) : (
          <meshStandardMaterial color="#161a21" metalness={0.55} roughness={0.38} roughnessMap={roughMap} />
        )}
      </mesh>
      {/* Edge lines */}
      {[edgeL, edgeR].map((g, i) => (
        <mesh key={i} geometry={g} rotation-x={-Math.PI / 2} position-y={0.01}>
          <meshStandardMaterial color="#8d8f8f" roughness={0.6} />
        </mesh>
      ))}
      <instancedMesh ref={dashRef} args={[undefined, undefined, dashMatrices.length]} frustumCulled={false}>
        <boxGeometry args={[1, 0.004, 0.12]} />
        <meshStandardMaterial color="#9a9b9a" roughness={0.6} />
      </instancedMesh>
      {/* Cat's eyes: a quiet amber route line through the dusk */}
      <instancedMesh ref={eyeRef} args={[undefined, undefined, eyeMatrices.length]} frustumCulled={false}>
        <boxGeometry args={[0.16, 0.03, 0.08]} />
        <meshBasicMaterial color={new THREE.Color("#ffb648").multiplyScalar(2.2)} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/** Low roadside marker posts with amber reflectors. */
function MarkerPosts() {
  const curve = useRoadCurve();
  const items = useMemo(() => {
    const out: { p: THREE.Vector3; q: THREE.Quaternion }[] = [];
    const len = curve.getLength();
    const up = new THREE.Vector3(0, 1, 0);
    for (let d = 14; d < 260; d += 22) {
      const t = d / len;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = new THREE.Vector3().crossVectors(up, tan).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1, 0, 0), tan);
      out.push({ p: p.clone().addScaledVector(side, -4.9), q });
    }
    return out;
  }, [curve]);
  return (
    <group>
      {items.map(({ p, q }, i) => (
        <group key={i} position={p} quaternion={q}>
          <mesh position={[0, 0.5, 0]}>
            <boxGeometry args={[0.1, 1, 0.1]} />
            <meshStandardMaterial color="#cfd0cc" roughness={0.7} />
          </mesh>
          <mesh position={[0.051, 0.86, 0]}>
            <boxGeometry args={[0.01, 0.14, 0.06]} />
            <meshBasicMaterial color={new THREE.Color("#ff9d2e").multiplyScalar(1.6)} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * The vehicle: an original, unbranded executive saloon
 * ────────────────────────────────────────────────────────────────────────── */

const WHEELBASE = 1.5;
const WHEEL_R = 0.355;
const BODY_W = 1.62; // extrusion depth, before bevel

function bodyShape() {
  const s = new THREE.Shape();
  const ay = WHEEL_R + 0.02;
  const ar = 0.43;
  s.moveTo(-2.36, 0.3);
  s.lineTo(-WHEELBASE - ar, 0.3);
  s.absarc(-WHEELBASE, ay, ar, Math.PI - 0.16, 0.16, true);
  s.lineTo(WHEELBASE - ar, 0.27);
  s.absarc(WHEELBASE, ay, ar, Math.PI - 0.16, 0.16, true);
  s.lineTo(2.32, 0.3);
  s.quadraticCurveTo(2.52, 0.34, 2.5, 0.58);
  s.quadraticCurveTo(2.48, 0.8, 2.25, 0.84);
  s.quadraticCurveTo(1.5, 0.93, 0.85, 1.0);
  s.lineTo(-1.85, 1.03);
  s.quadraticCurveTo(-2.3, 1.02, -2.44, 0.94);
  s.quadraticCurveTo(-2.52, 0.62, -2.44, 0.42);
  s.quadraticCurveTo(-2.42, 0.3, -2.36, 0.3);
  return s;
}

function cabinShape() {
  const s = new THREE.Shape();
  s.moveTo(1.02, 0.98);
  s.quadraticCurveTo(0.55, 1.28, 0.18, 1.42);
  s.quadraticCurveTo(-0.5, 1.5, -1.18, 1.43);
  s.quadraticCurveTo(-1.65, 1.3, -1.98, 1.02);
  s.lineTo(1.02, 0.98);
  return s;
}

function useSignTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 128;
    const g = c.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0, "#ffd27a");
    grd.addColorStop(1, "#f0a43a");
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 128);
    g.fillStyle = "#1a1408";
    g.font = "800 92px Arial, Helvetica, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    // Letter-spaced generic sign, no company branding
    const letters = "TAXI".split("");
    letters.forEach((ch, i) => g.fillText(ch, 256 + (i - 1.5) * 92, 70));
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
}

function Wheel({ position, mirrored }: { position: [number, number, number]; mirrored?: boolean }) {
  const spokes = 5;
  return (
    <group position={position} rotation-y={mirrored ? Math.PI : 0}>
      <mesh rotation-x={Math.PI / 2} castShadow>
        <cylinderGeometry args={[WHEEL_R, WHEEL_R, 0.25, 40]} />
        <meshStandardMaterial color="#0c0d0f" roughness={0.85} />
      </mesh>
      {/* Tyre sidewall bulge */}
      <mesh position={[0, 0, 0.12]}>
        <torusGeometry args={[WHEEL_R - 0.05, 0.05, 12, 40]} />
        <meshStandardMaterial color="#121315" roughness={0.75} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0, 0.115]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.245, 0.245, 0.03, 40]} />
        <meshStandardMaterial color="#1b1e24" metalness={0.9} roughness={0.35} />
      </mesh>
      {Array.from({ length: spokes }).map((_, i) => (
        <mesh key={i} position={[0, 0, 0.135]} rotation-z={(i / spokes) * Math.PI * 2}>
          <boxGeometry args={[0.055, 0.44, 0.025]} />
          <meshStandardMaterial color="#9aa3ae" metalness={1} roughness={0.22} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.15]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 20]} />
        <meshStandardMaterial color="#c3a160" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Vehicle({ quality }: { quality: SceneQuality }) {
  const bodyGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(bodyShape(), {
      depth: BODY_W,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.07,
      bevelSegments: quality === "high" ? 8 : 4,
      curveSegments: quality === "high" ? 28 : 14,
    });
    g.translate(0, 0, -BODY_W / 2);
    g.computeVertexNormals();
    return g;
  }, [quality]);
  const cabinGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(cabinShape(), {
      depth: 1.32,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.05,
      bevelSegments: 6,
      curveSegments: 24,
    });
    g.translate(0, 0, -0.66);
    g.computeVertexNormals();
    return g;
  }, []);

  const sign = useSignTexture();
  const shadowTex = useMemo(() => {
    // Soft elongated contact shadow, drawn once on a canvas
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 128;
    const g = c.getContext("2d")!;
    g.filter = "blur(14px)";
    g.fillStyle = "rgba(0,0,0,0.95)";
    g.beginPath();
    g.roundRect(34, 26, 188, 76, 30);
    g.fill();
    const t = new THREE.CanvasTexture(c);
    return t;
  }, []);
  const halo = useMemo(() => glowTexture("rgba(255,250,240,1)", "rgba(190,215,255,0.35)"), []);
  const amberHalo = useMemo(() => glowTexture("rgba(255,220,150,1)", "rgba(255,170,60,0.4)"), []);
  const redHalo = useMemo(() => glowTexture("rgba(255,120,110,1)", "rgba(255,40,40,0.35)"), []);

  const paint = (
    <meshPhysicalMaterial
      color="#16284a"
      metalness={0.6}
      roughness={0.26}
      clearcoat={1}
      clearcoatRoughness={0.04}
      envMapIntensity={2.1}
    />
  );

  const headlightTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(14, -0.2, 0);
    return o;
  }, []);

  const W = BODY_W / 2 + 0.11;

  return (
    <group>
      {/* Body */}
      <mesh geometry={bodyGeo} castShadow>
        {paint}
      </mesh>
      {/* Glasshouse */}
      <mesh geometry={cabinGeo}>
        <meshPhysicalMaterial color="#05070b" metalness={0.2} roughness={0.04} clearcoat={1} envMapIntensity={1.8} />
      </mesh>
      {/* Roof panel */}
      <RoundedBox args={[1.35, 0.06, 1.38]} radius={0.03} smoothness={4} position={[-0.5, 1.505, 0]}>
        {paint}
      </RoundedBox>
      {/* B pillars */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[-0.42, 1.22, side * 0.765]} rotation-z={0.08}>
          <boxGeometry args={[0.11, 0.42, 0.03]} />
          <meshStandardMaterial color="#05070b" roughness={0.3} metalness={0.4} />
        </mesh>
      ))}
      {/* Chrome window line */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[-0.45, 1.03, side * 0.775]}>
          <boxGeometry args={[2.85, 0.018, 0.012]} />
          <meshStandardMaterial color="#cfd5dd" metalness={1} roughness={0.15} />
        </mesh>
      ))}
      {/* Lower sill */}
      {[1, -1].map((side) => (
        <mesh key={side} position={[0, 0.3, side * (W - 0.01)]}>
          <boxGeometry args={[2.0, 0.07, 0.02]} />
          <meshStandardMaterial color="#0a0c10" roughness={0.6} />
        </mesh>
      ))}
      {/* Door shut lines */}
      {[0.38, -0.42, -1.35].map((x) =>
        [1, -1].map((side) => (
          <mesh key={`${x}${side}`} position={[x, 0.66, side * (W - 0.005)]}>
            <boxGeometry args={[0.008, 0.62, 0.006]} />
            <meshStandardMaterial color="#04060a" roughness={1} />
          </mesh>
        )),
      )}
      {/* Door handles */}
      {[0.12, -0.75].map((x) =>
        [1, -1].map((side) => (
          <mesh key={`h${x}${side}`} position={[x, 0.86, side * (W + 0.002)]}>
            <boxGeometry args={[0.16, 0.025, 0.012]} />
            <meshStandardMaterial color="#c8ced6" metalness={1} roughness={0.2} />
          </mesh>
        )),
      )}
      {/* Mirrors */}
      {[1, -1].map((side) => (
        <group key={side} position={[0.78, 1.05, side * 0.93]}>
          <RoundedBox args={[0.2, 0.12, 0.16]} radius={0.04} smoothness={3}>
            {paint}
          </RoundedBox>
        </group>
      ))}
      {/* Grille */}
      <mesh position={[2.52, 0.5, 0]}>
        <boxGeometry args={[0.04, 0.17, 1.2]} />
        <meshStandardMaterial color="#07090c" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[2.545, 0.5, 0]}>
        <boxGeometry args={[0.01, 0.012, 1.18]} />
        <meshStandardMaterial color="#c9cfd8" metalness={1} roughness={0.15} />
      </mesh>
      {/* Headlights: slim LED strips */}
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh position={[2.46, 0.72, side * 0.68]} rotation-y={side * -0.32}>
            <boxGeometry args={[0.04, 0.035, 0.44]} />
            <meshBasicMaterial color={new THREE.Color("#f2f6ff").multiplyScalar(3)} toneMapped={false} />
          </mesh>
          <sprite position={[2.6, 0.72, side * 0.7]} scale={[1.8, 1.1, 1]}>
            <spriteMaterial map={halo} transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      ))}
      {/* Tail lights: full-width light bar */}
      <mesh position={[-2.52, 0.86, 0]}>
        <boxGeometry args={[0.03, 0.045, 1.66]} />
        <meshBasicMaterial color={new THREE.Color("#ff2a2a").multiplyScalar(2.2)} toneMapped={false} />
      </mesh>
      {[1, -1].map((side) => (
        <sprite key={side} position={[-2.62, 0.86, side * 0.78]} scale={[0.9, 0.5, 1]}>
          <spriteMaterial map={redHalo} transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
      {/* Illuminated roof sign */}
      <group position={[-0.42, 1.62, 0]}>
        <RoundedBox args={[0.2, 0.17, 0.66]} radius={0.04} smoothness={3}>
          <meshStandardMaterial color="#1b1408" roughness={0.4} />
        </RoundedBox>
        {[1, -1].map((side) => (
          <mesh key={side} position={[side * 0.102, 0, 0]} rotation-y={side * (Math.PI / 2)}>
            <planeGeometry args={[0.6, 0.13]} />
            <meshBasicMaterial map={sign} toneMapped={false} color={new THREE.Color(1.6, 1.6, 1.6)} />
          </mesh>
        ))}
        <sprite scale={[1.6, 0.9, 1]}>
          <spriteMaterial map={amberHalo} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
        <pointLight color="#ffb24d" intensity={1.6} distance={3.2} decay={2} position={[0, 0.25, 0]} />
      </group>
      {/* Wheels */}
      <Wheel position={[WHEELBASE, WHEEL_R, BODY_W / 2 + 0.02]} />
      <Wheel position={[-WHEELBASE, WHEEL_R, BODY_W / 2 + 0.02]} />
      <Wheel position={[WHEELBASE, WHEEL_R, -BODY_W / 2 - 0.02]} mirrored />
      <Wheel position={[-WHEELBASE, WHEEL_R, -BODY_W / 2 - 0.02]} mirrored />
      {/* Headlamp beams onto the wet road */}
      <primitive object={headlightTarget} />
      {[1, -1].map((side) => (
        <spotLight
          key={side}
          position={[2.5, 0.72, side * 0.68]}
          target={headlightTarget}
          color="#e9f0ff"
          intensity={38}
          distance={34}
          angle={0.42}
          penumbra={0.75}
          decay={1.6}
        />
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.014, 0]} renderOrder={1}>
        <planeGeometry args={[6.4, 3.0]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} color="#000000" />
      </mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Camera: slow cinematic drift, entrance move and pointer parallax
 * ────────────────────────────────────────────────────────────────────────── */

function CameraRig({ animate, onReady }: { animate: boolean; onReady?: () => void }) {
  const { camera, size } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const t0 = useRef<number | null>(null);
  const readyFired = useRef(false);
  const target = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    if (!animate) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [animate]);

  useFrame(({ clock }, dt) => {
    const cam = camera as THREE.PerspectiveCamera;
    const portrait = size.width / size.height < 0.9;
    const now = clock.elapsedTime;
    if (t0.current === null) t0.current = now;
    const e = animate ? Math.min((now - t0.current) / 3.4, 1) : 1;
    const ease = 1 - Math.pow(1 - e, 4);

    const k = 1 - Math.exp(-dt * 2.2);
    smooth.current.x += (pointer.current.x - smooth.current.x) * k;
    smooth.current.y += (pointer.current.y - smooth.current.y) * k;

    const drift = animate ? Math.sin(now * 0.12) * 0.09 : 0;
    const az = THREE.MathUtils.lerp(1.1, 0.74, ease) + drift + smooth.current.x * 0.06;
    const el = THREE.MathUtils.lerp(0.05, portrait ? 0.15 : 0.12, ease) + smooth.current.y * -0.025;
    const radius = THREE.MathUtils.lerp(portrait ? 20 : 16, portrait ? 14.5 : 11.4, ease);

    target.set(-0.35, portrait ? 0.95 : 0.7, 0);
    cam.position.set(
      target.x + Math.cos(az) * Math.cos(el) * radius,
      target.y + Math.sin(el) * radius + 0.35,
      target.z + Math.sin(az) * Math.cos(el) * radius,
    );
    cam.lookAt(target);

    // Shift the frame so the car sits to the right of the headline on wide screens.
    const offset = portrait ? 0 : THREE.MathUtils.clamp((size.width / size.height - 1) * -7.5, -9, 0);
    cam.filmOffset = offset;
    // On portrait screens, push the scene down so the car sits below the headline.
    if (portrait) cam.setViewOffset(size.width, size.height, 0, -size.height * 0.2, size.width, size.height);
    else if (cam.view) cam.clearViewOffset();
    cam.fov = portrait ? 44 : 30;
    cam.updateProjectionMatrix();

    if (!readyFired.current && now - (t0.current ?? 0) > 0.15) {
      readyFired.current = true;
      onReady?.();
    }
  });
  return null;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Scene
 * ────────────────────────────────────────────────────────────────────────── */

function Scene({ quality, animate, onReady }: Omit<Props, "active">) {
  const { scene, gl } = useThree();
  useEffect(() => {
    scene.fog = new THREE.Fog("#232c3d", 60, 620);
    gl.toneMappingExposure = 0.95;
  }, [scene, gl]);

  return (
    <>
      <Sky animate={animate} />
      <hemisphereLight args={["#5c6f92", "#120f0c", 0.55]} />
      {/* Low warm sun behind and to the left: rim light on the car */}
      <directionalLight color="#ffb27a" intensity={1.1} position={[SUN_DIR.x * 50, 6, SUN_DIR.z * 50]} />
      {/* Cool fill from the camera side */}
      <directionalLight color="#8aa6d6" intensity={0.6} position={[20, 12, 18]} />

      <Environment resolution={quality === "high" ? 256 : 128} frames={1}>
        <color attach="background" args={["#0b1426"]} />
        {/* Warm horizon strip: the sunset reflected along the bodywork */}
        <Lightformer form="rect" intensity={3.2} color="#ffb070" position={[-12, 1.5, -26]} scale={[60, 3.5, 1]} />
        <Lightformer form="rect" intensity={1.3} color="#ff8a4a" position={[-30, 0.5, -10]} rotation-y={Math.PI / 2} scale={[40, 2, 1]} />
        {/* Cool sky dome overhead */}
        <Lightformer form="rect" intensity={0.9} color="#5a78a8" position={[0, 18, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} />
        {/* Long soft highlight for crisp clearcoat lines */}
        <Lightformer form="rect" intensity={2.6} color="#dfe8ff" position={[10, 5, 12]} rotation-y={-Math.PI / 4} scale={[22, 0.8, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#9fb6dd" position={[14, 2, 2]} rotation-y={-Math.PI / 2} scale={[30, 4, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#cfdcf5" position={[0, 1.4, 16]} rotation-y={Math.PI} scale={[40, 0.7, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffcf9a" position={[0, 5, 16]} rotation-y={Math.PI} scale={[40, 1.4, 1]} />
        <Lightformer form="ring" intensity={1.2} color="#ffc98a" position={[6, 3, -8]} scale={3} />
      </Environment>

      <Sea animate={animate} />
      <Headlands animate={animate} />
      <Land />
      <Road quality={quality} />
      <MarkerPosts />
      <group position={[0, 0, 0.9]} rotation-y={0.03}>
        <Vehicle quality={quality} />
      </group>
      <CameraRig animate={animate} onReady={onReady} />
    </>
  );
}

export default function HeroScene({ quality, animate, active, onReady, posterMode }: Props) {
  return (
    <Canvas
      dpr={quality === "high" ? [1, 1.75] : [1, 1.4]}
      frameloop={active ? (animate ? "always" : "demand") : "never"}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        preserveDrawingBuffer: !!posterMode,
      }}
      camera={{ position: [10, 2, 8], fov: 30, near: 0.1, far: 2000 }}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0 }}
    >
      <Scene quality={quality} animate={animate} onReady={onReady} posterMode={posterMode} />
    </Canvas>
  );
}
