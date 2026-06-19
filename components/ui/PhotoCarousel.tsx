"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import type { ImgRef } from "@/content/types";

// Scroll-snap carousel with prev/next + dots, keyboard accessible.
// single image → no controls; empty → renders nothing (spec Appendix B).
export function PhotoCarousel({ images }: { images: ImgRef[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const i = Math.round(track.scrollLeft / track.clientWidth);
      setActive(i);
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  if (!images || images.length === 0) return null;

  const go = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(images.length - 1, i));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setActive(clamped);
  };

  const multi = images.length > 1;

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-3xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="group"
        aria-roledescription="carousel"
        aria-label="Photo gallery"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(active + 1);
          if (e.key === "ArrowLeft") go(active - 1);
        }}
      >
        {images.map((im) => (
          <div key={im.src} className="relative aspect-[16/10] w-full shrink-0 snap-center">
            <Image
              src={im.src}
              alt={im.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority={false}
            />
          </div>
        ))}
      </div>

      {multi ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => go(active - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-cream/85 text-charcoal shadow-md backdrop-blur hover:bg-cream"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(active + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-cream/85 text-charcoal shadow-md backdrop-blur hover:bg-cream"
          >
            ›
          </button>
          <div className="mt-4 flex justify-center gap-2">
            {images.map((im, i) => (
              <button
                key={im.src}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === active}
                onClick={() => go(i)}
                className={`h-2 rounded-full transition-all ${
                  i === active ? "w-6 bg-coral-deep" : "w-2 bg-charcoal/25 hover:bg-charcoal/40"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
