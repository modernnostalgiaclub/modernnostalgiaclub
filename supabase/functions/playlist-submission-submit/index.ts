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

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (parsed.protocol === "https:" || parsed.protocol === "http:") && url.length <= 500;
  } catch {
    return false;
  }
}

async function hashIdentifier(identifier: string): Promise<string> {
  const data = new TextEncoder().encode(identifier.toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

const CLEARANCE = ["Yes, fully cleared and owned", "Partly cleared", "Not sure"];
const VOCAL_TYPES = ["Instrumental", "Vocal", "Both"];
const RELEASE_STATUS = ["Unreleased", "Released", "Coming soon"];

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const { name, email, artist_name, song_title, song_url, genre, clearance, vocal_type, release_status, notes, consent, _hp, _ts } = body ?? {};

    if (_hp && String(_hp).trim() !== "") return json({ success: true });
    if (_ts && Date.now() - Number(_ts) < 2000) return json({ success: true });

    if (!name || !email || !artist_name || !song_title || !song_url) {
      return json({ error: "Name, email, artist name, song title and song link are required" }, 400);
    }
    if (consent !== true) return json({ error: "Consent is required" }, 400);
    if (!isValidEmail(String(email))) return json({ error: "Invalid email format" }, 400);
    if (!isValidUrl(String(song_url))) return json({ error: "Please enter a valid link to your song" }, 400);
    if (String(name).length > 100) return json({ error: "Name must be less than 100 characters" }, 400);
    if (String(artist_name).length > 120) return json({ error: "Artist name is too long" }, 400);
    if (String(song_title).length > 200) return json({ error: "Song title is too long" }, 400);
    if (genre && String(genre).length > 200) return json({ error: "Genre is too long" }, 400);
    if (notes && String(notes).length > 1500) return json({ error: "Notes must be less than 1500 characters" }, 400);

    const pick = (value: unknown, list: string[]) => (typeof value === "string" && list.includes(value) ? value : null);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const identifier = await hashIdentifier(String(email));
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_endpoint: "playlist_submission",
      p_max_requests: 10,
      p_window_minutes: 60,
    });
    if (allowed === false) return json({ error: "Too many submissions. Please try again later." }, 429);

    const row = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      artist_name: String(artist_name).trim(),
      song_title: String(song_title).trim(),
      song_url: String(song_url).trim(),
      genre: genre ? String(genre).trim() : null,
      clearance: pick(clearance, CLEARANCE),
      vocal_type: pick(vocal_type, VOCAL_TYPES),
      release_status: pick(release_status, RELEASE_STATUS),
      notes: notes ? String(notes).trim() : null,
      consent: true,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("playlist_submissions")
      .insert(row)
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return json({ error: "Failed to save submission" }, 500);
    }

    try {
      await sendAndLogEmail(supabase, "form-submission-alert", "ge@modernnostalgia.club", {
        idempotencyKey: `playlist-submission-${inserted.id}`,
        templateData: {
          formName: "Playlist submission",
          senderEmail: row.email,
          submittedAt: new Date().toISOString(),
          fields: [
            { label: "Name", value: row.name },
            { label: "Email", value: row.email },
            { label: "Artist name", value: row.artist_name },
            { label: "Song title", value: row.song_title },
            { label: "Song link", value: row.song_url },
            { label: "Genre / mood", value: row.genre || "—" },
            { label: "Cleared and owned", value: row.clearance || "—" },
            { label: "Instrumental or vocal", value: row.vocal_type || "—" },
            { label: "Release status", value: row.release_status || "—" },
            { label: "Notes", value: row.notes || "—" },
          ],
        },
      });
    } catch (mailError) {
      console.error("Alert email failed:", mailError);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error in playlist-submission-submit:", error);
    return json({ error: "An error occurred while processing your request" }, 500);
  }
};

serve(handler);
