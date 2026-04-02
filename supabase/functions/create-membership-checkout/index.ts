import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    const { plan_id } = await req.json();
    if (!plan_id) {
      return new Response(JSON.stringify({ error: "Missing plan_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("User not authenticated");
    const user = userData.user;

    // Fetch plan details
    const { data: plan, error: planError } = await supabaseClient
      .from("membership_plans")
      .select("*")
      .eq("id", plan_id)
      .eq("is_active", true)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ error: "Plan not found or inactive" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!plan.stripe_price_id) {
      return new Response(JSON.stringify({ error: "Plan not configured for payments" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const origin = req.headers.get("origin") || "https://modernnostalgiaclub.lovable.app";
    const isSubscription = plan.billing_period === "monthly" || plan.billing_period === "yearly";

    // Check if user already has a subscription (prevent duplicates)
    const { data: existingSub } = await supabaseClient
      .from("member_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (existingSub) {
      return new Response(JSON.stringify({ error: "You already have an active membership" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `${origin}/dashboard?membership=success&plan=${plan.name}`,
      cancel_url: `${origin}/dashboard?membership=cancelled`,
      metadata: {
        plan_id: plan.id,
        plan_name: plan.name,
        user_id: user.id,
        is_new_member: "true",
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Record the new subscription at current pricing (NOT grandfathered)
    await supabaseClient.from("member_subscriptions").insert({
      user_id: user.id,
      plan_id: plan.id,
      locked_price: plan.price,
      locked_billing_period: plan.billing_period,
      is_grandfathered: false,
      status: "pending",
      stripe_customer_id: customerId || null,
      notes: `New signup at current pricing ($${plan.price})`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("create-membership-checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
