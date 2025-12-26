-- Update community_sections to require authentication for viewing

-- Drop the existing public access policy
DROP POLICY IF EXISTS "Anyone can view community sections" ON public.community_sections;

-- Create new policy requiring authentication
CREATE POLICY "Authenticated users can view community sections"
ON public.community_sections
FOR SELECT
TO authenticated
USING (true);