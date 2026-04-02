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
    const body = await req.json();

    // Support both single product_id (legacy) and cart_items (new cart)
    let lineItems: { price: string; quantity: number }[] = [];

    if (body.cart_items && Array.isArray(body.cart_items)) {
      for (const item of body.cart_items) {
        const priceId = PRICE_MAP[item.product_id];
        if (!priceId) {
          return new Response(
            JSON.stringify({ error: `Unknown product_id: "${item.product_id}"` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        lineItems.push({ price: priceId, quantity: item.quantity || 1 });
      }
    } else if (body.product_id) {
      const priceId = PRICE_MAP[body.product_id];
      if (!priceId) {
        return new Response(
          JSON.stringify({ error: `Unknown product_id: "${body.product_id}"` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      lineItems.push({ price: priceId, quantity: 1 });
    } else {
      return new Response(
        JSON.stringify({ error: "Missing product_id or cart_items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const origin = req.headers.get("origin") || "https://modernnostalgiaclub.lovable.app";

    // Build product string for success URL
    const productIds = lineItems.map(li => {
      const entry = Object.entries(PRICE_MAP).find(([, v]) => v === li.price);
      return entry ? entry[0] : "";
    }).filter(Boolean).join(",");

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/store/success?session_id={CHECKOUT_SESSION_ID}&product=${productIds}`,
      cancel_url: `${origin}/store`,
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
