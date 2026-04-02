-- Create member_subscriptions table for tracking active memberships with grandfathering
CREATE TABLE public.member_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  locked_price NUMERIC NOT NULL DEFAULT 0,
  locked_billing_period TEXT NOT NULL DEFAULT 'monthly',
  is_grandfathered BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one active subscription per user per plan
CREATE UNIQUE INDEX idx_member_subscriptions_user_plan
  ON public.member_subscriptions (user_id, plan_id)
  WHERE status = 'active';

-- Index for quick lookups
CREATE INDEX idx_member_subscriptions_user_id ON public.member_subscriptions (user_id);
CREATE INDEX idx_member_subscriptions_status ON public.member_subscriptions (status);
CREATE INDEX idx_member_subscriptions_grandfathered ON public.member_subscriptions (is_grandfathered) WHERE is_grandfathered = true;

-- Enable RLS
ALTER TABLE public.member_subscriptions ENABLE ROW LEVEL SECURITY;

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all member subscriptions"
  ON public.member_subscriptions
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscriptions"
  ON public.member_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Block anonymous access
CREATE POLICY "Block anonymous access to member subscriptions"
  ON public.member_subscriptions
  FOR ALL
  TO anon
  USING (false);

-- Trigger for updated_at
CREATE TRIGGER update_member_subscriptions_updated_at
  BEFORE UPDATE ON public.member_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();