import type { Plan } from "./types";

// Pricing intentionally left as "Contact for pricing" placeholders (spec §6.2) — owner to confirm.
export const plans: Plan[] = [
  {
    slug: "monthly",
    tier: "Monthly",
    price: null,
    cadence: "monthly",
    features: [
      "Full access to all gym amenities",
      "Unlimited group classes",
      "Sauna & cold plunge",
      "Members lounge & Peachy Bar",
      "Month-to-month flexibility",
    ],
  },
  {
    slug: "quarterly",
    tier: "Quarterly",
    price: null,
    cadence: "quarterly",
    highlighted: true,
    features: [
      "Everything in Monthly",
      "Better per-month value",
      "Priority class booking",
      "Bring-a-friend guest passes",
    ],
  },
  {
    slug: "annual",
    tier: "Annual",
    price: null,
    cadence: "annual",
    features: [
      "Everything in Quarterly",
      "Best per-month value",
      "Exclusive member perks & events",
      "Locked-in rate",
    ],
  },
];
