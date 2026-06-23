import { describe, it, expect } from "vitest";
import { formatAddress, directionsUrl, postalAddress } from "../nap";

const nap = {
  street: "2801 Eubank Blvd NE",
  suite: "Suite P",
  city: "Albuquerque",
  state: "NM",
  zip: "87112",
  phone: "(505) 808-9499",
  phoneHref: "+15058089499",
  email: "x@y.com",
  geo: { lat: 35.115047, lng: -106.536046 },
};

describe("nap serialization (single source)", () => {
  it("formats the full address with suite + correct ZIP", () => {
    expect(formatAddress(nap)).toBe("2801 Eubank Blvd NE, Suite P, Albuquerque, NM 87112");
  });

  it("omits suite cleanly when absent", () => {
    expect(formatAddress({ ...nap, suite: undefined })).toBe(
      "2801 Eubank Blvd NE, Albuquerque, NM 87112",
    );
  });

  it("builds a URL-encoded directions link from the address", () => {
    const url = directionsUrl(nap);
    expect(url.startsWith("https://www.google.com/maps/dir/?api=1&destination=")).toBe(true);
    expect(url).toContain(encodeURIComponent("2801 Eubank Blvd NE, Suite P, Albuquerque, NM 87112"));
    expect(url).not.toContain("87110"); // never the stale ZIP
  });

  it("produces a schema.org PostalAddress", () => {
    expect(postalAddress(nap)).toEqual({
      "@type": "PostalAddress",
      streetAddress: "2801 Eubank Blvd NE, Suite P",
      addressLocality: "Albuquerque",
      addressRegion: "NM",
      postalCode: "87112",
      addressCountry: "US",
    });
  });
});
