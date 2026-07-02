"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { usePortfolioScroll, SECTION_COUNT } from "../ScrollProvider";

/* ============================================================
 * CINEMATIC CAMERA RIG
 * ============================================================
 * - 6 anchors along Z; smoothstep between them
 * - Banks (rolls) into "turns" (anchor deltas in X/Y)
 * - Handheld noise (tiny per-frame jitter)
 * - Dolly arcs on Y between scenes (not straight-line)
 * - Velocity-aware lookahead on the lookAt target
 * - Mouse parallax offset
 */

const ANCHORS: [number, number, number][] = [
  [0, 0.2, 8],     // Hero
  [0, 0.5, 0],     // About
  [0, -0.2, -10],  // Skills
  [0, 0.4, -22],   // Projects
  [0, -0.3, -36],  // Learning
  [0, 0.3, -50],   // Contact
];

const LOOK_AT: [number, number, number][] = [
  [0, 0, 0],
  [0, 0, -2.5],
  [0, 0, -12],
  [0, 0, -26],
  [0, -0.5, -38],
  [0, 0, -52],
];

// Per-scene color temperature — interpolated fog + ambient tint
const SCENE_TINT: { fog: string; light: string; ambient: string }[] = [
  { fog: "#0a0010", light: "#810172", ambient: "#2a0828" }, // Hero — magenta
  { fog: "#080a14", light: "#5a3a8a", ambient: "#1a1a3a" }, // About — cool violet
  { fog: "#100014", light: "#810172", ambient: "#280838" }, // Skills — saturated magenta
  { fog: "#05050a", light: "#6040a0", ambient: "#15152a" }, // Projects — deep violet
  { fog: "#0a0010", light: "#810172", ambient: "#280838" }, // Learning — magenta
  { fog: "#10000a", light: "#ff3aaa", ambient: "#3a0820" }, // Contact — hot pink accent
];

export function CameraRig() {
  const { camera, scene } = useThree();
  const { refs } = usePortfolioScroll();

  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const tmpPos = useRef(new THREE.Vector3());
  const tmpLook = useRef(new THREE.Vector3());
  const tmpColor = useRef(new THREE.Color());
  const tmpColorB = useRef(new THREE.Color()); // pre-allocated to avoid per-frame alloc
  const fogColor = useRef(new THREE.Color(SCENE_TINT[0].fog));
  const lightColor = useRef(new THREE.Color(SCENE_TINT[0].light));
  const ambientColor = useRef(new THREE.Color(SCENE_TINT[0].ambient));
  const keyLightRef = useRef<THREE.PointLight | null>(null);
  const ambientRef = useRef<THREE.AmbientLight | null>(null);

  useFrame((state, delta) => {
    const t = refs.progress * (SECTION_COUNT - 1); // 0..5
    const i = Math.floor(t);
    const f = t - i;
    const i0 = Math.max(0, Math.min(SECTION_COUNT - 1, i));
    const i1 = Math.max(0, Math.min(SECTION_COUNT - 1, i + 1));

    // smoothstep
    const s = f * f * (3 - 2 * f);

    const a = ANCHORS[i0];
    const b = ANCHORS[i1];
    const la = LOOK_AT[i0];
    const lb = LOOK_AT[i1];

    // Dolly arc: add a sine-based Y bump during transitions
    const arc = Math.sin(f * Math.PI) * 0.35;

    // Bank into the turn: roll proportional to the X delta between anchors
    const dxTurn = b[0] - a[0];
    const dyTurn = b[1] - a[1];
    const targetRoll = -dxTurn * 0.15 + dyTurn * 0.05;

    // Handheld noise: single octave (cheaper than 2-octave, still reads "filmed")
    const time = state.clock.elapsedTime;
    const handheldX = Math.sin(time * 1.7) * 0.01;
    const handheldY = Math.cos(time * 1.3) * 0.01;
    const handheldZ = Math.sin(time * 0.9) * 0.006;

    // Velocity-aware lookahead: when scrolling fast, push the lookAt forward
    const v = Math.min(2, Math.abs(refs.smoothedVelocity));
    const lookahead = v * 0.6;

    tmpPos.current.set(
      a[0] + (b[0] - a[0]) * s + refs.mouse.x * 0.55 + handheldX,
      a[1] + (b[1] - a[1]) * s + arc + refs.mouse.y * 0.35 + handheldY,
      a[2] + (b[2] - a[2]) * s
    );

    tmpLook.current.set(
      la[0] + (lb[0] - la[0]) * s,
      la[1] + (lb[1] - la[1]) * s,
      la[2] + (lb[2] - la[2]) * s - lookahead
    );

    camera.position.lerp(tmpPos.current, 0.16);
    lookAtTarget.current.lerp(tmpLook.current, 0.18);
    camera.lookAt(lookAtTarget.current);

    // Apply roll (bank) on top of lookAt
    camera.rotation.z = targetRoll * 0.5 + handheldZ;

    // === Per-scene color temperature (pre-allocated colors, no per-frame alloc) ===
    const tintA = SCENE_TINT[i0];
    const tintB = SCENE_TINT[i1];
    tmpColor.current.set(tintA.fog);
    tmpColorB.current.set(tintB.fog);
    tmpColor.current.lerp(tmpColorB.current, s);
    fogColor.current.lerp(tmpColor.current, 0.05);

    tmpColor.current.set(tintA.light);
    tmpColorB.current.set(tintB.light);
    tmpColor.current.lerp(tmpColorB.current, s);
    lightColor.current.lerp(tmpColor.current, 0.05);

    tmpColor.current.set(tintA.ambient);
    tmpColorB.current.set(tintB.ambient);
    tmpColor.current.lerp(tmpColorB.current, s);
    ambientColor.current.lerp(tmpColor.current, 0.05);

    // Apply to scene fog if present
    if (scene.fog && (scene.fog as THREE.FogExp2).color) {
      (scene.fog as THREE.FogExp2).color.copy(fogColor.current);
      (scene.fog as THREE.FogExp2).density = 0.025 + Math.abs(refs.smoothedVelocity) * 0.01;
    }

    if (keyLightRef.current) {
      keyLightRef.current.color.copy(lightColor.current);
    }
    if (ambientRef.current) {
      ambientRef.current.color.copy(ambientColor.current);
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.32} color={SCENE_TINT[0].ambient} />
      <directionalLight position={[5, 6, 4]} intensity={0.35} color="#ffffff" />
      <pointLight
        ref={keyLightRef}
        position={[0, 0, -5]}
        intensity={2.2}
        color={SCENE_TINT[0].light}
        distance={32}
        decay={1.6}
      />
    </>
  );
}

/* ============================================================
 * PARTICLE FIELD v2
 * ============================================================
 * Three parallax layers (near / mid / far) with different scroll
 * parallax speeds, per-particle twinkle (opacity sine), brownian
 * drift, and velocity-driven streaks (elongate when scrolling fast).
 *
 * Uses a custom ShaderMaterial for full control over per-particle
 * attributes.
 */

interface ParticleFieldProps {
  /** Total particle count, split across 3 layers. */
  count?: number;
}

const PARTICLE_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  attribute float aLayer; // 0 = far, 1 = mid, 2 = near

  uniform float uTime;
  uniform float uVelocity;   // smoothed scroll velocity, signed
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vTwinkle;
  varying float vLayer;

  void main() {
    vColor = aColor;
    vLayer = aLayer;

    // Brownian drift
    vec3 pos = position;
    pos.x += sin(uTime * aSpeed * 0.3 + aPhase * 6.2831) * 0.15;
    pos.y += cos(uTime * aSpeed * 0.4 + aPhase * 6.2831) * 0.12;
    pos.z += sin(uTime * aSpeed * 0.25 + aPhase * 3.14) * 0.1;

    // Parallax: near particles move more with scroll velocity
    pos.z += uVelocity * 4.0 * (aLayer + 0.3);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Velocity streaks: stretch size along Y axis based on |velocity|
    float vel = abs(uVelocity);
    float streak = 1.0 + vel * 3.0 * aLayer;

    gl_PointSize = aSize * uPixelRatio * (320.0 / -mvPosition.z) * streak;

    // Twinkle
    vTwinkle = 0.6 + 0.4 * sin(uTime * aSpeed * 1.5 + aPhase * 6.2831);
  }
`;

const PARTICLE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vTwinkle;
  varying float vLayer;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Soft circular falloff with hot core
    float alpha = smoothstep(0.5, 0.0, dist);
    float core = smoothstep(0.25, 0.0, dist) * 0.6;
    vec3 col = vColor * (0.9 + core);
    // Far layer dimmer
    col *= 0.6 + 0.4 * vLayer;

    gl_FragColor = vec4(col, alpha * vTwinkle * (0.55 + 0.45 * vLayer));
  }
`;

export function ParticleField({ count = 1200 }: ParticleFieldProps) {
  const { refs } = usePortfolioScroll();
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // GPU-tier detection: scale count down on weak devices
  const effectiveCount = useMemo(() => {
    if (typeof window === "undefined") return count;
    const cores = (navigator as any).hardwareConcurrency || 4;
    const mem = (navigator as any).deviceMemory || 4;
    if (cores <= 4 || mem <= 4) return Math.floor(count * 0.55);
    if (cores <= 6) return Math.floor(count * 0.8);
    return count;
  }, [count]);

  const { geometry, uniforms } = useMemo(() => {
    const positions = new Float32Array(effectiveCount * 3);
    const sizes = new Float32Array(effectiveCount);
    const phases = new Float32Array(effectiveCount);
    const speeds = new Float32Array(effectiveCount);
    const colors = new Float32Array(effectiveCount * 3);
    const layers = new Float32Array(effectiveCount);

    // 3 layers: 25% near, 40% mid, 35% far
    for (let i = 0; i < effectiveCount; i++) {
      const layerRoll = Math.random();
      let layer: 0 | 1 | 2;
      let r: number;
      if (layerRoll < 0.25) {
        layer = 2; // near
        r = 4 + Math.random() * 8;
      } else if (layerRoll < 0.65) {
        layer = 1; // mid
        r = 8 + Math.random() * 14;
      } else {
        layer = 0; // far
        r = 14 + Math.random() * 18;
      }

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
      // Z spread across the entire camera path
      positions[i * 3 + 2] = 25 - Math.random() * 90;

      sizes[i] = (layer === 2 ? 0.08 : layer === 1 ? 0.05 : 0.03) + Math.random() * 0.04;
      phases[i] = Math.random();
      speeds[i] = 0.5 + Math.random() * 1.5;

      // Color: near layer gets warmer (more pink), far gets cooler
      if (layer === 2) {
        if (Math.random() < 0.55) {
          colors[i * 3] = 0.7 + Math.random() * 0.3;
          colors[i * 3 + 1] = 0.05;
          colors[i * 3 + 2] = 0.5 + Math.random() * 0.3;
        } else {
          const v = 0.85 + Math.random() * 0.15;
          colors[i * 3] = v;
          colors[i * 3 + 1] = v;
          colors[i * 3 + 2] = v;
        }
      } else if (layer === 1) {
        if (Math.random() < 0.4) {
          colors[i * 3] = 0.5;
          colors[i * 3 + 1] = 0.0;
          colors[i * 3 + 2] = 0.42;
        } else {
          const v = 0.55 + Math.random() * 0.35;
          colors[i * 3] = v;
          colors[i * 3 + 1] = v;
          colors[i * 3 + 2] = v;
        }
      } else {
        // far — mostly cool whites + faint purple
        if (Math.random() < 0.3) {
          colors[i * 3] = 0.35;
          colors[i * 3 + 1] = 0.0;
          colors[i * 3 + 2] = 0.3;
        } else {
          const v = 0.4 + Math.random() * 0.3;
          colors[i * 3] = v;
          colors[i * 3 + 1] = v;
          colors[i * 3 + 2] = v;
        }
      }

      layers[i] = layer;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aLayer", new THREE.BufferAttribute(layers, 1));

    const u = {
      uTime: { value: 0 },
      uVelocity: { value: 0 },
      uPixelRatio: {
        value: typeof window !== "undefined" ? Math.min(1.8, window.devicePixelRatio) : 1,
      },
    };
    return { geometry: geo, uniforms: u };
  }, [effectiveCount]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Lerp velocity for smooth streak transitions
      const current = matRef.current.uniforms.uVelocity.value as number;
      matRef.current.uniforms.uVelocity.value =
        current + (refs.smoothedVelocity - current) * 0.15;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.z = state.clock.elapsedTime * 0.004;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={PARTICLE_VERT}
        fragmentShader={PARTICLE_FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ============================================================
 * SWEEPING SPOTLIGHT
 * ============================================================
 * A spotlight that slowly orbits the camera path, catching the
 * logo / monitors and creating moving highlights. Adds life.
 */
export function SweepingSpotlight({
  radius = 6,
  speed = 0.15,
  color = "#810172",
}: {
  radius?: number;
  speed?: number;
  color?: string;
}) {
  const ref = useRef<THREE.SpotLight>(null);
  const targetRef = useRef<THREE.Object3D>(null);
  const { refs } = usePortfolioScroll();

  useFrame((state) => {
    if (!ref.current || !targetRef.current) return;
    const t = state.clock.elapsedTime * speed;
    // Orbit around the camera's current Z position
    const z = THREE.MathUtils.lerp(
      8, -50,
      refs.progress
    );
    ref.current.position.set(
      Math.cos(t) * radius,
      3 + Math.sin(t * 1.3) * 1.5,
      z + Math.sin(t * 0.5) * 2
    );
    targetRef.current.position.set(0, 0, z - 2);
    ref.current.target = targetRef.current;
    ref.current.target.updateMatrixWorld();
  });

  return (
    <>
      <spotLight
        ref={ref}
        color={color}
        intensity={3.2}
        angle={0.45}
        penumbra={0.7}
        distance={22}
        decay={1.5}
      />
      <object3D ref={targetRef} />
    </>
  );
}

/* ============================================================
 * PULSING VOLUMETRIC GLOW
 * ============================================================
 * A soft sprite-like glow that pulses slowly (≈0.7 Hz) behind a
 * given position. Used to add cinematic "atmosphere" beats.
 */
export function PulsingGlow({
  position = [0, 0, 0] as [number, number, number],
  color = "#810172",
  baseOpacity = 0.35,
  pulseSpeed = 0.7,
  size = 4,
}: {
  position?: [number, number, number];
  color?: string;
  baseOpacity?: number;
  pulseSpeed?: number;
  size?: number;
}) {
  const matRef = useRef<THREE.SpriteMaterial>(null);
  const glowTexture = useGlowTexture();

  useFrame((state) => {
    if (matRef.current) {
      const pulse = 0.7 + 0.3 * Math.sin(state.clock.elapsedTime * pulseSpeed * Math.PI);
      matRef.current.opacity = baseOpacity * pulse;
    }
  });

  // Sprite auto-faces camera — no per-frame lookAt needed (cheaper than mesh)
  return (
    <sprite position={position} scale={[size, size, 1]}>
      <spriteMaterial
        ref={matRef}
        color={color}
        transparent
        opacity={baseOpacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        map={glowTexture}
      />
    </sprite>
  );
}

// Build a soft radial glow texture once
function useGlowTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.3, "rgba(255,255,255,0.6)");
    grad.addColorStop(0.7, "rgba(255,255,255,0.15)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);
}

/* ============================================================
 * FLOATING LOGO 3D
 * ============================================================
 * Faceted H mark with extruded bevel, wireframe hex shell, and
 * glow ring. Supports an "entrance" animation (scale-from-0 with
 * a brief bloom-flash) controlled by `entranceProgress` 0..1.
 */
export function FloatingLogo3D({
  position = [0, 0, 0] as [number, number, number],
  scale = 1,
  rotate = true,
  entranceProgress = 1,
}: {
  position?: [number, number, number];
  scale?: number;
  rotate?: boolean;
  entranceProgress?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (rotate) {
      group.current.rotation.y += delta * 0.25;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
    group.current.position.y =
      position[1] + Math.sin(state.clock.elapsedTime * 0.6) * 0.15;

    // Entrance: scale from 0 with elastic ease + glow flash
    const ep = entranceProgress;
    const eased = ep === 1 ? 1 : 1 - Math.pow(2, -10 * ep) * Math.cos(ep * Math.PI * 2.5);
    group.current.scale.setScalar(scale * eased);

    if (glowRef.current) {
      const flash = ep < 0.7 ? (1 - ep / 0.7) * 0.6 : 0;
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.18 + flash;
    }
  });

  return (
    <group ref={group} position={position}>
      {/* Outer wireframe hex */}
      <mesh>
        <torusGeometry args={[1.8, 0.012, 12, 6]} />
        <meshBasicMaterial color="#810172" transparent opacity={0.7} />
      </mesh>
      {/* Inner solid hex with edges */}
      <mesh>
        <cylinderGeometry args={[1.3, 1.3, 0.15, 6, 1]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.85}
          roughness={0.18}
          emissive="#810172"
          emissiveIntensity={0.45}
        />
      </mesh>
      {/* H mark on top */}
      <mesh position={[0, 0.09, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <extrudeGeometry
          args={[
            buildHShape(),
            {
              depth: 0.05,
              bevelEnabled: true,
              bevelThickness: 0.02,
              bevelSize: 0.02,
              bevelSegments: 2,
            },
          ]}
        />
        <meshStandardMaterial
          color="#F2F2F2"
          metalness={0.6}
          roughness={0.25}
          emissive="#810172"
          emissiveIntensity={0.2}
        />
      </mesh>
      {/* Glow ring */}
      <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.0, 2.4, 64]} />
        <meshBasicMaterial
          color="#810172"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function buildHShape(): THREE.Shape {
  const s = new THREE.Shape();
  const w = 0.15;
  const h = 1.0;
  const wd = 0.7;
  s.moveTo(-wd - w / 2, -h / 2);
  s.lineTo(-wd + w / 2, -h / 2);
  s.lineTo(-wd + w / 2, -w / 2);
  s.lineTo(wd - w / 2, -w / 2);
  s.lineTo(wd - w / 2, -h / 2);
  s.lineTo(wd + w / 2, -h / 2);
  s.lineTo(wd + w / 2, h / 2);
  s.lineTo(wd - w / 2, h / 2);
  s.lineTo(wd - w / 2, w / 2);
  s.lineTo(-wd + w / 2, w / 2);
  s.lineTo(-wd + w / 2, h / 2);
  s.lineTo(-wd - w / 2, h / 2);
  s.closePath();
  return s;
}

/* ============================================================
 * SCENE FOG + BACKGROUND
 * ============================================================ */
export function SceneFog() {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fogExp2 attach="fog" args={["#0a0010", 0.025]} />
    </>
  );
}

/* ============================================================
 * PURPLE AURA — soft bloom disc behind scenes
 * ============================================================ */
export function PurpleAura({
  position = [0, 0, -55],
  color = "#810172",
  intensity = 0.7,
}: {
  position?: [number, number, number];
  color?: string;
  intensity?: number;
}) {
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: intensity * 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [color, intensity]
  );
  return (
    <mesh position={position} material={mat}>
      <circleGeometry args={[20, 64]} />
    </mesh>
  );
}
