"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";

/**
 * PostFX — the cinematic post-processing pipeline.
 *
 * Stack:
 *   Bloom    — soft glow on emissive purple + white pixels
 *   Vignette — darkens corners for "filmed" feel
 *
 * Performance notes:
 *   - Noise effect removed (per-pixel, expensive on software WebGL)
 *   - ChromaticAberration/DoF/mipmapBlur trigger React 19 circular-JSON
 *   - EffectComposer runs at full canvas resolution; we keep DPR low
 *     (0.75–1.25) to compensate
 */
export default function PostFX() {
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        intensity={0.85}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.5}
        kernelSize={KernelSize.LARGE}
      />
      <Vignette
        eskil={false}
        offset={0.2}
        darkness={0.8}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
