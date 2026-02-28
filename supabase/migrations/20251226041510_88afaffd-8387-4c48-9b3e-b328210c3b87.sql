-- Add explicit anonymous blocking policy to community_sections
CREATE POLICY "Block anonymous access to community sections"
ON public.community_sections
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);