import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/forms/ContactForm";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { pageMeta } from "@/lib/seo";
import { site } from "@/content/site";
import { formatAddress, directionsUrl } from "@/lib/nap";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description:
    "Get in touch with Peaches Fitness Club in Albuquerque, NM. Call (505) 808-9499, email us, or send a message — plus hours, directions and our location.",
  path: "/contact",
});

export default function ContactPage() {
  const { nap, hours } = site;
  return (
    <>
      <PageHero
        eyebrow="Say hello"
        title="Contact Us"
        intro="Questions about membership, training or a visit? We'd love to hear from you."
      />

      <Section tone="cream">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* form */}
          <div>
            <h2 className="text-2xl font-semibold">Send a message</h2>
            <p className="mt-2 text-charcoal/70">
              Fill out the form and we&apos;ll get back to you shortly.
            </p>
            <div className="mt-6">
              <ContactForm variant="full" />
            </div>
          </div>

          {/* details */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold">Visit us</h2>
              <a
                href={directionsUrl(nap)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-lg text-charcoal hover:text-coral-deep"
              >
                {formatAddress(nap)}
              </a>
              <div className="mt-3 space-y-1 text-charcoal/80">
                <a href={`tel:${nap.phoneHref}`} className="block hover:text-coral-deep">
                  {nap.phone}
                </a>
                <a href={`mailto:${nap.email}`} className="block hover:text-coral-deep">
                  {nap.email}
                </a>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
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

            {/* Map (Mapbox added in integrations slice) */}
            <div
              id="map"
              className="min-h-[300px] overflow-hidden rounded-3xl ring-1 ring-charcoal/10"
              data-map-slot
            >
              <a
                href={directionsUrl(nap)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full min-h-[300px] items-center justify-center bg-peach/40 text-center text-charcoal/70"
              >
                <span>
                  📍 {formatAddress(nap)}
                  <br />
                  <span className="text-sm underline">Open in Google Maps</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
    </>
  );
}
