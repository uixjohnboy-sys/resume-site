import type { MetadataRoute } from "next";
import { work } from "@/lib/work";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // One page per kind of work (homepage work index, since 2026-11-15).
    ...work.map((w) => ({
      url: `https://www.johnboydesign.com/work/${w.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    {
      url: "https://www.johnboydesign.com",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.johnboydesign.com/coach-os",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://www.johnboydesign.com/book",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.johnboydesign.com/schools",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.johnboydesign.com/errata",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
