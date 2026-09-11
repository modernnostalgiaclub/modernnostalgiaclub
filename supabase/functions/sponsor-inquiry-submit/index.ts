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

async function hashIdentifier(identifier: string): Promise<string> {
  const data = new TextEncoder().encode(identifier.toLowerCase());
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("").substring(0, 32);
}

const PARTNERSHIP_TYPES = ["Event sponsorship", "Playlist / content sponsorship", "Product placement", "Artist support", "Other"];
const BUDGETS = ["Under $500", "$500 - $2,500", "$2,500 - $10,000", "$10,000+", "Not sure yet"];
const TIMELINES = ["This month", "Next 1-3 months", "Later this year", "Flexible"];

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get("origin"));
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...corsHeaders } });

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const { name, email, company, website, role, partnership_type, budget_range, timeline, goals, referral_source, _hp, _ts } = body ?? {};

    if (_hp && String(_hp).trim() !== "") return json({ success: true });
    if (_ts && Date.now() - Number(_ts) < 2000) return json({ success: true });

    if (!name || !email || !company || !goals) return json({ error: "Name, email, company and goals are required" }, 400);
    if (!isValidEmail(String(email))) return json({ error: "Invalid email format" }, 400);
    if (String(name).length > 100) return json({ error: "Name must be less than 100 characters" }, 400);
    if (String(company).length > 200) return json({ error: "Company must be less than 200 characters" }, 400);
    if (website && String(website).length > 300) return json({ error: "Website link is too long" }, 400);
    if (role && String(role).length > 120) return json({ error: "Role is too long" }, 400);
    if (String(goals).length > 2000) return json({ error: "Goals must be less than 2000 characters" }, 400);
    if (referral_source && String(referral_source).length > 200) return json({ error: "Referral source is too long" }, 400);

    const pick = (value: unknown, list: string[]) => (typeof value === "string" && list.includes(value) ? value : null);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const identifier = await hashIdentifier(String(email));
    const { data: allowed } = await supabase.rpc("check_rate_limit", {
      p_identifier: identifier,
      p_endpoint: "sponsor_inquiry",
      p_max_requests: 5,
      p_window_minutes: 60,
    });
    if (allowed === false) return json({ error: "Too many submissions. Please try again later." }, 429);

    const row = {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      company: String(company).trim(),
      website: website ? String(website).trim() : null,
      role: role ? String(role).trim() : null,
      partnership_type: pick(partnership_type, PARTNERSHIP_TYPES),
      budget_range: pick(budget_range, BUDGETS),
      timeline: pick(timeline, TIMELINES),
      goals: String(goals).trim(),
      referral_source: referral_source ? String(referral_source).trim() : null,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("sponsor_inquiries")
      .insert(row)
      .select("id")
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return json({ error: "Failed to save inquiry" }, 500);
    }

    try {
      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "form-submission-alert",
          recipientEmail: "ge@modernnostalgia.club",
          idempotencyKey: `sponsor-inquiry-${inserted.id}`,
          templateData: {
            formName: "Sponsorship inquiry",
            senderEmail: row.email,
            submittedAt: new Date().toISOString(),
            fields: [
              { label: "Name", value: row.name },
              { label: "Email", value: row.email },
              { label: "Company", value: row.company },
              { label: "Website", value: row.website || "—" },
              { label: "Role", value: row.role || "—" },
              { label: "Partnership type", value: row.partnership_type || "—" },
              { label: "Budget range", value: row.budget_range || "—" },
              { label: "Timeline", value: row.timeline || "—" },
              { label: "Goals", value: row.goals },
              { label: "How they heard about us", value: row.referral_source || "—" },
            ],
          },
        },
      });
    } catch (mailError) {
      console.error("Alert email failed:", mailError);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error in sponsor-inquiry-submit:", error);
    return json({ error: "An error occurred while processing your request" }, 500);
  }
};

serve(handler);
