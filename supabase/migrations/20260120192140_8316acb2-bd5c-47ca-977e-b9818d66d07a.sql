-- Remove the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.networking_contacts;

-- Add explicit blocking policy for anonymous/unauthenticated access
-- This ensures no direct database access from unauthenticated users
CREATE POLICY "Block direct anonymous inserts"
ON public.networking_contacts
FOR INSERT
TO anon
WITH CHECK (false);

-- Note: The edge function uses service role which bypasses RLS,
-- so submissions still work through the rate-limited edge function