import { NextResponse } from "next/server";
import { contactBodySchema, type ContactBody } from "@/lib/schemas";
import { sendEmail } from "@/lib/resend";
import { confirmationEmail, notificationEmail } from "@/lib/email-templates";
import { site } from "@/content/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort per-IP rate limit (in-memory, per instance) — a light spam brake.
// nginx sets X-Forwarded-For (see conf.d/react.conf).
const HITS = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  if (HITS.size > 5000) HITS.clear(); // crude unbounded-growth guard
  return recent.length > MAX_PER_WINDOW;
}

// Ordered [label, value] pairs for the gym notification (first entry becomes the subject suffix).
function fieldsFor(data: ContactBody): Array<[string, string | undefined]> {
  switch (data.formType) {
    case "contact":
      return [["Name", data.name], ["Email", data.email], ["Phone", data.phone], ["Message", data.message]];
    case "newsletter":
      return [["Email", data.email]];
    case "personal-training":
      return [
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Experience", data.experience],
        ["Availability", data.availability],
        ["Goals", data.goals],
      ];
    case "careers":
      return [
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Address", data.address],
        ["Position", data.position],
        ["Over 18", data.overEighteen ? "Yes" : "No"],
        ["Gender", data.gender],
        ["Education", data.education],
        ["Experience", data.experience],
      ];
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests — please try again in a minute." }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Please check the form and try again." }, { status: 422 });
  }
  const data = parsed.data;

  // Honeypot: pretend success, send nothing.
  if (data.company) return NextResponse.json({ ok: true });

  const name = "name" in data ? data.name : undefined;
  const notify = notificationEmail(data.formType, fieldsFor(data));
  const confirm = confirmationEmail(data.formType, name);

  try {
    await Promise.all([
      sendEmail({ to: site.nap.email, replyTo: data.email, subject: notify.subject, html: notify.html }),
      sendEmail({ to: data.email, subject: confirm.subject, html: confirm.html }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] email send failed:", err);
    return NextResponse.json(
      { ok: false, error: "We couldn't send your message. Please try again or contact us directly." },
      { status: 502 },
    );
  }
}
