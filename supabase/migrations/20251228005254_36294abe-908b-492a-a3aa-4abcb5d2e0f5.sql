-- Create a security definer function to get user submissions without internal fields
CREATE OR REPLACE FUNCTION public.get_user_submissions()
RETURNS TABLE (
  id uuid,
  title text,
  disco_url text,
  notes text,
  reviewer_notes text,
  status public.submission_status,
  submission_type public.submission_type,
  user_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  reviewed_by uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin or moderator - they get full access
  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator') THEN
    RETURN QUERY
    SELECT 
      s.id,
      s.title,
      s.disco_url,
      s.notes,
      s.reviewer_notes,
      s.status,
      s.submission_type,
      s.user_id,
      s.created_at,
      s.updated_at,
      s.reviewed_at,
      s.reviewed_by
    FROM public.submissions s;
  ELSE
    -- Regular users get their own submissions WITHOUT internal_notes
    -- reviewer_notes is explicitly returned as NULL for non-reviewed submissions
    RETURN QUERY
    SELECT 
      s.id,
      s.title,
      s.disco_url,
      s.notes,
      CASE 
        WHEN s.status IN ('approved', 'rejected') THEN s.reviewer_notes
        ELSE NULL
      END as reviewer_notes,
      s.status,
      s.submission_type,
      s.user_id,
      s.created_at,
      s.updated_at,
      s.reviewed_at,
      s.reviewed_by
    FROM public.submissions s
    WHERE s.user_id = auth.uid();
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_submissions() TO authenticated;