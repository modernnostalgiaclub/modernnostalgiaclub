-- Create table for sync readiness quiz results
CREATE TABLE public.sync_quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  result_type TEXT NOT NULL CHECK (result_type IN ('sync-ready', 'almost-ready', 'not-ready')),
  answers JSONB NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sync_quiz_results ENABLE ROW LEVEL SECURITY;

-- Only admins can view quiz results (for marketing segmentation)
CREATE POLICY "Admins can view all quiz results"
  ON public.sync_quiz_results
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- No public insert - handled by edge function with service role
-- This prevents spam submissions

-- Create index for email lookups
CREATE INDEX idx_sync_quiz_results_email ON public.sync_quiz_results(email);
CREATE INDEX idx_sync_quiz_results_type ON public.sync_quiz_results(result_type);