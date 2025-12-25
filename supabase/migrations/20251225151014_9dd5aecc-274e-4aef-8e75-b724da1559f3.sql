-- Allow authenticated users to view other members' public profile info (stage_name, pro)
-- Only show profiles that have a stage_name set (opted into directory)
CREATE POLICY "Authenticated users can view public profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND stage_name IS NOT NULL 
  AND stage_name != ''
);