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

async function hashIdentifier(identifier: string): Promise<string> {
  const data = new TextEncoder().encode(identifier.toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

const CAMPS: Record<string, string> = {
  "sync-album": "Sync Compilation Album Camp",
  "loop-pack": "OPM Loop Pack Camp",
};
const ROLES = ["Artist / vocalist", "Songwriter", "Producer", "Instrumentalist"];
const ATTENDANCE = ["In person in San Diego", "Remote only", "Either"];

const DETAIL_FIELDS: Record<string, Array<{ key: string; label: string; max: number }>> = {
  "sync-album": [
    { key: "genres", label: "Genres", max: 200 },
    { key: "prior_sync", label: "Prior sync placement", max: 10 },
    { key: "sync_details", label: "Sync details", max: 1000 },
    { key: "ownership", label: "Owns masters/publishing", max: 20 },
    { key: "pro", label: "PRO", max: 100 },
  ],
  "loop-pack": [
    { key: "instruments", label: "Instruments", max: 500 },
    { key: "home_recording", label: "Can record at home", max: 20 },
    { key: "royalty_free_ok", label: "OK with royalty-free licensing", max: 30 },
  ],
};

const str = (v: unknown, max: number) => {
  if (v === undefined || v === null) return "";
  const s = String(v).trim();
  if (s.length > max) throw new Error("too_long");
  return s;
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    if (body?._hp && String(body._hp).trim() !== "") return json({ success: true });
    if (body?._ts && Date.now() - Number(body._ts) < 2000) return json({ success: true });

    const camp = String(body?.camp ?? "");
    if (!CAMPS[camp]) return json({ error: "Unknown camp" }, 400);

    let row;
    let details: Record<string, string> = {};
    try {
      const email = str(body.email, 255).toLowerCase();
      row = {
        camp,
        name: str(body.name, 100),
        email,
        artist_name: str(body.artist_name, 100),
        roles: Array.isArray(body.roles) ? body.roles.filter((r: unknown) => ROLES.includes(String(r))).map(String) : [],
        heritage: str(body.heritage, 300) || null,
        city: str(body.city, 120) || null,
        attendance: ATTENDANCE.includes(String(body.attendance)) ? String(body.attendance) : null,
        links: str(body.links, 1000),
        why: str(body.why, 3000),
        referral_source: str(body.referral_source, 200) || null,
      };
      for (const f of DETAIL_FIELDS[camp]) {
        const v = str(body.details?.[f.key], f.max);
        if (v) details[f.key] = v;
      }
      if (!row.name || !row.email || !row.artist_name || !row.links || !row.why) {
        return json({ error: "Please fill in all required fields" }, 400);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Invalid email format" }, 400);
    } catch {
      return json({ error: "One of your answers is too long" }, 400);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_identifier: await hashIdentifier(row.email),
      p_endpoint: "camp_application",
      p_max_requests: 5,
      p_window_minutes: 60,
    });
    if (allowed === false) return json({ error: "Too many submissions. Please try again later." }, 429);

    const { data: inserted, error } = await supabase
      .from("camp_applications").insert({ ...row, details }).select("id").single();
    if (error) {
      console.error("Insert error:", error);
      return json({ error: "Failed to save application" }, 500);
    }

    const campName = CAMPS[camp];
    try {
      await sendAndLogEmail(supabase, "form-submission-alert", "ge@modernnostalgia.club", {
        idempotencyKey: `camp-application-alert-${inserted.id}`,
        templateData: {
          formName: campName + " application",
          senderEmail: row.email,
          submittedAt: new Date().toISOString(),
          fields: [
            { label: "Camp", value: campName },
            { label: "Name", value: row.name },
            { label: "Email", value: row.email },
            { label: "Artist name", value: row.artist_name },
            { label: "Roles", value: row.roles.join(", ") || "—" },
            { label: "Filipino heritage / connection", value: row.heritage || "—" },
            { label: "City", value: row.city || "—" },
            { label: "Attendance", value: row.attendance || "—" },
            { label: "Links", value: row.links },
            ...DETAIL_FIELDS[camp].map((f) => ({ label: f.label, value: details[f.key] || "—" })),
            { label: "Why they want in", value: row.why },
            { label: "How they heard about us", value: row.referral_source || "—" },
          ],
        },
      });
    } catch (e) { console.error("Alert failed:", e); }

    try {
      await sendAndLogEmail(supabase, "camp-application-confirmation", row.email, {
        idempotencyKey: `camp-application-confirm-${inserted.id}`,
        templateData: { name: row.name, campName },
      });
    } catch (e) { console.error("Confirmation failed:", e); }

    return json({ success: true });
  } catch (error) {
    console.error("camp-application-submit error:", error);
    return json({ error: "An error occurred while processing your application" }, 500);
  }
});
