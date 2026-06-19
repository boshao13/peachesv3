import type { ReactNode } from "react";
import { Container } from "./Container";
import { Reveal } from "./Reveal";

type Tone = "cream" | "cream-2" | "peach" | "charcoal" | "white";

const tones: Record<Tone, string> = {
  cream: "bg-cream text-charcoal",
  "cream-2": "bg-cream-2 text-charcoal",
  peach: "bg-peach/40 text-charcoal",
  charcoal: "bg-charcoal text-cream",
  white: "bg-white text-charcoal",
};

export function Section({
  children,
  tone = "cream",
  className = "",
  containerSize = "default",
  id,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
  containerSize?: "default" | "narrow" | "wide";
  id?: string;
}) {
  return (
    <section id={id} className={`py-16 sm:py-24 ${tones[tone]} ${className}`}>
      <Container size={containerSize}>{children}</Container>
    </section>
  );
}

/** Small eyebrow + heading + optional intro, used atop most sections. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "center" | "left";
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <Reveal className={`${alignment} max-w-2xl`}>
      {eyebrow ? (
        <p className="script text-2xl text-coral-deep mb-1">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl sm:text-4xl font-semibold uppercase tracking-wide">{title}</h2>
      {intro ? <p className="mt-4 text-charcoal/75 text-lg">{intro}</p> : null}
    </Reveal>
  );
}
