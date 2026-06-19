import { Container } from "@/components/ui/Container";

export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="bg-peach/30 pt-16 pb-14 sm:pt-20 sm:pb-16">
      <Container size="narrow" className="text-center">
        {eyebrow ? <p className="script text-3xl text-coral-deep">{eyebrow}</p> : null}
        <h1 className="mt-1 text-4xl sm:text-5xl font-semibold uppercase tracking-tight">{title}</h1>
        {intro ? <p className="mt-4 text-lg text-charcoal/75">{intro}</p> : null}
      </Container>
    </section>
  );
}
