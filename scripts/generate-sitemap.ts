// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://www.modernnostalgia.club";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/join", changefreq: "monthly", priority: "0.9" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.9" },
  { path: "/artists", changefreq: "weekly", priority: "0.7" },
  { path: "/artistresources", changefreq: "monthly", priority: "0.7" },
  { path: "/store", changefreq: "weekly", priority: "0.8" },
  { path: "/catalog-audit", changefreq: "monthly", priority: "0.7" },
  { path: "/sync-quiz", changefreq: "monthly", priority: "0.7" },
  { path: "/connect", changefreq: "monthly", priority: "0.6" },
  { path: "/free-guide", changefreq: "monthly", priority: "0.7" },
  { path: "/apply", changefreq: "monthly", priority: "0.6" },
  { path: "/contact", changefreq: "yearly", priority: "0.5" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/login", changefreq: "yearly", priority: "0.3" },
  { path: "/signup", changefreq: "yearly", priority: "0.4" },
];

async function fetchBlogEntries(): Promise<SitemapEntry[]> {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("Skipping blog entries: missing Supabase env vars");
    return [];
  }
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("is_published", true);
    if (error || !data) {
      console.warn("Could not fetch blog posts:", error?.message);
      return [];
    }
    return data.map((p: any) => ({
      path: `/blog/${p.slug}`,
      lastmod: (p.updated_at || p.published_at || "").split("T")[0] || undefined,
      changefreq: "monthly" as const,
      priority: "0.6",
    }));
  } catch (e: any) {
    console.warn("Blog fetch failed:", e.message);
    return [];
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n"),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

(async () => {
  const blog = await fetchBlogEntries();
  const entries = [...staticEntries, ...blog];
  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
  console.log(`sitemap.xml written (${entries.length} entries)`);
})();
