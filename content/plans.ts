import type { Plan } from "./types";

// The gym's two current membership offerings. Purchase/registration is Glofox-only
// (every "Join Now" CTA links to site.glofox.membershipsUrl).
export const plans: Plan[] = [
  {
    slug: "12-month",
    tier: "12-Month Commitment",
    price: "$65/mo",
    cadence: "monthly",
    highlighted: true,
    features: [
      "Classes, sauna, equipment & cold plunge",
      "12-month commitment",
      "$25 sign-up fee",
      "No annual fee",
    ],
  },
  {
    slug: "month-to-month",
    tier: "Month-to-Month",
    price: "$75/mo",
    cadence: "monthly",
    features: [
      "Classes, sauna, equipment & cold plunge",
      "No monthly commitment",
      "$25 sign-up fee",
      "No annual fee",
    ],
  },
];
