"use client";

import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr, AdaptiveEvents } from "@react-three/drei";
import {
  CameraRig,
  ParticleField,
  PurpleAura,
  SceneFog,
  PulsingGlow,
} from "./Core3D";
import PostFX from "./PostFX";
import { usePerfTier } from "./usePerfTier";
import { HeroScene3D } from "../scenes/HeroScene3D";
import { AboutScene3D } from "../scenes/AboutScene3D";
import { SkillsScene3D } from "../scenes/SkillsScene3D";
import { ProjectsScene3D } from "../scenes/ProjectsScene3D";
import { LearningScene3D } from "../scenes/LearningScene3D";
import { ContactScene3D } from "../scenes/ContactScene3D";

/**
 * SceneCanvas — the persistent Three.js canvas that lives behind the DOM.
 *
 * Performance is adaptive via usePerfTier:
 *   LOW    — no PostFX, no reflector, 200 particles, DPR 0.6–0.85
 *   MEDIUM — PostFX on, no reflector, 400 particles, DPR 0.75–1.0
 *   HIGH   — PostFX on, reflector on, 600 particles, DPR 1.0–1.5
 */
export default function SceneCanvas() {
  const perf = usePerfTier();

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 55, near: 0.1, far: 200 }}
      gl={{
        antialias: false, // SMAA handles AA in post (when PostFX is on)
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: 2, // ACESFilmicToneMapping
        toneMappingExposure: 1.05,
      }}
      dpr={perf.dpr}
      className="!fixed inset-0"
      style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh" }}
    >
      <SceneFog />

      {/* Lights + per-scene color temperature are inside CameraRig */}
      <CameraRig />

      {/* Particle field (parallax + twinkle + velocity streaks) */}
      <ParticleField count={perf.particleCount} />

      {/* Pulsing volumetric glow */}
      <PulsingGlow position={[0, 1.5, -3]} color="#810172" baseOpacity={0.45} pulseSpeed={0.6} size={6} />

      {/* Soft purple aura behind the journey */}
      <PurpleAura position={[0, 0, -52]} intensity={0.7} />

      {/* Scenes — each positioned along Z to match the camera path */}
      <HeroScene3D />
      <AboutScene3D enableReflector={perf.enableReflector} />
      <SkillsScene3D />
      <ProjectsScene3D />
      <LearningScene3D />
      <ContactScene3D />

      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* Cinematic post-processing (disabled on LOW tier) */}
      {perf.enablePostFX && <PostFX />}
    </Canvas>
  );
}
