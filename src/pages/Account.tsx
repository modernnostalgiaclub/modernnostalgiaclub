import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { TierBadge } from '@/components/TierBadge';
import { TwoFactorSettings } from '@/components/TwoFactorSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth, PatreonTier } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CreditCard,
  ExternalLink,
  User,
  Mail,
  Shield,
  Loader2,
  Trash2,
  AlertTriangle,
  Lock,
  Crown,
  Calendar,
  Receipt,
  ArrowUpRight,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

interface MemberSubscription {
  plan_name: string;
  locked_price: number;
  locked_billing_period: string;
  is_grandfathered: boolean;
  status: string;
  started_at: string;
  stripe_subscription_id: string | null;
}

const tierLabel = (tier: PatreonTier | null): string => {
  switch (tier) {
    case 'lab-pass': return 'Club Pass';
    case 'creator-accelerator': return 'Accelerator';
    case 'creative-economy-lab': return 'Artist Incubator';
    default: return 'Club Pass';
  }
};

export default function Account() {
  const { user, profile, loading, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [subscription, setSubscription] = useState<MemberSubscription | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (user) fetchSubscription();
  }, [user]);

  async function fetchSubscription() {
    setSubLoading(true);
    try {
      const { data: subs } = await supabase
        .from('member_subscriptions')
        .select('*, membership_plans(name)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (subs && subs.length > 0) {
        const s = subs[0] as any;
        setSubscription({
          plan_name: s.membership_plans?.name || 'Unknown Plan',
          locked_price: s.locked_price,
          locked_billing_period: s.locked_billing_period,
          is_grandfathered: s.is_grandfathered,
          status: s.status,
          started_at: s.started_at,
          stripe_subscription_id: s.stripe_subscription_id,
        });
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    } finally {
      setSubLoading(false);
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('You must be logged in'); return; }
      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error || data?.error) { toast.error(data?.error || 'Failed to delete account'); return; }
      await signOut();
      toast.success('Your account has been deleted');
      navigate('/');
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent! Check your inbox.');
    } catch {
      toast.error('Failed to send reset email');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('You must be logged in'); return; }
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error || data?.error) {
        toast.error(data?.error || 'Unable to open billing portal');
        return;
      }
      window.open(data.url, '_blank');
    } catch {
      toast.error('Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (!loading && !user) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background studio-grain flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tier = (profile?.patreon_tier || 'lab-pass') as PatreonTier;
  const userName = profile?.name || user?.email?.split('@')[0] || 'Artist';
  const userEmail = user?.email || '';

  const billingText = (period: string) => {
    switch (period) {
      case 'monthly': return '/month';
      case 'yearly': return '/year';
      case 'one-time': return ' one-time';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto">
            <motion.div variants={fadeIn} className="mb-8">
              <SectionLabel className="mb-4">Settings</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-anton uppercase mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your membership, billing, and account security.</p>
            </motion.div>

            <div className="space-y-8">
              {/* ─── Account Info ─── */}
              <motion.div variants={fadeIn}>
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Account Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{userName}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </span>
                      <span>{userEmail}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Account Status</span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Active
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ─── Membership Plan ─── */}
              <motion.div variants={fadeIn}>
                <Card variant="elevated" className="border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Membership Plan
                    </CardTitle>
                    <CardDescription>Your current membership details and billing information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {subLoading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    ) : (
                      <>
                        {/* Plan & Tier */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-semibold text-foreground">{tierLabel(tier)}</p>
                            {subscription?.is_grandfathered && (
                              <Badge variant="outline" className="mt-1 gap-1 border-amber-500/50 text-amber-500">
                                <Shield className="h-3 w-3" /> Legacy Rate
                              </Badge>
                            )}
                          </div>
                          <TierBadge tier={tier} />
                        </div>

                        <Separator />

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                            <Badge variant={subscription?.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {subscription?.status || 'active'}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount</p>
                            <p className="font-mono text-foreground">
                              {subscription ? (
                                Number(subscription.locked_price) === 0 ? (
                                  <span className="text-green-500 font-semibold">Free</span>
                                ) : (
                                  <>${subscription.locked_price}<span className="text-muted-foreground text-sm">{billingText(subscription.locked_billing_period)}</span></>
                                )
                              ) : (
                                '—'
                              )}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Member Since
                            </p>
                            <p className="text-foreground">
                              {subscription
                                ? new Date(subscription.started_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                : new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Billing Period</p>
                            <p className="text-foreground capitalize">
                              {subscription?.locked_billing_period || 'monthly'}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        {/* Actions */}
                        <div className="flex flex-wrap gap-3">
                          <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={portalLoading} className="gap-2">
                            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                            {portalLoading ? 'Opening...' : 'Manage Payment Method'}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleManageBilling} disabled={portalLoading} className="gap-2">
                            <Receipt className="w-4 h-4" />
                            View Billing History
                          </Button>
                          <Button variant="maroon" size="sm" asChild className="gap-2">
                            <a href="/dashboard?tab=membership">
                              <ArrowUpRight className="w-4 h-4" />
                              Upgrade Plan
                            </a>
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* ─── Security ─── */}
              <motion.div variants={fadeIn}>
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security
                    </CardTitle>
                    <CardDescription>Manage your password and account security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Change Password */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          <Lock className="w-4 h-4" /> Change Password
                        </p>
                        <p className="text-sm text-muted-foreground">Send a password reset link to your email</p>
                      </div>
                      <Button onClick={handleResetPassword} disabled={isResettingPassword} variant="outline" size="sm" className="gap-2 shrink-0">
                        {isResettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        {isResettingPassword ? 'Sending...' : 'Send Reset Email'}
                      </Button>
                    </div>

                    {/* 2FA (Admin only) */}
                    {isAdmin && (
                      <>
                        <Separator />
                        <TwoFactorSettings />
                      </>
                    )}

                    <Separator />

                    {/* Delete Account */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-medium flex items-center gap-2 text-destructive">
                          <AlertTriangle className="w-4 h-4" /> Delete Account
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete your account and all associated data. This cannot be undone.
                        </p>
                      </div>
                      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="shrink-0 gap-2">
                            <Trash2 className="w-4 h-4" /> Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                              Delete Your Account?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <p>
                                This action is <strong>permanent and cannot be undone</strong>. All your data, membership, and content will be permanently deleted.
                              </p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              disabled={isDeleting}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {isDeleting ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                'Yes, Delete My Account'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
