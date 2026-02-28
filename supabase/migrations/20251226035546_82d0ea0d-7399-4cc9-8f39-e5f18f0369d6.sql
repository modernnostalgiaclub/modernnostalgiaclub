-- Add explicit anonymous blocking policies for complete coverage

-- 1. COMMUNITY_COMMENTS TABLE - Block anonymous access
CREATE POLICY "Block anonymous access to community comments"
ON public.community_comments
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- 2. COMMUNITY_POSTS TABLE - Block anonymous access
CREATE POLICY "Block anonymous access to community posts"
ON public.community_posts
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- 3. USER_LESSON_PROGRESS TABLE - Block anonymous access
CREATE POLICY "Block anonymous access to user lesson progress"
ON public.user_lesson_progress
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);