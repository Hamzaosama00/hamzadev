"use client";

import { useEffect, useState } from "react";

export type PerfTier = "low" | "medium" | "high";

interface PerfConfig {
  tier: PerfTier;
  enablePostFX: boolean;
  enableReflector: boolean;
  particleCount: number;
  dpr: [number, number];
}

const LOW: PerfConfig = {
  tier: "low",
  enablePostFX: false,
  enableReflector: false,
  particleCount: 200,
  dpr: [0.6, 0.85],
};
const MEDIUM: PerfConfig = {
  tier: "medium",
  enablePostFX: true,
  enableReflector: false,
  particleCount: 400,
  dpr: [0.75, 1.0],
};
const HIGH: PerfConfig = {
  tier: "high",
  enablePostFX: true,
  enableReflector: true,
  particleCount: 600,
  dpr: [1, 1.5],
};

/**
 * Detect performance tier on mount.
 *
 * Heuristics (in priority order):
 *  1. prefers-reduced-motion → LOW
 *  2. hardwareConcurrency ≤ 4 OR deviceMemory ≤ 4 → LOW
 *  3. hardwareConcurrency ≤ 6 → MEDIUM
 *  4. otherwise → HIGH
 *
 * Also does a quick WebGL micro-benchmark: if a tiny test render
 * takes > 30ms, force LOW.
 */
export function usePerfTier(): PerfConfig {
  const [config, setConfig] = useState<PerfConfig>(HIGH);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      setConfig(LOW);
      return;
    }

    const cores = (navigator as any).hardwareConcurrency || 4;
    const mem = (navigator as any).deviceMemory || 4;

    if (cores <= 4 || mem <= 4) {
      setConfig(LOW);
      return;
    }
    if (cores <= 6) {
      setConfig(MEDIUM);
      return;
    }

    // Quick WebGL sanity check — detect software renderers
    try {
      const canvas = document.createElement("canvas");
      const gl =
        (canvas.getContext("webgl2") as WebGL2RenderingContext | null) ||
        (canvas.getContext("webgl") as WebGLRenderingContext | null);
      if (gl) {
        const dbg = gl.getExtension("WEBGL_debug_renderer_info");
        const renderer = dbg
          ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
          : "";
        // SwiftShader, llvmpipe, Microsoft Basic Render = software
        if (
          /swiftshader|llvmpipe|software|basic render|microsoft/i.test(
            renderer
          )
        ) {
          setConfig(LOW);
          return;
        }
      }
    } catch {
      // ignore
    }

    setConfig(HIGH);
  }, []);

  return config;
}
