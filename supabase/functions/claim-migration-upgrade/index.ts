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

    // Verify the JWT to get the calling (new) user
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

    const newUserId = userData.user.id;

    // Determine auth method from user metadata
    const providers = userData.user.app_metadata?.providers ?? [];
    const authMethod = providers.includes("google") ? "google" : "email";

    // Parse optional patreon_source_user_id from request body
    let patreonSourceUserId: string | null = null;
    try {
      const body = await req.json();
      patreonSourceUserId = body?.patreon_source_user_id ?? null;
    } catch {
      // no body — ok
    }

    // --- Determine which profile to check for patreon_id ---
    // If a source user ID was passed, look up THAT profile (the original Patreon account).
    // Otherwise, fall back to checking the calling user's own profile (legacy path).
    const profileUserId = patreonSourceUserId ?? newUserId;

    const { data: sourceProfile, error: profileError } = await supabase
      .from("profiles")
      .select("patreon_id, patreon_tier, user_id")
      .eq("user_id", profileUserId)
      .single();

    if (profileError || !sourceProfile) {
      return new Response(JSON.stringify({ error: "Source profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!sourceProfile.patreon_id) {
      return new Response(JSON.stringify({
        error: "No Patreon account found on the source profile. This upgrade is only available for founding Patreon members.",
      }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if the NEW user is already at the top tier (idempotent)
    const { data: newProfile } = await supabase
      .from("profiles")
      .select("patreon_tier")
      .eq("user_id", newUserId)
      .single();

    if (newProfile?.patreon_tier === "creative-economy-lab") {
      // Still record migration if not already done
      await supabase.from("patreon_migration").upsert({
        patreon_user_id: sourceProfile.user_id,
        google_user_id: newUserId,
        migration_status: "migrated",
        migrated_at: new Date().toISOString(),
        auth_method: authMethod,
      }, { onConflict: "patreon_user_id" });

      return new Response(JSON.stringify({ success: true, already_upgraded: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upgrade the NEW account's tier
    const { error: upgradeError } = await supabase
      .from("profiles")
      .update({ patreon_tier: "creative-economy-lab" })
      .eq("user_id", newUserId);

    if (upgradeError) {
      console.error("Upgrade error:", upgradeError);
      return new Response(JSON.stringify({ error: "Failed to upgrade tier" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Record migration — link source Patreon account to new account
    await supabase.from("patreon_migration").upsert({
      patreon_user_id: sourceProfile.user_id,
      google_user_id: newUserId,
      migration_status: "migrated",
      migrated_at: new Date().toISOString(),
      auth_method: authMethod,
    }, { onConflict: "patreon_user_id" });

    // Send a success notification to the new account
    await supabase.from("notifications").insert({
      user_id: newUserId,
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
