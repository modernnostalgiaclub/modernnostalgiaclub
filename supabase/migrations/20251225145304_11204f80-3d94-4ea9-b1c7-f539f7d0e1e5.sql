-- Add new profile fields for artist/songwriter information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS stage_name text,
ADD COLUMN IF NOT EXISTS pro text,
ADD COLUMN IF NOT EXISTS has_publishing_account boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS publishing_company text,
ADD COLUMN IF NOT EXISTS writer_ipi text,
ADD COLUMN IF NOT EXISTS publisher_ipi text;

-- Add comment explaining the fields
COMMENT ON COLUMN public.profiles.full_name IS 'Legal full name (private) - should match PRO registration';
COMMENT ON COLUMN public.profiles.stage_name IS 'Public stage/artist name';
COMMENT ON COLUMN public.profiles.pro IS 'Performing Rights Organization (public)';
COMMENT ON COLUMN public.profiles.has_publishing_account IS 'Whether user has a publishing account';
COMMENT ON COLUMN public.profiles.publishing_company IS 'Publishing company name';
COMMENT ON COLUMN public.profiles.writer_ipi IS 'Writer IPI number';
COMMENT ON COLUMN public.profiles.publisher_ipi IS 'Publisher IPI number';