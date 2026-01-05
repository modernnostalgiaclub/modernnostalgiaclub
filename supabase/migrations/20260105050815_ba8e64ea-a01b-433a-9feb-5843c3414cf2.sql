-- Create analytics cache table
CREATE TABLE public.analytics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- Only admins/moderators can read cache (via edge function with service role)
-- No direct access policies needed as edge function uses service role

-- Create index for faster lookups
CREATE INDEX idx_analytics_cache_key ON public.analytics_cache(cache_key);
CREATE INDEX idx_analytics_cache_expires ON public.analytics_cache(expires_at);

-- Add comment
COMMENT ON TABLE public.analytics_cache IS 'Caches analytics data to reduce API calls. Entries expire after 15 minutes.';