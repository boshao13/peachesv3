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
import { GENDERS, POSITIONS } from "@/content/careers";
import { contactBodySchema, fieldErrors } from "@/lib/schemas";
import { sendEmail } from "@/lib/emailjs";

export function CareersForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | undefined>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      formType: "careers" as const,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      address: String(fd.get("address") ?? ""),
      education: String(fd.get("education") ?? ""),
      experience: String(fd.get("experience") ?? ""),
      overEighteen: String(fd.get("overEighteen") ?? ""),
      gender: String(fd.get("gender") ?? ""),
      position: String(fd.get("position") ?? ""),
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
      await sendEmail("careers", {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        education: payload.education,
        experience: payload.experience,
        overEighteen: payload.overEighteen,
        gender: payload.gender,
        position: payload.position,
      });
      setState("success");
      form.reset();
    } catch {
      setState("error");
      setTopError("We couldn't submit your application. Please email us your resume directly.");
    }
  }

  if (state === "success") {
    return <FormStatus state="success" />;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Honeypot />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="ca-name" error={errors.name} required>
          <TextInput id="ca-name" name="name" autoComplete="name" aria-invalid={!!errors.name} />
        </Field>
        <Field label="Email" htmlFor="ca-email" error={errors.email} required>
          <TextInput id="ca-email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} />
        </Field>
        <Field label="Phone" htmlFor="ca-phone" error={errors.phone} required>
          <TextInput id="ca-phone" name="phone" type="tel" autoComplete="tel" aria-invalid={!!errors.phone} />
        </Field>
        <Field label="Address" htmlFor="ca-address" error={errors.address} required>
          <TextInput id="ca-address" name="address" autoComplete="street-address" aria-invalid={!!errors.address} />
        </Field>
      </div>

      <Field label="Education" htmlFor="ca-education" error={errors.education} required>
        <TextArea id="ca-education" name="education" />
      </Field>
      <Field label="Relevant work experience" htmlFor="ca-experience" error={errors.experience} required>
        <TextArea id="ca-experience" name="experience" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Are you over 18?" htmlFor="ca-18" error={errors.overEighteen} required>
          <SelectInput id="ca-18" name="overEighteen" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </SelectInput>
        </Field>
        <Field label="Gender" htmlFor="ca-gender" error={errors.gender} required>
          <SelectInput id="ca-gender" name="gender" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Position desired" htmlFor="ca-position" error={errors.position} required>
          <SelectInput id="ca-position" name="position" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      <FormStatus state={state === "error" ? "error" : "idle"} error={topError} />

      <Button type="submit" size="lg" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
