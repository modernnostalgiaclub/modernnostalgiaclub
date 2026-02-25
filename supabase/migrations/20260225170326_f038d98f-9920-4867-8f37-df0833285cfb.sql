
-- Add new columns to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS username text UNIQUE,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS discord text,
  ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'public',
  ADD COLUMN IF NOT EXISTS tip_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS tip_message text,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS youtube text,
  ADD COLUMN IF NOT EXISTS soundcloud text,
  ADD COLUMN IF NOT EXISTS spotify text;

-- Create artist_tracks table
CREATE TABLE IF NOT EXISTS public.artist_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  artist_name text,
  disco_url text NOT NULL,
  cover_art_url text,
  duration text,
  track_type text DEFAULT 'single',
  versions jsonb DEFAULT '[]',
  sections jsonb DEFAULT '[]',
  price numeric DEFAULT 0,
  is_email_gated boolean DEFAULT false,
  is_for_licensing boolean DEFAULT false,
  is_published boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.artist_tracks ENABLE ROW LEVEL SECURITY;

-- Owner can do everything on their own tracks
CREATE POLICY "Users can manage their own tracks"
  ON public.artist_tracks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all tracks
CREATE POLICY "Admins can manage all artist tracks"
  ON public.artist_tracks FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Block anonymous
CREATE POLICY "Block anonymous access to artist_tracks"
  ON public.artist_tracks FOR ALL
  TO anon
  USING (false);

-- Create artist_track_access table (email gate captures)
CREATE TABLE IF NOT EXISTS public.artist_track_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid REFERENCES public.artist_tracks(id) ON DELETE CASCADE,
  email text NOT NULL,
  access_type text DEFAULT 'email_gate',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.artist_track_access ENABLE ROW LEVEL SECURITY;

-- Block all direct client access - only via edge functions (service role)
CREATE POLICY "Block direct access to artist_track_access"
  ON public.artist_track_access FOR ALL
  USING (false);

-- Admins can view
CREATE POLICY "Admins can view track access"
  ON public.artist_track_access FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Create licensing_requests table
CREATE TABLE IF NOT EXISTS public.licensing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_user_id uuid NOT NULL,
  supervisor_name text NOT NULL,
  supervisor_email text NOT NULL,
  company text,
  project_description text NOT NULL,
  track_id uuid REFERENCES public.artist_tracks(id) ON DELETE SET NULL,
  budget_range text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.licensing_requests ENABLE ROW LEVEL SECURITY;

-- Block direct anonymous inserts - goes through edge function
CREATE POLICY "Block direct anonymous inserts to licensing_requests"
  ON public.licensing_requests FOR INSERT
  TO anon
  WITH CHECK (false);

-- Artist can view their own licensing requests
CREATE POLICY "Artists can view their own licensing requests"
  ON public.licensing_requests FOR SELECT
  USING (auth.uid() = artist_user_id);

-- Admins can view all
CREATE POLICY "Admins can manage licensing requests"
  ON public.licensing_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Security definer function: returns public artist track data WITHOUT disco_url
CREATE OR REPLACE FUNCTION public.get_public_artist_tracks(p_username text)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  artist_name text,
  cover_art_url text,
  duration text,
  track_type text,
  versions jsonb,
  sections jsonb,
  price numeric,
  is_email_gated boolean,
  is_for_licensing boolean,
  sort_order integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    t.id,
    t.user_id,
    t.title,
    t.artist_name,
    t.cover_art_url,
    t.duration,
    t.track_type,
    t.versions,
    t.sections,
    t.price,
    t.is_email_gated,
    t.is_for_licensing,
    t.sort_order,
    t.created_at
  FROM public.artist_tracks t
  JOIN public.profiles p ON p.user_id = t.user_id
  WHERE p.username = p_username
    AND t.is_published = true
  ORDER BY t.sort_order ASC, t.created_at DESC;
$$;

-- Security definer function: returns public artist profile data
CREATE OR REPLACE FUNCTION public.get_artist_profile(p_username text)
RETURNS TABLE(
  user_id uuid,
  stage_name text,
  bio text,
  avatar_url text,
  hero_image_url text,
  instagram text,
  twitter text,
  tiktok text,
  youtube text,
  soundcloud text,
  spotify text,
  discord text,
  linktree text,
  tip_enabled boolean,
  tip_message text,
  profile_visibility text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.stage_name,
    p.bio,
    p.avatar_url,
    p.hero_image_url,
    p.instagram,
    p.twitter,
    p.tiktok,
    p.youtube,
    p.soundcloud,
    p.spotify,
    p.discord,
    p.linktree,
    p.tip_enabled,
    p.tip_message,
    p.profile_visibility
  FROM public.profiles p
  WHERE p.username = p_username
    AND p.profile_visibility = 'public';
$$;

-- Updated_at trigger for artist_tracks
CREATE TRIGGER update_artist_tracks_updated_at
  BEFORE UPDATE ON public.artist_tracks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
