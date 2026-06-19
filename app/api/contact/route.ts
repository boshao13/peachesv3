import { NextResponse } from "next/server";
import { contactBodySchema, fieldErrors } from "@/lib/schemas";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { sendSubmission } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  const parsed = contactBodySchema.safeParse(json);
  if (!parsed.success) {
    // Unknown/invalid formType → generic; otherwise field-keyed errors.
    const hasFormType =
      typeof json === "object" && json !== null && "formType" in (json as Record<string, unknown>);
    if (!hasFormType) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }
    return NextResponse.json(
      { ok: false, errors: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const body = parsed.data;

  // Honeypot: silently succeed (don't tip off bots), don't send.
  if (body.company && body.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  // Durable rate limit (per IP + formType).
  const ip = clientIp(req.headers);
  const allowed = await rateLimit(ip, body.formType);
  if (!allowed) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  try {
    await sendSubmission(body);
  } catch {
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
