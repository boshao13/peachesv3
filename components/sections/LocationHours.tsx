import type { ReactNode } from "react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";
import { formatAddress, directionsUrl } from "@/lib/nap";

export function LocationHours({ mapSlot }: { mapSlot?: ReactNode }) {
  const { nap, hours } = site;
  return (
    <Section tone="cream" id="location">
      <SectionHeading eyebrow="Come train with us" title="Visit Peaches" align="center" />
      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-stretch">
        <div className="flex flex-col justify-center">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal/60">
            Location
          </h3>
          <a
            href={directionsUrl(nap)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 text-lg text-charcoal hover:text-coral-deep"
          >
            {formatAddress(nap)}
          </a>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal/60">
                Access hours
              </h3>
              <ul className="mt-2 space-y-1 text-charcoal/80">
                {hours.operating.map((h) => (
                  <li key={h.days}>
                    <span className="font-medium">{h.days}:</span> {h.open} – {h.close}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-charcoal/60">
                Staffed hours
              </h3>
              <ul className="mt-2 space-y-1 text-charcoal/80">
                {hours.staffed.map((h) => (
                  <li key={h.days}>
                    <span className="font-medium">{h.days}:</span> {h.open} – {h.close}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button href={directionsUrl(nap)} external>
              Get directions
            </Button>
            <Button href={`tel:${nap.phoneHref}`} variant="secondary">
              {nap.phone}
            </Button>
          </div>
        </div>

        <div className="min-h-[320px] overflow-hidden rounded-3xl ring-1 ring-charcoal/10">
          {mapSlot ?? (
            <a
              href={directionsUrl(nap)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-full min-h-[320px] items-center justify-center bg-peach/40 text-center text-charcoal/70"
            >
              <span>
                📍 {nap.city}, {nap.state}
                <br />
                <span className="text-sm underline">Open in Google Maps</span>
              </span>
            </a>
          )}
        </div>
      </div>
    </Section>
  );
}
