import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Terms of Service",
  description: "The terms that govern use of the Peaches Fitness Club website and services.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <Section tone="cream" containerSize="narrow">
      <h1 className="text-4xl font-semibold uppercase tracking-wide">Terms of Service</h1>
      <div className="mt-6 space-y-4 text-charcoal/80 leading-relaxed">
        <p>
          This is placeholder terms copy. By using the Peaches Fitness Club website you agree to use
          it for lawful purposes only. Membership, day passes, and class bookings are subject to the
          policies provided at sign-up and to our{" "}
          <a className="text-coral-deep underline" href="/code-of-conduct">
            Code of Conduct
          </a>
          .
        </p>
        <p>
          Content on this site is provided for general information and may change without notice.
          Pricing and schedules are confirmed in person or through our member portal.
        </p>
        <p className="text-sm text-charcoal/80">
          The club owner will replace this with finalized legal copy before launch.
        </p>
      </div>
    </Section>
  );
}
