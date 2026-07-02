"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

function useIsFinePointer() {
  return useSyncExternalStore(
    emptySubscribe,
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches,
    () => false
  );
}

/**
 * CursorGlow — a soft purple spotlight that follows the cursor on desktop.
 * Hidden on touch devices.
 */
export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const isFine = useIsFinePointer();

  useEffect(() => {
    if (!isFine) return;
    const dot = dotRef.current!;
    const ring = ringRef.current!;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx - 4}px, ${my - 4}px, 0)`;

      // detect interactive target
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        "a, button, [data-cursor='hover'], input, textarea, [role='button']"
      );
      ring.dataset.hover = interactive ? "true" : "false";
    };

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
    };
  }, [isFine]);

  if (!isFine) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="fixed left-0 top-0 z-[100] pointer-events-none h-9 w-9 rounded-full border border-[#810172]/60 transition-[width,height,opacity,background-color] duration-300 data-[hover=true]:scale-150 data-[hover=true]:bg-[#810172]/10"
        style={{ willChange: "transform" }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="fixed left-0 top-0 z-[100] pointer-events-none h-2 w-2 rounded-full bg-[#810172]"
        style={{ willChange: "transform", boxShadow: "0 0 12px #810172" }}
      />
    </>
  );
}
