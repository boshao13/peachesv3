import type { DayRange } from "@/content/types";

export interface GroupedHours {
  days: string;
  /** One "open – close" string per block, in order. */
  times: string[];
}

/**
 * Collapse consecutive ranges that share a day label into a single entry, so
 * split hours (e.g. a morning and an evening block) render on one line instead
 * of repeating the day label. Also makes the day label safe to use as a React key.
 */
export function groupHours(ranges: DayRange[]): GroupedHours[] {
  const out: GroupedHours[] = [];
  for (const r of ranges) {
    const time = `${r.open} – ${r.close}`;
    const last = out[out.length - 1];
    if (last && last.days === r.days) last.times.push(time);
    else out.push({ days: r.days, times: [time] });
  }
  return out;
}

/** Single-line summary, e.g. "Mon–Fri 8:00 AM – 12:00 PM, 4:00 PM – 10:00 PM · Sat–Sun …". */
export function formatHoursLine(ranges: DayRange[]): string {
  return groupHours(ranges)
    .map((g) => `${g.days} ${g.times.join(", ")}`)
    .join(" · ");
}
