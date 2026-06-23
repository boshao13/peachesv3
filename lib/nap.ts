import type { SiteConfig } from "@/content/types";

type Nap = SiteConfig["nap"];

/** Full one-line address, single-sourced from site.nap (spec §6.1). */
export function formatAddress(nap: Nap): string {
  const line1 = nap.suite ? `${nap.street}, ${nap.suite}` : nap.street;
  return `${line1}, ${nap.city}, ${nap.state} ${nap.zip}`;
}

/** Google Maps directions deep-link, driven entirely by site.nap. */
export function directionsUrl(nap: Nap): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    formatAddress(nap),
  )}`;
}

/** schema.org PostalAddress object for LocalBusiness JSON-LD. */
export function postalAddress(nap: Nap) {
  return {
    "@type": "PostalAddress",
    streetAddress: nap.suite ? `${nap.street}, ${nap.suite}` : nap.street,
    addressLocality: nap.city,
    addressRegion: nap.state,
    postalCode: nap.zip,
    addressCountry: "US",
  };
}
