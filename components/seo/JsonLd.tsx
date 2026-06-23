import { site } from "@/content/site";
import { postalAddress } from "@/lib/nap";

/** Renders a JSON-LD <script>. Server component. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** HealthClub / LocalBusiness schema, single-sourced from content/site.ts (spec §8). */
export function localBusinessSchema() {
  const { nap } = site;
  const sameAs = [site.socials.instagram];
  if (site.socials.facebook) sameAs.push(site.socials.facebook);

  return {
    "@context": "https://schema.org",
    "@type": "HealthClub",
    "@id": `${site.siteUrl}/#business`,
    name: site.name,
    description:
      "Albuquerque's women-focused fitness club — weights, cardio, classes, sauna, cold plunge, kids care, and a supportive community.",
    url: site.siteUrl,
    telephone: nap.phone,
    email: nap.email,
    image: `${site.siteUrl}/og.png`,
    priceRange: site.priceRange,
    address: postalAddress(nap),
    geo: {
      "@type": "GeoCoordinates",
      latitude: nap.geo.lat,
      longitude: nap.geo.lng,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "05:00",
        closes: "22:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "05:00",
        closes: "20:00",
      },
    ],
    sameAs,
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${site.siteUrl}${it.path}`,
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
