import { auth, defineMcp } from "@lovable.dev/mcp-js";
import searchBlogPostsTool from "./tools/search-blog-posts";
import listCoursesTool from "./tools/list-courses";
import listMySubmissionsTool from "./tools/list-my-submissions";
import createSubmissionTool from "./tools/create-submission";
import getMyProfileTool from "./tools/get-my-profile";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "creative-economy-lab",
  title: "Creative Economy Lab",
  version: "0.1.0",
  instructions:
    "Tools for Modern Nostalgia Club (Creative Economy Lab). Browse published blog posts and courses, and — for the signed-in member — read their profile, list their Studio Floor submissions, and create new ones.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    searchBlogPostsTool,
    listCoursesTool,
    getMyProfileTool,
    listMySubmissionsTool,
    createSubmissionTool,
  ],
});
