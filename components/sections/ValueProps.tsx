import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

const values = [
  {
    icon: "🌸",
    title: "Women-Focused",
    body: "Every machine, class and corner is designed with women's goals in mind — comfortable, effective and genuinely yours.",
  },
  {
    icon: "🤝",
    title: "Judgment-Free",
    body: "A safe, welcoming space where every body and every level belongs. Come as you are; leave a little stronger.",
  },
  {
    icon: "💪",
    title: "Strong Community",
    body: "Locally owned by a brother-sister team, Peaches is more than a gym — it's a community that grows together.",
  },
  {
    icon: "✨",
    title: "Premium Amenities",
    body: "Sauna, cold plunge, recovery, a members lounge and the Peachy Bar — wellness that goes beyond the workout.",
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
        {values.map((v, i) => (
          <Reveal
            key={v.title}
            delay={i * 0.08}
            className="rounded-2xl bg-white/80 p-6 ring-1 ring-charcoal/5 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1"
          >
            <div className="text-3xl" aria-hidden>
              {v.icon}
            </div>
            <h3 className="mt-3 text-xl font-semibold">{v.title}</h3>
            <p className="mt-2 text-charcoal/75 leading-relaxed">{v.body}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
