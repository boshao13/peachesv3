// Server-side transactional email via Resend's REST API (no SDK dependency).
// SERVER ONLY — reads RESEND_API_KEY from the environment. Never import into a
// client component or the key would be bundled to the browser.
import "server-only";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

// Verified sending domain (DKIM/SPF/DMARC live in Route 53 for peachesfitnessclub.com).
export const MAIL_FROM = "Peaches Fitness Club <noreply@peachesfitnessclub.com>";

export interface SendArgs {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
    // Never hang a form submission on a slow provider.
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
}
