import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { GlofoxEmbed } from "@/components/glofox/GlofoxEmbed";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/seo";
import { classes } from "@/content/classes";
import { site } from "@/content/site";

export const metadata: Metadata = pageMeta({
  title: "Classes",
  description:
    "Group fitness classes at Peaches Fitness Club in Albuquerque — yoga, Pilates, Zumba and strength training for women of every level. View the schedule and book your spot.",
  path: "/classes",
});

export default function ClassesPage() {
  return (
    <>
      <PageHero
        eyebrow="Move with us"
        title="Group Classes"
        intro="Energizing, women-friendly classes led by instructors who coach to every level."
      />

      {/* Server-rendered, indexable class content (independent of the Glofox embed) */}
      <Section tone="cream">
        <div className="grid gap-6 sm:grid-cols-2">
          {classes.map((c) => (
            <div
              key={c.slug}
              className="rounded-2xl bg-white/80 p-7 ring-1 ring-charcoal/5 shadow-[var(--shadow-card)]"
            >
              <h2 className="text-2xl font-semibold">{c.name}</h2>
              <p className="mt-2 text-charcoal/75 leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Live schedule — Glofox (facade added in integrations slice). Booking is Glofox-only. */}
      <Section tone="cream-2" id="schedule">
        <SectionHeading
          eyebrow="Live schedule"
          title="Book your spot"
          intro="View today's classes and reserve your place through our Glofox member portal."
        />
        <div className="mt-8">
          <GlofoxEmbed scheduleUrl={site.glofox.scheduleUrl} />
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Classes", path: "/classes" },
        ])}
      />
    </>
  );
}
