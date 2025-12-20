-- Create the private schema first
CREATE SCHEMA IF NOT EXISTS private;

-- Create secure patreon_tokens table (only accessible via service role - no RLS needed since private schema is not exposed via API)
CREATE TABLE private.patreon_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger for updated_at
CREATE TRIGGER update_patreon_tokens_updated_at
  BEFORE UPDATE ON private.patreon_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing tokens to the new table
INSERT INTO private.patreon_tokens (user_id, access_token, refresh_token)
SELECT user_id, patreon_access_token, patreon_refresh_token
FROM public.profiles
WHERE patreon_access_token IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  access_token = EXCLUDED.access_token,
  refresh_token = EXCLUDED.refresh_token;

-- Remove token columns from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS patreon_access_token;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS patreon_refresh_token;

-- Add missing INSERT policy for authenticated users to create their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);