import { describe, it, expect } from "vitest";
import { clientIp } from "../client-ip";

const h = (o: Record<string, string>) => new Headers(o);

describe("clientIp", () => {
  it("prefers X-Real-IP, which nginx sets from $remote_addr and a client cannot forge", () => {
    expect(clientIp(h({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "1.2.3.4" }))).toBe("203.0.113.9");
  });

  it("ignores a spoofed first hop and takes the LAST X-Forwarded-For entry", () => {
    // $proxy_add_x_forwarded_for appends the real peer, so the last entry is the real one
    expect(clientIp(h({ "x-forwarded-for": "9.9.9.9, 203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("does not let an attacker vary the rate-limit key by rewriting X-Forwarded-For", () => {
    const real = "203.0.113.9";
    const keys = new Set(
      ["1.1.1.1", "2.2.2.2", "3.3.3.3"].map((spoof) =>
        clientIp(h({ "x-forwarded-for": `${spoof}, ${real}` }))
      )
    );
    expect(keys.size).toBe(1);
    expect([...keys][0]).toBe(real);
  });

  it("handles a single-entry header and whitespace", () => {
    expect(clientIp(h({ "x-forwarded-for": "  203.0.113.9  " }))).toBe("203.0.113.9");
  });

  it("falls back to a constant when no proxy headers are present", () => {
    expect(clientIp(h({}))).toBe("unknown");
  });
});
