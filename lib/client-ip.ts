/**
 * Resolve the caller's real IP for rate limiting.
 *
 * nginx is configured with:
 *   proxy_set_header X-Real-IP       $remote_addr;
 *   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
 *
 * $proxy_add_x_forwarded_for APPENDS the real peer address to whatever the client
 * sent, so the FIRST element of X-Forwarded-For is fully attacker-controlled and the
 * LAST is the only trustworthy one. Reading the first element let anyone defeat the
 * rate limiter by varying a header. X-Real-IP is set from $remote_addr alone and
 * cannot be forged through this proxy, so prefer it.
 */
export function clientIp(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;

  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (hops.length > 0) return hops[hops.length - 1];
  }
  return "unknown";
}
