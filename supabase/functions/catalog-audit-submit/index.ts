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

const CATALOG_SIZES = ["Under 5 songs", "5 to 10 songs", "10 to 25 songs", "25 to 50 songs", "50+ songs"];
const OWNERSHIP = ["I own everything", "Mostly mine, some co-writes", "Shared with a label or publisher", "Not sure"];
const SPLITS = ["Yes, all documented", "Some documented", "None documented", "Not sure"];

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const {
      full_name, email, artist_name, catalog_size, catalog_link,
      ownership_status, splits_documented, pro_affiliation, goals, notes, _hp, _ts,
    } = body ?? {};

    if (_hp && String(_hp).trim() !== "") return json({ success: true });
    if (_ts && Date.now() - Number(_ts) < 2000) return json({ success: true });

    if (!full_name || !email || !goals) return json({ error: "Name, email and goals are required" }, 400);
    if (!isValidEmail(String(email))) return json({ error: "Invalid email format" }, 400);
    if (String(full_name).length > 100) return json({ error: "Name is too long" }, 400);
    if (artist_name && String(artist_name).length > 120) return json({ error: "Artist name is too long" }, 400);
    if (catalog_link && !isValidUrl(String(catalog_link))) return json({ error: "Please enter a valid catalog link" }, 400);
    if (pro_affiliation && String(pro_affiliation).length > 120) return json({ error: "PRO is too long" }, 400);
    if (String(goals).length > 2000) return json({ error: "Goals must be less than 2000 characters" }, 400);
    if (notes && String(notes).length > 1500) return json({ error: "Notes must be less than 1500 characters" }, 400);

    const pick = (value: unknown, list: string[]) => (typeof value === "string" && list.includes(value) ? value : null);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const identifier = await hashIdentifier(String(email));
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_endpoint: "catalog_audit_submission",
      p_max_requests: 5,
      p_window_minutes: 60,
    });
    if (allowed === false) return json({ error: "Too many requests. Please try again later." }, 429);

    const row = {
      full_name: String(full_name).trim(),
      email: String(email).trim().toLowerCase(),
      artist_name: artist_name ? String(artist_name).trim() : null,
      catalog_size: pick(catalog_size, CATALOG_SIZES),
      catalog_link: catalog_link ? String(catalog_link).trim() : null,
      ownership_status: pick(ownership_status, OWNERSHIP),
      splits_documented: pick(splits_documented, SPLITS),
      pro_affiliation: pro_affiliation ? String(pro_affiliation).trim() : null,
      goals: String(goals).trim(),
      notes: notes ? String(notes).trim() : null,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("catalog_audit_submissions")
      .insert(row)
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return json({ error: "Failed to save your catalog details" }, 500);
    }

    try {
      const results = await Promise.allSettled([
        sendAndLogEmail(supabase, "form-submission-alert", "ge@modernnostalgia.club", {
          idempotencyKey: `catalog-audit-owner-${inserted.id}`,
          templateData: {
            formName: "Catalog audit request",
            senderEmail: row.email,
            submittedAt: new Date().toISOString(),
            fields: [
              { label: "Name", value: row.full_name },
              { label: "Email", value: row.email },
              { label: "Artist name", value: row.artist_name || "—" },
              { label: "Catalog size", value: row.catalog_size || "—" },
              { label: "Catalog link", value: row.catalog_link || "—" },
              { label: "Ownership", value: row.ownership_status || "—" },
              { label: "Splits documented", value: row.splits_documented || "—" },
              { label: "PRO", value: row.pro_affiliation || "—" },
              { label: "Goals", value: row.goals },
              { label: "Notes", value: row.notes || "—" },
            ],
          },
        }),
        sendAndLogEmail(supabase, "catalog-audit-confirmation", row.email, {
          idempotencyKey: `catalog-audit-confirmation-${inserted.id}`,
          templateData: {
            name: row.full_name,
            artistName: row.artist_name,
            catalogSize: row.catalog_size || "Not provided",
            goals: row.goals,
          },
        }),
      ]);

      if (results[0].status === "rejected") console.error("Owner alert failed:", results[0].reason);
      if (results[1].status === "rejected") console.error("Confirmation email failed:", results[1].reason);
    } catch (mailError) {
      console.error("Catalog audit emails failed:", mailError);
    }

    return json({ success: true, id: inserted.id });
  } catch (error) {
    console.error("Error in catalog-audit-submit:", error);
    return json({ error: "An error occurred while processing your request" }, 500);
  }
};

serve(handler);
