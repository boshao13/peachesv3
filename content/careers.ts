// Canonical enum literals — these are BOTH the <option value> and the label, and must
// match the zod schema exactly (spec §10, Appendix A). Legacy CRA values are replaced.
export const GENDERS = ["Male", "Female", "Non-Binary", "Prefer Not To Answer"] as const;
export type Gender = (typeof GENDERS)[number];

export const POSITIONS = [
  "Front Desk",
  "Child Care Provider",
  "Personal Trainer",
  "Group Instructor", // typo "Group Instuctor" from the live form is corrected here
] as const;
export type Position = (typeof POSITIONS)[number];

export const careersIntro =
  "Love what we're building? We're always looking for warm, motivated people to join the Peaches team. Tell us about yourself below and we'll be in touch.";
