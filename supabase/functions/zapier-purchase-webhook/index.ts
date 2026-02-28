import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// HTML escape function to prevent XSS in email templates
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}


// Product download mappings
const PRODUCT_DOWNLOADS: Record<string, { title: string; files: string[]; isService?: boolean; bookingFormUrl?: string }> = {
  'split-sheet': {
    title: 'Split Sheet w/ One Stop Agreement',
    files: ['/downloads/Split_Sheet_Modernnostalgia.club.pdf'],
  },
  'pro-tools-template': {
    title: 'Pro Tools Intro Recording Template',
    files: ['/downloads/Pro_Tools_Intro_Template_-_MNC.zip'],
  },
  'just-make-noise-bundle': {
    title: 'Just Make Noise: 2026 Indie Artist Bundle',
    files: [
      '/downloads/Just_Make_Noise_eBook.pdf',
      '/downloads/Split_Sheet_Modernnostalgia.club.pdf',
      '/downloads/Pro_Tools_Intro_Template_-_MNC.zip',
    ],
  },
  'be-loud-bundle': {
    title: 'Be Loud: How to Make a Living Making Beats',
    files: [
      '/downloads/Be_Loud_eBook.pdf',
      '/downloads/Split_Sheet_Modernnostalgia.club.pdf',
      '/downloads/Pro_Tools_Intro_Template_-_MNC.zip',
    ],
  },
  'catalog-audit': {
    title: 'Catalog Audit for Sync',
    files: [],
    isService: true,
    bookingFormUrl: 'https://form.jotform.com/253334227361048',
  },
};

// Base URL for downloads - update this to your production domain
const BASE_URL = Deno.env.get("SITE_URL") || "https://modernnostalgiaclub.lovable.app";

interface PurchaseWebhookPayload {
  customer_email: string;
  customer_name?: string;
  product_id: string; // e.g., 'split-sheet', 'just-make-noise-bundle'
  order_id?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Only allow POST requests for webhooks
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Authenticate the request
  const ZAPIER_WEBHOOK_SECRET = Deno.env.get("ZAPIER_WEBHOOK_SECRET");
  const incomingSecret = req.headers.get("x-webhook-secret");

  if (!ZAPIER_WEBHOOK_SECRET || incomingSecret !== ZAPIER_WEBHOOK_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const payload: PurchaseWebhookPayload = await req.json();
    
    console.log("Received purchase webhook:", {
      email: payload.customer_email,
      product: payload.product_id,
      order: payload.order_id,
    });

    // Validate required fields
    if (!payload.customer_email || !payload.product_id) {
      console.error("Missing required fields:", payload);
      return new Response(
        JSON.stringify({ error: "Missing customer_email or product_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get product info
    const product = PRODUCT_DOWNLOADS[payload.product_id];
    if (!product) {
      console.error("Unknown product:", payload.product_id);
      return new Response(
        JSON.stringify({ error: `Unknown product: ${payload.product_id}` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let emailHtml: string;
    let emailSubject: string;

    // Handle service products differently
    if (product.isService) {
      emailSubject = `Your ${product.title} - Next Steps`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #f5f5dc; margin: 0; font-size: 24px;">Thank You for Your Purchase!</h1>
          </div>
          
          <p>Hi${payload.customer_name ? ` ${escapeHtml(payload.customer_name)}` : ''},</p>
          
          <p>Thank you for purchasing the <strong>${escapeHtml(product.title)}</strong>. We're excited to help you get your catalog sync-ready.</p>
          
          <div style="background: #f9f9f9; border-left: 4px solid #8B1A1A; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h3 style="margin-top: 0; color: #8B1A1A;">Book Your Audit Session</h3>
            <p>Click the button below to schedule your catalog audit and provide details about your music:</p>
            <p style="text-align: center; margin: 20px 0;">
              <a href="${product.bookingFormUrl}" style="display: inline-block; background: #8B1A1A; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Schedule Your Audit</a>
            </p>
          </div>
          
          <h3 style="color: #8B1A1A;">What Happens Next</h3>
          <ol style="padding-left: 20px;">
            <li>Fill out the booking form with your catalog details</li>
            <li>We'll review up to 10 songs from your catalog</li>
            <li>You'll receive a written summary with clear next steps</li>
          </ol>
          
          <p style="font-size: 14px; color: #666;">
            <strong>Questions?</strong> Just reply to this email.
          </p>
          
          ${payload.order_id ? `<p style="font-size: 12px; color: #999;">Order ID: ${escapeHtml(payload.order_id)}</p>` : ''}
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            © Modern Nostalgia Club<br>
            Making music sustainable.
          </p>
        </body>
        </html>
      `;
    } else {
      // Generate download links HTML for digital products
      const downloadLinksHtml = product.files
        .map((file) => {
          const fileName = file.split('/').pop()?.replace(/_/g, ' ').replace(/\.(pdf|zip)$/i, '') || file;
          const fullUrl = `${BASE_URL}${file}`;
          return `<li style="margin-bottom: 10px;"><a href="${fullUrl}" style="color: #8B1A1A; text-decoration: underline;">${fileName}</a></li>`;
        })
        .join('');

      emailSubject = `Your Download: ${product.title}`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
            <h1 style="color: #f5f5dc; margin: 0; font-size: 24px;">Thank You for Your Purchase!</h1>
          </div>
          
          <p>Hi${payload.customer_name ? ` ${escapeHtml(payload.customer_name)}` : ''},</p>
          
          <p>Thank you for purchasing <strong>${escapeHtml(product.title)}</strong>. Your download links are ready:</p>
          
          <div style="background: #f9f9f9; border-left: 4px solid #8B1A1A; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h3 style="margin-top: 0; color: #8B1A1A;">Your Downloads</h3>
            <ul style="list-style: none; padding: 0; margin: 0;">
              ${downloadLinksHtml}
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            <strong>Tip:</strong> Save these links! If you have any issues downloading, just reply to this email.
          </p>
          
          ${payload.order_id ? `<p style="font-size: 12px; color: #999;">Order ID: ${escapeHtml(payload.order_id)}</p>` : ''}
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #666;">
            Want unlimited access to all resources plus courses, community, and more?<br>
            <a href="${BASE_URL}" style="color: #8B1A1A;">Join Modern Nostalgia Club</a>
          </p>
          
          <p style="font-size: 12px; color: #999; margin-top: 30px;">
            © Modern Nostalgia Club<br>
            Making music sustainable.
          </p>
        </body>
        </html>
      `;
    }

    // Send email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Modern Nostalgia Club <ge@modernnostalgia.club>",
        to: [payload.customer_email],
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Download email sent",
        email_id: emailData.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in zapier-purchase-webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
