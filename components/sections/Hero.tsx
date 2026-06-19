import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { RotatingWord } from "@/components/ui/RotatingWord";
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
        className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/50 to-charcoal/75"
      />

      <Container className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center py-24 text-center text-cream">
        {/* Original brand logo (wordmark) */}
        <Image
          src="/images/brand/MAINLOGO.png"
          alt="Peaches Fitness Club"
          width={460}
          height={460}
          priority
          className="w-56 sm:w-72 h-auto drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)]"
        />

        {/* Animated brand slogan — word swap (decorative; sr-only full phrase below) */}
        <p className="script -mt-2 text-3xl sm:text-5xl text-peach">
          Where good things are{" "}
          <span aria-hidden="true">
            <RotatingWord
              words={["growing", "thriving", "happening"]}
              className="script text-cream"
            />
          </span>
          <span className="sr-only">growing, thriving, and happening.</span>
        </p>

        <h1 className="mt-6 max-w-3xl text-2xl sm:text-4xl font-semibold uppercase leading-[1.1] tracking-tight">
          Albuquerque&apos;s women-focused fitness club
        </h1>
        <p className="mt-4 max-w-xl text-base sm:text-lg text-cream/90">
          Strong, safe and community-driven. Train your way in a judgment-free space built entirely
          for women — weights, classes, sauna, cold plunge and more.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href={site.glofox.membershipsUrl} external size="lg">
            Join Now
          </Button>
          <Button
            href="/amenities"
            size="lg"
            variant="secondary"
            className="!text-cream !ring-cream/50 hover:!ring-peach hover:!text-peach"
          >
            Explore the club
          </Button>
        </div>
      </Container>
    </section>
  );
}
