-- Add RLS policy for admins to view all user lesson progress
CREATE POLICY "Admins can view all lesson progress"
ON public.user_lesson_progress
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));