-- Block all direct client access to rate_limits table
-- This table is only accessed by Edge Functions using the service role key
CREATE POLICY "Block all direct access to rate_limits"
ON public.rate_limits
FOR ALL
USING (false);