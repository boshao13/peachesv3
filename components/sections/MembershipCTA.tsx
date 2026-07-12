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
          Month-to-month or 12-month memberships — every plan includes classes, sauna,
          equipment and cold plunge. Stop by or reach out and we&apos;ll find your perfect fit.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href={site.glofox.membershipsUrl} external size="lg">
            Join Now
          </Button>
        </div>
      </Container>
    </section>
  );
}
