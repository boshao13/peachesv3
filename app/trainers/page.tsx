import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { TrainerCard } from "@/components/trainers/TrainerCard";
import { PersonalTrainingForm } from "@/components/forms/PersonalTrainingForm";
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
      </Section>

      <Section tone="cream-2">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">Request personal training</h2>
            <p className="mt-3 text-charcoal/80">
              Tell us your goals and we&apos;ll match you with the right coach and get your first
              session set up.
            </p>
          </div>
          <Card className="mt-8 p-6 sm:p-8">
            <PersonalTrainingForm />
          </Card>
        </div>
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
