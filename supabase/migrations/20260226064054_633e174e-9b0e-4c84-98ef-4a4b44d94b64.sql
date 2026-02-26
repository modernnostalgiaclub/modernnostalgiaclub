-- Fix 1: Remove direct user SELECT on submissions to prevent internal_notes leakage.
-- Users must access their submissions via the get_user_submissions() RPC which filters internal_notes.
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;

-- Fix 2: Add an explicit blocking policy to analytics_cache for clarity.
-- (Table already defaults to deny with no policies, but explicit is better than implicit.)
CREATE POLICY "Block all direct user access to analytics cache"
ON public.analytics_cache
AS RESTRICTIVE
FOR ALL
USING (false);