import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  'https://gpcpovoikxgkgnabumlx.lovableproject.com',
  'https://lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  // If origin is in allowed list, use it; otherwise use first allowed origin
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(allowed => 
    origin === allowed || origin.endsWith('.lovable.app') || origin.endsWith('.lovableproject.com')
  ) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Safe error messages for clients - never expose internal details
const SAFE_ERROR_MESSAGES = {
  INVALID_CODE: 'Invalid authorization code. Please try signing in again.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  SERVER_ERROR: 'An error occurred. Please try again later.',
  MISSING_CREDENTIALS: 'Authentication service not properly configured.',
  INVALID_REQUEST: 'Invalid request parameters.',
} as const;

// Patreon tier mapping based on pledge amount (in cents)
function getTierFromPledge(pledgeCents: number): string {
  if (pledgeCents >= 15000) return 'creative-economy-lab'; // $150+
  if (pledgeCents >= 1000) return 'creator-accelerator'; // $10+
  return 'lab-pass'; // $1+
}

// Validate redirect URI is from allowed origins
function isValidRedirectUri(uri: string): boolean {
  try {
    const parsed = new URL(uri);
    return ALLOWED_ORIGINS.some(allowed => {
      const allowedUrl = new URL(allowed);
      return parsed.origin === allowedUrl.origin || 
             parsed.hostname.endsWith('.lovable.app') || 
             parsed.hostname.endsWith('.lovableproject.com');
    });
  } catch {
    return false;
  }
}

// Helper to create error redirect URL
function createErrorRedirect(baseUrl: string, errorMessage: string): string {
  const url = new URL('/auth/patreon/callback', baseUrl);
  url.searchParams.set('error', encodeURIComponent(errorMessage));
  return url.toString();
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get('action')
  
  console.log(`Patreon auth action: ${action}`)

  try {
    const PATREON_CLIENT_ID = Deno.env.get('PATREON_CLIENT_ID')
    const PATREON_CLIENT_SECRET = Deno.env.get('PATREON_CLIENT_SECRET')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!PATREON_CLIENT_ID || !PATREON_CLIENT_SECRET) {
      console.error('Missing Patreon credentials')
      return new Response(JSON.stringify({ error: SAFE_ERROR_MESSAGES.MISSING_CREDENTIALS }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: Get OAuth URL to redirect user to Patreon
    if (action === 'login') {
      const appOrigin = url.searchParams.get('app_origin')
      if (!appOrigin) {
        return new Response(JSON.stringify({ error: SAFE_ERROR_MESSAGES.INVALID_REQUEST }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      // Validate app origin is from allowed origins
      if (!isValidRedirectUri(appOrigin)) {
        console.error('Invalid app origin attempted:', appOrigin)
        return new Response(JSON.stringify({ error: SAFE_ERROR_MESSAGES.INVALID_REQUEST }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      // The callback will come back to this edge function, not the React app
      // We pass the app_origin so we know where to redirect after auth
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/patreon-auth`
      const callbackUrl = `${edgeFunctionUrl}?action=callback&app_origin=${encodeURIComponent(appOrigin)}`
      
      const scopes = 'identity identity[email] identity.memberships'
      const patreonAuthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${PATREON_CLIENT_ID}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${encodeURIComponent(scopes)}`
      
      console.log(`Generated Patreon auth URL with callback: ${callbackUrl}`)
      
      return new Response(JSON.stringify({ url: patreonAuthUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: Handle OAuth callback with authorization code (Patreon redirects here directly)
    if (action === 'callback') {
      const code = url.searchParams.get('code')
      const appOrigin = url.searchParams.get('app_origin')
      const patreonError = url.searchParams.get('error')
      
      // If Patreon sent an error, redirect to app with error
      if (patreonError) {
        console.error('Patreon OAuth error:', patreonError)
        return new Response(null, {
          status: 302,
          headers: { 'Location': createErrorRedirect(appOrigin || ALLOWED_ORIGINS[0], SAFE_ERROR_MESSAGES.AUTH_FAILED) },
        })
      }
      
      if (!appOrigin || !isValidRedirectUri(appOrigin)) {
        console.error('Invalid or missing app_origin:', appOrigin)
        return new Response(null, {
          status: 302,
          headers: { 'Location': createErrorRedirect(ALLOWED_ORIGINS[0], SAFE_ERROR_MESSAGES.INVALID_REQUEST) },
        })
      }
      
      if (!code) {
        return new Response(null, {
          status: 302,
          headers: { 'Location': createErrorRedirect(appOrigin, SAFE_ERROR_MESSAGES.INVALID_CODE) },
        })
      }

      console.log('Exchanging authorization code for tokens...')

      // Reconstruct the exact redirect_uri that was used in the authorize request
      const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/patreon-auth`
      const callbackUrl = `${edgeFunctionUrl}?action=callback&app_origin=${encodeURIComponent(appOrigin)}`

      // Exchange code for tokens
      const tokenResponse = await fetch('https://www.patreon.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          client_id: PATREON_CLIENT_ID,
          client_secret: PATREON_CLIENT_SECRET,
          redirect_uri: callbackUrl,
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('Token exchange failed:', errorText)
        return new Response(null, {
          status: 302,
          headers: { 'Location': createErrorRedirect(appOrigin, SAFE_ERROR_MESSAGES.INVALID_CODE) },
        })
      }

      const tokens = await tokenResponse.json()
      console.log('Token exchange successful')

      // Get user info from Patreon
      const userResponse = await fetch(
        'https://www.patreon.com/api/oauth2/v2/identity?include=memberships,memberships.currently_entitled_tiers&fields[user]=email,full_name,image_url&fields[member]=patron_status,currently_entitled_amount_cents',
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      )

      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('Failed to get user info:', errorText)
        return new Response(null, {
          status: 302,
          headers: { 'Location': createErrorRedirect(appOrigin, SAFE_ERROR_MESSAGES.AUTH_FAILED) },
        })
      }

      const userData = await userResponse.json()
      console.log('Got Patreon user data')

      const patreonUser = userData.data
      const email = patreonUser.attributes.email
      const name = patreonUser.attributes.full_name
      const avatarUrl = patreonUser.attributes.image_url
      const patreonId = patreonUser.id

      // Determine tier from membership data
      let tier = 'lab-pass' // Default tier
      let pledgeCents = 0
      
      if (userData.included) {
        const membership = userData.included.find((inc: any) => 
          inc.type === 'member' && inc.attributes.patron_status === 'active_patron'
        )
        if (membership) {
          pledgeCents = membership.attributes.currently_entitled_amount_cents || 0
          tier = getTierFromPledge(pledgeCents)
          console.log(`User pledge: ${pledgeCents} cents, tier: ${tier}`)
        }
      }

      // Create Supabase client with service role
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

      // Check if user exists by Patreon ID
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('patreon_id', patreonId)
        .maybeSingle()

      let userId: string

      if (existingProfile) {
        // User exists, update their profile
        userId = existingProfile.user_id
        console.log(`Existing user found: ${userId}`)

        // Update profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            patreon_tier: tier,
            name,
            avatar_url: avatarUrl,
          })
          .eq('user_id', userId)

        if (updateError) {
          console.error('Failed to update profile:', updateError)
        }

        // Update tokens in private table
        const { error: tokenUpdateError } = await supabase
          .from('private.patreon_tokens')
          .upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          }, { onConflict: 'user_id' })

        if (tokenUpdateError) {
          console.error('Failed to update tokens:', tokenUpdateError)
        }
      } else {
        // Create new user in Supabase Auth
        console.log('Creating new user...')
        
        // Generate a random password for the user (they'll use Patreon to login)
        const randomPassword = crypto.randomUUID() + crypto.randomUUID()
        
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password: randomPassword,
          email_confirm: true,
          user_metadata: {
            name,
            avatar_url: avatarUrl,
            patreon_id: patreonId,
          },
        })

        if (createError) {
          // Check if user already exists with this email
          if (createError.message.includes('already been registered')) {
            // Get existing user by email
            const { data: existingAuthUsers } = await supabase.auth.admin.listUsers()
            const existingAuthUser = existingAuthUsers?.users.find(u => u.email === email)
            
            if (existingAuthUser) {
              userId = existingAuthUser.id
              console.log(`Found existing auth user by email: ${userId}`)
            } else {
              console.error('User creation failed:', createError)
              return new Response(null, {
                status: 302,
                headers: { 'Location': createErrorRedirect(appOrigin, SAFE_ERROR_MESSAGES.AUTH_FAILED) },
              })
            }
          } else {
            console.error('Failed to create user:', createError)
            return new Response(null, {
              status: 302,
              headers: { 'Location': createErrorRedirect(appOrigin, SAFE_ERROR_MESSAGES.AUTH_FAILED) },
            })
          }
        } else {
          userId = newUser.user!.id
          console.log(`Created new user: ${userId}`)
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            email,
            name,
            patreon_id: patreonId,
            patreon_tier: tier,
            avatar_url: avatarUrl,
          }, { onConflict: 'user_id' })

        if (profileError) {
          console.error('Failed to create profile:', profileError)
        }

        // Store tokens in private table
        const { error: tokenError } = await supabase
          .from('private.patreon_tokens')
          .upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          }, { onConflict: 'user_id' })

        if (tokenError) {
          console.error('Failed to store tokens:', tokenError)
        }
      }

      // Generate a magic link for the user to sign in
      // The redirect URL is where the user ends up after clicking the magic link
      const finalRedirectUrl = `${appOrigin}/dashboard`
      
      const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: finalRedirectUrl,
        }
      })

      if (magicLinkError) {
        console.error('Failed to generate magic link:', magicLinkError)
        return new Response(null, {
          status: 302,
          headers: { 'Location': createErrorRedirect(appOrigin, SAFE_ERROR_MESSAGES.AUTH_FAILED) },
        })
      }

      // SERVER-SIDE SESSION CREATION:
      // Instead of returning the token to the client, redirect the user directly to the magic link
      // This way the token never touches client-side JavaScript
      const magicLinkUrl = magicLinkData.properties.action_link
      
      console.log('Patreon OAuth successful, redirecting to magic link for session creation')

      // Redirect user to the magic link - Supabase will handle session creation
      return new Response(null, {
        status: 302,
        headers: { 'Location': magicLinkUrl },
      })
    }

    return new Response(JSON.stringify({ error: SAFE_ERROR_MESSAGES.INVALID_REQUEST }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: unknown) {
    // Log detailed error internally, return safe message to client
    console.error('Patreon auth error:', error)
    
    // Try to redirect to error page if we have a valid origin
    const appOrigin = new URL(req.url).searchParams.get('app_origin')
    if (appOrigin && isValidRedirectUri(appOrigin)) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': createErrorRedirect(appOrigin, SAFE_ERROR_MESSAGES.SERVER_ERROR) },
      })
    }
    
    return new Response(JSON.stringify({ 
      error: SAFE_ERROR_MESSAGES.SERVER_ERROR 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
