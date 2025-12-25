-- Add 'producer-mission' to the submission_type enum
ALTER TYPE public.submission_type ADD VALUE IF NOT EXISTS 'producer-mission';