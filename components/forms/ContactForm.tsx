"use client";

import { useState } from "react";
import {
  Field,
  TextInput,
  TextArea,
  Honeypot,
  FormStatus,
  type SubmitState,
} from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";
import { contactBodySchema, fieldErrors } from "@/lib/schemas";
import { submitLeadForm } from "@/lib/submit-form";

// variant "full" = contact page (with message); "lead" = membership/join CTA (no message).
export function ContactForm({ variant = "full" }: { variant?: "full" | "lead" }) {
  const [state, setState] = useState<SubmitState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | undefined>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      formType: "contact" as const,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      message: variant === "full" ? String(fd.get("message") ?? "") : undefined,
      company: String(fd.get("company") ?? ""),
    };
    setErrors({});
    setTopError(undefined);

    // Honeypot: silently "succeed" (don't tip off bots), don't send.
    if (payload.company) {
      setState("success");
      form.reset();
      return;
    }

    const parsed = contactBodySchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      setState("idle");
      return;
    }

    setState("submitting");
    try {
      await submitLeadForm(parsed.data);
      setState("success");
      form.reset();
    } catch {
      setState("error");
      setTopError("We couldn't send your message. Please call or email us directly.");
    }
  }

  if (state === "success") {
    return <FormStatus state="success" />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="cf-name" error={errors.name} required>
          <TextInput id="cf-name" name="name" autoComplete="name" aria-invalid={!!errors.name} />
        </Field>
        <Field label="Email" htmlFor="cf-email" error={errors.email} required>
          <TextInput
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
        </Field>
      </div>
      <Field label="Phone (optional)" htmlFor="cf-phone" error={errors.phone}>
        <TextInput id="cf-phone" name="phone" type="tel" autoComplete="tel" />
      </Field>
      {variant === "full" ? (
        <Field label="Message" htmlFor="cf-message" error={errors.message}>
          <TextArea id="cf-message" name="message" placeholder="How can we help?" />
        </Field>
      ) : null}

      <FormStatus state={state === "error" ? "error" : "idle"} error={topError} />

      <Button type="submit" size="lg" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending…" : variant === "lead" ? "Request info" : "Send message"}
      </Button>
    </form>
  );
}
