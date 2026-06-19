import Image from "next/image";
import type { ImgRef } from "@/content/types";

// Responsive image grid (server component). Empty → renders nothing (spec Appendix B).
export function Gallery({
  images,
  className = "",
}: {
  images: ImgRef[];
  className?: string;
}) {
  if (!images || images.length === 0) return null;

  return (
    <div
      className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
    >
      {images.map((im, i) => (
        <div
          key={im.src}
          className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-peach/30 shadow-[var(--shadow-card)]"
        >
          <Image
            src={im.src}
            alt={im.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
            loading={i < 3 ? "eager" : "lazy"}
          />
        </div>
      ))}
    </div>
  );
}
