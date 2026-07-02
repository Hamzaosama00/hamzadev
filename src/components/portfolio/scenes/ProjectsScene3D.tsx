"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { usePortfolioScroll } from "../ScrollProvider";

/**
 * ProjectsScene3D — floating futuristic monitors arranged along Z.
 *
 * Each monitor = thin box frame + glowing screen plane showing
 * animated content:
 *   - Completed: mock UI grid (rectangles) + slow horizontal scanline sweep
 *   - In-progress: dimmer screen + faster vertical scanline sweep +
 *     "BUILDING" stripe across the top
 *
 * Positioned around z=-22..-31.
 */

const MONITORS = [
  { z: -22, completed: true, hue: "#810172" },
  { z: -25.5, completed: true, hue: "#810172" },
  { z: -28.5, completed: false, hue: "#3a3a3a" },
  { z: -31.5, completed: false, hue: "#3a3a3a" },
];

export function ProjectsScene3D() {
  const group = useRef<THREE.Group>(null);
  const { refs } = usePortfolioScroll();

  useFrame((state) => {
    if (!group.current) return;
    const visible = refs.progress > 0.42 && refs.progress < 0.72;
    group.current.visible = visible;
    if (visible) {
      group.current.children.forEach((c, i) => {
        c.position.y = Math.sin(state.clock.elapsedTime * 0.6 + i) * 0.08;
      });
    }
  });

  return (
    <group ref={group}>
      {MONITORS.map((m, i) => (
        <Monitor key={i} z={m.z} index={i} completed={m.completed} hue={m.hue} />
      ))}
    </group>
  );
}

function Monitor({
  z,
  index,
  completed,
  hue,
}: {
  z: number;
  index: number;
  completed: boolean;
  hue: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const scanRef = useRef<THREE.Mesh>(null);
  const sweepRef = useRef<THREE.Mesh>(null);
  const side = index % 2 === 0 ? -1 : 1;

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = side * 0.35 + Math.sin(state.clock.elapsedTime * 0.4 + index) * 0.03;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5 + index * 0.5) * 0.03;

    // Animated scanline (horizontal sweep on completed, vertical on in-progress)
    const t = state.clock.elapsedTime;
    if (scanRef.current) {
      const cycle = completed ? 4.0 : 2.2;
      const phase = (t % cycle) / cycle;
      if (completed) {
        // Horizontal sweep across screen
        scanRef.current.position.x = -1.4 + phase * 2.8;
        scanRef.current.position.y = 0;
      } else {
        // Vertical sweep
        scanRef.current.position.y = -0.8 + phase * 1.6;
        scanRef.current.position.x = 0;
      }
    }
    // Pulse sweep opacity
    if (sweepRef.current) {
      const mat = sweepRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + 0.25 * Math.sin(t * 1.5 + index);
    }
  });

  return (
    <group ref={ref} position={[side * 3.4, 0, z]}>
      {/* Monitor frame */}
      <mesh>
        <boxGeometry args={[3.0, 1.85, 0.06]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Screen background */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[2.84, 1.7]} />
        <meshBasicMaterial color={completed ? "#0d0810" : "#050505"} toneMapped={false} />
      </mesh>

      {/* Animated UI mockup (only for completed) */}
      {completed && <MockUI />}

      {/* Scanline sweep */}
      <mesh ref={scanRef} position={[0, 0, 0.045]}>
        <planeGeometry args={completed ? [0.02, 1.6] : [2.84, 0.02]} />
        <meshBasicMaterial
          color="#810172"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* Pulsing edge glow */}
      <mesh ref={sweepRef} position={[0, 0, 0.042]}>
        <planeGeometry args={[3.1, 1.95]} />
        <meshBasicMaterial
          color={hue}
          transparent
          opacity={completed ? 0.22 : 0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Stand */}
      <mesh position={[0, -1.15, -0.15]}>
        <cylinderGeometry args={[0.06, 0.06, 0.5, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -1.4, -0.15]}>
        <cylinderGeometry args={[0.4, 0.5, 0.05, 16]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* For "in-progress" monitors: warning bar + scanline overlay */}
      {!completed && (
        <>
          <mesh position={[0, 0.7, 0.05]}>
            <planeGeometry args={[2.84, 0.18]} />
            <meshBasicMaterial
              color="#810172"
              transparent
              opacity={0.35}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <mesh position={[0, 0.0, 0.05]}>
            <planeGeometry args={[0.04, 1.6]} />
            <meshBasicMaterial
              color="#810172"
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

/** A faint mock UI grid rendered on completed monitors' screens. */
function MockUI() {
  // Build a few rectangles to look like a UI layout
  const rects = [
    { x: -0.9, y: 0.55, w: 1.8, h: 0.18, color: "#1a0a18", opacity: 0.85 }, // top bar
    { x: -0.9, y: 0.1, w: 0.7, h: 0.5, color: "#150510", opacity: 0.75 }, // left card
    { x: 0.0, y: 0.1, w: 0.9, h: 0.5, color: "#1a0815", opacity: 0.7 }, // right card
    { x: -0.9, y: -0.55, w: 1.8, h: 0.12, color: "#120410", opacity: 0.6 }, // bottom bar
  ];
  return (
    <group position={[0, 0, 0.045]}>
      {rects.map((r, i) => (
        <mesh key={i} position={[r.x + r.w / 2 - 1.4 + r.w / 2, r.y, 0]}>
          <planeGeometry args={[r.w, r.h]} />
          <meshBasicMaterial
            color={r.color}
            transparent
            opacity={r.opacity}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Tiny accent dot in top-right */}
      <mesh position={[1.2, 0.65, 0]}>
        <circleGeometry args={[0.03, 16]} />
        <meshBasicMaterial color="#810172" toneMapped={false} />
      </mesh>
    </group>
  );
}
