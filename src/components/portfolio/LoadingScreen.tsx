"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  onComplete: () => void;
}

/**
 * LoadingScreen — premium black launch screen with a centered logo
 * that draws in, a thin progress bar, and a fade out.
 */
export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1800;

    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(1, elapsed / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(Math.round(eased * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => setDone(true), 350);
        setTimeout(onComplete, 1250);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
        >
          {/* radial purple glow */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(129,1,114,0.25) 0%, transparent 55%)",
            }}
          />

          {/* Center logo */}
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0, filter: "blur(20px)" }}
              animate={{
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
              }}
              className="relative"
            >
              <svg
                width="84"
                height="84"
                viewBox="0 0 84 84"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M42 6 L74 24 L74 60 L42 78 L10 60 L10 24 Z"
                  stroke="#810172"
                  strokeWidth="1.5"
                  fill="rgba(129,1,114,0.06)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: 1,
                    transition: { duration: 1.4, ease: "easeInOut" },
                  }}
                />
                <motion.path
                  d="M42 22 L58 32 L58 52 L42 62 L26 52 L26 32 Z"
                  stroke="#F2F2F2"
                  strokeWidth="1"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: 0.8,
                    transition: {
                      duration: 1.4,
                      delay: 0.3,
                      ease: "easeInOut",
                    },
                  }}
                />
                <motion.circle
                  cx="42"
                  cy="42"
                  r="3"
                  fill="#810172"
                  initial={{ scale: 0 }}
                  animate={{
                    scale: 1,
                    transition: { delay: 1, duration: 0.5 },
                  }}
                />
              </svg>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.5, duration: 0.7 },
              }}
              className="mt-8 flex flex-col items-center"
            >
              <div className="font-display text-2xl tracking-[0.35em] text-[#F2F2F2]">
                HAMZA
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.4em] text-white/40">
                Digital Experience Engineer
              </div>
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-[18vh] left-1/2 -translate-x-1/2 w-[min(420px,80vw)]">
            <div className="h-px w-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#810172] via-[#b14aa0] to-[#810172]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
              <span>Loading Experience</span>
              <span className="text-[#810172]">{progress}%</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
