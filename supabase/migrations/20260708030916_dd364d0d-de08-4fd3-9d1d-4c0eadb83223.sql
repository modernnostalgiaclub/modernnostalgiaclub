
-- Prevent non-admin users from escalating their own tier or tampering with Stripe payout fields via a trigger.
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Admins may change anything
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Service role bypasses RLS/triggers only when SECURITY DEFINER is not restricting;
  -- for safety, allow when auth.uid() is NULL (backend/service context).
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.patreon_tier IS DISTINCT FROM OLD.patreon_tier THEN
    RAISE EXCEPTION 'Not authorized to modify patreon_tier';
  END IF;

  IF NEW.stripe_account_id IS DISTINCT FROM OLD.stripe_account_id THEN
    RAISE EXCEPTION 'Not authorized to modify stripe_account_id';
  END IF;

  IF NEW.stripe_onboarding_complete IS DISTINCT FROM OLD.stripe_onboarding_complete THEN
    RAISE EXCEPTION 'Not authorized to modify stripe_onboarding_complete';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();
