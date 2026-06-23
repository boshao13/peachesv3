import { describe, it, expect } from "vitest";
import { contactBodySchema, fieldErrors } from "../schemas";

describe("contact discriminated-union schema", () => {
  it("accepts a valid contact submission (phone optional)", () => {
    const r = contactBodySchema.safeParse({
      formType: "contact",
      name: "Jane",
      email: "jane@example.com",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a contact submission missing name + email, keyed by field", () => {
    const r = contactBodySchema.safeParse({ formType: "contact" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errs = fieldErrors(r.error);
      expect(errs.name).toBeTruthy();
      expect(errs.email).toBeTruthy();
    }
  });

  it("accepts careers with canonical enums and coerces over-18 yes/no to boolean", () => {
    const r = contactBodySchema.safeParse({
      formType: "careers",
      name: "Sam",
      email: "sam@example.com",
      phone: "5055551234",
      address: "1 Main St",
      education: "BS",
      experience: "3 years",
      overEighteen: "yes",
      gender: "Female",
      position: "Personal Trainer",
    });
    expect(r.success).toBe(true);
    if (r.success && r.data.formType === "careers") {
      expect(r.data.overEighteen).toBe(true);
    }
  });

  it("rejects careers with a legacy/invalid position value", () => {
    const r = contactBodySchema.safeParse({
      formType: "careers",
      name: "Sam",
      email: "sam@example.com",
      phone: "5055551234",
      address: "1 Main St",
      education: "BS",
      experience: "3 years",
      overEighteen: "no",
      gender: "Female",
      position: "Group Instuctor", // legacy typo — must fail
    });
    expect(r.success).toBe(false);
  });

  it("accepts a valid newsletter submission", () => {
    const r = contactBodySchema.safeParse({ formType: "newsletter", email: "a@b.com" });
    expect(r.success).toBe(true);
  });

  it("rejects a filled honeypot (company non-empty)", () => {
    const r = contactBodySchema.safeParse({
      formType: "newsletter",
      email: "a@b.com",
      company: "spammy",
    });
    expect(r.success).toBe(false);
  });

  it("rejects an unknown formType", () => {
    const r = contactBodySchema.safeParse({ formType: "wat", email: "a@b.com" });
    expect(r.success).toBe(false);
  });
});
