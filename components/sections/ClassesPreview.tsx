import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { classes } from "@/content/classes";

export function ClassesPreview() {
  return (
    <Section tone="cream">
      <SectionHeading
        eyebrow="Move with us"
        title="Group classes for every level"
        intro="Energizing, women-friendly classes led by instructors who meet you where you are."
      />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {classes.map((c) => (
          <div
            key={c.slug}
            className="rounded-2xl bg-peach/30 p-6 ring-1 ring-charcoal/5 transition-transform hover:-translate-y-1"
          >
            <h3 className="text-xl font-semibold">{c.name}</h3>
            <p className="mt-2 text-charcoal/75 leading-relaxed">{c.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button href="/classes">View the schedule</Button>
      </div>
    </Section>
  );
}
