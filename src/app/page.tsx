"use client";

import { useState, useEffect, Suspense, lazy } from "react";
import SmoothScroll from "@/components/portfolio/SmoothScroll";
import CursorGlow from "@/components/portfolio/CursorGlow";
import LoadingScreen from "@/components/portfolio/LoadingScreen";
import SceneTransitionFlash from "@/components/portfolio/SceneTransitionFlash";
import ScrollProvider from "@/components/portfolio/ScrollProvider";
import TopNav, { SideRail } from "@/components/portfolio/TopNav";
import { HeroSection } from "@/components/portfolio/scenes/HeroSection";
import { AboutSection } from "@/components/portfolio/scenes/AboutSection";
import { SkillsSection } from "@/components/portfolio/scenes/SkillsSection";
import { ProjectsSection } from "@/components/portfolio/scenes/ProjectsSection";
import { LearningSection } from "@/components/portfolio/scenes/LearningSection";
import { ContactSection } from "@/components/portfolio/scenes/ContactSection";

// Lazy-load the heavy 3D canvas — improves initial paint dramatically.
const SceneCanvas = lazy(
  () => import("@/components/portfolio/three/SceneCanvas")
);

export default function Home() {
  const [loading, setLoading] = useState(true);
  // 3D is always enabled; ScrollProvider/SmoothScroll handle reduced motion.
  const has3D = true;

  // Lock body scroll while loading
  useEffect(() => {
    document.body.style.overflow = loading ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading]);

  return (
    <>
      {loading && <LoadingScreen onComplete={() => setLoading(false)} />}

      <SmoothScroll paused={loading}>
        <ScrollProvider>
          {/* 3D background */}
          {has3D && (
            <Suspense fallback={null}>
              <div className="pointer-events-none fixed inset-0 z-0">
                <SceneCanvas />
              </div>
            </Suspense>
          )}

          {/* DOM overlays */}
          <CursorGlow />
          <SceneTransitionFlash />
          <div className="noise-overlay" />
          <TopNav show={!loading} />
          <SideRail show={!loading} />

          {/* Scrollable content layered on top of the canvas */}
          <main className="relative z-10">
            <HeroSection />
            <AboutSection />
            <SkillsSection />
            <ProjectsSection />
            <LearningSection />
            <ContactSection />
          </main>

          {/* Footer */}
          <footer className="relative z-10 mt-auto border-t border-white/5 bg-black px-6 py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                  © {new Date().getFullYear()} Hamza
                </span>
                <span className="hidden font-mono text-[10px] text-white/20 sm:inline">
                  ·
                </span>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 sm:inline">
                  Built with Next.js · Three.js · Lenis
                </span>
              </div>
              <button
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
                className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-[#810172]"
              >
                Back to top ↑
              </button>
            </div>
          </footer>
        </ScrollProvider>
      </SmoothScroll>
    </>
  );
}
