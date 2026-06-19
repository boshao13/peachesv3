import { Resend } from "resend";
import type { ContactBody } from "./schemas";
import { site } from "@/content/site";

// Resend sender (spec §10). Timeout via Promise.race → maps to a send failure.
const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

const FROM = "Peaches Website <onboarding@resend.dev>"; // replace with a verified domain sender at launch
const TO = site.nap.email;

function subjectFor(body: ContactBody): string {
  switch (body.formType) {
    case "contact":
      return `New contact/lead from ${body.name}`;
    case "careers":
      return `New careers application — ${body.position} (${body.name})`;
    case "newsletter":
      return `New newsletter signup`;
  }
}

function htmlFor(body: ContactBody): string {
  const rows = Object.entries(body)
    .filter(([k]) => k !== "company")
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:600">${k}</td><td>${String(v ?? "")}</td></tr>`)
    .join("");
  return `<h2>Peaches Fitness Club — ${body.formType}</h2><table>${rows}</table>`;
}

function replyToFor(body: ContactBody): string | undefined {
  return "email" in body ? body.email : undefined;
}

const TIMEOUT_MS = 8000;

/** Send the submission email. Throws on failure/timeout (caller maps to 502). */
export async function sendSubmission(body: ContactBody): Promise<void> {
  if (!resend) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY missing in production");
    }
    // eslint-disable-next-line no-console
    console.warn("[email] RESEND_API_KEY not set — logging submission instead (dev):", body);
    return;
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("resend_timeout")), TIMEOUT_MS),
  );

  const send = resend.emails.send({
    from: FROM,
    to: TO,
    subject: subjectFor(body),
    html: htmlFor(body),
    replyTo: replyToFor(body),
  });

  const result = (await Promise.race([send, timeout])) as Awaited<typeof send>;
  if (result.error) throw new Error(result.error.message);
}
