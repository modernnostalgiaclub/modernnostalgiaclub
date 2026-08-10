import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_submission",
  title: "Create a submission",
  description:
    "Create a Studio Floor submission for the signed-in member (sync review, catalog audit, branding, project proposal, audio mission, or producer mission).",
  inputSchema: {
    title: z.string().trim().min(1).describe("Title of the track or project being submitted."),
    submission_type: z
      .enum([
        "sync-review",
        "catalog-audit",
        "branding",
        "project-proposal",
        "audio-mission",
        "producer-mission",
      ])
      .describe("The kind of review being requested."),
    disco_url: z.string().trim().url().describe("Link to the music (DISCO or other private share link)."),
    notes: z.string().trim().optional().describe("Optional context for the reviewer."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, submission_type, disco_url, notes }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        user_id: ctx.getUserId(),
        title,
        submission_type,
        disco_url,
        notes: notes ?? null,
      })
      .select("id, title, submission_type, status, created_at");

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    return {
      content: [{ type: "text", text: JSON.stringify(data?.[0] ?? null) }],
      structuredContent: { submission: data?.[0] ?? null },
    };
  },
});
