import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://modernnostalgia.club",
  "https://www.modernnostalgia.club",
  "https://modernnostalgiaclub.lovable.app",
  "https://id-preview--d2e8cfe7-9d48-4ca0-8572-89bc493985c7.lovable.app",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some((a) => origin.startsWith(a.replace("id-preview--", "")))
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

async function hashIdentifier(identifier: string): Promise<string> {
  const data = new TextEncoder().encode(identifier.toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

const TOPICS = [
  "Sync licensing strategy",
  "Catalog audit",
  "Membership questions",
  "Production or beats",
  "Partnership or sponsorship",
  "Something else",
];

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const {
      full_name, email, artist_name, phone, topic,
      preferred_date, preferred_time, alt_date, alt_time,
      timezone, notes, _hp, _ts,
    } = body ?? {};

    if (_hp && String(_hp).trim() !== "") return json({ success: true });
    if (_ts && Date.now() - Number(_ts) < 2000) return json({ success: true });

    if (!full_name || !email || !preferred_date || !preferred_time) {
      return json({ error: "Name, email, preferred date and time are required" }, 400);
    }
    if (!isValidEmail(String(email))) return json({ error: "Invalid email format" }, 400);
    if (!isValidDate(String(preferred_date))) return json({ error: "Invalid preferred date" }, 400);
    if (!TIME_SLOTS.includes(String(preferred_time))) return json({ error: "Invalid preferred time" }, 400);
    if (alt_date && !isValidDate(String(alt_date))) return json({ error: "Invalid alternate date" }, 400);
    if (alt_time && !TIME_SLOTS.includes(String(alt_time))) return json({ error: "Invalid alternate time" }, 400);
    if (String(full_name).length > 100) return json({ error: "Name is too long" }, 400);
    if (artist_name && String(artist_name).length > 120) return json({ error: "Artist name is too long" }, 400);
    if (phone && String(phone).length > 40) return json({ error: "Phone number is too long" }, 400);
    if (notes && String(notes).length > 1500) return json({ error: "Notes must be less than 1500 characters" }, 400);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (new Date(`${preferred_date}T00:00:00Z`) < today) {
      return json({ error: "Please choose a date in the future" }, 400);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const identifier = await hashIdentifier(String(email));
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_endpoint: "discovery_call_booking",
      p_max_requests: 5,
      p_window_minutes: 60,
    });
    if (allowed === false) return json({ error: "Too many booking requests. Please try again later." }, 429);

    const row = {
      full_name: String(full_name).trim(),
      email: String(email).trim().toLowerCase(),
      artist_name: artist_name ? String(artist_name).trim() : null,
      phone: phone ? String(phone).trim() : null,
      topic: typeof topic === "string" && TOPICS.includes(topic) ? topic : null,
      preferred_date: String(preferred_date),
      preferred_time: String(preferred_time),
      alt_date: alt_date ? String(alt_date) : null,
      alt_time: alt_time ? String(alt_time) : null,
      timezone: timezone ? String(timezone).slice(0, 80) : null,
      notes: notes ? String(notes).trim() : null,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("discovery_call_bookings")
      .insert(row)
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return json({ error: "Failed to save booking" }, 500);
    }

    const bookingFields = [
      { label: "Name", value: row.full_name },
      { label: "Email", value: row.email },
      { label: "Artist name", value: row.artist_name || "—" },
      { label: "Phone", value: row.phone || "—" },
      { label: "Topic", value: row.topic || "—" },
      { label: "Preferred time", value: `${row.preferred_date} at ${row.preferred_time}` },
      { label: "Alternate time", value: row.alt_date ? `${row.alt_date} at ${row.alt_time || "—"}` : "—" },
      { label: "Timezone", value: row.timezone || "—" },
      { label: "Notes", value: row.notes || "—" },
    ];

    try {
      const [ownerAlert, customerConfirmation] = await Promise.all([
        supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "form-submission-alert",
          recipientEmail: "ge@modernnostalgia.club",
          idempotencyKey: `discovery-call-owner-${inserted.id}`,
          templateData: {
            formName: "Discovery call booking",
            senderEmail: row.email,
            submittedAt: new Date().toISOString(),
            fields: bookingFields,
          },
        },
        }),
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "discovery-call-confirmation",
            recipientEmail: row.email,
            idempotencyKey: `discovery-call-confirmation-${inserted.id}`,
            templateData: {
              name: row.full_name,
              preferredDate: row.preferred_date,
              preferredTime: row.preferred_time,
              alternateDate: row.alt_date,
              alternateTime: row.alt_time,
              timezone: row.timezone || "Local timezone",
              topic: row.topic || "Discovery call",
            },
          },
        }),
      ]);

      if (ownerAlert.error) console.error("Owner booking alert failed:", ownerAlert.error);
      if (customerConfirmation.error) console.error("Booking confirmation failed:", customerConfirmation.error);
    } catch (mailError) {
      console.error("Booking emails failed:", mailError);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error in discovery-call-book:", error);
    return json({ error: "An error occurred while processing your request" }, 500);
  }
};

serve(handler);
