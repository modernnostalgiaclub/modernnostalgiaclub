import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
