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
    const { offset, pageSize } = await req.json().catch(() => ({}));
    
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

    // Patreon returns posts oldest-first, so fetch every page, then sort newest-first.
    const all: any[] = [];
    let pageCursor: string | null = null;
    for (let i = 0; i < 20; i++) {
      let postsUrl = `${PATREON_API_BASE}/campaigns/${campaignId}/posts?fields[post]=title,content,published_at,url,is_public,embed_data,embed_url&page[count]=100`;
      if (pageCursor) postsUrl += `&page[cursor]=${encodeURIComponent(pageCursor)}`;
      const postsResponse = await fetch(postsUrl, {
        headers: { Authorization: `Bearer ${CREATOR_ACCESS_TOKEN}` },
      });
      if (!postsResponse.ok) {
        const errorText = await postsResponse.text();
        console.error("Patreon posts error:", errorText);
        throw new Error(`Failed to fetch Patreon posts: ${postsResponse.status}`);
      }
      const postsData = await postsResponse.json();
      all.push(...(postsData.data || []));
      pageCursor = postsData.meta?.pagination?.cursors?.next || null;
      if (!pageCursor) break;
    }

    all.sort((a, b) =>
      new Date(b.attributes.published_at).getTime() - new Date(a.attributes.published_at).getTime()
    );

    const stripHtml = (html: string) =>
      (html || "")
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<\/p>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();

    const findImage = (post: any): string | null => {
      const html: string = post.attributes.content || "";
      const m = html.match(/<img[^>]+src="([^"]+)"/i);
      if (m) return m[1];
      const embed = post.attributes.embed_data;
      if (embed && typeof embed === "object") {
        return embed.thumbnail_url || embed.image || null;
      }
      return null;
    };

    const limit = Math.min(Math.max(Number(pageSize) || 9, 1), 30);
    const start = Math.max(Number(offset) || 0, 0);
    const slice = all.slice(start, start + limit);

    const hasFullAccess = userTier !== "public";
    const posts = slice.map((post: any) => {
      const isPublic = post.attributes.is_public;
      const fullContent = post.attributes.content || "";
      const plain = stripHtml(fullContent);
      const canSeeFull = isPublic || hasFullAccess;
      const rawUrl: string = post.attributes.url || "";
      return {
        id: post.id,
        title: (post.attributes.title || "").trim(),
        teaser: plain.length > 220 ? plain.substring(0, 220).trimEnd() + "…" : plain,
        content: canSeeFull ? fullContent : null,
        publishedAt: post.attributes.published_at,
        url: rawUrl.startsWith("http") ? rawUrl : `https://www.patreon.com${rawUrl}`,
        thumbnail: findImage(post),
        isPublic,
        isFullAccess: canSeeFull,
      };
    });

    const nextOffset = start + limit < all.length ? start + limit : null;

    return new Response(JSON.stringify({ posts, userTier, nextOffset, total: all.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
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
