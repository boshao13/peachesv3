import { Section, SectionHeading } from "@/components/ui/Section";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { faq } from "@/content/faq";

// Home-page FAQ section (matches the live site, which shows the FAQ on the homepage).
// The dedicated /faq route carries the FAQPage JSON-LD to avoid duplicate structured data.
export function FaqSection() {
  return (
    <Section tone="cream" containerSize="narrow" id="faq">
      <SectionHeading
        eyebrow="Good to know"
        title="Frequently Asked Questions"
        intro="Everything you might want to know before you join."
      />
      <div className="mt-10">
        <Accordion items={faq} />
      </div>
      <div className="mt-8 text-center">
        <Button href="/contact" variant="secondary">
          Still have questions? Contact us
        </Button>
      </div>
    </Section>
  );
}
