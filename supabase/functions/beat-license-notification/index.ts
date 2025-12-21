import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Domain allowlist for CORS
const ALLOWED_ORIGINS = [
  'https://gpcpovoikxgkgnabumlx.lovableproject.com',
  'https://modernnostalgiaclub.lovable.app',
  'https://modernnostalgia.club',
  'https://www.modernnostalgia.club',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.some(allowed =>
    origin === allowed || 
    origin.endsWith('.lovable.app') || 
    origin.endsWith('.lovableproject.com')
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// HTML escape function to prevent XSS in email templates
function escapeHtml(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

interface BeatLicenseRequest {
  fullName: string;
  artistName: string;
  email: string;
  beatsInterested: string;
  specialRequests: string;
  licenseOption: string;
  totalAmount: number;
}

// Input validation
function validateInput(data: BeatLicenseRequest): { valid: boolean; error?: string } {
  if (!data.fullName || data.fullName.length > 100) {
    return { valid: false, error: 'Full name is required and must be under 100 characters' };
  }
  if (data.artistName && data.artistName.length > 100) {
    return { valid: false, error: 'Artist name must be under 100 characters' };
  }
  if (!data.email || data.email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { valid: false, error: 'Valid email is required' };
  }
  if (!data.beatsInterested || data.beatsInterested.length > 500) {
    return { valid: false, error: 'Beats interested is required and must be under 500 characters' };
  }
  if (data.specialRequests && data.specialRequests.length > 1000) {
    return { valid: false, error: 'Special requests must be under 1000 characters' };
  }
  if (!['single', 'double'].includes(data.licenseOption)) {
    return { valid: false, error: 'Invalid license option' };
  }
  if (typeof data.totalAmount !== 'number' || (data.totalAmount !== 60 && data.totalAmount !== 100)) {
    return { valid: false, error: 'Invalid total amount' };
  }
  return { valid: true };
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Authenticated user:", user.id);

    const data: BeatLicenseRequest = await req.json();
    console.log("Received beat license request from user:", user.id);

    // Validate input
    const validation = validateInput(data);
    if (!validation.valid) {
      console.error("Validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { fullName, artistName, email, beatsInterested, specialRequests, licenseOption, totalAmount } = data;

    // Escape all user inputs for HTML
    const safeFullName = escapeHtml(fullName);
    const safeArtistName = escapeHtml(artistName);
    const safeEmail = escapeHtml(email);
    const safeBeatsInterested = escapeHtml(beatsInterested);
    const safeSpecialRequests = escapeHtml(specialRequests);
    const safeLicenseOption = licenseOption === 'single' ? 'Single Exclusive ($60)' : 'Two Exclusives ($100)';

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Beat License Form <onboarding@resend.dev>",
      to: ["ge@modernnostalgia.club"],
      subject: `New Beat License Request from ${safeArtistName || safeFullName}`,
      html: `
        <h1>New Exclusive Beat License Request</h1>
        
        <h2>Contact Information</h2>
        <ul>
          <li><strong>Full Name:</strong> ${safeFullName}</li>
          <li><strong>Artist Name:</strong> ${safeArtistName || 'Not provided'}</li>
          <li><strong>Email:</strong> ${safeEmail}</li>
        </ul>
        
        <h2>License Details</h2>
        <ul>
          <li><strong>Beat(s) Interested:</strong> ${safeBeatsInterested}</li>
          <li><strong>License Option:</strong> ${safeLicenseOption}</li>
          <li><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</li>
        </ul>
        
        ${safeSpecialRequests ? `
        <h2>Special Requests/Questions</h2>
        <p>${safeSpecialRequests}</p>
        ` : ''}
        
        <hr />
        <p><em>This submission was made through the Creative Economy Lab Beat License form by authenticated user ${user.id}.</em></p>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "ModernNostalgia.club <onboarding@resend.dev>",
      to: [email],
      subject: "Beat License Request Received - Ge Oh x ModernNostalgia",
      html: `
        <h1>Thank you for your interest, ${safeArtistName || safeFullName}!</h1>
        
        <p>We've received your exclusive beat license request and will get back to you shortly.</p>
        
        <h2>Your Request Details</h2>
        <ul>
          <li><strong>Beat(s):</strong> ${safeBeatsInterested}</li>
          <li><strong>License Type:</strong> ${safeLicenseOption}</li>
          <li><strong>Total:</strong> $${totalAmount.toFixed(2)}</li>
        </ul>
        
        <p>Ge Oh will reach out to discuss next steps, including:</p>
        <ul>
          <li>Confirming beat availability</li>
          <li>Discussing any sample clearances if applicable</li>
          <li>Payment processing</li>
          <li>Stem delivery</li>
        </ul>
        
        <p>Questions? Simply reply to this email.</p>
        
        <p>— The ModernNostalgia.club Team</p>
      `,
    });

    console.log("User confirmation email sent:", userEmailResponse);

    return new Response(
      JSON.stringify({ success: true, adminEmail: adminEmailResponse, userEmail: userEmailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in beat-license-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
