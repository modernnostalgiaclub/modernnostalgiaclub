-- Fix example_tracks to ensure internal tracks are never publicly visible
DROP POLICY IF EXISTS "Anyone can view published example tracks" ON public.example_tracks;

CREATE POLICY "Anyone can view published non-internal example tracks" 
ON public.example_tracks 
FOR SELECT 
USING (is_published = true AND (is_internal = false OR is_internal IS NULL));