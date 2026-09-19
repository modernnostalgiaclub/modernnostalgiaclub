import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { sendAndLogEmail } from "../_shared/send-and-log-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();

    if (
      typeof session_id !== "string" ||
      !/^cs_[A-Za-z0-9_]+$/.test(session_id) ||
      session_id.length > 200
    ) {
      return new Response(JSON.stringify({ error: "Invalid session_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === "paid";

    if (paid) {
      // Idempotency guard: only the first successful insert sends the alert.
      const { error: dedupeError } = await supabase
        .from("webhook_events")
        .insert({ event_id: `store-session-${session.id}`, source: "store-verify" });

      if (!dedupeError) {
        try {
          const metadata = session.metadata || {};
          await sendAndLogEmail(
            supabase,
            "purchase-alert",
            "ge@modernnostalgia.club",
            {
              idempotencyKey: `purchase-alert-${session.id}`,
              templateData: {
                purchaseType: metadata.purchase_type || "store",
                buyerEmail:
                  session.customer_details?.email ||
                  session.customer_email ||
                  "unknown",
                items: metadata.items || "Store purchase",
                amount:
                  session.amount_total != null
                    ? (session.amount_total / 100).toFixed(2)
                    : "",
                currency: session.currency || "usd",
                reference: session.id,
                purchasedAt: new Date().toISOString(),
              },
            }
          );
        } catch (alertError) {
          console.error("Purchase alert error:", alertError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        paid,
        email: session.customer_details?.email || session.customer_email || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("verify-store-purchase error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
