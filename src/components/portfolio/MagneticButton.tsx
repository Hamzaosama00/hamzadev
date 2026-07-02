"use client";

import { useRef, useState, ReactNode, MouseEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "ghost" | "outline";
  strength?: number;
  ariaLabel?: string;
}

/**
 * MagneticButton — a button/link that subtly follows the cursor
 * with a magnetic easing effect on hover.
 */
export default function MagneticButton({
  children,
  className,
  onClick,
  href,
  variant = "primary",
  strength = 0.35,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    setPos({ x: dx * strength, y: dy * strength });
  };

  const handleLeave = () => {
    setPos({ x: 0, y: 0 });
    setHovered(false);
  };

  const baseClasses = cn(
    "relative inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-display font-medium text-sm tracking-wide overflow-hidden transition-colors duration-300 outline-none",
    variant === "primary" &&
      "bg-[#810172] text-white hover:bg-[#9a0188] shadow-[0_0_30px_rgba(129,1,114,0.4)]",
    variant === "outline" &&
      "border border-[#810172]/50 text-[#F2F2F2] hover:border-[#810172] hover:bg-[#810172]/10",
    variant === "ghost" &&
      "text-[#F2F2F2] hover:text-white border border-white/10 hover:border-white/30",
    className
  );

  const content = (
    <>
      {/* shine sweep */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700"
        style={{
          transform: hovered
            ? "translateX(100%)"
            : "translateX(-100%)",
        }}
      />
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
      </span>
    </>
  );

  const motionProps = {
    animate: { x: pos.x, y: pos.y },
    transition: { type: "spring" as const, stiffness: 200, damping: 18 },
  };

  if (href) {
    return (
      <motion.a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        aria-label={ariaLabel}
        className={baseClasses}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onMouseEnter={() => setHovered(true)}
        {...motionProps}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      aria-label={ariaLabel}
      className={baseClasses}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={() => setHovered(true)}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
