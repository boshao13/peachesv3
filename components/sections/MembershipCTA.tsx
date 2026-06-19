import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";

export function MembershipCTA() {
  return (
    <section className="bg-charcoal py-20 text-cream">
      <Container size="narrow" className="text-center">
        {site.promo.enabled ? (
          <p className="mb-4 inline-block rounded-full bg-coral-deep px-4 py-1.5 text-sm font-semibold">
            {site.promo.text}
          </p>
        ) : null}
        <h2 className="text-3xl sm:text-4xl font-semibold uppercase tracking-wide">
          Ready to join the Peaches family?
        </h2>
        <p className="mt-4 text-cream/80 text-lg">
          Memberships are monthly, quarterly or annual — every plan includes full access to
          amenities and classes. Stop by or reach out and we&apos;ll find your perfect fit.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={site.glofox.membershipsUrl} external size="lg">
            Join Now
          </Button>
          <Button
            href="/membership"
            size="lg"
            variant="secondary"
            className="!text-cream !ring-cream/40 hover:!text-peach hover:!ring-peach"
          >
            Compare plans
          </Button>
        </div>
      </Container>
    </section>
  );
}
