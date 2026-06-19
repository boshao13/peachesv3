import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/sections/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { MembershipCTA } from "@/components/sections/MembershipCTA";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About Us",
  description:
    "Peaches Fitness Club is a locally owned, women-focused gym in Albuquerque, NM — founded by a brother-sister team to give women a safe, supportive place to grow strong.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Our story"
        title="More than a gym"
        intro="Locally owned and built for the women of Albuquerque."
      />

      <Section tone="cream" containerSize="narrow">
        <div className="space-y-5 text-lg text-charcoal/80 leading-relaxed">
          <p>
            At Peaches Fitness Club, we&apos;re dedicated to fostering a welcoming, judgment-free
            environment that empowers clients to achieve their fitness goals. Our commitment to
            safety, support for women, and emphasis on diversity and inclusivity underpin our
            community&apos;s spirit.
          </p>
          <p>
            With top-notch trainers, advanced facilities, and a nurturing community, we inspire
            confidence and healthy living — celebrating the joy of self-improvement and the strength
            found in encouragement. At Peaches, we&apos;re more than a gym; we&apos;re a community
            where everyone grows together.
          </p>
          <p>
            Peaches was opened in June 2024 by Rachel Berrier and Sean Kaplan, a brother-and-sister
            team who wanted to give Albuquerque a fitness club designed specifically around the way
            women want to train — comfortable, well-equipped, and free of intimidation.
          </p>
        </div>
      </Section>

      <Section tone="cream-2">
        <SectionHeading eyebrow="The space" title="Designed around you" />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl shadow-[var(--shadow-card)]">
            <Image
              src="/images/gym/Gym1.webp"
              alt="The Peaches Fitness Club training floor"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-3xl shadow-[var(--shadow-card)]">
            <Image
              src="/images/lounge/PeachesLounge.webp"
              alt="The members lounge"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      <MembershipCTA />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
    </>
  );
}
