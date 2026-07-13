import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { TrainerCard } from "@/components/trainers/TrainerCard";
import { trainers } from "@/content/trainers";

export function TrainersPreview() {
  return (
    <Section tone="cream-2">
      <SectionHeading
        eyebrow="Meet the team"
        title="Trainers in your corner"
        intro="Certified, women-focused coaches who help you build strength and confidence — one session at a time."
      />
      <div className="mt-12 grid gap-8 sm:grid-cols-2 max-w-3xl mx-auto">
        {trainers.map((t) => (
          <TrainerCard key={t.slug} trainer={t} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button href="/trainers" size="xl">
          Meet our trainers
        </Button>
      </div>
    </Section>
  );
}
