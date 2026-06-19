"use client";

import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const company = (form.elements.namedItem("company") as HTMLInputElement)?.value ?? "";
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType: "newsletter", email, company }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <p className="text-sm text-cream/90" role="status">
        You&apos;re subscribed — thanks for joining the Peaches community! 🍑
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row" noValidate>
      {/* honeypot */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        name="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="min-w-0 flex-1 rounded-full bg-cream/10 px-4 py-2.5 text-sm text-cream placeholder:text-cream/50 ring-1 ring-cream/25 focus:ring-peach outline-none"
      />
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-peach px-5 py-2.5 text-sm font-semibold text-charcoal transition hover:bg-peach-2 disabled:opacity-60"
      >
        {status === "submitting" ? "…" : "Subscribe"}
      </button>
      {status === "error" ? (
        <p className="sr-only" role="alert">
          Something went wrong. Please try again.
        </p>
      ) : null}
    </form>
  );
}
