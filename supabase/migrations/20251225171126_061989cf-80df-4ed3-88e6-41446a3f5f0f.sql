-- Fix: User Personal Information Exposed to All Authenticated Users
-- The current policy allows any authenticated user to see full profile details
-- We need to restrict public profile viewing to only non-sensitive fields

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Authenticated users can view public profile info" ON public.profiles;

-- Create a security definer function to safely return only public profile fields
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  stage_name text,
  avatar_url text,
  patreon_tier patreon_tier
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.stage_name,
    p.avatar_url,
    p.patreon_tier
  FROM public.profiles p
  WHERE p.stage_name IS NOT NULL 
    AND p.stage_name <> ''
$$;

-- Create a function to get a single public profile by user_id
CREATE OR REPLACE FUNCTION public.get_public_profile(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  stage_name text,
  avatar_url text,
  patreon_tier patreon_tier
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.stage_name,
    p.avatar_url,
    p.patreon_tier
  FROM public.profiles p
  WHERE p.user_id = target_user_id
    AND p.stage_name IS NOT NULL 
    AND p.stage_name <> ''
$$;