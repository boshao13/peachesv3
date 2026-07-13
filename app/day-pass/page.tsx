import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { IconCheck } from "@/components/ui/icons";
import { pageMeta } from "@/lib/seo";
import { dayPasses } from "@/content/dayPasses";
import { site } from "@/content/site";

export const metadata: Metadata = pageMeta({
  title: "Day Pass",
  description:
    "Drop in at Peaches Fitness Club in Albuquerque with a day pass — Standard ($15) or Premium ($25) with sauna, cold plunge and classes. Available during staffed hours.",
  path: "/day-pass",
});

export default function DayPassPage() {
  return (
    <>
      <PageHero
        eyebrow="Just visiting?"
        title="Day Passes"
        intro="Try Peaches for a day — no membership required."
      />

      <Section tone="cream" containerSize="narrow">
        <div className="grid gap-6 sm:grid-cols-2">
          {dayPasses.map((d) => (
            <div
              key={d.name}
              className={`flex flex-col rounded-3xl p-8 text-center ring-1 ${
                d.highlighted
                  ? "bg-white ring-coral-deep/40 shadow-[var(--shadow-soft)]"
                  : "bg-white/80 ring-charcoal/5 shadow-[var(--shadow-card)]"
              }`}
            >
              <h2 className="text-xl font-semibold uppercase tracking-wide">{d.name}</h2>
              <p className="mt-2 text-5xl font-semibold text-coral-deep">{d.price}</p>
              <ul className="mt-6 flex-1 space-y-2 text-charcoal/80">
                {d.includes.map((f) => (
                  <li key={f} className="flex items-center justify-center gap-2">
                    <IconCheck className="h-4 w-4 shrink-0 text-sage" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <p className="text-charcoal/80">
            Day passes are available <strong>during staffed hours only</strong> — grab one at the
            front desk.
          </p>
          <p className="mt-1 text-sm text-charcoal/60">
            Staffed hours: {site.hours.staffed.map((h) => `${h.days} ${h.open}–${h.close}`).join(" · ")}
          </p>
          <div className="mt-5">
            <Button href={site.glofox.membershipsUrl} external>
              Become a member
            </Button>
          </div>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Day Pass", path: "/day-pass" },
        ])}
      />
    </>
  );
}
