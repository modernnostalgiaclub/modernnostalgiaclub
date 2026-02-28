-- Allow admins to insert beat license submissions (for cash sales)
CREATE POLICY "Admins can create beat license submissions"
ON public.beat_license_submissions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete beat license submissions if needed
CREATE POLICY "Admins can delete beat license submissions"
ON public.beat_license_submissions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));