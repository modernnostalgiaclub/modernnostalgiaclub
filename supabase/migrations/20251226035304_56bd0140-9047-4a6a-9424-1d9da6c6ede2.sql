-- =====================================================
-- FIX ERROR-LEVEL RLS ISSUES
-- Add explicit policies to block anonymous/public access
-- =====================================================

-- 1. PROFILES TABLE - Block anonymous access explicitly
-- Create a policy that explicitly requires authentication
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- 2. BEAT_LICENSE_SUBMISSIONS TABLE - Block anonymous access
CREATE POLICY "Block anonymous access to beat license submissions"
ON public.beat_license_submissions
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- 3. AUDIT_LOGS TABLE - Block anonymous access
CREATE POLICY "Block anonymous access to audit logs"
ON public.audit_logs
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- =====================================================
-- FIX WARN-LEVEL RLS ISSUES
-- Ensure users can only access their own data
-- =====================================================

-- 4. SUBMISSIONS TABLE - Add policy for users to view their own submissions
-- (Currently they can only use the get_user_submissions function)
CREATE POLICY "Users can view their own submissions"
ON public.submissions
FOR SELECT
USING (auth.uid() = user_id);

-- 5. For tracker tables, the existing policies are correct but let's add
-- explicit blocking for anon role to be extra safe

CREATE POLICY "Block anonymous access to tracker progress"
ON public.tracker_progress
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

CREATE POLICY "Block anonymous access to tracker reflections"
ON public.tracker_reflections
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

CREATE POLICY "Block anonymous access to tracker sessions"
ON public.tracker_sessions
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);