-- Remove email column from profiles table
-- Email is already securely stored in auth.users and can be accessed via user session
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;