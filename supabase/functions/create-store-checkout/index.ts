import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Map product IDs to Stripe price IDs
const PRICE_MAP: Record<string, string> = {
  "split-sheet": "price_1TCSN5BXeI74l25DPtyrdDJe",
  "pro-tools-template": "price_1TCScvBXeI74l25DRxaSdSPs",
  "just-make-noise-bundle": "price_1TCSgIBXeI74l25DphXtkDvi",
  "be-loud-bundle": "price_1TDC7qBXeI74l25DKft9K3KM",
  "catalog-audit": "price_1TDCB2BXeI74l25DQspvwxZg",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_id } = await req.json();

    if (!product_id || !PRICE_MAP[product_id]) {
      return new Response(
        JSON.stringify({ error: `Unknown product_id: "${product_id}"` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://modernnostalgiaclub.lovable.app";

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: PRICE_MAP[product_id], quantity: 1 }],
      mode: "payment",
      success_url: `${origin}/store/success?session_id={CHECKOUT_SESSION_ID}&product=${product_id}`,
      cancel_url: `${origin}/store`,
      // Allow both guests and logged-in users
      billing_address_collection: "auto",
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("create-store-checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
