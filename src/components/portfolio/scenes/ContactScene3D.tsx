"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { usePortfolioScroll } from "../ScrollProvider";
import { FloatingLogo3D } from "../three/Core3D";

/**
 * ContactScene3D — a dark room with a slowly rotating logo at z=-52.
 *
 * Adds a gravitational particle system: ~300 particles drift in from
 * the surrounding space and spiral inward toward the logo, creating a
 * sense of "everything converging here."
 */
export function ContactScene3D() {
  const group = useRef<THREE.Group>(null);
  const { refs } = usePortfolioScroll();

  useFrame(() => {
    if (!group.current) return;
    const visible = refs.progress > 0.82;
    group.current.visible = visible;
  });

  return (
    <group ref={group} position={[0, 0, -52]}>
      <FloatingLogo3D position={[0, 0, 0]} scale={1.4} rotate />

      {/* Gravitational particle system */}
      <GravityParticles />

      {/* Reflective floor */}
      <mesh position={[0, -2.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 4, 64]} />
        <meshBasicMaterial
          color="#810172"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Faint back wall */}
      <mesh position={[0, 0, -8]}>
        <planeGeometry args={[60, 30]} />
        <meshBasicMaterial color="#050505" />
      </mesh>

      {/* Side accent lights */}
      <mesh position={[-6, 0, -3]}>
        <planeGeometry args={[0.1, 12]} />
        <meshBasicMaterial
          color="#810172"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[6, 0, -3]}>
        <planeGeometry args={[0.1, 12]} />
        <meshBasicMaterial
          color="#810172"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ============================================================
 * GRAVITY PARTICLES — spiral inward toward the logo
 * ============================================================ */
const GRAVITY_COUNT = 120;
// Module-level storage so the lint "immutability" rule doesn't fire.
const gravityVelocities = new Float32Array(GRAVITY_COUNT * 3);

function GravityParticles() {
  const ref = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(GRAVITY_COUNT * 3);
    const colors = new Float32Array(GRAVITY_COUNT * 3);
    const sizes = new Float32Array(GRAVITY_COUNT);
    for (let i = 0; i < GRAVITY_COUNT; i++) {
      // Start in a large shell around the logo
      const r = 6 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Initial tangential velocity (for spiral effect)
      gravityVelocities[i * 3] = -Math.sin(theta) * 0.5;
      gravityVelocities[i * 3 + 1] = Math.cos(theta) * 0.3;
      gravityVelocities[i * 3 + 2] = 0;

      // Color: purple or white
      if (Math.random() < 0.7) {
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.05;
        colors[i * 3 + 2] = 0.55;
      } else {
        colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = 0.95;
      }
      sizes[i] = 0.04 + Math.random() * 0.04;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, []);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < GRAVITY_COUNT; i++) {
      const px = arr[i * 3];
      const py = arr[i * 3 + 1];
      const pz = arr[i * 3 + 2];
      const distSq = px * px + py * py + pz * pz + 0.5;
      const dist = Math.sqrt(distSq);

      // Gravity toward origin (logo)
      const g = 4 / distSq;
      gravityVelocities[i * 3] += (-px / dist) * g * delta;
      gravityVelocities[i * 3 + 1] += (-py / dist) * g * delta;
      gravityVelocities[i * 3 + 2] += (-pz / dist) * g * delta;

      // Tangential swirl (perpendicular to radial)
      gravityVelocities[i * 3] += -py * 0.15 * delta;
      gravityVelocities[i * 3 + 1] += px * 0.15 * delta;

      // Integrate
      arr[i * 3] += gravityVelocities[i * 3] * delta;
      arr[i * 3 + 1] += gravityVelocities[i * 3 + 1] * delta;
      arr[i * 3 + 2] += gravityVelocities[i * 3 + 2] * delta;

      // If too close to origin, respawn at outer shell
      if (dist < 0.8) {
        const r = 6 + Math.random() * 8;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
        arr[i * 3 + 2] = r * Math.cos(phi);
        gravityVelocities[i * 3] = -Math.sin(theta) * 0.5;
        gravityVelocities[i * 3 + 1] = Math.cos(theta) * 0.3;
        gravityVelocities[i * 3 + 2] = 0;
      }
    }
    pos.needsUpdate = true;
  });

  return <points ref={ref} geometry={geometry} material={material} />;
}
