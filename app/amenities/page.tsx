import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { IconPeach } from "@/components/ui/icons";
import { pageMeta } from "@/lib/seo";
import { amenities } from "@/content/amenities";

export const metadata: Metadata = pageMeta({
  title: "Amenities",
  description:
    "Explore Peaches Fitness Club amenities — weight room, cardio, Booty Builder® equipment, group classes, sauna, cold plunge, recovery, members lounge, free Tea Bar and more in Albuquerque.",
  path: "/amenities",
});

export default function AmenitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="The club"
        title="Amenities"
        intro="Everything you need for a strong workout and a real recovery — all in one women-focused space."
      />

      <Section tone="cream">
        <div className="space-y-16">
          {amenities.map((a, i) => {
            const hasImg = a.images.length > 0;
            return (
              <div
                key={a.slug}
                className={`grid items-center gap-8 lg:grid-cols-2 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                {hasImg ? (
                  <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[var(--shadow-card)]">
                    <Image
                      src={a.images[0].src}
                      alt={a.images[0].alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      loading={i < 2 ? "eager" : "lazy"}
                    />
                  </div>
                ) : (
                  // Empty decorative box: hidden on mobile (single-column grid — it would
                  // just waste a full 4:3 of scroll), shown on lg to balance the 2-col layout.
                  <div className="hidden aspect-[4/3] items-center justify-center rounded-3xl bg-peach/40 lg:flex">
                    <IconPeach className="h-16 w-16 text-coral/70" />
                  </div>
                )}
                <div>
                  <h2 className="text-3xl font-semibold uppercase tracking-wide">{a.name}</h2>
                  <p className="mt-3 text-lg text-charcoal/75 leading-relaxed">{a.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <MembershipCTA />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Amenities", path: "/amenities" },
        ])}
      />
    </>
  );
}
