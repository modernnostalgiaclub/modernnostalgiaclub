
-- Create patreon_migration tracking table
CREATE TABLE IF NOT EXISTS public.patreon_migration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patreon_user_id uuid NOT NULL,
  google_user_id uuid,
  migration_status text NOT NULL DEFAULT 'pending',
  notified_at timestamptz,
  migrated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.patreon_migration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage patreon_migration"
  ON public.patreon_migration FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Add Stripe Connect columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_account_id text,
  ADD COLUMN IF NOT EXISTS stripe_onboarding_complete boolean NOT NULL DEFAULT false;
