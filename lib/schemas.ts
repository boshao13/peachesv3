import { z } from "zod";
import { GENDERS, POSITIONS } from "@/content/careers";

// Upper bounds on every free-text field. Without them a single request could push
// megabytes through JSON.parse -> zod -> HTML templating on a 0.9 GB box, and the
// submitted name is interpolated into an email subject line.
const NAME_MAX = 100;
const SHORT_MAX = 200;
const LINE_MAX = 500;

// zod v3 discriminated union on `formType` (spec §10). Honeypot field `company` must be empty.
const honeypot = z.string().max(0).optional().or(z.literal(""));

const contactSchema = z.object({
  formType: z.literal("contact"),
  name: z.string().min(1, "Please enter your name").max(NAME_MAX),
  email: z.string().email("Please enter a valid email").max(254),
  phone: z.string().max(SHORT_MAX).optional(),
  message: z.string().max(5000).optional(),
  company: honeypot,
});

const careersSchema = z.object({
  formType: z.literal("careers"),
  name: z.string().min(1, "Please enter your name").max(NAME_MAX),
  email: z.string().email("Please enter a valid email").max(254),
  phone: z.string().min(1, "Please enter your phone number").max(SHORT_MAX),
  address: z.string().min(1, "Please enter your address").max(LINE_MAX),
  education: z.string().min(1, "Please tell us about your education").max(2000),
  experience: z.string().min(1, "Please tell us about your experience").max(2000),
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
  email: z.string().email("Please enter a valid email").max(254),
  company: honeypot,
});

const personalTrainingSchema = z.object({
  formType: z.literal("personal-training"),
  name: z.string().min(1, "Please enter your name").max(NAME_MAX),
  email: z.string().email("Please enter a valid email").max(254),
  phone: z.string().min(1, "Please enter your phone number").max(SHORT_MAX),
  goals: z.string().max(2000).optional(),
  experience: z.string().max(200).optional(),
  availability: z.string().max(500).optional(),
  company: honeypot,
});

export const contactBodySchema = z.discriminatedUnion("formType", [
  contactSchema,
  careersSchema,
  newsletterSchema,
  personalTrainingSchema,
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
