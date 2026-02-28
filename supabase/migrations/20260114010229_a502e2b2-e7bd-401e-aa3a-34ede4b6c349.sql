-- Create rate_limits table for tracking submission attempts
CREATE TABLE public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL, -- IP address or email hash
  endpoint TEXT NOT NULL, -- 'contact_form' or 'email_capture'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_rate_limits_lookup ON public.rate_limits (identifier, endpoint, created_at);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated service role only (edge functions)
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_count INTEGER;
BEGIN
  -- Count requests in the time window
  SELECT COUNT(*) INTO request_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND endpoint = p_endpoint
    AND created_at > now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- If under limit, record this request and return true
  IF request_count < p_max_requests THEN
    INSERT INTO public.rate_limits (identifier, endpoint)
    VALUES (p_identifier, p_endpoint);
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create cleanup function to remove old rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE created_at < now() - INTERVAL '24 hours';
END;
$$;