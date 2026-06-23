import type { DayPass } from "./types";

export const dayPasses: DayPass[] = [
  {
    name: "Standard Day Pass",
    price: "$15",
    includes: ["24-hour unlimited gym use"],
  },
  {
    name: "Premium Day Pass",
    price: "$25",
    highlighted: true,
    includes: ["24-hour unlimited gym use", "Sauna", "Cold plunge", "Group classes"],
  },
];
