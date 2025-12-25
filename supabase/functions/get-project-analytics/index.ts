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

    // Return the analytics data structure
    // In production, this would fetch from Lovable's analytics API
    // For now, we return the current analytics snapshot
    const analyticsData = {
      visitors: 137,
      pageviews: 577,
      pageviewsPerVisit: 4.21,
      sessionDuration: 168,
      bounceRate: 57,
      dailyData: [
        { date: '2025-12-17', visitors: 0, pageviews: 0 },
        { date: '2025-12-18', visitors: 0, pageviews: 0 },
        { date: '2025-12-19', visitors: 0, pageviews: 0 },
        { date: '2025-12-20', visitors: 0, pageviews: 0 },
        { date: '2025-12-21', visitors: 65, pageviews: 344 },
        { date: '2025-12-22', visitors: 30, pageviews: 120 },
        { date: '2025-12-23', visitors: 22, pageviews: 73 },
        { date: '2025-12-24', visitors: 20, pageviews: 40 },
      ],
      topPages: [
        { page: '/', views: 120 },
        { page: '/dashboard', views: 21 },
        { page: '/admin', views: 18 },
        { page: '/reference', views: 16 },
        { page: '/classroom', views: 15 },
        { page: '/studio', views: 13 },
        { page: '/community', views: 11 },
        { page: '/account', views: 9 },
        { page: '/classroom/sync-licensing-handbook', views: 5 },
        { page: '/reference/beat-license', views: 3 },
      ],
      sources: [
        { source: 'Direct', visits: 73 },
        { source: 't.co', visits: 29 },
        { source: 'patreon.com', visits: 27 },
        { source: 'l.instagram.com', visits: 20 },
        { source: 'facebook.com', visits: 2 },
        { source: 'l.threads.com', visits: 2 },
      ],
      devices: [
        { device: 'mobile', count: 97 },
        { device: 'desktop', count: 40 },
      ],
      countries: [
        { country: 'US', count: 123 },
        { country: 'Unknown', count: 4 },
        { country: 'DE', count: 3 },
        { country: 'CA', count: 3 },
        { country: 'ID', count: 2 },
        { country: 'KE', count: 1 },
      ],
      dateRange: {
        start: startDate || '2025-12-17',
        end: endDate || '2025-12-24',
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
