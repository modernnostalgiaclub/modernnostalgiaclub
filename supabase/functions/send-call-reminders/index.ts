import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendAndLogEmail } from "../_shared/send-and-log-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-reminder-secret",
};

function pacificDateString(offsetDays: number): string {
  const now = new Date();
  const pacific = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  pacific.setDate(pacific.getDate() + offsetDays);
  const y = pacific.getFullYear();
  const m = String(pacific.getMonth() + 1).padStart(2, "0");
  const d = String(pacific.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function prettyDate(dateStr: string): string {
  const parsed = new Date(`${dateStr}T12:00:00Z`);
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  const expectedSecret = Deno.env.get("CALL_REMINDER_SECRET");
  if (!expectedSecret || req.headers.get("x-reminder-secret") !== expectedSecret) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const tomorrow = pacificDateString(1);

    const { data: bookings, error } = await supabase
      .from("discovery_call_bookings")
      .select("id, full_name, email, preferred_date, preferred_time, timezone, topic")
      .eq("preferred_date", tomorrow)
      .neq("status", "cancelled")
      .is("reminder_sent_at", null);

    if (error) {
      console.error("Failed to load bookings:", error);
      return json({ error: "Failed to load bookings" }, 500);
    }

    let sent = 0;
    for (const booking of bookings ?? []) {
      try {
        await sendAndLogEmail(supabase, "discovery-call-reminder", booking.email, {
          idempotencyKey: `discovery-call-reminder-${booking.id}`,
          templateData: {
            name: booking.full_name,
            callDate: prettyDate(booking.preferred_date),
            callTime: booking.preferred_time,
            timezone: booking.timezone || null,
            topic: booking.topic || null,
          },
        });
        sent += 1;
      } catch (mailError) {
        console.error("Reminder failed for booking", booking.id, mailError);
        continue;
      }

      await supabase
        .from("discovery_call_bookings")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", booking.id);
    }

    return json({ success: true, date: tomorrow, considered: bookings?.length ?? 0, sent });
  } catch (err) {
    console.error("send-call-reminders error:", err);
    return json({ error: "Unexpected error" }, 500);
  }
});
