-- Fix security issues: Add explicit authentication requirements to sensitive tables

-- Drop and recreate policies for beat_license_submissions to ensure auth is required
DROP POLICY IF EXISTS "Users can view their own beat license submissions" ON public.beat_license_submissions;
DROP POLICY IF EXISTS "Admins can view all beat license submissions" ON public.beat_license_submissions;
DROP POLICY IF EXISTS "Admins can update beat license submissions" ON public.beat_license_submissions;
DROP POLICY IF EXISTS "Users can create their own beat license submissions" ON public.beat_license_submissions;

-- Recreate with proper PERMISSIVE policies (the default, which is more secure for this use case)
CREATE POLICY "Users can view their own beat license submissions" 
ON public.beat_license_submissions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all beat license submissions" 
ON public.beat_license_submissions 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update beat license submissions" 
ON public.beat_license_submissions 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own beat license submissions" 
ON public.beat_license_submissions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert profiles" 
ON public.profiles 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Fix submissions table policies - ensure internal_notes is protected
DROP POLICY IF EXISTS "Users can view their own submissions without internal_notes" ON public.submissions;
DROP POLICY IF EXISTS "Admins and moderators can view all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Admins and moderators can update any submission" ON public.submissions;
DROP POLICY IF EXISTS "Users can create their own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update their own pending submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can delete their own pending submissions" ON public.submissions;

CREATE POLICY "Users can view their own submissions" 
ON public.submissions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can view all submissions" 
ON public.submissions 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins and moderators can update any submission" 
ON public.submissions 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Users can create their own submissions" 
ON public.submissions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending submissions" 
ON public.submissions 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Users can delete their own pending submissions" 
ON public.submissions 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

-- Fix user_roles table policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Fix community tables to require authentication
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Admins and moderators can manage all posts" ON public.community_posts;

CREATE POLICY "Authenticated users can view all posts" 
ON public.community_posts 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create posts" 
ON public.community_posts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.community_posts 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can manage all posts" 
ON public.community_posts 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

DROP POLICY IF EXISTS "Authenticated users can view all comments" ON public.community_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.community_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.community_comments;
DROP POLICY IF EXISTS "Admins and moderators can manage all comments" ON public.community_comments;

CREATE POLICY "Authenticated users can view all comments" 
ON public.community_comments 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create comments" 
ON public.community_comments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.community_comments 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.community_comments 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can manage all comments" 
ON public.community_comments 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));