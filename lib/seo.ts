import type { Metadata } from "next";
import { site } from "@/content/site";

/** Per-route metadata helper — unique title/description/canonical, OG inherits from root. */
export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const canonical = path === "/" ? "/" : path;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: canonical,
    },
    twitter: {
      title: `${title} | ${site.name}`,
      description,
    },
  };
}
