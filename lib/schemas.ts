import { z } from "zod";
import { GENDERS, POSITIONS } from "@/content/careers";

// zod v3 discriminated union on `formType` (spec §10). Honeypot field `company` must be empty.
const honeypot = z.string().max(0).optional().or(z.literal(""));

const contactSchema = z.object({
  formType: z.literal("contact"),
  name: z.string().min(1, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  message: z.string().max(5000).optional(),
  company: honeypot,
});

const careersSchema = z.object({
  formType: z.literal("careers"),
  name: z.string().min(1, "Please enter your name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(1, "Please enter your phone number"),
  address: z.string().min(1, "Please enter your address"),
  education: z.string().min(1, "Please tell us about your education"),
  experience: z.string().min(1, "Please tell us about your experience"),
  // rendered as a yes/no select; coerced to boolean
  overEighteen: z.preprocess(
    (v) => (v === "yes" ? true : v === "no" ? false : v),
    z.boolean({ required_error: "Please confirm whether you are over 18" }),
  ),
  gender: z.enum(GENDERS),
  position: z.enum(POSITIONS),
  company: honeypot,
});

const newsletterSchema = z.object({
  formType: z.literal("newsletter"),
  email: z.string().email("Please enter a valid email"),
  company: honeypot,
});

export const contactBodySchema = z.discriminatedUnion("formType", [
  contactSchema,
  careersSchema,
  newsletterSchema,
]);

export type ContactBody = z.infer<typeof contactBodySchema>;
export type FormType = ContactBody["formType"];

/** Flatten zod errors to one message per field (first issue), keyed by field name. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
