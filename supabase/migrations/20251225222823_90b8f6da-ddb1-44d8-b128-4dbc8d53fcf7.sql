-- Drop and recreate the get_user_submissions function to exclude internal_notes
-- This ensures regular users cannot see internal notes, only admins/moderators via direct table access

DROP FUNCTION IF EXISTS public.get_user_submissions(uuid);

CREATE OR REPLACE FUNCTION public.get_user_submissions(_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  submission_type submission_type,
  disco_url text,
  notes text,
  status submission_status,
  reviewer_notes text,
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    s.id,
    s.user_id,
    s.title,
    s.submission_type,
    s.disco_url,
    s.notes,
    s.status,
    s.reviewer_notes,
    s.reviewed_at,
    s.reviewed_by,
    s.created_at,
    s.updated_at
  FROM public.submissions s
  WHERE s.user_id = _user_id
$$;