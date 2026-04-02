import { useState } from 'react';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { TierBadge } from '@/components/TierBadge';
import { TwoFactorSettings } from '@/components/TwoFactorSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth, PatreonTier } from '@/contexts/AuthContext';
import { TIER_INFO } from '@/lib/types';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  ExternalLink,
  User,
  Mail,
  Shield,
  Loader2,
  Trash2,
  AlertTriangle,
  Lock,
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
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 }
  }
};

const tierOrder: PatreonTier[] = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];

export default function Account() {
  const { user, profile, loading, signOut, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const isAdmin = hasRole('admin');

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error('You must be logged in to delete your account'); return; }
      const { data, error } = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (error) { toast.error('Failed to delete account. Please try again.'); return; }
      if (data?.error) { toast.error(data.error); return; }
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

  if (!loading && !user) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background studio-grain flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const tier = (profile?.patreon_tier || 'lab-pass') as PatreonTier;
  const currentTierIndex = tierOrder.indexOf(tier);
  const userName = profile?.name || user?.email?.split('@')[0] || 'Artist';
  const userEmail = user?.email || '';

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto">
            <motion.div variants={fadeIn} className="mb-8">
              <SectionLabel className="mb-4">Settings</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display uppercase mb-4">Settings</h1>
            </motion.div>

            <div className="space-y-8">
              {/* Account Info */}
              <motion.div variants={fadeIn}>
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Account Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Name</span>
                      <span>{userName}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Email
                      </span>
                      <span>{userEmail}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Shield className="w-4 h-4" /> Patreon Connected
                      </span>
                      <span className={profile?.patreon_id ? 'text-green-400' : 'text-muted-foreground'}>
                        {profile?.patreon_id ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground">Status</span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        Active
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Change Password */}
              <motion.div variants={fadeIn}>
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Change Password
                    </CardTitle>
                    <CardDescription>Send a password reset link to your email</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={handleResetPassword} disabled={isResettingPassword} variant="outline" className="gap-2">
                      {isResettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      {isResettingPassword ? 'Sending...' : 'Send Reset Email'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 2FA (Admin) */}
              {isAdmin && (
                <motion.div variants={fadeIn}>
                  <TwoFactorSettings />
                </motion.div>
              )}

              {/* Current Tier */}
              <motion.div variants={fadeIn}>
                <Card variant="elevated" className="border-primary/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Current Tier</CardTitle>
                      <TierBadge tier={tier} showPrice />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {TIER_INFO[tier].features.map(f => (
                        <div key={f} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-sm">{f}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* All Tiers */}
              <motion.div variants={fadeIn}>
                <h2 className="font-display text-2xl mb-6">All Tier Options</h2>
                <div className="space-y-4">
                  {tierOrder.map((tierId, index) => {
                    const tierInfo = TIER_INFO[tierId];
                    const isCurrent = tierId === tier;
                    const isLocked = index > currentTierIndex;
                    return (
                      <Card key={tierId} variant={isCurrent ? "elevated" : isLocked ? "default" : "feature"} className={isCurrent ? "border-primary/30" : ""}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <CardTitle className="text-xl">{tierInfo.name}</CardTitle>
                                {isCurrent && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Current</span>}
                              </div>
                              <CardDescription className="text-lg font-display text-foreground">{tierInfo.price}/month</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                            {tierInfo.features.map(f => (
                              <div key={f} className="flex items-center gap-2">
                                <Check className={`w-4 h-4 ${isCurrent || !isLocked ? 'text-primary' : 'text-muted-foreground'}`} />
                                <span className={`text-sm ${isLocked ? 'text-muted-foreground' : ''}`}>{f}</span>
                              </div>
                            ))}
                          </div>
                          {!isCurrent && (
                            tierId === 'creative-economy-lab' ? (
                              <Button variant={isLocked ? "maroon" : "outline"} size="sm" asChild>
                                <a href="/apply">Apply for Lab Access <ExternalLink className="ml-2 w-4 h-4" /></a>
                              </Button>
                            ) : (
                              <Button variant={isLocked ? "maroon" : "outline"} size="sm" asChild>
                                <a href="https://www.patreon.com/modernnostalgiaclub" target="_blank" rel="noopener noreferrer">
                                  {isLocked ? 'Upgrade' : 'Manage on Patreon'} <ExternalLink className="ml-2 w-4 h-4" />
                                </a>
                              </Button>
                            )
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="text-center">
                <Button variant="outline" asChild>
                  <a href="https://www.patreon.com/modernnostalgiaclub" target="_blank" rel="noopener noreferrer">
                    Manage Membership on Patreon <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </motion.div>

              {/* Danger Zone */}
              <motion.div variants={fadeIn}>
                <Card variant="elevated" className="border-destructive/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>Irreversible actions that affect your account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="font-medium">Delete Account</p>
                        <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
                      </div>
                      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" className="shrink-0">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                              Delete Your Account?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2">
                              <p>This action is <strong>permanent and cannot be undone</strong>. All your data will be deleted.</p>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              {isDeleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Deleting...</> : 'Yes, Delete My Account'}
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
