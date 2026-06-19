"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// Tasteful scroll-reveal (fade + rise), staggered when delayed. Fully disabled
// under prefers-reduced-motion (spec §9).
export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const MotionTag = as === "li" ? motion.li : motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  );
}
