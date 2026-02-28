import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Domain allowlist for CORS
const ALLOWED_ORIGINS = [
  'https://gpcpovoikxgkgnabumlx.lovableproject.com',
  'https://modernnostalgiaclub.lovable.app',
  'https://modernnostalgia.club',
  'https://www.modernnostalgia.club',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.some(allowed =>
    origin === allowed || 
    origin.endsWith('.lovable.app') || 
    origin.endsWith('.lovableproject.com')
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

const PATREON_API_BASE = "https://www.patreon.com/api/oauth2/v2";

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cursor } = await req.json().catch(() => ({}));
    
    const CREATOR_ACCESS_TOKEN = Deno.env.get("PATREON_CREATOR_ACCESS_TOKEN");
    if (!CREATOR_ACCESS_TOKEN) {
      throw new Error("PATREON_CREATOR_ACCESS_TOKEN is not configured");
    }

    // Get the user's tier from the request (if authenticated)
    let userTier = "public";
    const authHeader = req.headers.get("authorization");
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("patreon_tier")
          .eq("user_id", user.id)
          .single();
        
        if (profile?.patreon_tier) {
          userTier = profile.patreon_tier;
        }
      }
    }

    console.log("Fetching posts for user tier:", userTier);

    // First, get the campaign ID
    const identityResponse = await fetch(
      `${PATREON_API_BASE}/identity?include=campaign&fields[campaign]=created_at,creation_name,patron_count`,
      {
        headers: {
          Authorization: `Bearer ${CREATOR_ACCESS_TOKEN}`,
        },
      }
    );

    if (!identityResponse.ok) {
      const errorText = await identityResponse.text();
      console.error("Patreon identity error:", errorText);
      throw new Error(`Failed to fetch Patreon identity: ${identityResponse.status}`);
    }

    const identityData = await identityResponse.json();
    const campaignId = identityData.included?.[0]?.id;

    if (!campaignId) {
      throw new Error("Could not find Patreon campaign ID");
    }

    console.log("Campaign ID:", campaignId);

    // Fetch posts from the campaign - using only valid Patreon API v2 fields
    let postsUrl = `${PATREON_API_BASE}/campaigns/${campaignId}/posts?fields[post]=title,content,published_at,url,is_public&page[count]=6`;
    if (cursor) {
      postsUrl += `&page[cursor]=${cursor}`;
    }
    
    const postsResponse = await fetch(postsUrl, {
      headers: {
        Authorization: `Bearer ${CREATOR_ACCESS_TOKEN}`,
      },
    });

    if (!postsResponse.ok) {
      const errorText = await postsResponse.text();
      console.error("Patreon posts error:", errorText);
      throw new Error(`Failed to fetch Patreon posts: ${postsResponse.status}`);
    }

    const postsData = await postsResponse.json();
    console.log("Fetched posts count:", postsData.data?.length || 0);

    // Map the posts to a simpler format
    const posts = postsData.data?.map((post: any) => ({
      id: post.id,
      title: post.attributes.title,
      teaser: post.attributes.content?.substring(0, 200) || "",
      content: post.attributes.content,
      publishedAt: post.attributes.published_at,
      url: post.attributes.url,
      isPublic: post.attributes.is_public,
      // Show full content only to logged-in users with a tier
      isFullAccess: userTier !== "public",
    })) || [];

    // Get next cursor for pagination
    const nextCursor = postsData.meta?.pagination?.cursors?.next || null;

    return new Response(JSON.stringify({ posts, userTier, nextCursor }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);
    console.error("Error fetching Patreon posts:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
