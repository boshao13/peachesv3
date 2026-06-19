import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Durable, serverless-safe rate limiting (spec §10). Upstash is REQUIRED in production
// (fail-loud at REQUEST time, not module load — so `next build` works without env vars);
// in dev it degrades to honeypot-only with a warning.
let limiter: Ratelimit | null = null;
let initialized = false;

function getLimiter(): Ratelimit | null {
  if (initialized) return limiter;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 submissions / 10 min / IP+formType
      prefix: "peaches:rl",
    });
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Upstash rate-limit env vars missing in production (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).",
    );
  } else {
    // eslint-disable-next-line no-console
    console.warn(
      "[rateLimit] Upstash not configured — degrading to honeypot-only (dev). Set UPSTASH_* for durable limiting.",
    );
  }
  return limiter;
}

/** Returns true if allowed, false if rate-limited. Allows (no-op) when limiter absent in dev. */
export async function rateLimit(ip: string, formType: string): Promise<boolean> {
  const l = getLimiter();
  if (!l) return true;
  const { success } = await l.limit(`${formType}:${ip}`);
  return success;
}

/** First hop of x-forwarded-for (Vercel), fallback to a shared key. */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
