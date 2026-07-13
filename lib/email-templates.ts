// Branded HTML email templates for Peaches Fitness Club (Resend).
// Emails use inline styles + table layout for broad client support.
import { site } from "@/content/site";

export type LeadKind = "contact" | "newsletter" | "careers" | "personal-training";

const C = {
  cream: "#fff8f0",
  cream2: "#fdf1e7",
  charcoal: "#2b2622",
  coral: "#d56f52",
  coralDeep: "#a8503a",
  peach: "#faccb5",
  sage: "#4e7a51",
};

/** Escape untrusted user input before interpolating into email HTML. */
function esc(input: string): string {
  return String(input).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
}

function addressLine(): string {
  const { street, suite, city, state, zip } = site.nap;
  return esc([street, suite, `${city}, ${state} ${zip}`].filter(Boolean).join(", "));
}

/** Branded outer shell shared by every email. */
function shell(opts: { heading: string; preheader: string; inner: string }): string {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>${esc(opts.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${C.cream2};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.charcoal};">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${esc(opts.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream2};padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.cream};border-radius:16px;overflow:hidden;">
      <tr><td style="background:${C.coralDeep};padding:22px 32px;">
        <span style="font-size:19px;font-weight:700;letter-spacing:.10em;color:${C.cream};text-transform:uppercase;">Peaches Fitness Club</span>
      </td></tr>
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:${C.charcoal};">${esc(opts.heading)}</h1>
        ${opts.inner}
      </td></tr>
      <tr><td style="background:${C.cream2};padding:20px 32px;border-top:1px solid rgba(43,38,34,.08);font-size:13px;line-height:1.6;color:rgba(43,38,34,.7);">
        ${esc(site.name)} &middot; ${addressLine()}<br>
        <a href="tel:${esc(site.nap.phoneHref)}" style="color:${C.coralDeep};text-decoration:none;">${esc(site.nap.phone)}</a>
        &nbsp;&middot;&nbsp;
        <a href="mailto:${esc(site.nap.email)}" style="color:${C.coralDeep};text-decoration:none;">${esc(site.nap.email)}</a>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

const p = (text: string) =>
  `<p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:${C.charcoal};">${text}</p>`;

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;background:${C.coralDeep};color:${C.cream};text-decoration:none;font-weight:600;padding:12px 24px;border-radius:9999px;font-size:15px;">${esc(label)}</a>`;
}

// ---- per-kind copy ----------------------------------------------------------
const COPY: Record<
  LeadKind,
  { confirmSubject: string; confirmHeading: string; confirmBody: string; notifyLabel: string }
> = {
  contact: {
    confirmSubject: "We got your message — Peaches Fitness Club",
    confirmHeading: "Thanks for reaching out!",
    confirmBody: "We've received your message and someone from our team will get back to you shortly. We're glad you're here.",
    notifyLabel: "contact message",
  },
  newsletter: {
    confirmSubject: "You're on the list — Peaches Fitness Club",
    confirmHeading: "Welcome to the Peaches community!",
    confirmBody: "You're subscribed to our newsletter — expect news, class updates, and member perks in your inbox.",
    notifyLabel: "newsletter signup",
  },
  careers: {
    confirmSubject: "Application received — Peaches Fitness Club",
    confirmHeading: "Thanks for applying!",
    confirmBody: "We've received your application and our team will review it. If it's a good fit, we'll reach out to talk next steps.",
    notifyLabel: "careers application",
  },
  "personal-training": {
    confirmSubject: "Let's get you started — Peaches Fitness Club",
    confirmHeading: "Thanks for your interest in personal training!",
    confirmBody: "We've received your request and one of our trainers will reach out to talk about your goals and find the right fit.",
    notifyLabel: "personal training inquiry",
  },
};

/** Confirmation email sent to the lead. */
export function confirmationEmail(kind: LeadKind, name?: string): { subject: string; html: string } {
  const first = (name ?? "").trim().split(/\s+/)[0];
  const c = COPY[kind];
  const inner =
    p(`Hi ${first ? esc(first) : "there"},`) +
    p(c.confirmBody) +
    p("Have a question in the meantime? Just reply to this email or reach us any time.") +
    `<div style="margin-top:22px;">${button(site.siteUrl, "Visit peachesfitnessclub.com")}</div>`;
  return { subject: c.confirmSubject, html: shell({ heading: c.confirmHeading, preheader: c.confirmBody, inner }) };
}

/** Internal notification sent to the gym with the submitted details. */
export function notificationEmail(
  kind: LeadKind,
  fields: Array<[string, string | undefined]>,
): { subject: string; html: string } {
  const c = COPY[kind];
  const rows = fields
    .filter(([, v]) => v && String(v).trim())
    .map(
      ([k, v]) => `<tr>
        <td style="padding:9px 14px 9px 0;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:rgba(43,38,34,.6);width:160px;vertical-align:top;">${esc(k)}</td>
        <td style="padding:9px 0;font-size:15px;line-height:1.5;color:${C.charcoal};white-space:pre-wrap;">${esc(String(v))}</td>
      </tr>`,
    )
    .join("");
  const inner =
    p(`You've received a new <strong>${esc(c.notifyLabel)}</strong> from the website. Reply to this email to respond to them directly.`) +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;border-top:1px solid rgba(43,38,34,.12);">${rows}</table>`;
  return {
    subject: `New ${c.notifyLabel}${fields[0]?.[1] ? ` — ${fields[0][1]}` : ""}`,
    html: shell({ heading: `New ${c.notifyLabel}`, preheader: `New ${c.notifyLabel} from the website`, inner }),
  };
}
