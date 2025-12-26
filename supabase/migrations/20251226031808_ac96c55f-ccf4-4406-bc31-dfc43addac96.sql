-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON public.audit_logs;

-- The log_admin_access function is already SECURITY DEFINER, 
-- so it bypasses RLS and can still insert audit logs.
-- No INSERT policy needed - only the system function can insert now.