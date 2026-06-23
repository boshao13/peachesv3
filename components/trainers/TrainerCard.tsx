"use client";

import { useState } from "react";
import Image from "next/image";
import type { Trainer } from "@/content/types";
import { Card } from "@/components/ui/Card";
import { IconArrowRight } from "@/components/ui/icons";

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  const [expanded, setExpanded] = useState(false);
  const { photo, name, title, bio, specializations, certifications, placeholder } = trainer;

  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative aspect-[3/4] w-full bg-peach/40">
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={`object-cover ${placeholder ? "opacity-80" : ""}`}
        />
        {placeholder ? (
          <span className="absolute bottom-3 left-3 rounded-full bg-cream/90 px-3 py-1 text-xs font-medium text-charcoal/70">
            Photo coming soon
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-7">
        {/* name in the fancy script font */}
        <h3 className="script text-3xl leading-tight text-coral-deep">{name}</h3>
        {/* title in regular type */}
        <p className="mt-1 text-sm font-medium uppercase tracking-wide text-charcoal/70">
          {title}
        </p>

        {/* description in regular font */}
        <div className="mt-4 space-y-3 leading-relaxed text-charcoal/75">
          <p>{bio[0]}</p>
          {expanded ? bio.slice(1).map((p, i) => <p key={i}>{p}</p>) : null}
        </div>

        {expanded && specializations.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-charcoal/80">
              Specializes in
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-charcoal/75">
              {specializations.map((s) => (
                <li key={s} className="flex gap-2.5">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral-deep" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {expanded && certifications && certifications.length > 0 ? (
          <p className="mt-3 text-sm text-sage">{certifications.join(" · ")}</p>
        ) : null}

        {!placeholder && (bio.length > 1 || specializations.length > 0) ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-auto inline-flex items-center gap-1.5 self-start pt-6 text-sm font-semibold text-coral-deep hover:text-coral-dark"
          >
            {expanded ? "Show less" : "Read more"}
            <IconArrowRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : null}
      </div>
    </Card>
  );
}
