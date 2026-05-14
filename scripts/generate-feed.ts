// Runs before `vite dev` and `vite build`; writes public/rss.xml (RSS 2.0).
import { writeFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://www.modernnostalgia.club";
const FEED_TITLE = "Modern Nostalgia Club — Blog";
const FEED_DESCRIPTION =
  "Music stories, artist features, and industry perspective from ModernNostalgia.club.";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchPosts() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    console.warn("Skipping RSS: missing Supabase env vars");
    return [];
  }
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, author_name, published_at, updated_at, cover_image_url")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(50);
    if (error || !data) {
      console.warn("Could not fetch blog posts:", error?.message);
      return [];
    }
    return data;
  } catch (e: any) {
    console.warn("RSS fetch failed:", e.message);
    return [];
  }
}

function buildRss(posts: any[]): string {
  const lastBuildDate = new Date().toUTCString();
  const items = posts
    .map((p) => {
      const link = `${BASE_URL}/blog/${p.slug}`;
      const pubDate = new Date(p.published_at || p.updated_at || Date.now()).toUTCString();
      const description = escapeXml(p.excerpt || "");
      const enclosure = p.cover_image_url
        ? `      <enclosure url="${escapeXml(p.cover_image_url)}" type="image/jpeg" />\n`
        : "";
      return [
        `    <item>`,
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        p.author_name ? `      <dc:creator>${escapeXml(p.author_name)}</dc:creator>` : null,
        description ? `      <description>${description}</description>` : null,
        enclosure ? enclosure.trimEnd() : null,
        `    </item>`,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">`,
    `  <channel>`,
    `    <title>${escapeXml(FEED_TITLE)}</title>`,
    `    <link>${BASE_URL}/blog</link>`,
    `    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />`,
    `    <description>${escapeXml(FEED_DESCRIPTION)}</description>`,
    `    <language>en-us</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    items,
    `  </channel>`,
    `</rss>`,
  ].join("\n");
}

(async () => {
  const posts = await fetchPosts();
  writeFileSync(resolve("public/rss.xml"), buildRss(posts));
  console.log(`rss.xml written (${posts.length} items)`);
})();
