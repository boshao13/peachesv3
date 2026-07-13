import type { ComponentType, SVGProps } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { IconBloom, IconShield, IconCommunity, IconSparkle } from "@/components/ui/icons";

const values: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  body: string;
}[] = [
  {
    icon: IconBloom,
    title: "Women-Focused",
    body: "Every machine, class and corner is designed with women's goals in mind — comfortable, effective and genuinely yours.",
  },
  {
    icon: IconShield,
    title: "Judgment-Free",
    body: "A safe, welcoming space where every body and every level belongs. Come as you are; leave a little stronger.",
  },
  {
    icon: IconCommunity,
    title: "Strong Community",
    body: "Locally owned by a brother-sister team, Peaches is more than a gym — it's a community that grows together.",
  },
  {
    icon: IconSparkle,
    title: "Premium Amenities",
    body: "Sauna, cold plunge, a members lounge and a free Tea Bar — wellness that goes beyond the workout.",
  },
];

export function ValueProps() {
  return (
    <Section tone="cream">
      <SectionHeading
        eyebrow="Why Peaches"
        title="A gym that finally feels like yours"
        intro="We built Peaches so women in Albuquerque have a place to train that's safe, supportive and seriously well-equipped."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {values.map((v, i) => {
          const Icon = v.icon;
          return (
            <Reveal
              key={v.title}
              delay={i * 0.08}
              className="rounded-2xl bg-white/80 p-6 ring-1 ring-charcoal/5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-peach/50 text-coral-deep">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-xl font-semibold">{v.title}</h3>
              <p className="mt-2 text-charcoal/75 leading-relaxed">{v.body}</p>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
