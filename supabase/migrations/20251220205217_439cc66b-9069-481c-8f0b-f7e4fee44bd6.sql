-- Enable RLS on private.patreon_tokens for defense in depth
-- Even though private schema is not exposed via API, RLS provides explicit access control
ALTER TABLE private.patreon_tokens ENABLE ROW LEVEL SECURITY;

-- Add comment documenting security model
COMMENT ON TABLE private.patreon_tokens IS 
  'OAuth tokens stored in private schema. Only accessible via service role. 
   RLS enabled for defense in depth. Never expose this schema via API.';