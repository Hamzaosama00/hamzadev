"use client";

import { useEffect, useRef } from "react";
import { usePortfolioScroll } from "./ScrollProvider";

/**
 * SceneTransitionFlash — listens for active-section changes and fires
 * a brief purple flash + subtle vignette pulse across the whole page.
 *
 * The flash is intentionally brief (450ms) and soft — it signals
 * "you've crossed a threshold" without being distracting.
 *
 * Implementation: a fixed full-screen div with a radial purple gradient.
 * When a section change is detected, we ramp opacity 0 → 0.32 → 0
 * directly via RAF + DOM manipulation (no React state churn).
 */
export default function SceneTransitionFlash() {
  const { activeSection } = usePortfolioScroll();
  const lastSection = useRef(0);
  const flashRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  // Fire flash on section change
  useEffect(() => {
    if (activeSection !== lastSection.current) {
      lastSection.current = activeSection;
      startTimeRef.current = performance.now();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [activeSection]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tick = (now: number) => {
    const flash = flashRef.current;
    if (!flash) return;
    const DURATION = 450;
    const elapsed = now - startTimeRef.current;
    const t = Math.min(1, elapsed / DURATION);
    let opacity: number;
    if (t < 0.15) {
      opacity = (t / 0.15) * 0.32;
    } else {
      opacity = 0.32 * (1 - (t - 0.15) / 0.85);
    }
    flash.style.opacity = String(opacity);
    if (t < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      flash.style.opacity = "0";
      rafRef.current = null;
    }
  };

  return (
    <div
      ref={flashRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80]"
      style={{
        opacity: 0,
        background:
          "radial-gradient(circle at 50% 50%, rgba(129,1,114,0.55) 0%, rgba(129,1,114,0.18) 35%, transparent 75%)",
        mixBlendMode: "screen",
      }}
    />
  );
}
