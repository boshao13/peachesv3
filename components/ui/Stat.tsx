"use client";

import { useEffect, useRef, useState } from "react";

// Animated count-up ONLY for values with a leading integer (e.g. "12+", "4").
// Non-numeric values (e.g. "5AM–10PM", "Est. 2024") render static (spec §6.4).
// Respects prefers-reduced-motion.
export function Stat({ value, label }: { value: string; label: string }) {
  const match = value.match(/^(\d+)(.*)$/s);
  const target = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : "";

  const ref = useRef<HTMLDivElement>(null);
  // SSR / no-JS shows the real value; count-up animates from 0 on scroll-into-view.
  const [display, setDisplay] = useState<string>(value);

  useEffect(() => {
    if (target === null) {
      setDisplay(value);
      return;
    }
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(`${target}${suffix}`);
      return;
    }

    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;

    const run = () => {
      const duration = 1100;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(`${Math.round(eased * target)}${suffix}`);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          run();
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, suffix, value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl sm:text-5xl font-semibold text-coral-deep tabular-nums">
        {display}
      </div>
      <div className="mt-1 text-sm uppercase tracking-widest text-charcoal/80">{label}</div>
    </div>
  );
}
