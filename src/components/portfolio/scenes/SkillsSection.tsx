"use client";

import { motion } from "framer-motion";

const TECH_GROUPS = [
  {
    label: "Core Web",
    items: [
      { name: "HTML5", desc: "Semantic, accessible markup foundations" },
      { name: "CSS3", desc: "Modern layout, animation, container queries" },
      { name: "JavaScript", desc: "ES2024, async patterns, performance" },
    ],
  },
  {
    label: "React Stack",
    items: [
      { name: "React", desc: "Hooks, Suspense, server components" },
      { name: "Next.js", desc: "App router, RSC, edge runtime" },
      { name: "Tailwind", desc: "Utility-first design systems" },
    ],
  },
  {
    label: "Game & Tools",
    items: [
      { name: "Unity", desc: "C# gameplay, shaders, ECS" },
      { name: "Git / GitHub", desc: "Trunk-based, Actions, releases" },
      { name: "Shopify", desc: "Liquid, themes, custom sections" },
    ],
  },
  {
    label: "Exploring",
    items: [
      { name: "AI Tools", desc: "LLM workflows, prompt design, automation" },
      { name: "日本語", desc: "Currently learning — JLPT N5 path" },
    ],
  },
];

/**
 * SkillsSection — DOM overlay for Scene 3.
 * While the 3D holographic sphere + orbiting icons are visible behind,
 * the foreground shows grouped skill cards as a reference panel.
 */
export function SkillsSection() {
  return (
    <section
      className="relative min-h-screen w-full px-6 py-24 sm:py-32"
      data-section="skills"
      aria-label="Skills"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-14 flex flex-col items-start gap-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#810172]">
            03 · Skills
          </span>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            <span className="gradient-text">A Holographic Stack.</span>
          </h2>
          <p className="max-w-xl text-sm text-white/50 sm:text-base">
            Hover the orbiting nodes in the 3D scene to freeze and inspect each
            technology. Below — the same stack, organized for quick reference.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TECH_GROUPS.map((g, i) => (
            <motion.div
              key={g.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="glass-panel rounded-2xl p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#810172]">
                  {g.label}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#810172]" />
              </div>
              <ul className="space-y-3">
                {g.items.map((t) => (
                  <li
                    key={t.name}
                    className="group border-b border-white/5 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm text-white transition-colors group-hover:text-[#b14aa0]">
                        {t.name}
                      </span>
                      <span className="font-mono text-[10px] text-white/30">
                        ◢
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-white/40">
                      {t.desc}
                    </p>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
