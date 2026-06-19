"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Cycling word swap (e.g. growing → thriving → happening). Visual only — an sr-only
// full phrase is rendered by the parent for screen readers. Honors reduced-motion.
export function RotatingWord({
  words,
  interval = 2200,
  className = "",
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || words.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [reduce, words.length, interval]);

  if (reduce) {
    // Static: show all words joined so motion-averse users still get the message.
    return <span className={className}>{words.join(" · ")}</span>;
  }

  return (
    <span className="relative inline-grid place-items-center">
      {/* invisible sizer = widest word, prevents layout jump */}
      <span className={`invisible col-start-1 row-start-1 ${className}`} aria-hidden>
        {words.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={words[i]}
          className={`col-start-1 row-start-1 ${className}`}
          initial={{ y: "0.5em", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-0.5em", opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
