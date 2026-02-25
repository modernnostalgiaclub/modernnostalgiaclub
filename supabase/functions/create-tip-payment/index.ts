import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { artist_user_id, amount, currency = "usd", tipper_email, username } = await req.json();

    if (!artist_user_id || !amount || amount < 1) {
      return new Response(JSON.stringify({ error: "Invalid tip amount or missing artist" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch artist profile for name and Stripe Connect info
    const { data: artist } = await supabase
      .from("profiles")
      .select("stage_name, name, stripe_account_id, stripe_onboarding_complete")
      .eq("user_id", artist_user_id)
      .single();

    const artistName = (artist as any)?.stage_name || (artist as any)?.name || "the artist";
    const stripeAccountId = (artist as any)?.stripe_account_id;
    const onboardingComplete = (artist as any)?.stripe_onboarding_complete;

    const origin = req.headers.get("origin") || "https://modernnostalgiaclub.lovable.app";
    const artistPath = username ? `/artist/${username}` : "/";

    const amountInCents = Math.round(amount * 100);

    // Build session params
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: amountInCents,
            product_data: {
              name: `Tip for ${artistName}`,
              description: `Support ${artistName}'s music`,
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        metadata: {
          artist_user_id,
          artist_name: artistName,
          tip: "true",
        },
      },
      success_url: `${origin}${artistPath}?tip=success`,
      cancel_url: `${origin}${artistPath}`,
    };

    if (tipper_email) {
      sessionParams.customer_email = tipper_email;
    }

    // If artist has completed Stripe Connect, route funds to them
    if (stripeAccountId && onboardingComplete) {
      const platformFeePercent = 0.05; // 5% platform fee
      const platformFee = Math.round(amountInCents * platformFeePercent);
      (sessionParams.payment_intent_data as any).application_fee_amount = platformFee;
      (sessionParams as any).stripe_account = stripeAccountId;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(JSON.stringify({ checkout_url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-tip-payment error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
