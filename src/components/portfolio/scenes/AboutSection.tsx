"use client";

import { motion } from "framer-motion";
import { User, Compass, Target, Rocket } from "lucide-react";
import TiltCard from "../TiltCard";

const PANELS = [
  {
    icon: User,
    title: "About Me",
    body: "I'm Hamza — a frontend developer and Unity game developer who treats the browser as a stage. I obsess over micro-interactions, motion choreography, and the precise moment a transition should ease in. My work sits between engineering and design, leaning on both.",
  },
  {
    icon: Compass,
    title: "Journey",
    body: "Started with Shopify themes, then moved into hand-crafted client websites. Along the way I picked up Unity for game development and fell in love with realtime graphics. Each project sharpened a different muscle — typography, performance, or storytelling.",
  },
  {
    icon: Target,
    title: "Current Focus",
    body: "Building modern, performant web experiences with React, Next.js, Three.js, and Tailwind. Parallel-track: deepening my JavaScript fundamentals and exploring AI-assisted developer workflows that compress days of work into hours.",
  },
  {
    icon: Rocket,
    title: "Goals",
    body: "Short term: ship a SaaS product and contribute to client work that pushes my craft. Long term: an international software engineering career — Japan is the dream. Learning 日本語 to make that bridge real, not aspirational.",
  },
];

/**
 * AboutSection — DOM overlay for Scene 2.
 * Floating glassmorphism panels with hover tilt.
 */
export function AboutSection() {
  return (
    <section
      className="relative min-h-screen w-full px-6 py-24 sm:py-32"
      data-section="about"
      aria-label="About"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-14 flex flex-col items-start gap-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#810172]">
            02 · About
          </span>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            <span className="gradient-text">Inside the Mind.</span>
          </h2>
          <p className="max-w-xl text-sm text-white/50 sm:text-base">
            A short tour through who I am, where I've been, what I'm focused on
            now, and where I'm headed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {PANELS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
            >
              <TiltCard className="glass-panel glass-panel-glow h-full rounded-2xl p-7 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#810172]/40 bg-[#810172]/10">
                    <p.icon className="h-5 w-5 text-[#b14aa0]" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-medium text-white sm:text-xl">
                      {p.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/55 sm:text-[15px]">
                      {p.body}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                    0{i + 1} / 04
                  </span>
                  <span className="font-mono text-[10px] text-[#810172]">
                    ◢ {p.title.toLowerCase().replace(/\s+/g, "-")}
                  </span>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
