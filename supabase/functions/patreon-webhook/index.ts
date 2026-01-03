import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-patreon-signature, x-patreon-event',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the event type from Patreon headers
    const eventType = req.headers.get('x-patreon-event');
    console.log('Received Patreon webhook event:', eventType);

    // Only process post events
    if (!eventType?.startsWith('posts:')) {
      console.log('Ignoring non-post event:', eventType);
      return new Response(JSON.stringify({ message: 'Event ignored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await req.json();
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    // Handle posts:publish event
    if (eventType === 'posts:publish') {
      const postData = payload.data;
      const postTitle = postData?.attributes?.title || 'New Post';
      const postUrl = postData?.attributes?.url || 'https://www.patreon.com';
      const isPublic = postData?.attributes?.is_public ?? false;

      console.log('Processing new post:', { postTitle, postUrl, isPublic });

      // Get all members to notify
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, patreon_tier')
        .not('user_id', 'is', null);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log(`Found ${profiles?.length || 0} profiles to notify`);

      // Create notifications for all members
      const notifications = (profiles || []).map(profile => ({
        user_id: profile.user_id,
        title: '🎉 New Patreon Post',
        message: postTitle,
        type: 'patreon',
        link: postUrl,
        is_read: false,
      }));

      if (notifications.length > 0) {
        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) {
          console.error('Error inserting notifications:', insertError);
          throw insertError;
        }

        console.log(`Created ${notifications.length} notifications for new post`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Notified ${notifications.length} members about new post` 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle posts:update event
    if (eventType === 'posts:update') {
      console.log('Post updated - no notification sent for updates');
      return new Response(JSON.stringify({ message: 'Post update acknowledged' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Event processed' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
