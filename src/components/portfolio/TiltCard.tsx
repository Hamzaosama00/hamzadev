"use client";

import { useRef, useState, MouseEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
  glare?: boolean;
}

/**
 * TiltCard — 3D tilt on mouse move, with optional glare.
 */
export default function TiltCard({
  children,
  className,
  maxTilt = 12,
  scale = 1.02,
  glare = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, o: 0 });

  const handleMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -2 * maxTilt;
    const ry = (px - 0.5) * 2 * maxTilt;
    setTransform(
      `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`
    );
    setGlarePos({ x: px * 100, y: py * 100, o: 0.25 });
  };

  const handleLeave = () => {
    setTransform("perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)");
    setGlarePos((g) => ({ ...g, o: 0 }));
  };

  return (
    <motion.div
      ref={ref}
      className={cn("relative will-change-transform", className)}
      style={{ transformStyle: "preserve-3d" }}
      animate={{ transform }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
      {glare && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glarePos.o}) 0%, transparent 50%)`,
            opacity: glarePos.o > 0 ? 1 : 0,
          }}
        />
      )}
    </motion.div>
  );
}
