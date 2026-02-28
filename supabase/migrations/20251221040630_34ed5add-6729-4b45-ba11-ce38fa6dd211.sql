-- Create table for beat license submissions
CREATE TABLE public.beat_license_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  artist_name TEXT,
  email TEXT NOT NULL,
  beats_interested TEXT NOT NULL,
  special_requests TEXT,
  license_option TEXT NOT NULL, -- 'single' ($60) or 'double' ($100)
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beat_license_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own beat license submissions"
ON public.beat_license_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own submissions
CREATE POLICY "Users can create their own beat license submissions"
ON public.beat_license_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all beat license submissions"
ON public.beat_license_submissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update submissions (e.g., payment status)
CREATE POLICY "Admins can update beat license submissions"
ON public.beat_license_submissions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_beat_license_submissions_updated_at
BEFORE UPDATE ON public.beat_license_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();