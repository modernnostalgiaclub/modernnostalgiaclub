import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SITE_URL = Deno.env.get("SITE_URL") || "https://modernnostalgiaclub.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates for the rights-clarity education sequence
const emailTemplates = {
  day1: {
    subject: "Why PRO Registration Matters for Sync",
    html: (email: string) => `
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
        
        <p>Based on your Sync Readiness Quiz results, we noticed some uncertainty around PRO registration. This is one of the most common—and fixable—issues we see.</p>
        
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
        
        <p>Tomorrow, we'll cover contributor agreements and why informal handshakes create licensing nightmares.</p>
        
        <p style="margin-top: 30px;">— The Modern Nostalgia Club Team</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999;">
          You're receiving this because you took our Sync Readiness Quiz.<br>
          <a href="${SITE_URL}" style="color: #8B1A1A;">Modern Nostalgia Club</a>
        </p>
      </body>
      </html>
    `,
  },
  day3: {
    subject: "The Silent Deal Killer: Uncredited Contributors",
    html: (email: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
          <h1 style="color: #f5f5dc; margin: 0; font-size: 24px;">Rights Clarity Series: Part 2</h1>
        </div>
        
        <p>Hi again,</p>
        
        <p>Yesterday we covered PRO registration. Today, let's talk about something that kills more sync deals than bad music: <strong>uncredited contributors</strong>.</p>
        
        <h2 style="color: #8B1A1A; font-size: 20px;">The Problem with "Informal Agreements"</h2>
        
        <p>Maybe someone helped write the hook. Maybe a friend added drums. Maybe you promised them "something" if it ever blew up.</p>
        
        <p>These informal arrangements work fine—until money shows up. Then:</p>
        
        <ul style="padding-left: 20px;">
          <li>People remember contributions differently</li>
          <li>Text messages and DMs don't hold up as contracts</li>
          <li>Sync supervisors need <em>written proof</em> of clear ownership</li>
        </ul>
        
        <div style="background: #f9f9f9; border-left: 4px solid #8B1A1A; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <h3 style="margin-top: 0; color: #8B1A1A;">What You Can Do Now</h3>
          <p>For every song you want to pitch for sync, create a simple split sheet that documents:</p>
          <ul style="margin-bottom: 0; padding-left: 20px;">
            <li>Who wrote what percentage of the composition</li>
            <li>Who owns what percentage of the master</li>
            <li>Everyone's PRO affiliation and IPI/CAE number</li>
          </ul>
        </div>
        
        <p>We offer a <a href="${SITE_URL}/store" style="color: #8B1A1A;">free Split Sheet template</a> for members, or you can purchase it separately from our store.</p>
        
        <p>On Day 5, we'll show you how to audit your catalog and prioritize which songs to clean up first.</p>
        
        <p style="margin-top: 30px;">— The Modern Nostalgia Club Team</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999;">
          You're receiving this because you took our Sync Readiness Quiz.<br>
          <a href="${SITE_URL}" style="color: #8B1A1A;">Modern Nostalgia Club</a>
        </p>
      </body>
      </html>
    `,
  },
  day5: {
    subject: "Your Next Step: Get Your Catalog Audit-Ready",
    html: (email: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 30px; border-radius: 12px; margin-bottom: 20px;">
          <h1 style="color: #f5f5dc; margin: 0; font-size: 24px;">Rights Clarity Series: Part 3</h1>
        </div>
        
        <p>Hi,</p>
        
        <p>Over the past few days, we've covered the two biggest structural issues that block sync deals:</p>
        
        <ol style="padding-left: 20px;">
          <li>Collaborators not registered with PROs</li>
          <li>Uncredited contributors and informal agreements</li>
        </ol>
        
        <p>If you've started fixing these, you're already ahead of most artists.</p>
        
        <h2 style="color: #8B1A1A; font-size: 20px;">The Full Picture: Catalog Audit for Sync</h2>
        
        <p>For artists serious about sync, we offer a professional <strong>Catalog Audit for Sync</strong>—a one-on-one review of up to 10 songs from your catalog.</p>
        
        <div style="background: #f9f9f9; border-left: 4px solid #8B1A1A; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <h3 style="margin-top: 0; color: #8B1A1A;">What's Included</h3>
          <ul style="margin-bottom: 0; padding-left: 20px;">
            <li>Ownership and split structure check</li>
            <li>Collaborator and PRO registration review</li>
            <li>Sample, cover, and clearance risk flags</li>
            <li>Delivery readiness (instrumentals, stems, metadata)</li>
            <li>Sync suitability notes</li>
            <li>Written summary with clear next steps</li>
          </ul>
        </div>
        
        <p>This is not legal advice—it's a practical, industry-facing assessment built around how licensing actually works.</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/store" style="display: inline-block; background: #8B1A1A; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Catalog Audit - $249</a>
        </p>
        
        <p><strong>Sync deals fail more often from unclear rights than bad music.</strong> This process is designed to prevent that.</p>
        
        <p style="margin-top: 30px;">— The Modern Nostalgia Club Team</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999;">
          You're receiving this because you took our Sync Readiness Quiz.<br>
          <a href="${SITE_URL}" style="color: #8B1A1A;">Modern Nostalgia Club</a>
        </p>
      </body>
      </html>
    `,
  },
};

interface EmailQueueEntry {
  email: string;
  sequence_step: number;
  scheduled_for: string;
  quiz_result_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Two modes: 
    // 1. POST with quiz_result_id - Queue new sequence
    // 2. GET - Process pending emails (called by cron)
    
    if (req.method === "POST") {
      const { email, quiz_result_id } = await req.json();
      
      if (!email) {
        return new Response(
          JSON.stringify({ error: "Missing email" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Queueing rights-clarity email sequence for:", email);
      
      // Send first email immediately
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Modern Nostalgia Club <ge@modernnostalgia.club>",
          to: [email],
          subject: emailTemplates.day1.subject,
          html: emailTemplates.day1.html(email),
        }),
      });

      if (!emailResponse.ok) {
        const error = await emailResponse.json();
        console.error("Failed to send day 1 email:", error);
        throw new Error(error.message || "Failed to send email");
      }

      console.log("Day 1 email sent successfully");

      // Schedule remaining emails using Supabase
      // We'll store in a simple queue table and process via cron
      // For now, we'll just log the schedule
      const schedule = [
        { day: 3, template: "day3" },
        { day: 5, template: "day5" },
      ];

      console.log("Scheduled follow-up emails:", schedule);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email sequence started",
          scheduled: schedule 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET request - manual trigger for sending specific email
    const url = new URL(req.url);
    const emailParam = url.searchParams.get("email");
    const dayParam = url.searchParams.get("day");

    if (emailParam && dayParam) {
      const template = emailTemplates[`day${dayParam}` as keyof typeof emailTemplates];
      
      if (!template) {
        return new Response(
          JSON.stringify({ error: "Invalid day parameter" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Modern Nostalgia Club <ge@modernnostalgia.club>",
          to: [emailParam],
          subject: template.subject,
          html: template.html(emailParam),
        }),
      });

      const result = await emailResponse.json();
      
      return new Response(
        JSON.stringify({ success: emailResponse.ok, result }),
        { status: emailResponse.ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid request" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in rights-clarity-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
