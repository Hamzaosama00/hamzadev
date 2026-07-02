"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Mail } from "lucide-react";
import MagneticButton from "../MagneticButton";
import { usePortfolioScroll } from "../ScrollProvider";

/**
 * HeroSection — DOM overlay for Scene 1.
 * Headline, description, CTA buttons.
 * Fades + translates out as the user scrolls past the first viewport.
 */
export function HeroSection() {
  const { progress } = usePortfolioScroll();

  // Fade out roughly between progress 0.04 → 0.16
  const opacity = Math.max(0, 1 - Math.max(0, progress - 0.04) / 0.12);
  const translateY = -progress * 200;

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight * 1.1,
      behavior: "smooth",
    });
  };
  const scrollToContact = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: max * 0.92, behavior: "smooth" });
  };

  return (
    <section
      className="relative h-screen w-full"
      data-section="hero"
      aria-label="Hero"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        style={{ opacity, y: translateY }}
      >
        {/* eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-6 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#810172] opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#810172]" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
            Frontend · Unity · AI
          </span>
        </motion.div>

        {/* headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          <span className="gradient-text">Building Digital</span>
          <br />
          <span className="gradient-text">Experiences That</span>
          <br />
          <span className="gradient-text text-glow">Feel Alive.</span>
        </motion.h1>

        {/* description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-8 max-w-xl font-sans text-sm leading-relaxed text-white/55 sm:text-base"
        >
          Hi, I'm <span className="text-[#F2F2F2]">Hamza</span>. Frontend
          Developer, Unity Game Developer, and AI Enthusiast. Currently building
          modern web experiences while preparing for an international software
          engineering career.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.8 }}
          className="pointer-events-auto mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <MagneticButton onClick={scrollToNext} variant="primary">
            Explore My Work
            <ArrowDown className="h-4 w-4" />
          </MagneticButton>
          <MagneticButton onClick={scrollToContact} variant="outline">
            <Mail className="h-4 w-4" />
            Contact
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ opacity: Math.max(0, 1 - progress * 20) }}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
          Scroll
        </span>
        <div className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
      </motion.div>
    </section>
  );
}
