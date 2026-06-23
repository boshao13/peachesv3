import type { Stat } from "./types";

// Honest, verifiable facts only — never fabricated member counts (spec §6.4).
// Numeric-leading values animate (count-up); the rest render static.
export const stats: Stat[] = [
  { value: "12+", label: "Premium amenities" },
  { value: "4", label: "Group class formats" },
  { value: "5AM–10PM", label: "Weekday hours" },
  { value: "5AM–8PM", label: "Weekend hours" },
  { value: "Est. 2024", label: "Locally owned" },
];
