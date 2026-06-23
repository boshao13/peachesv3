"use client";

import { useState } from "react";

// Lazy facade for the Glofox class-schedule iframe (spec §11). The heavy third-party
// iframe loads only on user intent. Load failure/timeout → "Book on Glofox" link out.
export function GlofoxEmbed({
  scheduleUrl,
  className = "",
}: {
  scheduleUrl: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "loaded" | "failed">("idle");

  function load() {
    setState("loading");
    // If the iframe hasn't reported load within 12s, fall back to the link-out.
    window.setTimeout(() => {
      setState((s) => (s === "loading" ? "failed" : s));
    }, 12000);
  }

  if (state === "idle") {
    return (
      <div
        className={`flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-3xl bg-peach/40 p-8 text-center ${className}`}
      >
        <p className="text-lg text-charcoal/80">
          View this week&apos;s classes and reserve your spot.
        </p>
        <button
          type="button"
          onClick={load}
          className="rounded-full bg-coral-deep px-7 py-3.5 text-base font-medium text-white transition hover:bg-coral-dark"
        >
          Load live schedule
        </button>
        <a
          href={scheduleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-semibold text-charcoal underline hover:text-coral-dark"
        >
          or open it in a new tab
        </a>
      </div>
    );
  }

  if (state === "failed") {
    return (
      <div
        className={`flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-3xl bg-peach/40 p-8 text-center ${className}`}
      >
        <p className="text-lg text-charcoal/80">
          The live schedule is taking a moment. You can open it directly on Glofox.
        </p>
        <a
          href={scheduleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-coral-deep px-7 py-3.5 text-base font-medium text-white transition hover:bg-coral-dark"
        >
          Book on Glofox
        </a>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl ${className}`}>
      {state === "loading" ? (
        <div className="absolute inset-0 grid place-items-center bg-peach/40 text-charcoal/70">
          Loading schedule…
        </div>
      ) : null}
      <iframe
        src={scheduleUrl}
        title="Peaches Fitness Club class schedule"
        className="h-[640px] w-full"
        onLoad={() => setState("loaded")}
      />
    </div>
  );
}
