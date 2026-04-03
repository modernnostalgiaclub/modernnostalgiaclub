import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Not authenticated");

    const { data: roleCheck } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleCheck) throw new Error("Unauthorized: admin role required");

    // Parse and validate input
    const body = await req.json();
    const { name, email, tier, locked_price, locked_billing_period, is_grandfathered, billing_status, notes, plan_id } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Valid email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Name is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const validTiers = ["lab-pass", "creator-accelerator", "creative-economy-lab"];
    if (!tier || !validTiers.includes(tier)) {
      return new Response(JSON.stringify({ error: "Valid tier is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const validStatuses = ["active", "inactive", "comped", "manual"];
    const status = validStatuses.includes(billing_status) ? billing_status : "active";

    // Create auth user with a random password (they'll reset via email)
    const tempPassword = crypto.randomUUID() + "!Aa1";
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: tempPassword,
      email_confirm: true,
      user_metadata: { name: name.trim() },
    });

    if (createError) {
      // Check for duplicate
      if (createError.message?.includes("already been registered") || createError.message?.includes("already exists")) {
        return new Response(JSON.stringify({ error: "A user with this email already exists" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 409,
        });
      }
      throw createError;
    }

    const userId = newUser.user.id;

    // The handle_new_user trigger will create a profile, but we need to update the tier
    // Wait briefly for the trigger to fire
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update profile with correct tier
    await supabaseAdmin
      .from("profiles")
      .upsert({
        user_id: userId,
        name: name.trim(),
        patreon_tier: tier,
      }, { onConflict: "user_id" });

    // Create member_subscription record
    const price = typeof locked_price === "number" ? locked_price : 0;
    const billingPeriod = locked_billing_period || "one-time";

    const subscriptionData: Record<string, unknown> = {
      user_id: userId,
      plan_id: plan_id || null,
      locked_price: price,
      locked_billing_period: billingPeriod,
      is_grandfathered: is_grandfathered === true,
      status: status,
      notes: notes || null,
    };

    const { error: subError } = await supabaseAdmin
      .from("member_subscriptions")
      .insert(subscriptionData);

    if (subError) {
      console.error("Failed to create subscription:", subError);
      // User was created but subscription failed - still return success with warning
      return new Response(JSON.stringify({ 
        success: true, 
        user_id: userId,
        warning: "User created but subscription record failed. Please add manually." 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Send password reset email so user can set their own password
    await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email.trim().toLowerCase(),
    });

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      user_id: userData.user.id,
      action: "admin_create_user",
      table_name: "profiles",
      record_id: userId,
      details: {
        created_email: email,
        created_name: name,
        tier,
        billing_status: status,
        locked_price: price,
        is_grandfathered: is_grandfathered === true,
      },
    });

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("admin-create-user error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
