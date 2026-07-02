"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import MagneticButton from "./MagneticButton";

/**
 * CaseStudyModal — a full-screen overlay that slides in from the right
 * with the complete Davaam case study. Triggered by the Case Study
 * button on the project card.
 *
 * Accessibility:
 *  - ESC key closes
 *  - Backdrop click closes
 *  - Body scroll locked while open
 *  - ARIA dialog role
 */
export default function CaseStudyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Davaam Website Recreation — Case Study"
            className="fixed right-0 top-0 z-[130] h-full w-full max-w-3xl overflow-y-auto border-l border-white/10 bg-[#080808]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onClose}
              aria-label="Close case study"
              className="fixed right-5 top-5 z-[140] flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 backdrop-blur-md transition-colors hover:border-[#810172] hover:bg-[#810172]/10"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <DavaamCaseStudy />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DavaamCaseStudy() {
  return (
    <article className="relative">
      <header className="relative overflow-hidden px-8 pb-16 pt-28 sm:px-12 sm:pt-32">
        <div
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(129,1,114,0.25) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0 scanlines opacity-30" aria-hidden />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#810172]">
              Case Study · 01
            </span>
            <span className="h-px w-12 bg-[#810172]/40" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
              2026
            </span>
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            <span className="gradient-text">Davaam Website</span>
            <br />
            <span className="gradient-text text-glow">Recreation.</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/60 sm:text-base">
            A ground-up recreation of the Davaam industrial brand site —
            studying its visual rhythm, motion choreography, and the precise
            pacing that makes a product page feel inevitable.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton
              href="https://davaam.vercel.app"
              variant="primary"
              ariaLabel="Visit live Davaam site"
            >
              <ExternalLink className="h-4 w-4" />
              Visit Live Site
            </MagneticButton>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <MetaItem label="Role" value="Frontend" />
            <MetaItem label="Stack" value="HTML · CSS · JS · GSAP" />
            <MetaItem label="Type" value="Recreation" />
            <MetaItem label="Live" value="davaam.vercel.app" />
          </div>
        </div>
      </header>

      <div className="hairline mx-8 sm:mx-12" />

      <Section index="01" title="Overview">
        <p>
          Davaam is an industrial brand whose website uses restrained motion
          and a confident grid to let products lead. This project was a
          deliberate study — not a clone for production, but a careful rebuild
          to understand the engineering decisions behind a site that feels
          premium without shouting.
        </p>
        <p>
          I rebuilt the site from scratch with modern tooling, paying attention
          to the parts that are easy to overlook: the easing curves on section
          reveals, the exact moment a hover state should ease in, the rhythm of
          whitespace between a product image and its label. The goal was to
          match the original&apos;s tone beat-for-beat, then ship it to a live
          URL so the work could be experienced in context.
        </p>
      </Section>

      <Section index="02" title="The Brief">
        <p>
          The challenge wasn&apos;t &quot;build a website&quot; — it was
          &quot;build the same website, and understand why each choice was
          made.&quot; That meant reverse-engineering the motion design from
          observation: timing functions, stagger delays, the way the navigation
          hides and reveals on scroll.
        </p>
        <BlockQuote>
          Recreation is the fastest path to taste. You only truly understand a
          design decision once you&apos;ve had to make it yourself.
        </BlockQuote>
      </Section>

      <Section index="03" title="Approach">
        <p>
          I worked in three passes. First, a structural pass — semantic HTML,
          layout grid, responsive breakpoints. Second, a motion pass — GSAP
          timelines for section reveals, hover micro-interactions, and the
          product gallery transitions. Third, a polish pass — typography
          kerning, easing curve tuning, and asset optimization for fast loading
          on slower connections.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StepCard num="01" title="Structure" body="Semantic HTML, CSS Grid, mobile-first responsive breakpoints." />
          <StepCard num="02" title="Motion" body="GSAP timelines for reveals, hovers, and gallery transitions." />
          <StepCard num="03" title="Polish" body="Easing curves, kerning, and asset optimization." />
        </div>
      </Section>

      <Section index="04" title="Key Features">
        <div className="space-y-3">
          {[
            { t: "Section-based reveal choreography", d: "Each section enters on a staggered timeline as it crosses the viewport, with easing tuned to feel unhurried." },
            { t: "Matched typography & spacing system", d: "Rebuilt the original's type scale and vertical rhythm from measurement, not guesswork." },
            { t: "Responsive across breakpoints", d: "Layout reflows cleanly from 320px mobile to 4K desktop without losing the brand's composure." },
            { t: "Optimized asset pipeline", d: "Images compressed and lazy-loaded; the site scores well on Core Web Vitals despite the motion." },
          ].map((f) => (
            <FeatureRow key={f.t} title={f.t} desc={f.d} />
          ))}
        </div>
      </Section>

      <Section index="05" title="Tech Stack">
        <div className="flex flex-wrap gap-2">
          {["HTML5", "CSS3", "JavaScript", "GSAP", "Responsive Design", "Motion Design"].map(
            (s) => (
              <span
                key={s}
                className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/60"
              >
                {s}
              </span>
            )
          )}
        </div>
      </Section>

      <Section index="06" title="Lessons">
        <p>
          The biggest takeaway was about restraint. The original site
          doesn&apos;t animate everything — it animates the right things. A
          hover that lasts 200ms too long stops feeling premium and starts
          feeling slow. A stagger delay of 0.05s vs 0.08s is the difference
          between &quot;elegant&quot; and &quot;laggy.&quot;
        </p>
        <p>
          I also learned that recreation is a faster teacher than original
          work. When you build from scratch, you make every decision under the
          weight of infinite options. When you recreate, the decisions are
          already made — your job is to understand why, and that understanding
          transfers directly to your own work.
        </p>
      </Section>

      <div className="hairline mx-8 sm:mx-12" />
      <div className="px-8 py-16 sm:px-12">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#810172]/10 to-transparent p-8 sm:p-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#810172]">
            See it live
          </span>
          <h3 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            Experience the recreation.
          </h3>
          <p className="mt-3 max-w-md text-sm text-white/55">
            The live site is the only real proof. Open it on desktop and mobile,
            scroll slowly, and pay attention to the timing.
          </p>
          <div className="mt-6">
            <MagneticButton
              href="https://davaam.vercel.app"
              variant="primary"
              ariaLabel="Visit live Davaam site"
            >
              <ExternalLink className="h-4 w-4" />
              davaam.vercel.app
              <ArrowRight className="h-3.5 w-3.5" />
            </MagneticButton>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => {
              const el = document.querySelector("[data-section='projects']");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 transition-colors hover:text-[#810172]"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Projects
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
            © 2026 · Hamza
          </span>
        </div>
      </div>
    </article>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
        {label}
      </div>
      <div className="mt-1.5 text-sm text-white/80">{value}</div>
    </div>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-8 py-16 sm:px-12">
      <div className="mb-8 flex items-center gap-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#810172]">
          {index}
        </span>
        <span className="h-px w-8 bg-[#810172]/40" />
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
      </div>
      <div className="space-y-5 text-sm leading-relaxed text-white/65 sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

function BlockQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="mt-6 border-l-2 border-[#810172] pl-5 font-display text-lg italic text-white/80 sm:text-xl">
      {children}
    </blockquote>
  );
}

function StepCard({
  num,
  title,
  body,
}: {
  num: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#810172]">
        {num}
      </span>
      <h4 className="mt-2 font-display text-sm font-medium text-white">
        {title}
      </h4>
      <p className="mt-2 text-[12px] leading-relaxed text-white/50">{body}</p>
    </div>
  );
}

function FeatureRow({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.01] p-4">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#810172]/40 bg-[#810172]/10">
        <Check className="h-3 w-3 text-[#b14aa0]" />
      </div>
      <div>
        <h4 className="font-display text-sm font-medium text-white">{title}</h4>
        <p className="mt-1 text-[12px] leading-relaxed text-white/50">{desc}</p>
      </div>
    </div>
  );
}
