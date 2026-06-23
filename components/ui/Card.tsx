import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl bg-white/90 ring-1 ring-charcoal/5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </div>
  );
}
