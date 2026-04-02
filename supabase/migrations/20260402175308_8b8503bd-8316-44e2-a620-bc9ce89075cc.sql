
-- Create membership_plans table
CREATE TABLE public.membership_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly', 'one-time')),
  price NUMERIC NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  promo_codes JSONB DEFAULT '[]',
  grace_period_days INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  limit_one_per_email BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  parent_plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- Admins can fully manage plans
CREATE POLICY "Admins can manage membership plans"
  ON public.membership_plans FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can view active plans
CREATE POLICY "Authenticated users can view active plans"
  ON public.membership_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Timestamp trigger
CREATE TRIGGER update_membership_plans_updated_at
  BEFORE UPDATE ON public.membership_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
