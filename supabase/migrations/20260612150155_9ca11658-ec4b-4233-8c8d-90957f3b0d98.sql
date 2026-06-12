-- Ensure payment provider identifiers are not browser-readable from membership plans
REVOKE ALL ON public.membership_plans FROM anon, authenticated;
GRANT SELECT (
  id,
  name,
  description,
  features,
  billing_period,
  price,
  promo_codes,
  grace_period_days,
  is_active,
  is_popular,
  limit_one_per_email,
  sort_order,
  parent_plan_id,
  created_at,
  updated_at
) ON public.membership_plans TO anon, authenticated;
GRANT ALL ON public.membership_plans TO service_role;

-- Replace ineffective permissive anonymous blocker with a restrictive anon-only policy
DROP POLICY IF EXISTS "Block anonymous access to notifications" ON public.notifications;
CREATE POLICY "Block anonymous access to notifications"
ON public.notifications
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Explicitly prevent direct client writes to quiz results; inserts remain server-side through the quiz function with validation and rate limiting
REVOKE INSERT, UPDATE, DELETE ON public.sync_quiz_results FROM anon, authenticated;
GRANT SELECT ON public.sync_quiz_results TO authenticated;
GRANT ALL ON public.sync_quiz_results TO service_role;

-- Public track preview helper for pages that should not query the full artist_tracks table directly
CREATE OR REPLACE FUNCTION public.get_public_track_previews(p_limit integer DEFAULT 8)
RETURNS TABLE(
  id uuid,
  title text,
  artist_name text,
  cover_art_url text,
  disco_url text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    t.title,
    t.artist_name,
    t.cover_art_url,
    t.disco_url,
    t.created_at
  FROM public.artist_tracks t
  WHERE t.is_published = true
  ORDER BY t.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 8), 1), 24);
$$;

REVOKE ALL ON FUNCTION public.get_public_track_previews(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_track_previews(integer) TO anon, authenticated, service_role;