"use client";

import { useState } from "react";
import {
  Field,
  TextInput,
  TextArea,
  SelectInput,
  Honeypot,
  FormStatus,
  type SubmitState,
} from "@/components/ui/FormControls";
import { Button } from "@/components/ui/Button";
import { contactBodySchema, fieldErrors } from "@/lib/schemas";
import { submitLeadForm } from "@/lib/submit-form";

const EXPERIENCE_LEVELS = ["New to training", "Some experience", "Very experienced"] as const;

export function PersonalTrainingForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | undefined>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      formType: "personal-training" as const,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      goals: String(fd.get("goals") ?? ""),
      experience: String(fd.get("experience") ?? ""),
      availability: String(fd.get("availability") ?? ""),
      company: String(fd.get("company") ?? ""),
    };
    setErrors({});
    setTopError(undefined);

    // Honeypot: silently "succeed", don't send.
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
      setTopError("We couldn't send your request. Please call or email us directly.");
    }
  }

  if (state === "success") {
    return <FormStatus state="success" />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="pt-name" error={errors.name} required>
          <TextInput id="pt-name" name="name" autoComplete="name" aria-invalid={!!errors.name} />
        </Field>
        <Field label="Email" htmlFor="pt-email" error={errors.email} required>
          <TextInput id="pt-email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
        </Field>
        <Field label="Phone" htmlFor="pt-phone" error={errors.phone} required>
          <TextInput id="pt-phone" name="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} />
        </Field>
        <Field label="Experience level" htmlFor="pt-exp" error={errors.experience}>
          <SelectInput id="pt-exp" name="experience" defaultValue="">
            <option value="">Select…</option>
            {EXPERIENCE_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <Field label="What are your goals?" htmlFor="pt-goals" error={errors.goals}>
        <TextArea id="pt-goals" name="goals" placeholder="e.g. build strength, lose weight, train for an event…" />
      </Field>
      <Field label="When are you usually available? (optional)" htmlFor="pt-avail" error={errors.availability}>
        <TextInput id="pt-avail" name="availability" placeholder="e.g. weekday evenings, weekend mornings" />
      </Field>

      <FormStatus state={state === "error" ? "error" : "idle"} error={topError} />

      <Button type="submit" size="lg" disabled={state === "submitting"}>
        {state === "submitting" ? "Sending…" : "Request personal training"}
      </Button>
    </form>
  );
}
