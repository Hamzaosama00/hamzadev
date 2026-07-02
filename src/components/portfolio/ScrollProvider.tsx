"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

interface ScrollCtx {
  /** Smoothed 0..1 progress over the whole page. */
  progress: number;
  /** Raw scrollY in px. */
  scrollY: number;
  /** Section progress: array of 0..1 for each section (6 sections). */
  sectionProgress: number[];
  /** Active section index. */
  activeSection: number;
  /** Subscribe to per-frame mouse target (for 3D camera). */
  mouse: { x: number; y: number };
  /** Smoothed scroll velocity in "progress units per second" (≈0..2). */
  velocity: number;
  /**
   * Stable refs to per-frame values. Use inside R3F useFrame to avoid
   * triggering React re-renders every frame.
   */
  refs: {
    progress: number;
    targetProgress: number;
    velocity: number;
    smoothedVelocity: number;
    mouse: { x: number; y: number };
    activeSection: number;
    /** Increments every time the active section changes (for transition FX). */
    sectionChangeCounter: number;
    /** Index of the section we just left (for flash direction). */
    previousSection: number;
  };
}

const initialRefs = {
  progress: 0,
  targetProgress: 0,
  velocity: 0,
  smoothedVelocity: 0,
  mouse: { x: 0, y: 0 },
  activeSection: 0,
  sectionChangeCounter: 0,
  previousSection: 0,
};

const Ctx = createContext<ScrollCtx>({
  progress: 0,
  scrollY: 0,
  sectionProgress: [0, 0, 0, 0, 0, 0],
  activeSection: 0,
  mouse: { x: 0, y: 0 },
  velocity: 0,
  refs: initialRefs,
});

export const usePortfolioScroll = () => useContext(Ctx);

export const SECTION_COUNT = 6;

/**
 * ScrollProvider — listens to window scroll, computes smoothed
 * progress + per-section progress, and exposes it via context.
 *
 * Also computes scroll velocity (delta per second) for cinematic
 * effects like particle streaks and camera lookahead.
 *
 * Exposes a stable `refs` object so R3F useFrame callbacks can read
 * the latest values without causing React re-renders.
 */
export default function ScrollProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [sectionProgress, setSectionProgress] = useState<number[]>(
    Array(SECTION_COUNT).fill(0)
  );
  const [activeSection, setActiveSection] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState(0);

  const refs = useRef(initialRefs);

  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const targetMouse = useRef({ x: 0, y: 0 });
  const currentMouse = useRef({ x: 0, y: 0 });
  const lastProgress = useRef(0);
  const lastTime = useRef(performance.now());
  const currentVelocity = useRef(0);
  const smoothedVelocity = useRef(0);
  const prevSection = useRef(0);
  const sectionChangeCounter = useRef(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY || window.pageYOffset;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      targetProgress.current = p;
      refs.current.targetProgress = p;
      setScrollY(y);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      targetMouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener("mousemove", onMouse);
    return () => window.removeEventListener("mousemove", onMouse);
  }, []);

  useEffect(() => {
    let raf = 0;
    const lerpFactor = 0.1;
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime.current) / 1000);
      lastTime.current = now;

      // smooth progress
      currentProgress.current +=
        (targetProgress.current - currentProgress.current) * lerpFactor;
      const p = currentProgress.current;

      // velocity = progress units per second
      const rawVel = dt > 0 ? (p - lastProgress.current) / dt : 0;
      lastProgress.current = p;
      currentVelocity.current = rawVel;
      // smoothed velocity (decay back to 0 when not scrolling)
      const target = Math.abs(rawVel) > 0.001 ? rawVel : 0;
      smoothedVelocity.current +=
        (target - smoothedVelocity.current) * 0.18;
      // decay
      smoothedVelocity.current *= 0.92;

      setProgress(p);
      setVelocity(smoothedVelocity.current);

      // compute per-section progress
      const sp: number[] = [];
      let active = 0;
      for (let i = 0; i < SECTION_COUNT; i++) {
        const local = p * SECTION_COUNT - i;
        sp[i] = Math.max(0, Math.min(1, local));
        if (local > 0.5) active = i;
      }
      setSectionProgress(sp);

      if (active !== prevSection.current) {
        refs.current.previousSection = prevSection.current;
        refs.current.sectionChangeCounter++;
        prevSection.current = active;
      }
      setActiveSection(active);

      // smooth mouse
      currentMouse.current.x +=
        (targetMouse.current.x - currentMouse.current.x) * 0.06;
      currentMouse.current.y +=
        (targetMouse.current.y - currentMouse.current.y) * 0.06;
      setMouse({ x: currentMouse.current.x, y: currentMouse.current.y });

      // update refs
      refs.current.progress = p;
      refs.current.velocity = smoothedVelocity.current;
      refs.current.smoothedVelocity = smoothedVelocity.current;
      refs.current.mouse = currentMouse.current;
      refs.current.activeSection = active;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <Ctx.Provider
      value={{
        progress,
        scrollY,
        sectionProgress,
        activeSection,
        mouse,
        velocity,
        refs: refs.current,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
