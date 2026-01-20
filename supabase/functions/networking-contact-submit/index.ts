import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Restrict CORS to known origins
const ALLOWED_ORIGINS = [
  "https://modernnostalgiaclub.lovable.app",
  "https://id-preview--d2e8cfe7-9d48-4ca0-8572-89bc493985c7.lovable.app",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed.replace('id-preview--', '')))
    ? origin
    : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

interface ContactSubmission {
  name: string;
  email: string;
  company?: string;
  role?: string;
  notes?: string;
  event_tag?: string;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Hash identifier for rate limiting
async function hashIdentifier(identifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(identifier.toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { name, email, company, role, notes, event_tag }: ContactSubmission = await req.json();

    // Validate required fields
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate input lengths
    if (name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name must be less than 100 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (company && company.length > 200) {
      return new Response(
        JSON.stringify({ error: "Company must be less than 200 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (notes && notes.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Notes must be less than 1000 characters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate role if provided
    const validRoles = ['Artist', 'Brand', 'Music Tech', 'Publisher / Sync', 'Other'];
    const sanitizedRole = role && validRoles.includes(role) ? role : 'Other';

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting check (5 submissions per email per hour)
    const identifier = await hashIdentifier(email);
    
    const { data: rateLimitAllowed, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_identifier: identifier,
        p_endpoint: 'networking_contact',
        p_max_requests: 5,
        p_window_minutes: 60
      });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    }

    if (rateLimitAllowed === false) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Insert contact using service role (bypasses RLS)
    const { error: insertError } = await supabase
      .from('networking_contacts')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() || null,
        role: sanitizedRole,
        notes: notes?.trim() || null,
        event_tag: event_tag || 'NAMM',
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save contact" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Contact submitted:", { name: name.trim(), email: email.trim().toLowerCase() });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in networking-contact-submit:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
