"use client";

import { useState } from "react";
import type { FaqItem } from "@/content/types";

export function Accordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-charcoal/10 rounded-2xl bg-white/80 ring-1 ring-charcoal/5">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
              >
                <span className="font-medium text-charcoal">{item.q}</span>
                <span
                  aria-hidden
                  className={`shrink-0 text-coral-deep transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  ＋
                </span>
              </button>
            </h3>
            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              hidden={!isOpen}
              className="px-5 pb-5 -mt-1 text-charcoal/75 leading-relaxed"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
