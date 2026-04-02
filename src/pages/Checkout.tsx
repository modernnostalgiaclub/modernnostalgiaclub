import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

const PLAN_SLUG_MAP: Record<string, string> = {
  'club-pass': 'Club Pass',
  'accelerator': 'Accelerator',
  'artist-incubator': 'Artist Incubator',
};

export default function Checkout() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const planSlug = searchParams.get('plan');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const planName = planSlug ? PLAN_SLUG_MAP[planSlug] : null;

  const { data: plan, isLoading } = useQuery({
    queryKey: ['checkout-plan', planName],
    queryFn: async () => {
      if (!planName) return null;
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('name', planName)
        .eq('is_active', true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!planName,
  });

  useEffect(() => {
    if (!planSlug || !PLAN_SLUG_MAP[planSlug]) {
      navigate('/join', { replace: true });
    }
  }, [planSlug, navigate]);

  const handleCheckout = async () => {
    if (!plan || !user) return;
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-membership-checkout', {
        body: { plan_id: plan.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: 'Checkout failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
      setCheckoutLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg text-muted-foreground">Plan not found.</p>
        <Button variant="outline" asChild>
          <Link to="/join"><ArrowLeft className="w-4 h-4 mr-2" /> Back to plans</Link>
        </Button>
      </div>
    );
  }

  const isSubscription = plan.billing_period === 'monthly' || plan.billing_period === 'yearly';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link
          to="/join"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to plans
        </Link>

        <Card className="border border-border shadow-sm">
          <CardHeader className="text-center pb-2">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">You're joining</p>
            <CardTitle className="text-2xl font-serif">{plan.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-bold">${plan.price}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {isSubscription ? `per ${plan.billing_period === 'yearly' ? 'year' : 'month'}` : 'one-time payment'}
              </p>
            </div>

            {plan.features && plan.features.length > 0 && (
              <ul className="space-y-2">
                {plan.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            )}

            <Button
              className="w-full h-12 text-base"
              onClick={handleCheckout}
              disabled={checkoutLoading}
            >
              {checkoutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {checkoutLoading ? 'Redirecting to payment…' : `Continue to Payment`}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You'll be redirected to Stripe for secure payment.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
