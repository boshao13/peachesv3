import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only lint our own source (never the archived legacy/ CRA, which iCloud may resurrect).
  eslint: { dirs: ["app", "components", "lib", "content"] },
  // Legacy CRA slug → new hyphenated routes (308 permanent). Hash anchors are
  // handled client-side by components/layout/HashRedirect.tsx (fragments can't
  // be matched here).
  async redirects() {
    return [
      { source: "/daypass", destination: "/day-pass", permanent: true },
      { source: "/kidscare", destination: "/kids-care", permanent: true },
      { source: "/codeofconduct", destination: "/code-of-conduct", permanent: true },
    ];
  },
  images: {
    // WebP only. AVIF encoding is ~4x slower on the t3.micro and images optimize
    // on-demand, so AVIF made first-load of photo-heavy pages (amenities) crawl.
    formats: ["image/webp"],
    // Cache optimized variants for 30 days so they're only ever encoded once.
    minimumCacheTTL: 2592000,
  },
};

export default nextConfig;
