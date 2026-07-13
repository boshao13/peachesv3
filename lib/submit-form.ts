// Client helper: POST a validated lead-form payload to the server route (/api/contact),
// which sends the gym notification + the applicant confirmation via Resend.
// Throws with a user-safe message on failure so callers can surface it.
export async function submitLeadForm(payload: unknown): Promise<void> {
  const res = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    let message = "We couldn't send your message. Please try again.";
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON error response — keep the default */
    }
    throw new Error(message);
  }
}
