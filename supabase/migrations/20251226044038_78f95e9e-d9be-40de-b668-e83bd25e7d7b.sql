-- Fix error-level RLS issues for profiles and beat_license_submissions
-- The issue is that the existing policies are marked as RESTRICTIVE when they should be PERMISSIVE

-- 1. PROFILES TABLE - Recreate user policies as PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- Recreate as PERMISSIVE (default) policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2. BEAT_LICENSE_SUBMISSIONS TABLE - Recreate policies as PERMISSIVE
DROP POLICY IF EXISTS "Users can view their own beat license submissions" ON public.beat_license_submissions;
DROP POLICY IF EXISTS "Users can create their own beat license submissions" ON public.beat_license_submissions;
DROP POLICY IF EXISTS "Admins can view all beat license submissions" ON public.beat_license_submissions;
DROP POLICY IF EXISTS "Admins can update beat license submissions" ON public.beat_license_submissions;

-- Recreate as PERMISSIVE policies with explicit authenticated role
CREATE POLICY "Users can view their own beat license submissions"
ON public.beat_license_submissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own beat license submissions"
ON public.beat_license_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all beat license submissions"
ON public.beat_license_submissions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update beat license submissions"
ON public.beat_license_submissions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));