import type { DayPass } from "./types";

export const dayPasses: DayPass[] = [
  {
    name: "Standard Day Pass",
    price: "$15",
    includes: ["Full-day gym access"],
  },
  {
    name: "Premium Day Pass",
    price: "$25",
    highlighted: true,
    includes: ["Full-day gym access", "Sauna", "Cold plunge", "Group classes"],
  },
];
