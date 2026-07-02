"use client";

import { motion } from "framer-motion";
import { Check, Target, Sparkles } from "lucide-react";

interface Milestone {
  year?: string;
  label: string;
  detail: string;
  state: "done" | "active" | "future";
}

const MILESTONES: Milestone[] = [
  {
    year: "2026",
    label: "Started Shopify",
    detail: "First exposure to building for the web — themes, Liquid, and client storefronts.",
    state: "done",
  },
  {
    label: "Built Portfolio",
    detail: "Designed and shipped the first version of this very portfolio.",
    state: "done",
  },
  {
    label: "Created Client Websites",
    detail: "Delivered custom websites for clients, sharpening layout and motion craft.",
    state: "done",
  },
  {
    label: "Learning JavaScript",
    detail: "Going deeper than syntax — async, prototypes, performance, and engine internals.",
    state: "active",
  },
  {
    label: "Building SaaS",
    detail: "Shipping a full end-to-end SaaS product on Next.js with auth, billing, and dashboards.",
    state: "active",
  },
  {
    label: "Remote Developer",
    detail: "Target — start working internationally as a remote frontend / full-stack developer.",
    state: "future",
  },
  {
    label: "Software Engineering Career in Japan",
    detail: "Future goal — relocate and build a long-term engineering career in Japan. Currently learning 日本語.",
    state: "future",
  },
];

/**
 * LearningSection — DOM overlay for Scene 5.
 *
 * A vertical timeline of floating milestone cards. Completed milestones
 * use a solid purple dot; in-progress use a pulsing dot; future goals
 * use a dashed/wireframe treatment to feel aspirational, not finished.
 */
export function LearningSection() {
  return (
    <section
      className="relative min-h-screen w-full px-6 py-24 sm:py-32"
      data-section="learning"
      aria-label="Learning Journey"
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 flex flex-col items-start gap-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#810172]">
            05 · Journey
          </span>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            <span className="gradient-text">Floating Milestones.</span>
          </h2>
          <p className="max-w-xl text-sm text-white/50 sm:text-base">
            A trajectory, not a checklist. Completed milestones glow solid;
            future goals stay wireframe — closer to a vision than a victory
            lap.
          </p>
        </motion.div>

        <ol className="relative">
          {/* vertical guide line */}
          <div className="absolute left-[14px] top-2 bottom-2 w-px bg-gradient-to-b from-[#810172]/60 via-white/10 to-transparent sm:left-1/2" />

          {MILESTONES.map((m, i) => {
            const isFuture = m.state === "future";
            const isLeft = i % 2 === 0;

            return (
              <motion.li
                key={m.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: (i % 2) * 0.1 }}
                className="relative mb-8 flex items-start gap-6 last:mb-0 sm:mb-12"
              >
                {/* Node */}
                <div className="relative z-10 mt-1 shrink-0 sm:absolute sm:left-1/2 sm:mt-0 sm:-translate-x-1/2">
                  {m.state === "done" && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#810172]/60 bg-[#810172]/20 backdrop-blur-md">
                      <Check className="h-3.5 w-3.5 text-[#b14aa0]" />
                    </div>
                  )}
                  {m.state === "active" && (
                    <div className="relative flex h-7 w-7 items-center justify-center rounded-full border border-[#810172] bg-[#810172]/30 backdrop-blur-md">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#810172] opacity-60" />
                      <Sparkles className="relative h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  {m.state === "future" && (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-white/30 bg-black/50 backdrop-blur-md">
                      <Target className="h-3.5 w-3.5 text-white/40" />
                    </div>
                  )}
                </div>

                {/* Card */}
                <div
                  className={`flex-1 sm:w-[calc(50%-2rem)] ${
                    isLeft ? "sm:ml-auto sm:pl-12" : "sm:mr-auto sm:pr-12"
                  }`}
                >
                  {isFuture ? (
                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.01] p-5 backdrop-blur-sm scanlines">
                      {m.year && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                          {m.year}
                        </span>
                      )}
                      <h3 className="mt-1 font-display text-base font-medium text-white/70">
                        {m.label}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-white/40">
                        {m.detail}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
                        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#810172]" />
                        Aspirational
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel rounded-2xl p-5">
                      {m.year && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#810172]">
                          {m.year}
                        </span>
                      )}
                      <h3 className="mt-1 font-display text-base font-medium text-white">
                        {m.label}
                      </h3>
                      <p className="mt-2 text-[13px] leading-relaxed text-white/55">
                        {m.detail}
                      </p>
                    </div>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
