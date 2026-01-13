-- Create table to store captured emails for gated downloads
CREATE TABLE public.download_email_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  track_id TEXT NOT NULL,
  track_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index to prevent duplicate captures per email/track
CREATE UNIQUE INDEX idx_download_email_captures_unique ON public.download_email_captures (email, track_id);

-- Enable RLS
ALTER TABLE public.download_email_captures ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form submission)
CREATE POLICY "Anyone can submit email for downloads"
ON public.download_email_captures
FOR INSERT
WITH CHECK (true);

-- Only admins can view captured emails
CREATE POLICY "Only admins can view captured emails"
ON public.download_email_captures
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'moderator')
  )
);