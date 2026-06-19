import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { site } from "@/content/site";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background image — preloaded (LCP) */}
      <Image
        src="/images/brand/mainbackground.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Legibility overlay */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-charcoal/65 via-charcoal/45 to-charcoal/70"
      />

      <Container className="relative z-10 flex min-h-[88vh] flex-col items-center justify-center py-28 text-center text-cream">
        <p className="script text-3xl sm:text-4xl text-peach drop-shadow">Where good things are</p>
        <h1 className="mt-2 max-w-4xl text-4xl sm:text-6xl font-semibold uppercase leading-[1.05] tracking-tight drop-shadow-sm">
          Albuquerque&apos;s women-focused fitness club
        </h1>
        <p className="mt-5 max-w-xl text-lg text-cream/90">
          Strong, safe and community-driven. Train your way in a judgment-free space built entirely
          for women — weights, classes, sauna, cold plunge and more.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href={site.glofox.membershipsUrl} external size="lg">
            Join Now
          </Button>
          <Button href="/amenities" size="lg" variant="secondary" className="!text-cream !ring-cream/50 hover:!ring-peach hover:!text-peach">
            Explore the club
          </Button>
        </div>
      </Container>
    </section>
  );
}
