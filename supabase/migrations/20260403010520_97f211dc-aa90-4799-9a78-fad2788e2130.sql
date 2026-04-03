
-- Drop existing function to change return type
DROP FUNCTION IF EXISTS public.get_public_profiles();

-- Recreate with additional safe fields
CREATE FUNCTION public.get_public_profiles()
RETURNS TABLE(id uuid, user_id uuid, stage_name text, avatar_url text, patreon_tier patreon_tier, pro text, name text, username text, bio text, instagram text, spotify text, soundcloud text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.stage_name,
    p.avatar_url,
    p.patreon_tier,
    p.pro,
    p.name,
    p.username,
    p.bio,
    p.instagram,
    p.spotify,
    p.soundcloud
  FROM public.profiles p
  WHERE p.profile_visibility = 'public'
    AND p.username IS NOT NULL
    AND p.stage_name IS NOT NULL 
    AND p.stage_name <> ''
$$;

-- Create chat profiles function for Community page
CREATE OR REPLACE FUNCTION public.get_chat_profiles(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, stage_name text, name text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.user_id,
    p.stage_name,
    p.name,
    p.avatar_url
  FROM public.profiles p
  WHERE p.user_id = ANY(p_user_ids)
$$;

-- Drop the overly broad public profiles policy
DROP POLICY IF EXISTS "Public profiles viewable by all" ON public.profiles;
