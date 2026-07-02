"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/**
 * useScrollProgress
 * Returns a normalized 0..1 scroll progress across the whole page,
 * plus a smoothed version (lerped toward raw) and the raw scrollY in px.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(0);
  const currentRef = useRef(0);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY || window.pageYOffset;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      targetRef.current = p;
      setScrollY(y);

      // smooth lerp
      currentRef.current += (targetRef.current - currentRef.current) * 0.12;
      setProgress(currentRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { progress, scrollY };
}

/**
 * useMousePosition
 * Returns normalized mouse position (-1..1) on both axes, with smoothing.
 */
export function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1),
      };
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      currentRef.current.x +=
        (targetRef.current.x - currentRef.current.x) * 0.08;
      currentRef.current.y +=
        (targetRef.current.y - currentRef.current.y) * 0.08;
      setPos({ x: currentRef.current.x, y: currentRef.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return pos;
}

/**
 * useReducedMotion
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/**
 * useIsMobile
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

/**
 * useScrollTo
 * Returns a function that smoothly scrolls to a target (selector or element).
 */
export function useScrollTo() {
  return useCallback((target: string | number | HTMLElement) => {
    let el: HTMLElement | null = null;
    if (typeof target === "string") el = document.querySelector(target);
    else if (typeof target === "number")
      window.scrollTo({ top: target, behavior: "smooth" });
    else el = target;
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);
}
