import { describe, it, expect } from "vitest";
import { contactBodySchema } from "../schemas";

const big = (n: number) => "A".repeat(n);

describe("request size bounds", () => {
  it("rejects a megabyte name instead of templating it into an email subject", () => {
    const r = contactBodySchema.safeParse({
      formType: "contact", name: big(1_000_000), email: "a@b.com",
    });
    expect(r.success).toBe(false);
  });

  it("rejects an over-long email local part", () => {
    expect(contactBodySchema.safeParse({
      formType: "newsletter", email: big(300) + "@b.com",
    }).success).toBe(false);
  });

  it("rejects oversized careers free-text", () => {
    expect(contactBodySchema.safeParse({
      formType: "careers", name: "Sam", email: "s@b.com", phone: "5055551234",
      address: big(5000), education: "BS", experience: "3y",
      overEighteen: "yes", gender: "Female", position: "Personal Trainer",
    }).success).toBe(false);
  });

  it("still accepts realistic submissions", () => {
    expect(contactBodySchema.safeParse({
      formType: "contact", name: "Jane Doe", email: "jane@example.com",
      phone: "505-555-1234", message: "Do you offer postpartum training?",
    }).success).toBe(true);
    expect(contactBodySchema.safeParse({
      formType: "newsletter", email: "jane@example.com",
    }).success).toBe(true);
  });
});
