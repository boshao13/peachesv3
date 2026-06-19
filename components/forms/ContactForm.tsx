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
    setState("submitting");
    setErrors({});
    setTopError(undefined);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setState("success");
        form.reset();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data.errors) {
        setErrors(data.errors);
        setState("idle");
      } else if (res.status === 429) {
        setState("error");
        setTopError("Too many attempts — please wait a few minutes and try again.");
      } else {
        setState("error");
        setTopError("We couldn't send your message. Please call or email us directly.");
      }
    } catch {
      setState("error");
      setTopError("Network error. Please try again, or call us.");
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
