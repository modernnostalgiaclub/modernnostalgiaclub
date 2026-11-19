DROP POLICY IF EXISTS "Authenticated users can view chat messages" ON public.chat_messages;
CREATE POLICY "Members can view chat messages" ON public.chat_messages FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.user_has_tier_access('lab-pass'::patreon_tier));

DROP POLICY IF EXISTS "Authenticated users can view all comments" ON public.community_comments;
CREATE POLICY "Members can view comments" ON public.community_comments FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.user_has_tier_access('lab-pass'::patreon_tier));

DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.community_posts;
CREATE POLICY "Members can view posts" ON public.community_posts FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.user_has_tier_access('lab-pass'::patreon_tier));