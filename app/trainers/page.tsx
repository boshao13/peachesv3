import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { TrainerCard } from "@/components/trainers/TrainerCard";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/seo";
import { trainers } from "@/content/trainers";

export const metadata: Metadata = pageMeta({
  title: "Trainers",
  description:
    "Meet the certified, women-focused personal trainers at Peaches Fitness Club in Albuquerque — here to help you build strength and confidence.",
  path: "/trainers",
});

export default function TrainersPage() {
  return (
    <>
      <PageHero
        eyebrow="Meet the team"
        title="Our Trainers"
        intro="Certified coaches who specialize in women's fitness and meet you exactly where you are."
      />

      <Section tone="cream">
        <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-2">
          {trainers.map((t) => (
            <TrainerCard key={t.slug} trainer={t} />
          ))}
        </div>
        <p className="mt-10 text-center text-charcoal/60">
          Interested in personal training?{" "}
          <a href="/contact" className="font-semibold text-coral-deep hover:text-coral-dark">
            Get in touch
          </a>{" "}
          and we&apos;ll match you with the right coach.
        </p>
      </Section>

      <MembershipCTA />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Trainers", path: "/trainers" },
        ])}
      />
    </>
  );
}
