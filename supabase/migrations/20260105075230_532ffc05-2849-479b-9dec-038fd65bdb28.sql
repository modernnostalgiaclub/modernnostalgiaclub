-- Add restrictive RLS policy to block all direct public access to analytics_cache
-- This table is only accessed via the get-project-analytics edge function using service role
CREATE POLICY "Block direct access to analytics cache"
ON public.analytics_cache
AS RESTRICTIVE
FOR ALL
USING (false);