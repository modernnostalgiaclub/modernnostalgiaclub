-- Fix: Remove direct SELECT access for regular users to submissions table
-- Users must use the get_user_submissions() RPC which excludes internal_notes

-- Drop the existing policy that allows users to view their own submissions directly
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;

-- The get_user_submissions() RPC already exists and excludes internal_notes
-- Admin/moderator SELECT policy already exists for full access
-- Regular users can only access their submissions via the RPC function