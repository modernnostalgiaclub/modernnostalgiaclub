import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://modernnostalgiaclub.lovable.app";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://modernnostalgia.club",
  "https://www.modernnostalgia.club",
  "https://modernnostalgiaclub.lovable.app",
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

interface QuizSubmission {
  email: string;
  answers: Record<string, number>;
  score: number;
  resultType: 'sync-ready' | 'almost-ready' | 'not-ready';
  hasRightsClarity?: boolean;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

async function hashIdentifier(identifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(identifier.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const payload: QuizSubmission = await req.json();

    // Validate required fields
    if (!payload.email || !payload.answers || typeof payload.score !== 'number' || !payload.resultType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    if (!isValidEmail(payload.email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate result type
    const validResultTypes = ['sync-ready', 'almost-ready', 'not-ready'];
    if (!validResultTypes.includes(payload.resultType)) {
      return new Response(
        JSON.stringify({ error: "Invalid result type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Rate limiting: 5 quiz submissions per hour per email
    const emailHash = await hashIdentifier(payload.email);
    const { data: rateLimitOk, error: rateLimitError } = await supabase.rpc('check_rate_limit', {
      p_identifier: emailHash,
      p_endpoint: 'sync-quiz-submit',
      p_max_requests: 5,
      p_window_minutes: 60
    });

    if (rateLimitError) {
      console.error("Rate limit check failed:", rateLimitError);
      return new Response(
        JSON.stringify({ error: "Rate limit check failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!rateLimitOk) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store answers with rights-clarity flag in metadata
    const answersWithMetadata = {
      ...payload.answers,
      _metadata: {
        hasRightsClarity: payload.hasRightsClarity ?? false,
        submittedAt: new Date().toISOString(),
      }
    };

    // Insert quiz result
    const { error: insertError } = await supabase
      .from('sync_quiz_results')
      .insert({
        email: payload.email.toLowerCase().trim(),
        result_type: payload.resultType,
        answers: answersWithMetadata,
        score: payload.score
      });

    if (insertError) {
      console.error("Failed to save quiz result:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save your result. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If user has rights-clarity issues, trigger the education email sequence
    if (payload.hasRightsClarity && RESEND_API_KEY) {
      console.log("Triggering rights-clarity email sequence for:", payload.email);
      
      try {
        // Send first email of the sequence immediately
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Modern Nostalgia Club <ge@modernnostalgia.club>",
            to: [payload.email.toLowerCase().trim()],
            subject: "Why PRO Registration Matters for Sync",
            html: generateRightsClarityEmail1(SITE_URL),
          }),
        });

        if (emailResponse.ok) {
          console.log("Rights-clarity email sequence started successfully");
        } else {
          const error = await emailResponse.json();
          console.error("Failed to send rights-clarity email:", error);
        }
      } catch (emailError) {
        // Don't fail the quiz submission if email fails
        console.error("Error sending rights-clarity email:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        resultType: payload.resultType,
        hasRightsClarity: payload.hasRightsClarity ?? false
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Quiz submission error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Email template for rights-clarity education - Day 1
function generateRightsClarityEmail1(siteUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
        <h1 style="color: #f5f5dc; margin: 0; font-size: 24px;">Rights Clarity Series: Part 1</h1>
      </div>
      
      <p>Hi there,</p>
      
      <p>Based on your Sync Readiness Quiz results, we noticed some uncertainty around PRO registration and ownership clarity. This is one of the most common—and fixable—issues we see.</p>
      
      <h2 style="color: #8B1A1A; font-size: 20px;">Why Every Collaborator Needs PRO Registration</h2>
      
      <p>When a sync supervisor clears a song for TV, film, or advertising, they need to know:</p>
      
      <ul style="padding-left: 20px;">
        <li><strong>Who owns the composition</strong> (the song itself)</li>
        <li><strong>Who owns the master</strong> (the recording)</li>
        <li><strong>How to pay everyone involved</strong></li>
      </ul>
      
      <p>If any collaborator isn't registered with a PRO (ASCAP, BMI, SESAC, etc.), performance royalties can't flow properly. Worse, some supervisors will pass on the song entirely rather than deal with the paperwork risk.</p>
      
      <div style="background: #f9f9f9; border-left: 4px solid #8B1A1A; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
        <h3 style="margin-top: 0; color: #8B1A1A;">Quick Action Step</h3>
        <p style="margin-bottom: 0;">Reach out to your collaborators this week and confirm their PRO registration status. If anyone isn't registered, point them to <a href="https://www.ascap.com" style="color: #8B1A1A;">ASCAP</a>, <a href="https://www.bmi.com" style="color: #8B1A1A;">BMI</a>, or <a href="https://www.sesac.com" style="color: #8B1A1A;">SESAC</a> to get started.</p>
      </div>
      
      <p>In our next email, we'll cover contributor agreements and why informal handshakes create licensing nightmares.</p>
      
      <p style="margin-top: 30px;">— The Modern Nostalgia Club Team</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #999;">
        You're receiving this because you took our Sync Readiness Quiz.<br>
        <a href="${siteUrl}" style="color: #8B1A1A;">Modern Nostalgia Club</a>
      </p>
    </body>
    </html>
  `;
}

serve(handler);
