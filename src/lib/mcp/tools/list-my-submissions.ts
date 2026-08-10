import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_submissions",
  title: "List my submissions",
  description: "List the signed-in member's Studio Floor submissions, their status, and any reviewer notes.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(20).describe("Maximum number of submissions to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("submissions")
      .select("id, title, submission_type, status, reviewer_notes, created_at, reviewed_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { submissions: data ?? [] },
    };
  },
});
