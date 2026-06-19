"use client";

import type { ReactNode } from "react";

const inputCls =
  "w-full rounded-xl border border-charcoal/15 bg-white px-4 py-2.5 text-charcoal " +
  "placeholder:text-charcoal/40 focus:border-coral-deep focus:outline-none focus:ring-2 focus:ring-coral-deep/30 " +
  "aria-[invalid=true]:border-red-500";

export function Field({
  label,
  htmlFor,
  error,
  children,
  required,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-charcoal/80">
        {label} {required ? <span className="text-coral-deep">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} min-h-28 ${props.className ?? ""}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

/** Honeypot — visually hidden, must stay empty (bots fill it). */
export function Honeypot() {
  return (
    <input
      type="text"
      name="company"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="hidden"
    />
  );
}

export type SubmitState = "idle" | "submitting" | "success" | "error";

export function FormStatus({ state, error }: { state: SubmitState; error?: string }) {
  if (state === "success")
    return (
      <p className="rounded-xl bg-sage/15 px-4 py-3 text-sage" role="status">
        Thank you! We&apos;ve received your message and will get back to you shortly.
      </p>
    );
  if (state === "error")
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-red-700" role="alert">
        {error ?? "Something went wrong. Please try again, or call us."}
      </p>
    );
  return null;
}
