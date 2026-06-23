import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/seo";
import { conductIntro, conductRules } from "@/content/codeOfConduct";

export const metadata: Metadata = pageMeta({
  title: "Code of Conduct",
  description:
    "The Peaches Fitness Club Code of Conduct — the respect, safety and privacy standards that keep our women-focused gym a secure, empowering space.",
  path: "/code-of-conduct",
});

export default function CodeOfConductPage() {
  return (
    <>
      <PageHero eyebrow="Respect & safety" title="Code of Conduct" />

      <Section tone="cream" containerSize="narrow">
        <p className="text-lg text-charcoal/80 leading-relaxed">{conductIntro}</p>

        <ol className="mt-10 space-y-5">
          {conductRules.map((rule, i) => (
            <li key={rule.title} className="flex gap-4 rounded-2xl bg-white/80 p-6 ring-1 ring-charcoal/5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-coral-deep text-sm font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <h2 className="font-semibold text-charcoal">{rule.title}</h2>
                <p className="mt-1 text-charcoal/75 leading-relaxed">{rule.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Code of Conduct", path: "/code-of-conduct" },
        ])}
      />
    </>
  );
}
