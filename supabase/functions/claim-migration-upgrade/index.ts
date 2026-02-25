import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the JWT to get the user
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Check if user has a patreon_id (i.e., is a founding Patreon member)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("patreon_id, patreon_tier")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!profile.patreon_id) {
      return new Response(JSON.stringify({
        error: "No Patreon account found on your profile. This upgrade is only available for founding Patreon members.",
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Already at the top tier — idempotent
    if (profile.patreon_tier === "creative-economy-lab") {
      // Still mark as migrated if not already
      await supabase.from("patreon_migration").upsert({
        patreon_user_id: userId,
        google_user_id: userId,
        migration_status: "migrated",
        migrated_at: new Date().toISOString(),
      }, { onConflict: "patreon_user_id" });

      return new Response(JSON.stringify({ success: true, already_upgraded: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upgrade tier
    const { error: upgradeError } = await supabase
      .from("profiles")
      .update({ patreon_tier: "creative-economy-lab" })
      .eq("user_id", userId);

    if (upgradeError) {
      console.error("Upgrade error:", upgradeError);
      return new Response(JSON.stringify({ error: "Failed to upgrade tier" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark migration as complete
    await supabase.from("patreon_migration").upsert({
      patreon_user_id: userId,
      google_user_id: userId,
      migration_status: "migrated",
      migrated_at: new Date().toISOString(),
    }, { onConflict: "patreon_user_id" });

    // Send a success notification
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "🎉 Upgrade Complete!",
      message: "You've been upgraded to Creative Economy Lab — our highest tier. Welcome to the inner circle.",
      type: "upgrade",
      link: "/dashboard",
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("claim-migration-upgrade error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
