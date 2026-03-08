
-- Add new columns to artist_tracks for the custom player
ALTER TABLE public.artist_tracks
  ADD COLUMN IF NOT EXISTS show_in_landing_player boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_add_to_disco_button boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mp3_storage_paths jsonb DEFAULT '[]'::jsonb;

-- Create private storage bucket for track audio
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'track-audio',
  'track-audio',
  false,
  52428800,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/x-mpeg', 'audio/x-mp3']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for track-audio bucket (service role handles all access via edge functions)
CREATE POLICY "Admins can manage track audio"
  ON storage.objects FOR ALL
  USING (bucket_id = 'track-audio' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Drop and recreate get_public_artist_tracks with new columns
DROP FUNCTION IF EXISTS public.get_public_artist_tracks(text);

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
  created_at timestamp with time zone,
  show_add_to_disco_button boolean,
  disco_url text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    t.created_at,
    t.show_add_to_disco_button,
    t.disco_url
  FROM public.artist_tracks t
  JOIN public.profiles p ON p.user_id = t.user_id
  WHERE p.username = p_username
    AND t.is_published = true
  ORDER BY t.sort_order ASC, t.created_at DESC;
$function$;

-- New security definer function to get landing player tracks (anon accessible)
CREATE OR REPLACE FUNCTION public.get_landing_player_tracks()
RETURNS TABLE(
  id uuid,
  title text,
  artist_name text,
  cover_art_url text,
  duration text,
  track_type text,
  versions jsonb,
  mp3_storage_paths jsonb,
  sort_order integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    t.id,
    t.title,
    t.artist_name,
    t.cover_art_url,
    t.duration,
    t.track_type,
    t.versions,
    t.mp3_storage_paths,
    t.sort_order
  FROM public.artist_tracks t
  WHERE t.show_in_landing_player = true
    AND t.is_published = true
  ORDER BY t.sort_order ASC, t.created_at DESC;
$function$;
