import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "search_blog_posts",
  title: "Search blog posts",
  description: "Search published Modern Nostalgia Club blog posts by title, excerpt, or tag.",
  inputSchema: {
    query: z.string().trim().default("").describe("Optional keyword to match against title and excerpt."),
    limit: z.number().int().min(1).max(25).default(10).describe("Maximum number of posts to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const supabase = supabaseAnon();
    let builder = supabase
      .from("blog_posts")
      .select("title, slug, excerpt, tags, author_name, published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (query) {
      builder = builder.or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);
    }

    const { data, error } = await builder;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { posts: data ?? [] },
    };
  },
});
