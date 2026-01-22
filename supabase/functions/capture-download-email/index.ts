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

interface EmailCaptureRequest {
  email: string;
  trackId: string;
  trackTitle: string;
  // Anti-spam fields
  _hp?: string;  // Honeypot
  _fp?: string;  // Fingerprint
  _ts?: number;  // Timestamp
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

  try {
    const { email, trackId, trackTitle, _hp, _fp, _ts }: EmailCaptureRequest = await req.json();

    // Anti-spam: Check honeypot field (should be empty for humans)
    if (_hp && _hp.trim() !== '') {
      console.warn("Honeypot triggered - likely bot submission");
      // Return success to not reveal detection to bots
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Anti-spam: Check timestamp (reject if submitted too quickly - less than 2 seconds)
    if (_ts && (Date.now() - _ts) < 2000) {
      console.warn("Form submitted too quickly - likely bot");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate inputs
    if (!email || !trackId) {
      return new Response(
        JSON.stringify({ error: "Email and track ID are required" }),
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

    // Validate track ID length
    if (trackId.length > 100) {
      return new Response(
        JSON.stringify({ error: "Invalid track ID" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting check - 10 submissions per email per hour
    const identifier = await hashIdentifier(email);
    
    const { data: rateLimitAllowed, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_identifier: identifier,
        p_endpoint: 'email_capture',
        p_max_requests: 10,
        p_window_minutes: 60
      });

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    }

    if (rateLimitAllowed === false) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Insert email capture
    const { error: insertError } = await supabase
      .from('download_email_captures')
      .insert({
        email: email.toLowerCase().trim(),
        track_id: trackId,
        track_title: trackTitle || null,
      });

    if (insertError) {
      // Unique constraint violation - email already captured for this track
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ success: true, message: "Email already registered" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      throw insertError;
    }

    console.log(`Email captured: ${email} for track: ${trackId}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in capture-download-email function:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
