import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { JsonLd, faqSchema, breadcrumbSchema } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/seo";
import { faq } from "@/content/faq";

export const metadata: Metadata = pageMeta({
  title: "FAQ",
  description:
    "Answers to common questions about Peaches Fitness Club — our women-focused approach, classes, personal training, amenities, memberships and booking.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="Good to know"
        title="Frequently Asked Questions"
        intro="Everything you might want to know before you join."
      />

      <Section tone="cream" containerSize="narrow">
        {/* Server-rendered Q&A (also emitted as FAQPage JSON-LD, matching exactly) */}
        <Accordion items={faq} />
      </Section>

      <MembershipCTA />

      <JsonLd data={faqSchema(faq)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />
    </>
  );
}
