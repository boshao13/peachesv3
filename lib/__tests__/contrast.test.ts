import { describe, it, expect } from "vitest";
import { contrastRatio } from "../contrast";

// Pinned tokens (spec §5.1)
const C = {
  cream: "#FFF8F0",
  white: "#FFFFFF",
  charcoal: "#2B2622",
  coral: "#D56F52",
  coralDeep: "#A8503A",
  coralDark: "#B55C44",
  peach: "#FACCB5",
  peach2: "#FAB39D",
  sage: "#4E7A51",
};

const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

describe("WCAG contrast gate — allowed-pairings matrix (spec §5.1)", () => {
  it("charcoal body text passes AA-normal on every surface", () => {
    for (const bg of [C.cream, C.white, C.peach, C.peach2]) {
      expect(contrastRatio(C.charcoal, bg)).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it("white-on-coral-deep (primary button) passes AA-normal", () => {
    expect(contrastRatio(C.white, C.coralDeep)).toBeGreaterThanOrEqual(AA_NORMAL); // ~5.42
  });

  it("white-on-coral-dark (button hover) passes AA-normal", () => {
    expect(contrastRatio(C.white, C.coralDark)).toBeGreaterThanOrEqual(AA_NORMAL); // ~4.59
  });

  it("coral-deep text links pass AA-normal on cream/white", () => {
    expect(contrastRatio(C.coralDeep, C.cream)).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrastRatio(C.coralDeep, C.white)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("sage text passes AA-normal on white", () => {
    expect(contrastRatio(C.sage, C.white)).toBeGreaterThanOrEqual(AA_NORMAL); // ~4.97
  });

  it("coral is LARGE-text-only: passes 3:1 on cream/white but FAILS normal 4.5:1", () => {
    expect(contrastRatio(C.coral, C.cream)).toBeGreaterThanOrEqual(AA_LARGE);
    expect(contrastRatio(C.coral, C.white)).toBeGreaterThanOrEqual(AA_LARGE);
    expect(contrastRatio(C.coral, C.white)).toBeLessThan(AA_NORMAL); // proves large-only
  });

  it("coral must NOT be used for large text/functional icons on peach (<3:1)", () => {
    expect(contrastRatio(C.coral, C.peach)).toBeLessThan(AA_LARGE);
    expect(contrastRatio(C.coral, C.peach2)).toBeLessThan(AA_LARGE);
  });
});
