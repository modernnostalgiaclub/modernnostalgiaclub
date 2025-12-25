-- Update: Add 'pro' field to public profile functions as it's intentionally public (PRO affiliation)
-- Users deliberately choose to share their Performing Rights Organization

DROP FUNCTION IF EXISTS public.get_public_profiles();
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  stage_name text,
  avatar_url text,
  patreon_tier patreon_tier,
  pro text
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
    p.patreon_tier,
    p.pro
  FROM public.profiles p
  WHERE p.stage_name IS NOT NULL 
    AND p.stage_name <> ''
$$;

CREATE OR REPLACE FUNCTION public.get_public_profile(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  stage_name text,
  avatar_url text,
  patreon_tier patreon_tier,
  pro text
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
    p.patreon_tier,
    p.pro
  FROM public.profiles p
  WHERE p.user_id = target_user_id
    AND p.stage_name IS NOT NULL 
    AND p.stage_name <> ''
$$;