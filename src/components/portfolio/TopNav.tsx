"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePortfolioScroll, SECTION_COUNT } from "./ScrollProvider";

const SECTIONS = [
  { id: 0, label: "Hero" },
  { id: 1, label: "About" },
  { id: 2, label: "Skills" },
  { id: 3, label: "Projects" },
  { id: 4, label: "Journey" },
  { id: 5, label: "Contact" },
];

/**
 * TopNav — fixed top navigation with section dots, logo, and an
 * "available" indicator. Hidden during the loading screen.
 */
export default function TopNav({ show }: { show: boolean }) {
  const { activeSection, sectionProgress, progress } = usePortfolioScroll();

  const scrollTo = (i: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const target = (i / (SECTION_COUNT - 1)) * max;
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.header
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-40 px-6 py-4 sm:py-5"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            {/* Logo */}
            <button
              onClick={() => scrollTo(0)}
              className="group flex items-center gap-2.5 outline-none"
              aria-label="Back to top"
            >
              <span className="relative flex h-7 w-7 items-center justify-center">
                <span className="absolute inset-0 rotate-45 rounded-md border border-[#810172]/60 transition-transform duration-500 group-hover:rotate-[225deg]" />
                <span className="font-display text-xs font-bold text-white">
                  H
                </span>
              </span>
              <span className="hidden font-display text-sm font-medium tracking-[0.2em] text-white/80 sm:inline">
                HAMZA
              </span>
            </button>

            {/* Section dots */}
            <nav
              aria-label="Sections"
              className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur-md"
            >
              {SECTIONS.map((s) => {
                const active = activeSection === s.id;
                const filled = sectionProgress[s.id] > 0.05;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    aria-label={`Go to ${s.label} section`}
                    aria-current={active ? "true" : undefined}
                    className="group relative rounded-full px-2.5 py-1 outline-none transition-colors"
                  >
                    <span
                      className={`block h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        active
                          ? "bg-[#810172] shadow-[0_0_8px_#810172]"
                          : filled
                            ? "bg-white/40"
                            : "bg-white/15"
                      } group-hover:bg-[#810172]`}
                    />
                    {/* Tooltip */}
                    <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 opacity-0 transition-opacity group-hover:opacity-100">
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Progress / status */}
            <div className="hidden items-center gap-3 sm:flex">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
                {String(activeSection + 1).padStart(2, "0")} / 0{SECTION_COUNT}
              </span>
              <div className="h-px w-16 overflow-hidden bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[#810172] to-[#b14aa0]"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}

/**
 * SideRail — a fixed left rail on desktop with a vertical progress
 * indicator + the current section name.
 */
export function SideRail({ show }: { show: boolean }) {
  const { activeSection, progress } = usePortfolioScroll();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 lg:flex flex-col items-center gap-4"
        >
          {/* Vertical progress */}
          <div className="relative h-40 w-px overflow-hidden bg-white/10">
            <div
              className="absolute left-0 top-0 w-full bg-gradient-to-b from-[#810172] to-[#b14aa0]"
              style={{ height: `${progress * 100}%` }}
            />
          </div>
          <span
            className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/40"
            style={{ writingMode: "vertical-rl" }}
          >
            {SECTIONS[activeSection]?.label}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
