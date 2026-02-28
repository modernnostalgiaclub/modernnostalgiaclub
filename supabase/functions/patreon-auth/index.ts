import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Patreon tier mapping based on pledge amount (in cents)
function getTierFromPledge(pledgeCents: number): string {
  if (pledgeCents >= 15000) return 'creative-economy-lab'; // $150+
  if (pledgeCents >= 1000) return 'creator-accelerator'; // $10+
  return 'lab-pass'; // $1+
}

Deno.serve(async (req) => {
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
      throw new Error('Patreon credentials not configured')
    }

    // Action: Get OAuth URL to redirect user to Patreon
    if (action === 'login') {
      const redirectUri = url.searchParams.get('redirect_uri')
      if (!redirectUri) {
        throw new Error('redirect_uri is required')
      }
      
      const scopes = 'identity identity[email] identity.memberships'
      const patreonAuthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${PATREON_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`
      
      console.log(`Generated Patreon auth URL with redirect: ${redirectUri}`)
      
      return new Response(JSON.stringify({ url: patreonAuthUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Action: Handle OAuth callback with authorization code
    if (action === 'callback') {
      const code = url.searchParams.get('code')
      const redirectUri = url.searchParams.get('redirect_uri')
      
      if (!code) {
        throw new Error('Authorization code is required')
      }
      if (!redirectUri) {
        throw new Error('redirect_uri is required')
      }

      console.log('Exchanging authorization code for tokens...')

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
          redirect_uri: redirectUri,
        }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('Token exchange failed:', errorText)
        throw new Error(`Failed to exchange code for tokens: ${errorText}`)
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
        throw new Error(`Failed to get Patreon user info: ${errorText}`)
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

        // Update profile (without tokens - they're stored separately)
        await supabase
          .from('profiles')
          .update({
            patreon_tier: tier,
            name,
            avatar_url: avatarUrl,
          })
          .eq('user_id', userId)

        // Update tokens in private table (service role only)
        await supabase
          .from('private.patreon_tokens')
          .upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          }, { onConflict: 'user_id' })
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
              throw createError
            }
          } else {
            console.error('Failed to create user:', createError)
            throw createError
          }
        } else {
          userId = newUser.user!.id
          console.log(`Created new user: ${userId}`)
        }

        // Create profile (without tokens)
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
          throw profileError
        }

        // Store tokens in private table (service role only)
        const { error: tokenError } = await supabase
          .from('private.patreon_tokens')
          .upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          }, { onConflict: 'user_id' })

        if (tokenError) {
          console.error('Failed to store tokens:', tokenError)
          throw tokenError
        }
      }

      // Generate a magic link for the user to sign in
      const { data: magicLinkData, error: magicLinkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
      })

      if (magicLinkError) {
        console.error('Failed to generate magic link:', magicLinkError)
        throw magicLinkError
      }

      // Extract the token from the magic link
      const magicLinkUrl = new URL(magicLinkData.properties.action_link)
      const token = magicLinkUrl.searchParams.get('token')
      const tokenHash = magicLinkData.properties.hashed_token

      console.log('Patreon OAuth successful, returning session data')

      return new Response(JSON.stringify({
        success: true,
        email,
        token_hash: tokenHash,
        user: {
          id: userId,
          email,
          name,
          avatar_url: avatarUrl,
          patreon_id: patreonId,
          tier,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error(`Unknown action: ${action}`)
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Patreon auth error:', error)
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})