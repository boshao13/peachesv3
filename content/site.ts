import type { SiteConfig } from "./types";

// SINGLE SOURCE of NAP + integration config (spec §6.1). Address/phone/socials are
// owner-authoritative from the project brief. Confirm before production (spec §13).
export const site: SiteConfig = {
  name: "Peaches Fitness Club",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.peachesfitnessclub.com",
  nap: {
    street: "2801 Eubank Blvd NE",
    suite: "Suite P",
    city: "Albuquerque",
    state: "NM",
    zip: "87112",
    phone: "(505) 808-9499",
    phoneHref: "+15058089499",
    email: "peachesfitnessclub@gmail.com",
    geo: { lat: 35.115047, lng: -106.536046 },
  },
  hours: {
    operating: [
      { days: "Mon–Fri", open: "5:00 AM", close: "10:00 PM" },
      { days: "Sat–Sun", open: "5:00 AM", close: "8:00 PM" },
    ],
    staffed: [
      { days: "Mon–Fri", open: "8:00 AM", close: "10:00 PM" },
      { days: "Sat–Sun", open: "8:00 AM", close: "8:00 PM" },
    ],
  },
  socials: {
    instagram: "https://www.instagram.com/peachesfitnessclub/",
    // facebook intentionally omitted from sameAs until the exact page URL is confirmed (spec §8/§13)
  },
  glofox: {
    branchId: "65d38d833aabb0e6490203b0",
    membershipsUrl:
      "https://app.glofox.com/portal/#/branch/65d38d833aabb0e6490203b0/memberships",
    scheduleUrl:
      "https://app.glofox.com/portal/#/branch/65d38d833aabb0e6490203b0/classes-day-view",
  },
  mapbox: {
    styleUrl: "mapbox://styles/peachesgym/clqea736d005p01of0tvtg9g8",
    zoom: 14,
    pitch: 60,
  },
  promo: {
    enabled: false,
    text: "No sign-up fee — limited-time grand-opening rate",
  },
  priceRange: "$$",
};
