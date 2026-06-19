import Image from "next/image";
import Link from "next/link";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { amenities } from "@/content/amenities";

// Feature a handful of photogenic amenities on the Home page.
const featured = ["weight-room", "booty-builder", "sauna", "cold-plunge", "members-lounge", "peachy-bar"];

export function AmenitiesPreview() {
  const items = featured
    .map((slug) => amenities.find((a) => a.slug === slug))
    .filter((a): a is NonNullable<typeof a> => Boolean(a && a.images[0]));

  return (
    <Section tone="cream-2">
      <SectionHeading
        eyebrow="The space"
        title="Everything you need under one roof"
        intro="From the weight floor to the sauna and cold plunge, Peaches is built for strong workouts and real recovery."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <Link
            key={a.slug}
            href="/amenities"
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-card)]"
          >
            <Image
              src={a.images[0].src}
              alt={a.images[0].alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
            <span className="absolute bottom-4 left-4 text-lg font-semibold uppercase tracking-wide text-cream">
              {a.name}
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button href="/amenities" variant="secondary">
          See all amenities
        </Button>
      </div>
    </Section>
  );
}
