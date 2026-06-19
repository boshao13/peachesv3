import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { CareersForm } from "@/components/forms/CareersForm";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/seo";
import { careersIntro } from "@/content/careers";
import { site } from "@/content/site";

export const metadata: Metadata = pageMeta({
  title: "Careers",
  description:
    "Join the team at Peaches Fitness Club in Albuquerque — front desk, child care, personal training and group instructor roles. Apply online.",
  path: "/careers",
});

export default function CareersPage() {
  return (
    <>
      <PageHero eyebrow="Work with us" title="Careers" intro={careersIntro} />

      <Section tone="cream" containerSize="narrow">
        <CareersForm />
        <p className="mt-8 text-center text-sm text-charcoal/60">
          Prefer email? Send your resume to{" "}
          <a
            href={`mailto:${site.nap.email}?subject=New%20Applicant`}
            className="font-semibold text-coral-deep hover:text-coral-dark"
          >
            {site.nap.email}
          </a>
          .
        </p>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Careers", path: "/careers" },
        ])}
      />
    </>
  );
}
