"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { usePortfolioScroll } from "../ScrollProvider";

/**
 * LearningScene3D — a vertical sequence of floating milestone nodes
 * (icosahedrons) along z=-36..-44, connected by a thin glowing line.
 *
 * Completed milestones are solid purple; future goals are wireframe /
 * translucent and pulse slowly to look "in progress".
 */

interface Milestone {
  z: number;
  y: number;
  label: string;
  future?: boolean;
}

const MILESTONES: Milestone[] = [
  { z: -36, y: 1.4, label: "2026 · Started Shopify" },
  { z: -37, y: 0.7, label: "Built Portfolio" },
  { z: -38, y: 0, label: "Created Client Websites" },
  { z: -39, y: -0.7, label: "Learning JavaScript" },
  { z: -40, y: -1.4, label: "Building SaaS" },
  { z: -41, y: -2.1, label: "Target · Remote Developer", future: true },
  { z: -42, y: -2.8, label: "Future · SE Career in Japan", future: true },
];

export function LearningScene3D() {
  const group = useRef<THREE.Group>(null);
  const { progress } = usePortfolioScroll();

  useFrame((state) => {
    if (!group.current) return;
    const visible = progress > 0.66 && progress < 0.88;
    group.current.visible = visible;
  });

  // Build connecting line geometry
  const lineGeo = useRef<THREE.BufferGeometry>(null);
  const points = MILESTONES.map(
    (m) => new THREE.Vector3(0, m.y, m.z)
  );
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group ref={group}>
      {/* Connecting line */}
      <line>
        <primitive object={lineGeometry} attach="geometry" />
        <lineBasicMaterial
          color="#810172"
          transparent
          opacity={0.5}
          linewidth={1}
        />
      </line>

      {MILESTONES.map((m, i) => (
        <MilestoneNode key={i} {...m} index={i} />
      ))}
    </group>
  );
}

function MilestoneNode({
  z,
  y,
  future,
  index,
}: MilestoneNode & { index: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.3 + index;
    ref.current.position.y = y + Math.sin(state.clock.elapsedTime * 0.8 + index) * 0.08;
    if (future) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5 + index) * 0.08;
      ref.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={ref} position={[0, y, z]}>
      {future ? (
        <>
          {/* Wireframe, pulsing */}
          <mesh>
            <icosahedronGeometry args={[0.35, 1]} />
            <meshBasicMaterial color="#810172" wireframe transparent opacity={0.6} />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.5, 0]} />
            <meshBasicMaterial color="#810172" wireframe transparent opacity={0.2} />
          </mesh>
        </>
      ) : (
        <>
          {/* Solid */}
          <mesh>
            <icosahedronGeometry args={[0.32, 1]} />
            <meshStandardMaterial
              color="#0a0a0a"
              metalness={0.85}
              roughness={0.15}
              emissive="#810172"
              emissiveIntensity={0.7}
            />
          </mesh>
          {/* Glow */}
          <mesh>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshBasicMaterial
              color="#810172"
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
