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

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

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

    // Fetch real analytics from Lovable API
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    const projectId = Deno.env.get("SUPABASE_URL")?.match(/https:\/\/([^.]+)/)?.[1] || "gpcpovoikxgkgnabumlx";
    
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
      startdate: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      enddate: endDate || new Date().toISOString().split('T')[0],
      granularity: granularity || 'daily'
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
        start: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: endDate || new Date().toISOString().split('T')[0],
      }
    };

    console.log("Returning analytics data for date range:", startDate, "to", endDate);

    return new Response(JSON.stringify(analyticsData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch analytics" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
