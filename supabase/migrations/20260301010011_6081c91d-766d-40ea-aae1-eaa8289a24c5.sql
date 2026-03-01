CREATE POLICY "Public profiles viewable by all"
ON public.profiles FOR SELECT
USING (profile_visibility = 'public' AND username IS NOT NULL);