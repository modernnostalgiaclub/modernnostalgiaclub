-- Create a function to check if user has access to a specific tier
CREATE OR REPLACE FUNCTION public.user_has_tier_access(required_tier patreon_tier)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier patreon_tier;
  tier_hierarchy patreon_tier[] := ARRAY['lab-pass', 'creator-accelerator', 'creative-economy-lab']::patreon_tier[];
  user_tier_index INTEGER;
  required_tier_index INTEGER;
BEGIN
  -- Admins bypass tier checks
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN true;
  END IF;
  
  -- Get user's tier from profile
  SELECT patreon_tier INTO user_tier
  FROM public.profiles
  WHERE user_id = auth.uid();
  
  -- If no profile or tier, deny access
  IF user_tier IS NULL THEN
    RETURN false;
  END IF;
  
  -- Find tier indexes
  user_tier_index := array_position(tier_hierarchy, user_tier);
  required_tier_index := array_position(tier_hierarchy, required_tier);
  
  -- User's tier must be >= required tier
  RETURN user_tier_index >= required_tier_index;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;
DROP POLICY IF EXISTS "Anyone can view published lessons" ON public.lessons;

-- Create new tier-enforced policy for courses
CREATE POLICY "Users can view courses matching their tier"
ON public.courses FOR SELECT
USING (
  is_published = true AND 
  public.user_has_tier_access(min_tier)
);

-- Create new tier-enforced policy for lessons
CREATE POLICY "Users can view lessons matching their tier"
ON public.lessons FOR SELECT
USING (
  is_published = true AND 
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE id = lessons.course_id 
    AND public.user_has_tier_access(min_tier)
  )
);