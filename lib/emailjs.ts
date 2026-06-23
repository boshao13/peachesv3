// Client-side email via EmailJS — the gym's existing account (carried over from the
// old site). These IDs are PUBLIC by design (EmailJS protects the account with an
// allowed-origins list + per-account quotas), so they live in the client bundle.
// No server API key, Resend, or Upstash needed.
//
// Templates expect these variables (matching the legacy forms):
//   contact    → user_name, user_email, user_phone, message
//   careers    → name, email, phone, address, education, experience, overEighteen, gender, position
//   newsletter → user_email
const EMAILJS = {
  publicKey: "gk157tFkxTFBmQWBQ",
  serviceId: "service_3ykzhp7",
  templates: {
    contact: "template_8c53d6n",
    careers: "template_9ntam3d",
    newsletter: "template_2q0mhqd",
  },
} as const;

export type EmailjsTemplate = keyof typeof EMAILJS.templates;

/**
 * Send a templated email through EmailJS from the browser.
 * The SDK is dynamically imported so it stays out of the initial page bundle
 * (loaded only when a visitor actually submits a form). Throws on failure.
 */
export async function sendEmail(
  template: EmailjsTemplate,
  params: Record<string, string>,
): Promise<void> {
  const emailjs = (await import("@emailjs/browser")).default;
  await emailjs.send(EMAILJS.serviceId, EMAILJS.templates[template], params, {
    publicKey: EMAILJS.publicKey,
  });
}
