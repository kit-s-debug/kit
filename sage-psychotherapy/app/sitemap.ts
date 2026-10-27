import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-09-03");
  return [
    { url: `${SITE_URL}/`, lastModified: updated, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: updated, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/privacy`, lastModified: updated, changeFrequency: "yearly", priority: 0.3 },
  ];
}
