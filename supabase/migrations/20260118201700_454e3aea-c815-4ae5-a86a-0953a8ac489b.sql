-- Remove the overly permissive INSERT policy since the edge function uses service role
-- This provides defense-in-depth: only the rate-limited edge function can insert
DROP POLICY IF EXISTS "Anyone can submit email for downloads" ON public.download_email_captures;

-- Also fix the rate_limits table policy to be more explicit
-- The current policy allows ANY authenticated user to manipulate rate limits
-- This should only be accessible via service role (edge functions)
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;