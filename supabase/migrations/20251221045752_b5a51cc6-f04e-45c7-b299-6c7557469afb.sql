-- Fix community_posts: Require authentication for viewing posts
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.community_posts;
CREATE POLICY "Authenticated users can view all posts" 
ON public.community_posts 
FOR SELECT 
TO authenticated
USING (true);

-- Fix community_comments: Require authentication for viewing comments
DROP POLICY IF EXISTS "Authenticated users can view all comments" ON public.community_comments;
CREATE POLICY "Authenticated users can view all comments" 
ON public.community_comments 
FOR SELECT 
TO authenticated
USING (true);

-- Add explicit authenticated-only policies for beat_license_submissions (defense in depth)
-- The existing policies already use auth.uid() but we ensure the role is explicit
DROP POLICY IF EXISTS "Users can view their own beat license submissions" ON public.beat_license_submissions;
CREATE POLICY "Users can view their own beat license submissions" 
ON public.beat_license_submissions 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own beat license submissions" ON public.beat_license_submissions;
CREATE POLICY "Users can create their own beat license submissions" 
ON public.beat_license_submissions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Add explicit authenticated-only policies for profiles (defense in depth)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Ensure community sections remain publicly viewable (intentional for navigation)
DROP POLICY IF EXISTS "Anyone can view community sections" ON public.community_sections;
CREATE POLICY "Anyone can view community sections" 
ON public.community_sections 
FOR SELECT 
USING (true);