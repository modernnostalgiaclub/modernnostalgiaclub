import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "list_courses",
  title: "List courses",
  description: "List published Modern Nostalgia Club courses and the membership tier each one requires.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(25).describe("Maximum number of courses to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = supabaseAnon();
    const { data, error } = await supabase
      .from("courses")
      .select("title, slug, description, min_tier, sort_order")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .limit(limit);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { courses: data ?? [] },
    };
  },
});
