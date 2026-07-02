"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Github, ExternalLink, FileText, Hammer } from "lucide-react";
import TiltCard from "../TiltCard";
import MagneticButton from "../MagneticButton";

/**
 * ProjectsSection — DOM overlay for Scene 4.
 *
 * Two completed projects (Davaam Website Recreation, DV Smart) shown as
 * full case-study cards with tech stack, GitHub, live demo, and a case
 * study link. Two future projects (Unity Survival Game, SaaS App) shown
 * with a deliberately different "Currently Building" treatment.
 */

interface CompletedProject {
  index: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  stack: string[];
  github?: string;
  demo?: string;
  hasCaseStudy?: boolean;
}

interface FutureProject {
  index: string;
  title: string;
  status: string;
  description: string;
  eta: string;
}

const COMPLETED: CompletedProject[] = [
  {
    index: "01",
    title: "Davaam Website Recreation",
    tagline: "Pixel-faithful rebuild of an industrial brand site.",
    description:
      "A ground-up recreation of the Davaam website focused on the original's visual rhythm — section transitions, hover states, and product reveal sequences rebuilt with modern tooling. Used as a craft study: matching tone, pacing, and motion choreography to a real production brand.",
    features: [
      "Section-based reveal choreography",
      "Matched typography & spacing system",
      "Responsive across breakpoints",
      "Optimized asset pipeline",
    ],
    stack: ["HTML5", "CSS3", "JavaScript", "GSAP"],
    github: "https://github.com/",
    demo: "https://example.com/",
    hasCaseStudy: true,
  },
  {
    index: "02",
    title: "DV Smart",
    tagline: "Modern industrial website for an industrial brand.",
    description:
      "A modern industrial website built for DV Smart — clean grid layouts, restrained motion, and a strong content hierarchy that lets the products lead. Designed to load fast on slower connections while still feeling premium on a flagship device.",
    features: [
      "Industrial-strength layout system",
      "Lazy-loaded media gallery",
      "Mobile-first responsive grid",
      "Accessible navigation patterns",
    ],
    stack: ["HTML5", "CSS3", "JavaScript", "Tailwind"],
    github: "https://github.com/",
    demo: "https://example.com/",
  },
];

const FUTURE: FutureProject[] = [
  {
    index: "03",
    title: "Unity Survival Game",
    status: "Currently Building",
    description:
      "An open-world survival prototype in Unity. Focused on procedural terrain, day-night cycles, inventory systems, and enemy AI behaviors. A long-form project I'm building in parallel with client work.",
    eta: "In Progress",
  },
  {
    index: "04",
    title: "SaaS Application",
    status: "Currently Building",
    description:
      "A focused SaaS product built on Next.js with authentication, billing, and a real-time dashboard. The goal is to ship a complete end-to-end product that exercises the full modern stack.",
    eta: "In Progress",
  },
];

export function ProjectsSection() {
  return (
    <section
      className="relative min-h-screen w-full px-6 py-24 sm:py-32"
      data-section="projects"
      aria-label="Projects"
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
            04 · Projects
          </span>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            <span className="gradient-text">The Exhibition.</span>
          </h2>
          <p className="max-w-xl text-sm text-white/50 sm:text-base">
            Walking the floor of a futuristic exhibition. Completed work sits on
            lit monitors; in-progress builds sit on dimmer, scanlined ones.
          </p>
        </motion.div>

        {/* Completed Projects */}
        <div className="space-y-8">
          {COMPLETED.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            >
              <TiltCard
                maxTilt={6}
                scale={1.005}
                className="glass-panel glass-panel-glow rounded-3xl p-1.5"
              >
                <div className="rounded-[1.4rem] bg-black/40 p-6 sm:p-10">
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Left: preview */}
                    <div className="lg:col-span-5">
                      <ProjectPreview title={p.title} index={p.index} />
                    </div>

                    {/* Right: info */}
                    <div className="lg:col-span-7">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#810172]">
                            Project {p.index}
                          </span>
                          <h3 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
                            {p.title}
                          </h3>
                          <p className="mt-1 text-sm text-white/50">
                            {p.tagline}
                          </p>
                        </div>
                      </div>

                      <p className="mt-5 text-sm leading-relaxed text-white/65">
                        {p.description}
                      </p>

                      {/* Features */}
                      <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {p.features.map((f) => (
                          <li
                            key={f}
                            className="flex items-start gap-2 text-[13px] text-white/55"
                          >
                            <span className="mt-1 text-[#810172]">◢</span>
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* Stack */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {p.stack.map((s) => (
                          <span
                            key={s}
                            className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/60"
                          >
                            {s}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="mt-7 flex flex-wrap items-center gap-3">
                        {p.demo && (
                          <MagneticButton
                            href={p.demo}
                            variant="primary"
                            ariaLabel={`Live demo of ${p.title}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Live Demo
                          </MagneticButton>
                        )}
                        {p.github && (
                          <MagneticButton
                            href={p.github}
                            variant="ghost"
                            ariaLabel={`GitHub repository for ${p.title}`}
                          >
                            <Github className="h-4 w-4" />
                            GitHub
                          </MagneticButton>
                        )}
                        {p.hasCaseStudy && (
                          <MagneticButton
                            href={p.demo}
                            variant="outline"
                            ariaLabel={`Case study for ${p.title}`}
                          >
                            <FileText className="h-4 w-4" />
                            Case Study
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </MagneticButton>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Future Projects — deliberately different treatment */}
        <div className="mt-16">
          <div className="mb-6 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
              In the Workshop
            </span>
            <div className="hairline flex-1" />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FUTURE.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
              >
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.01] p-6 sm:p-8 scanlines">
                  {/* corner marker */}
                  <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-[#810172]/40 bg-[#810172]/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[#b14aa0]">
                    <Hammer className="h-3 w-3" />
                    {p.status}
                  </span>

                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                    Project {p.index} · {p.eta}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-medium text-white/80">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/45">
                    {p.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#810172]" />
                    Under Active Development
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Faux browser preview used inside completed project cards. */
function ProjectPreview({ title, index }: { title: string; index: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0a0a0a] to-[#1a0a18]">
      {/* browser chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/5 bg-black/40 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-3 font-mono text-[9px] text-white/30">
          {title.toLowerCase().replace(/\s+/g, "-")}.preview
        </span>
      </div>
      {/* preview body */}
      <div className="relative h-[calc(100%-2rem)] p-5">
        <div className="absolute inset-0 opacity-50 scanlines" />
        <div className="relative flex h-full flex-col">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#810172]">
            {index} · Preview
          </span>
          <h4 className="mt-2 font-display text-lg font-medium text-white/80">
            {title}
          </h4>
          {/* Skeleton bars */}
          <div className="mt-4 space-y-2">
            <div className="h-2 w-3/4 rounded-full bg-white/10" />
            <div className="h-2 w-full rounded-full bg-white/[0.06]" />
            <div className="h-2 w-5/6 rounded-full bg-white/[0.06]" />
          </div>
          <div className="mt-auto grid grid-cols-3 gap-2">
            <div className="aspect-square rounded-lg border border-white/5 bg-white/[0.02]" />
            <div className="aspect-square rounded-lg border border-white/5 bg-white/[0.02]" />
            <div className="aspect-square rounded-lg border border-[#810172]/30 bg-[#810172]/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
