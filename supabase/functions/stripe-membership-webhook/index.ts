import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2025-08-27.basil",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } }
);

// Map plan names to patreon_tier enum values
const PLAN_TIER_MAP: Record<string, string> = {
  "Club Pass": "lab-pass",
  "Accelerator": "creator-accelerator",
  "Artist Incubator": "creative-economy-lab",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!signature || !webhookSecret) {
    console.error("Missing signature or webhook secret");
    return new Response("Missing signature", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`[stripe-membership-webhook] Received event: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const userId = metadata.user_id;
    const planName = metadata.plan_name;
    const planId = metadata.plan_id;

    if (!userId || !planId) {
      console.error("Missing metadata in checkout session", metadata);
      return new Response("Missing metadata", { status: 400 });
    }

    console.log(`[stripe-membership-webhook] Activating membership for user ${userId}, plan: ${planName}`);

    // Update member_subscriptions to active
    const { error: subError } = await supabase
      .from("member_subscriptions")
      .update({
        status: "active",
        stripe_customer_id: session.customer as string || null,
        stripe_subscription_id: session.subscription as string || null,
      })
      .eq("user_id", userId)
      .eq("plan_id", planId)
      .eq("status", "pending");

    if (subError) {
      console.error("Failed to update member_subscriptions:", subError);
    }

    // Sync patreon_tier on profiles
    const tier = PLAN_TIER_MAP[planName || ""];
    if (tier) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ patreon_tier: tier })
        .eq("user_id", userId);

      if (profileError) {
        console.error("Failed to update profile tier:", profileError);
      }
    }

    // Record webhook event for idempotency
    await supabase.from("webhook_events").insert({
      event_id: event.id,
      source: "stripe-membership",
    });

    console.log(`[stripe-membership-webhook] Successfully activated membership for user ${userId}`);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
