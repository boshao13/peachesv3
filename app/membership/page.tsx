import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { IconCheck } from "@/components/ui/icons";
import { pageMeta } from "@/lib/seo";
import { plans } from "@/content/plans";
import { site } from "@/content/site";

export const metadata: Metadata = pageMeta({
  title: "Membership",
  description:
    "Peaches Fitness Club memberships in Albuquerque — monthly, quarterly and annual plans with full access to amenities and classes.",
  path: "/membership",
});

export default function MembershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Join us"
        title="Membership"
        intro="Flexible plans, full access, and a community that has your back."
      />

      {site.promo.enabled ? (
        <div className="bg-coral-deep py-3 text-center text-sm font-semibold text-white">
          {site.promo.text}
        </div>
      ) : null}

      <Section tone="cream">
        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.slug}
              className={`flex flex-col rounded-3xl p-8 ring-1 transition-transform hover:-translate-y-1 ${
                p.highlighted
                  ? "bg-white ring-coral-deep/40 shadow-[var(--shadow-soft)] lg:scale-[1.03]"
                  : "bg-white/80 ring-charcoal/5 shadow-[var(--shadow-card)]"
              }`}
            >
              {p.highlighted ? (
                <span className="mb-3 self-start rounded-full bg-peach px-3 py-1 text-xs font-semibold uppercase tracking-wide text-charcoal">
                  Most popular
                </span>
              ) : null}
              <h2 className="text-2xl font-semibold">{p.tier}</h2>
              <p className="mt-1 text-3xl font-semibold text-coral-deep">
                {p.price ?? "Contact for pricing"}
              </p>
              <ul className="mt-6 flex-1 space-y-2.5 text-charcoal/80">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <IconCheck className="mt-1 h-4 w-4 shrink-0 text-sage" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href={site.glofox.membershipsUrl} external className="w-full">
                  Join Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-charcoal/70">
          Questions about which plan fits you best?{" "}
          <a href="/contact" className="font-semibold text-coral-deep hover:text-coral-dark">
            Contact us
          </a>{" "}
          or stop by the front desk — we&apos;ll walk you through current options.
        </p>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Membership", path: "/membership" },
        ])}
      />
    </>
  );
}
