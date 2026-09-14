import { describe, it, expect } from "vitest";
import { groupHours, formatHoursLine } from "../hours";
import { site } from "../../content/site";
import { kidsCare } from "../../content/kidsCare";

describe("groupHours", () => {
  it("collapses repeated day labels into one entry with multiple blocks", () => {
    const g = groupHours([
      { days: "Mon–Fri", open: "8:00 AM", close: "12:00 PM" },
      { days: "Mon–Fri", open: "4:00 PM", close: "10:00 PM" },
      { days: "Sat", open: "8:00 AM", close: "12:00 PM" },
    ]);
    expect(g).toHaveLength(2);
    expect(g[0].times).toEqual(["8:00 AM – 12:00 PM", "4:00 PM – 10:00 PM"]);
    expect(g[1].times).toEqual(["8:00 AM – 12:00 PM"]);
  });

  it("leaves single-block days untouched", () => {
    const g = groupHours(site.hours.operating);
    expect(g.map((x) => x.days)).toEqual(["Mon–Fri", "Sat–Sun"]);
    expect(g.every((x) => x.times.length === 1)).toBe(true);
  });

  it("produces day labels unique enough to use as React keys", () => {
    for (const list of [site.hours.staffed, site.hours.operating, kidsCare.hours]) {
      const days = groupHours(list).map((g) => g.days);
      expect(new Set(days).size).toBe(days.length);
    }
  });
});

describe("staffed hours content", () => {
  it("has a morning and an evening block on both weekdays and weekends", () => {
    const g = groupHours(site.hours.staffed);
    expect(g).toHaveLength(2);
    expect(g[0]).toEqual({
      days: "Mon–Fri",
      times: ["8:00 AM – 12:00 PM", "4:00 PM – 10:00 PM"],
    });
    expect(g[1]).toEqual({
      days: "Sat–Sun",
      times: ["8:00 AM – 12:00 PM", "4:00 PM – 8:00 PM"],
    });
  });

  it("never runs past the door-access hours for the same days", () => {
    // staffed close must not exceed operating close: 10 PM weekdays, 8 PM weekends
    expect(formatHoursLine(site.hours.staffed)).toContain("4:00 PM – 10:00 PM");
    expect(formatHoursLine(site.hours.staffed)).toContain("4:00 PM – 8:00 PM");
  });
});

describe("kids care hours content", () => {
  it("is split on weekdays, mornings only on Saturday, and closed Sunday", () => {
    const g = groupHours(kidsCare.hours);
    expect(g).toEqual([
      { days: "Mon–Fri", times: ["8:00 AM – 12:00 PM", "4:00 PM – 8:00 PM"] },
      { days: "Sat", times: ["8:00 AM – 12:00 PM"] },
    ]);
    expect(kidsCare.closedDays).toBe("Sun");
    expect(g.some((x) => x.days === "Sun")).toBe(false);
  });
});
