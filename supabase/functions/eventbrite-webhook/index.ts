import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Note: CORS headers removed - webhooks are server-to-server and don't need CORS
// Security is handled by Eventbrite's webhook delivery system

interface EventbriteEvent {
  api_url: string;
  config: {
    action: string;
    endpoint_url: string;
    user_id: string;
    webhook_id: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Eventbrite webhook received");
  
  // Webhooks are server-to-server, no CORS preflight needed
  // If a browser sends OPTIONS, just reject it
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 405 });
  }

  try {
    const payload: EventbriteEvent = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload, null, 2));

    // Check if this is an event.created or event.published action
    const action = payload.config?.action;
    if (!action || !["event.created", "event.published", "event.updated"].includes(action)) {
      console.log(`Ignoring action: ${action}`);
      return new Response(JSON.stringify({ message: "Action ignored" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check site settings for notification preferences
    const { data: emailSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "event_email_notifications")
      .single();
    
    const { data: inappSetting } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "event_inapp_notifications")
      .single();

    const emailEnabled = (emailSetting?.value as { enabled: boolean })?.enabled ?? true;
    const inappEnabled = (inappSetting?.value as { enabled: boolean })?.enabled ?? true;

    console.log(`Settings - Email: ${emailEnabled}, In-app: ${inappEnabled}`);

    if (!emailEnabled && !inappEnabled) {
      console.log("Both notification types are disabled");
      return new Response(JSON.stringify({ message: "Notifications disabled" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch all member profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, stage_name, full_name")
      .not("patreon_tier", "is", null);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      throw new Error("Failed to fetch member profiles");
    }

    console.log(`Found ${profiles?.length || 0} members to notify`);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No members to notify" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    let emailsSent = 0;
    let notificationsCreated = 0;

    // Create in-app notifications if enabled
    if (inappEnabled) {
      const notificationInserts = profiles.map(profile => ({
        user_id: profile.user_id,
        title: "🎉 New Event Added!",
        message: "A new event has been added to our calendar. Check out the Events page to see what's coming up!",
        type: "event",
        link: "/events",
      }));

      const { error: notificationError } = await supabase
        .from("notifications")
        .insert(notificationInserts);

      if (notificationError) {
        console.error("Error creating notifications:", notificationError);
      } else {
        notificationsCreated = notificationInserts.length;
        console.log(`Created ${notificationsCreated} in-app notifications`);
      }
    }

    // Send email notifications if enabled
    if (emailEnabled) {
      const userIds = profiles.map(p => p.user_id);
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error("Error fetching users:", usersError);
      } else {
        const memberEmails = users.users
          .filter(u => userIds.includes(u.id) && u.email)
          .map(u => u.email!);

        console.log(`Sending emails to ${memberEmails.length} members`);

        if (memberEmails.length > 0) {
          const batchSize = 50;

          for (let i = 0; i < memberEmails.length; i += batchSize) {
            const batch = memberEmails.slice(i, i + batchSize);
            
            try {
              const emailResponse = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${RESEND_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  from: "ModernNostalgia.club <events@modernnostalgia.club>",
                  to: ["events@modernnostalgia.club"],
                  bcc: batch,
                  subject: "🎉 New Event Added - ModernNostalgia.club",
                  html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                      <meta charset="utf-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #8B2635; margin: 0;">ModernNostalgia.club</h1>
                      </div>
                      
                      <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                        <h2 style="margin-top: 0; color: #8B2635;">🎉 New Event Added!</h2>
                        <p>Hey there!</p>
                        <p>We've just added a new event to our calendar. Don't miss out on this opportunity to connect, learn, and grow with the ModernNostalgia community.</p>
                        <p style="text-align: center; margin: 30px 0;">
                          <a href="https://modernnostalgiaclub.eventbrite.com" 
                             style="background: #8B2635; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                            View Events on Eventbrite
                          </a>
                        </p>
                        <p>You can also check out all upcoming events on our <a href="https://modernnostalgia.club/events" style="color: #8B2635;">Events page</a>.</p>
                      </div>
                      
                      <div style="text-align: center; color: #888; font-size: 12px;">
                        <p>You're receiving this because you're a member of ModernNostalgia.club</p>
                        <p>© ${new Date().getFullYear()} ModernNostalgia.club. All rights reserved.</p>
                      </div>
                    </body>
                    </html>
                  `,
                }),
              });

              const emailResult = await emailResponse.json();
              console.log(`Email batch ${Math.floor(i / batchSize) + 1} sent:`, emailResult);
              emailsSent += batch.length;
            } catch (emailError) {
              console.error(`Error sending email batch ${Math.floor(i / batchSize) + 1}:`, emailError);
            }
          }
        }
      }
    }

    console.log(`Successfully sent ${emailsSent} emails, created ${notificationsCreated} in-app notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        notificationsCreated
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in eventbrite-webhook function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
