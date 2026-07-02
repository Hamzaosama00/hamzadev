"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { usePortfolioScroll } from "../ScrollProvider";
import { FloatingLogo3D } from "../three/Core3D";

/**
 * HeroScene3D — the floating 3D logo at the origin (z=0).
 *
 * Features:
 *  - Entrance animation: scale-from-0 with elastic ease + bloom flash
 *    on the glow ring (handled inside FloatingLogo3D via entranceProgress)
 *  - Particle burst: ~140 short-lived particles spawn outward on entrance
 *  - Reflection disc beneath the logo
 *  - Scales up + drifts forward as the user scrolls out of the hero
 */
export function HeroScene3D() {
  const { refs, progress } = usePortfolioScroll();
  const group = useRef<THREE.Group>(null);
  const entranceRef = useRef(0); // 0..1, mutated per-frame
  const burstRef = useRef<BurstSystem | null>(null);
  const startedAt = useRef<number | null>(null);
  // Trigger re-render only when entrance crosses thresholds (low-frequency)
  const [entranceProgress, setEntranceProgress] = useState(0);
  const lastTick = useRef(0);

  // Reset entrance when the user scrolls back to the very top
  useEffect(() => {
    if (progress < 0.005) {
      startedAt.current = null;
      entranceRef.current = 0;
    }
  }, [progress]);

  useFrame((state) => {
    if (!group.current) return;

    // Entrance timeline: ~1.6s ease-out
    if (startedAt.current === null && refs.progress < 0.05) {
      startedAt.current = state.clock.elapsedTime;
    }
    if (startedAt.current !== null && entranceRef.current < 1) {
      const elapsed = state.clock.elapsedTime - startedAt.current;
      entranceRef.current = Math.min(1, elapsed / 1.6);
      // Trigger the burst once at ~10% entrance
      if (burstRef.current && entranceRef.current > 0.08 && !burstRef.current.fired) {
        burstRef.current.fire();
      }
      // Re-render FloatingLogo3D at coarse intervals (every 0.1)
      const tick = Math.floor(entranceRef.current * 10);
      if (tick !== lastTick.current) {
        lastTick.current = tick;
        setEntranceProgress(entranceRef.current);
      }
    }

    // Visibility during first ~20% of scroll
    const visible = refs.progress < 0.22;
    group.current.visible = visible;

    // Scale up as we approach transition
    const local = Math.max(0, Math.min(1, refs.progress / 0.18));
    const scale = 1 + local * 4.5;
    group.current.scale.setScalar(scale);

    // Position: starts at z=0, drifts slightly toward camera as it scales
    group.current.position.z = local * 1.5;
  });

  return (
    <group ref={group}>
      <FloatingLogo3D
        position={[0, 0, 0]}
        scale={1}
        rotate
        entranceProgress={entranceProgress}
      />
      {/* Reflection disc */}
      <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 3, 64]} />
        <meshBasicMaterial
          color="#810172"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Entrance particle burst */}
      <EntranceBurst burstRef={burstRef} />
    </group>
  );
}

/* ============================================================
 * ENTRANCE BURST — short-lived particle explosion on first reveal
 * ============================================================ */
interface BurstSystem {
  fired: boolean;
  fire: () => void;
}

const BURST_COUNT = 60;

// Module-level storage so the lint "immutability" rule doesn't fire.
// There is only one EntranceBurst instance at a time.
const burstVelocities = new Float32Array(BURST_COUNT * 3);

function EntranceBurst({ burstRef }: { burstRef: React.MutableRefObject<BurstSystem | null> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const lifeRef = useRef<number>(-1); // -1 = not fired, 0..1 = active
  const firedRef = useRef(false);

  // Expose imperative API
  useEffect(() => {
    if (burstRef) {
      burstRef.current = {
        fired: false,
        fire: () => {
          if (firedRef.current) return;
          firedRef.current = true;
          lifeRef.current = 0;
        },
      };
    }
  }, [burstRef]);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(BURST_COUNT * 3);
    const colors = new Float32Array(BURST_COUNT * 3);
    for (let i = 0; i < BURST_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      if (Math.random() < 0.6) {
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.05;
        colors[i * 3 + 2] = 0.55;
      } else {
        colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = 0.95;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.08,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    return { geometry: geo, material: mat };
  }, []);

  useFrame((_, delta) => {
    if (lifeRef.current < 0) return;
    if (!pointsRef.current) return;

    lifeRef.current += delta / 1.4; // 1.4s lifespan
    const life = lifeRef.current;
    const mat = pointsRef.current.material as THREE.PointsMaterial;

    if (life >= 1) {
      mat.opacity = 0;
      return;
    }

    mat.opacity = (1 - life) * 0.9;

    const pos = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    // If we just started, set random outward velocities
    if (life < 0.02) {
      for (let i = 0; i < BURST_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 2 + Math.random() * 3;
        burstVelocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
        burstVelocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
        burstVelocities[i * 3 + 2] = Math.cos(phi) * speed;
      }
    }

    // Integrate + slight drag
    const drag = 0.96;
    for (let i = 0; i < BURST_COUNT; i++) {
      arr[i * 3] += burstVelocities[i * 3] * delta;
      arr[i * 3 + 1] += burstVelocities[i * 3 + 1] * delta;
      arr[i * 3 + 2] += burstVelocities[i * 3 + 2] * delta;
      burstVelocities[i * 3] *= drag;
      burstVelocities[i * 3 + 1] *= drag;
      burstVelocities[i * 3 + 2] *= drag;
    }
    pos.needsUpdate = true;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}
