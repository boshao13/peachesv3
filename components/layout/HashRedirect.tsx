"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

// Best-effort migration of legacy CRA hash anchors to the new routes (spec §4).
// Leaf client component mounted in the root layout; the layout itself stays server.
// No SEO equity (client-side only).
const MAP: Record<string, string> = {
  "#contact-us-section": "/contact",
  "#faq": "/faq",
  "#pre-enrollment-section": "/membership",
};

export function HashRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;
    const target = MAP[window.location.hash];
    if (target) router.replace(target);
  }, [pathname, router]);

  return null;
}
