import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { pageMeta } from "@/lib/seo";
import { site } from "@/content/site";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy",
  description: "How Peaches Fitness Club collects, uses, and protects your information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <Section tone="cream" containerSize="narrow">
      <h1 className="text-4xl font-semibold uppercase tracking-wide">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-charcoal/80 leading-relaxed">
        <p>
          This is placeholder privacy copy. Peaches Fitness Club respects your privacy. We collect
          only the information you provide through our contact, careers, and newsletter forms (such
          as your name, email, and phone number) and use it solely to respond to your inquiry or
          send updates you&apos;ve requested.
        </p>
        <p>
          We do not sell your personal information. Form submissions are delivered to{" "}
          <a className="text-coral-deep underline" href={`mailto:${site.nap.email}`}>
            {site.nap.email}
          </a>
          . You may request deletion of your information at any time by contacting us.
        </p>
        <p className="text-sm text-charcoal/60">
          The club owner will replace this with finalized legal copy before launch.
        </p>
      </div>
    </Section>
  );
}
