import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Gallery } from "@/components/ui/Gallery";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/seo";
import { kidsCare } from "@/content/kidsCare";

export const metadata: Metadata = pageMeta({
  title: "Kids Care",
  description:
    "On-site Kids Care at Peaches Fitness Club in Albuquerque — $15/month plus $5 per additional child. Work out with peace of mind while your kids have fun nearby.",
  path: "/kids-care",
});

export default function KidsCarePage() {
  return (
    <>
      <PageHero
        eyebrow="For busy moms"
        title="Kids Care"
        intro="Prioritize yourself while we look after your little ones — just a hop, skip and a jump away."
      />

      <Section tone="cream" containerSize="narrow">
        <p className="text-lg text-charcoal/80 leading-relaxed">{kidsCare.intro}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <div className="rounded-2xl bg-peach/40 px-6 py-4">
            <p className="text-3xl font-semibold text-coral-deep">{kidsCare.priceMonthly}</p>
            <p className="text-sm text-charcoal/70">per child</p>
          </div>
          <div className="rounded-2xl bg-peach/40 px-6 py-4">
            <p className="text-3xl font-semibold text-coral-deep">{kidsCare.priceAdditional}</p>
            <p className="text-sm text-charcoal/70">per additional child</p>
          </div>
        </div>
      </Section>

      <Section tone="cream-2">
        <Gallery images={kidsCare.images} />
      </Section>

      <MembershipCTA />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Kids Care", path: "/kids-care" },
        ])}
      />
    </>
  );
}
