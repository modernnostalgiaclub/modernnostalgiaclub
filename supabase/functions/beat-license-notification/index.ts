import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BeatLicenseRequest {
  fullName: string;
  artistName: string;
  email: string;
  beatsInterested: string;
  specialRequests: string;
  licenseOption: string;
  totalAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: BeatLicenseRequest = await req.json();
    console.log("Received beat license request:", data);

    const { fullName, artistName, email, beatsInterested, specialRequests, licenseOption, totalAmount } = data;

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Beat License Form <onboarding@resend.dev>",
      to: ["ge@modernnostalgia.club"],
      subject: `New Beat License Request from ${artistName || fullName}`,
      html: `
        <h1>New Exclusive Beat License Request</h1>
        
        <h2>Contact Information</h2>
        <ul>
          <li><strong>Full Name:</strong> ${fullName}</li>
          <li><strong>Artist Name:</strong> ${artistName || 'Not provided'}</li>
          <li><strong>Email:</strong> ${email}</li>
        </ul>
        
        <h2>License Details</h2>
        <ul>
          <li><strong>Beat(s) Interested:</strong> ${beatsInterested}</li>
          <li><strong>License Option:</strong> ${licenseOption === 'single' ? 'Single Exclusive ($60)' : 'Two Exclusives ($100)'}</li>
          <li><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</li>
        </ul>
        
        ${specialRequests ? `
        <h2>Special Requests/Questions</h2>
        <p>${specialRequests}</p>
        ` : ''}
        
        <hr />
        <p><em>This submission was made through the Creative Economy Lab Beat License form.</em></p>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "ModernNostalgia.club <onboarding@resend.dev>",
      to: [email],
      subject: "Beat License Request Received - Ge Oh x ModernNostalgia",
      html: `
        <h1>Thank you for your interest, ${artistName || fullName}!</h1>
        
        <p>We've received your exclusive beat license request and will get back to you shortly.</p>
        
        <h2>Your Request Details</h2>
        <ul>
          <li><strong>Beat(s):</strong> ${beatsInterested}</li>
          <li><strong>License Type:</strong> ${licenseOption === 'single' ? 'Single Exclusive ($60)' : 'Two Exclusives ($100)'}</li>
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
