import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { PersonalTrainingForm } from "@/components/forms/PersonalTrainingForm";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { IconCheck } from "@/components/ui/icons";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Personal Training",
  description:
    "One-on-one personal training at Peaches Fitness Club in Albuquerque. Tell us your goals and a certified trainer will build a plan around you.",
  path: "/personal-training",
});

const HIGHLIGHTS = [
  "A certified trainer matched to your goals",
  "A plan built around your schedule and level",
  "Accountability, form coaching, and steady progress",
  "Access to all Peaches amenities — sauna, cold plunge & more",
];

export default function PersonalTrainingPage() {
  return (
    <>
      <PageHero
        eyebrow="Train with us"
        title="Personal Training"
        intro="Whether you're just starting out or chasing a new PR, our trainers meet you where you are and help you get where you want to be."
      />

      <Section tone="cream">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div>
            <h2 className="text-2xl font-semibold">Why train with a Peaches coach?</h2>
            <ul className="mt-6 space-y-3 text-charcoal/80">
              {HIGHLIGHTS.map((h) => (
                <li key={h} className="flex gap-3">
                  <IconCheck className="mt-1 h-5 w-5 shrink-0 text-sage" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-charcoal/75">
              Share a few details and we&apos;ll reach out to match you with the right trainer and set up your first
              session.
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Request personal training</h2>
            <p className="mt-2 text-charcoal/75">
              Fill out the form and a trainer will be in touch shortly.
            </p>
            <div className="mt-6">
              <PersonalTrainingForm />
            </div>
          </Card>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Personal Training", path: "/personal-training" },
        ])}
      />
    </>
  );
}
