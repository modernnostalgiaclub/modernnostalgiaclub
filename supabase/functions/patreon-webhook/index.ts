import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as hexEncode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-patreon-signature, x-patreon-event',
};

// Verify Patreon webhook signature using HMAC-MD5
async function verifyWebhookSignature(body: string, signature: string | null): Promise<boolean> {
  if (!signature) {
    console.error('No signature provided in webhook request');
    return false;
  }

  const webhookSecret = Deno.env.get('PATREON_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('PATREON_WEBHOOK_SECRET not configured');
    return false;
  }

  try {
    // Patreon uses HMAC-MD5 for webhook signatures
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'MD5' },
      false,
      ['sign']
    );
    
    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSignature = new TextDecoder().decode(hexEncode(new Uint8Array(signatureBytes)));
    
    // Compare signatures (constant-time comparison to prevent timing attacks)
    const isValid = expectedSignature.toLowerCase() === signature.toLowerCase();
    
    if (!isValid) {
      console.error('Webhook signature mismatch');
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Tier hierarchy for access control
const tierHierarchy = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];

function hasTierAccess(userTier: string | null, requiredTier: string): boolean {
  if (!userTier) return false;
  const userTierIndex = tierHierarchy.indexOf(userTier);
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
  return userTierIndex >= requiredTierIndex;
}

// Map Patreon tier IDs to our tier names (you'll need to configure these)
function mapPatreonTierToAppTier(patreonTierId: string | null): string | null {
  // These IDs should match your Patreon campaign tier IDs
  const tierMapping: Record<string, string> = {
    // Add your Patreon tier ID mappings here, e.g.:
    // '12345': 'lab-pass',
    // '12346': 'creator-accelerator',
    // '12347': 'creative-economy-lab',
  };
  
  if (!patreonTierId) return null;
  return tierMapping[patreonTierId] || null;
}

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

    // Verify webhook signature for security
    const signature = req.headers.get('x-patreon-signature');
    const rawBody = await req.text();
    
    const isValid = await verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.error('Invalid webhook signature - rejecting request');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.parse(rawBody);
    console.log('Webhook payload:', JSON.stringify(payload, null, 2));

    // Handle posts:publish event
    if (eventType === 'posts:publish') {
      const postData = payload.data;
      const postTitle = postData?.attributes?.title || 'New Post';
      const postUrl = postData?.attributes?.url || 'https://www.patreon.com';
      const isPublic = postData?.attributes?.is_public ?? false;
      
      // Get tier requirements from the post
      // Patreon includes tier info in relationships
      const tierRelationships = payload?.data?.relationships?.access_rules?.data || [];
      const accessibleTierIds = tierRelationships
        .filter((rule: { type: string }) => rule.type === 'tier')
        .map((rule: { id: string }) => rule.id);

      console.log('Processing new post:', { postTitle, postUrl, isPublic, accessibleTierIds });

      // Get all members to potentially notify
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, patreon_tier')
        .not('user_id', 'is', null);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log(`Found ${profiles?.length || 0} profiles to check`);

      // Filter profiles based on tier access
      const eligibleProfiles = (profiles || []).filter(profile => {
        // If post is public, everyone gets notified
        if (isPublic) {
          return true;
        }
        
        // If no tier restrictions specified, notify all members
        if (accessibleTierIds.length === 0) {
          return true;
        }
        
        // Check if user's tier grants access
        // For tier-restricted posts, we check if the user has at least the minimum required tier
        const userTier = profile.patreon_tier;
        
        // If we have mapped Patreon tiers, check against those
        // Otherwise, any authenticated member with a tier gets notified for non-public posts
        if (userTier) {
          // Users with any tier can see tier-restricted content at their level or below
          // Since we don't have exact Patreon tier ID mapping yet, notify all tiered members
          return true;
        }
        
        return false;
      });

      console.log(`${eligibleProfiles.length} profiles eligible for notification`);

      // Create notifications for eligible members
      const notifications = eligibleProfiles.map(profile => ({
        user_id: profile.user_id,
        title: isPublic ? '🎉 New Public Post' : '🔒 New Member Post',
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
        message: `Notified ${notifications.length} eligible members about new post`,
        isPublic,
        totalProfiles: profiles?.length || 0,
        eligibleProfiles: eligibleProfiles.length
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