
CREATE OR REPLACE FUNCTION public.get_public_playable_tracks(p_limit integer DEFAULT 12)
RETURNS TABLE(
  id uuid,
  title text,
  artist_name text,
  cover_art_url text,
  duration text,
  audio_path text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    t.title,
    t.artist_name,
    t.cover_art_url,
    t.duration,
    (
      SELECT (elem->>'storage_path')
      FROM jsonb_array_elements(COALESCE(t.mp3_storage_paths, '[]'::jsonb)) elem
      WHERE (elem->>'version_tag') = 'MAIN'
         OR (elem->>'version_name') ILIKE 'main'
      LIMIT 1
    ) AS audio_path
  FROM public.artist_tracks t
  WHERE t.is_published = true
    AND t.show_in_landing_player = true
    AND t.mp3_storage_paths IS NOT NULL
    AND jsonb_array_length(t.mp3_storage_paths) > 0
  ORDER BY t.sort_order ASC NULLS LAST, t.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 12), 1), 50);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_playable_tracks(integer) TO anon, authenticated;
