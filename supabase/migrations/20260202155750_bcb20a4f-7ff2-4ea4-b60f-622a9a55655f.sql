-- Fix download_email_captures RLS policy to restrict to admins only
-- Drop the existing policy that incorrectly includes moderators
DROP POLICY IF EXISTS "Only admins can view captured emails" ON public.download_email_captures;

-- Create corrected policy that only allows admins (not moderators)
CREATE POLICY "Only admins can view captured emails"
ON public.download_email_captures
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));