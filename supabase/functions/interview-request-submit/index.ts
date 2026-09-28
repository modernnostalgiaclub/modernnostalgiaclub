import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendAndLogEmail } from "../_shared/send-and-log-email.ts";

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

async function hashIdentifier(identifier: string): Promise<string> {
  const data = new TextEncoder().encode(identifier.toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

const RELEASE_STATUSES = ["Unreleased", "Recently released", "Coming soon", "Catalog artist"];

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const { name, email, artist_name, genre, location, links, story, topics, release_status, availability, referral_source, _hp, _ts } = body ?? {};

    if (_hp && String(_hp).trim() !== "") return json({ success: true });
    if (_ts && Date.now() - Number(_ts) < 2000) return json({ success: true });

    if (!name || !email || !artist_name || !story) return json({ error: "Name, email, artist name and your story are required" }, 400);
    if (!isValidEmail(String(email))) return json({ error: "Invalid email format" }, 400);
    if (String(name).length > 100) return json({ error: "Name must be less than 100 characters" }, 400);
    if (String(artist_name).length > 100) return json({ error: "Artist name must be less than 100 characters" }, 400);
    if (genre && String(genre).length > 100) return json({ error: "Genre is too long" }, 400);
    if (location && String(location).length > 120) return json({ error: "Location is too long" }, 400);
    if (links && String(links).length > 1000) return json({ error: "Links must be less than 1000 characters" }, 400);
    if (String(story).length > 3000) return json({ error: "Story must be less than 3000 characters" }, 400);
    if (topics && String(topics).length > 1000) return json({ error: "Topics must be less than 1000 characters" }, 400);
    if (availability && String(availability).length > 300) return json({ error: "Availability is too long" }, 400);
    if (referral_source && String(referral_source).length > 200) return json({ error: "Referral source is too long" }, 400);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const identifier = await hashIdentifier(String(email));
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_endpoint: "interview_request",
      p_max_requests: 5,
      p_window_minutes: 60,
    });
    if (allowed === false) return json({ error: "Too many submissions. Please try again later." }, 429);

    const row = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      artist_name: String(artist_name).trim(),
      genre: genre ? String(genre).trim() : null,
      location: location ? String(location).trim() : null,
      links: links ? String(links).trim() : null,
      story: String(story).trim(),
      topics: topics ? String(topics).trim() : null,
      release_status: typeof release_status === "string" && RELEASE_STATUSES.includes(release_status) ? release_status : null,
      availability: availability ? String(availability).trim() : null,
      referral_source: referral_source ? String(referral_source).trim() : null,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("interview_requests")
      .insert(row)
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return json({ error: "Failed to save request" }, 500);
    }

    try {
      await sendAndLogEmail(supabase, "form-submission-alert", "ge@modernnostalgia.club", {
        idempotencyKey: `interview-request-${inserted.id}`,
        templateData: {
          formName: "Patreon interview request",
          senderEmail: row.email,
          submittedAt: new Date().toISOString(),
          fields: [
            { label: "Name", value: row.name },
            { label: "Email", value: row.email },
            { label: "Artist name", value: row.artist_name },
            { label: "Genre", value: row.genre || "—" },
            { label: "Location", value: row.location || "—" },
            { label: "Links", value: row.links || "—" },
            { label: "Release status", value: row.release_status || "—" },
            { label: "Their story", value: row.story },
            { label: "Topics they want to cover", value: row.topics || "—" },
            { label: "Availability", value: row.availability || "—" },
            { label: "How they heard about us", value: row.referral_source || "—" },
          ],
        },
      });
    } catch (mailError) {
      console.error("Alert email failed:", mailError);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error in interview-request-submit:", error);
    return json({ error: "An error occurred while processing your request" }, 500);
  }
};

serve(handler);
