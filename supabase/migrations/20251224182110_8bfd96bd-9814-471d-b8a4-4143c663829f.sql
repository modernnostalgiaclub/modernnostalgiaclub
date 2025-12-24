-- Create a function to get user submissions without internal_notes
-- This prevents users from accessing internal moderator notes via direct queries
CREATE OR REPLACE FUNCTION public.get_user_submissions(_user_id uuid)
RETURNS TABLE (
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

-- Drop the existing policy that allows users to view all columns
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;

-- Create a new restrictive policy that only allows admins/moderators to see all columns
-- Regular users must use the get_user_submissions function
CREATE POLICY "Users can view their own submissions without internal_notes"
ON public.submissions
FOR SELECT
USING (
  -- Admins and moderators can see everything (including internal_notes)
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role)
  OR (
    -- Regular users can only see their own submissions
    -- They should use get_user_submissions() function which excludes internal_notes
    auth.uid() = user_id
  )
);

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_user_submissions(uuid) TO authenticated;