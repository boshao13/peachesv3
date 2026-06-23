import type { MetadataRoute } from "next";
import { site } from "@/content/site";

const routes = [
  "/",
  "/about",
  "/amenities",
  "/trainers",
  "/classes",
  "/membership",
  "/day-pass",
  "/kids-care",
  "/code-of-conduct",
  "/careers",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-06-19");
  return routes.map((path) => ({
    url: `${site.siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
