"use client";

import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { usePortfolioScroll } from "../ScrollProvider";

/**
 * AboutScene3D — a "futuristic glass room": a corridor of glass panels
 * with a real reflective floor (MeshReflectorMaterial) and a faint
 * ceiling light strip. The camera flies through this corridor during
 * the About section.
 *
 * Panel highlights are pure-emissive so they read even with no lights.
 */
export function AboutScene3D({ enableReflector = true }: { enableReflector?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { refs } = usePortfolioScroll();

  useFrame((state) => {
    if (!group.current) return;
    const visible = refs.progress > 0.08 && refs.progress < 0.36;
    group.current.visible = visible;
    if (!visible) return;

    // Subtle pulse
    const t = performance.now() * 0.0008;
    group.current.rotation.y = Math.sin(t) * 0.03;
  });

  return (
    <group ref={group}>
      {/* Reflective floor (only on high-tier devices) OR simple dark floor */}
      {enableReflector ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, -2]}>
          <planeGeometry args={[40, 40]} />
          <MeshReflectorMaterial
            blur={[200, 50]}
            resolution={128}
            mixBlur={1.0}
            mixStrength={20}
            roughness={0.9}
            depthScale={1.0}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#05050a"
            metalness={0.6}
            mirror={0.4}
          />
        </mesh>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, -2]}>
          <planeGeometry args={[40, 40]} />
          <meshBasicMaterial color="#05050a" />
        </mesh>
      )}

      {/* Floor grid overlay (on top of reflector) */}
      <gridHelper
        args={[40, 40, "#810172", "#1a1a1a"]}
        position={[0, -2.99, -2]}
      >
        <meshBasicMaterial transparent opacity={0.15} attach="material" />
      </gridHelper>

      {/* Left + Right walls of glass panels */}
      <GlassWall z={-2} side={-1} />
      <GlassWall z={-2} side={1} />

      {/* Ceiling light strip */}
      <mesh position={[0, 4, -2]}>
        <planeGeometry args={[20, 0.2]} />
        <meshBasicMaterial
          color="#810172"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function GlassWall({ z, side }: { z: number; side: -1 | 1 }) {
  const panels = useMemo(
    () =>
      [-5, -2, 1, 4].map((dz) => ({
        z: z + dz,
        height: 5 + Math.random() * 0.6,
      })),
    [z]
  );

  return (
    <group>
      {panels.map((p, i) => (
        <mesh
          key={i}
          position={[side * 5, 0.2, p.z]}
          rotation={[0, side > 0 ? Math.PI : 0, 0]}
        >
          <planeGeometry args={[2.2, p.height]} />
          {/* meshStandardMaterial (NOT meshPhysicalMaterial) — transmission
              triggers an extra scene render per panel, which is 8x the cost
              here. We fake the glass look with low opacity + emissive tint. */}
          <meshStandardMaterial
            color="#0a0a0a"
            metalness={0.6}
            roughness={0.15}
            transparent
            opacity={0.35}
            side={THREE.DoubleSide}
            emissive="#810172"
            emissiveIntensity={0.18}
          />
        </mesh>
      ))}
      {/* Vertical accent strips */}
      {panels.map((p, i) => (
        <mesh key={`strip-${i}`} position={[side * 4.96, 0.2, p.z]}>
          <planeGeometry args={[0.04, p.height]} />
          <meshBasicMaterial
            color="#810172"
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
