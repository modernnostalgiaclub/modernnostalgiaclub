import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  'https://gpcpovoikxgkgnabumlx.lovableproject.com',
  'https://modernnostalgiaclub.lovable.app',
  'https://modernnostalgia.club',
  'https://www.modernnostalgia.club',
  'http://localhost:5173',
  'http://localhost:8080',
];

// Cache duration in minutes
const CACHE_DURATION_MINUTES = 15;

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

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token for auth checks
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    // Service role client for cache operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    // Check if user has admin or moderator role
    const { data: hasAdminRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin"
    });

    const { data: hasModeratorRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "moderator"
    });

    if (!hasAdminRole && !hasModeratorRole) {
      console.error("User does not have admin or moderator role:", user.id);
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin or moderator access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authorized with role - admin:", hasAdminRole, "moderator:", hasModeratorRole);

    const { startDate, endDate, granularity } = await req.json();
    
    // Generate cache key based on request parameters
    const effectiveStartDate = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const effectiveEndDate = endDate || new Date().toISOString().split('T')[0];
    const effectiveGranularity = granularity || 'daily';
    const cacheKey = `analytics_${effectiveStartDate}_${effectiveEndDate}_${effectiveGranularity}`;
    
    // Check cache first
    const { data: cachedData, error: cacheError } = await supabaseAdmin
      .from('analytics_cache')
      .select('data, expires_at')
      .eq('cache_key', cacheKey)
      .maybeSingle();
    
    if (!cacheError && cachedData && new Date(cachedData.expires_at) > new Date()) {
      console.log("Cache hit for key:", cacheKey);
      return new Response(JSON.stringify(cachedData.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }
    
    console.log("Cache miss for key:", cacheKey, "- fetching fresh data");

    // Fetch real analytics from Lovable API
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const projectId = supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1] || "gpcpovoikxgkgnabumlx";
    
    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Analytics API not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lovable Analytics API
    const analyticsUrl = `https://api.lovable.dev/v1/projects/${projectId}/analytics`;
    const analyticsParams = new URLSearchParams({
      startdate: effectiveStartDate,
      enddate: effectiveEndDate,
      granularity: effectiveGranularity
    });

    console.log("Fetching analytics from Lovable API:", `${analyticsUrl}?${analyticsParams}`);

    const analyticsResponse = await fetch(`${analyticsUrl}?${analyticsParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!analyticsResponse.ok) {
      const errorText = await analyticsResponse.text();
      console.error("Lovable Analytics API error:", analyticsResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch analytics from Lovable API", details: errorText }),
        { status: analyticsResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawAnalytics = await analyticsResponse.json();
    console.log("Raw analytics received:", JSON.stringify(rawAnalytics).substring(0, 500));

    // Transform Lovable API response to match expected format
    const analyticsData = {
      visitors: rawAnalytics.visitors || rawAnalytics.totalVisitors || 0,
      pageviews: rawAnalytics.pageviews || rawAnalytics.totalPageviews || 0,
      pageviewsPerVisit: rawAnalytics.pageviewsPerVisit || (rawAnalytics.pageviews && rawAnalytics.visitors ? (rawAnalytics.pageviews / rawAnalytics.visitors).toFixed(2) : 0),
      sessionDuration: rawAnalytics.sessionDuration || rawAnalytics.avgSessionDuration || 0,
      bounceRate: rawAnalytics.bounceRate || 0,
      dailyData: rawAnalytics.dailyData || rawAnalytics.data || [],
      topPages: rawAnalytics.topPages || rawAnalytics.pages || [],
      sources: rawAnalytics.sources || rawAnalytics.referrers || [],
      devices: rawAnalytics.devices || [],
      countries: rawAnalytics.countries || rawAnalytics.locations || [],
      dateRange: {
        start: effectiveStartDate,
        end: effectiveEndDate,
      }
    };

    // Store in cache (upsert to handle existing keys)
    const expiresAt = new Date(Date.now() + CACHE_DURATION_MINUTES * 60 * 1000).toISOString();
    const { error: upsertError } = await supabaseAdmin
      .from('analytics_cache')
      .upsert({
        cache_key: cacheKey,
        data: analyticsData,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      }, { onConflict: 'cache_key' });
    
    if (upsertError) {
      console.error("Failed to cache analytics:", upsertError.message);
    } else {
      console.log("Analytics cached with key:", cacheKey, "expires:", expiresAt);
    }
    
    // Clean up expired cache entries (async, don't wait)
    supabaseAdmin
      .from('analytics_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .then(({ error }) => {
        if (error) console.error("Failed to clean expired cache:", error.message);
        else console.log("Cleaned expired cache entries");
      });

    console.log("Returning analytics data for date range:", effectiveStartDate, "to", effectiveEndDate);

    return new Response(JSON.stringify(analyticsData), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch analytics" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
