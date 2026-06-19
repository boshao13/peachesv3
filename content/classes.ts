import type { ClassType } from "./types";

// Server-rendered class types (spec §8 — must be indexable independent of the Glofox embed).
export const classes: ClassType[] = [
  {
    slug: "yoga",
    name: "Yoga",
    description:
      "Flow, breathe and build flexibility and core strength in a calming, all-levels practice.",
  },
  {
    slug: "pilates",
    name: "Pilates",
    description:
      "Low-impact, high-focus work that strengthens your core, improves posture and tones from the inside out.",
  },
  {
    slug: "zumba",
    name: "Zumba",
    description:
      "A high-energy dance workout that burns serious calories while feeling more like a party than a class.",
  },
  {
    slug: "strength-training",
    name: "Strength Training",
    description:
      "Coached resistance sessions that build real, functional strength and confidence under the bar.",
  },
];
