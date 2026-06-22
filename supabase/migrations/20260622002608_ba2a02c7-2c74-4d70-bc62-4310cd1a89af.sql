
-- 1. membership_plans: hide Stripe IDs from authenticated users
REVOKE SELECT (stripe_price_id, stripe_product_id) ON public.membership_plans FROM authenticated;
REVOKE SELECT (stripe_price_id, stripe_product_id) ON public.membership_plans FROM anon;

-- 2. member_subscriptions: hide Stripe IDs from authenticated users (admins/edge functions use service_role)
REVOKE SELECT (stripe_customer_id, stripe_subscription_id) ON public.member_subscriptions FROM authenticated;
REVOKE SELECT (stripe_customer_id, stripe_subscription_id) ON public.member_subscriptions FROM anon;

-- 3. licensing_requests: artists should not see supervisor contact info via direct table reads.
-- No client code reads this table; admins keep full access through their ALL policy.
DROP POLICY IF EXISTS "Artists can view their own licensing requests" ON public.licensing_requests;

-- 4. track-audio storage: add owner-scoped INSERT/UPDATE/DELETE policies for defense-in-depth.
CREATE POLICY "Owners can upload their own track audio"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'track-audio'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners can update their own track audio"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'track-audio'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'track-audio'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

CREATE POLICY "Owners can delete their own track audio"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'track-audio'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
