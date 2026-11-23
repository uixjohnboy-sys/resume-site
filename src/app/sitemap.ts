import type { MetadataRoute } from "next";
import { work } from "@/lib/work";

// lastModified is the date the page content really last changed (from git), not the build date, so Google can tell
// which pages are new. Update the date when a page changes.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // One page per kind of work (homepage work index, since 2026-11-15).
    ...work.map((w) => ({
      url: `https://www.johnboydesign.com/work/${w.slug}`,
      lastModified: new Date("2026-11-20"),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    })),
    {
      url: "https://www.johnboydesign.com",
      lastModified: new Date("2026-11-20"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://www.johnboydesign.com/coach-os",
      lastModified: new Date("2026-11-04"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://www.johnboydesign.com/intro",
      lastModified: new Date("2026-11-23"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.johnboydesign.com/book",
      lastModified: new Date("2026-11-20"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.johnboydesign.com/schools",
      lastModified: new Date("2026-09-09"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://www.johnboydesign.com/errata",
      lastModified: new Date("2026-09-13"),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
