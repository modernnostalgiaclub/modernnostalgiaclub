import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, ChevronRight, Star, Shield, Zap, Users2, Mail, Lock } from 'lucide-react';
import logoCreamy from '@/assets/logo-cream.png';

const PERKS = [
  { icon: <Zap className="w-4 h-4" />, text: 'All features unlocked' },
  { icon: <Star className="w-4 h-4" />, text: 'Priority submission review' },
  { icon: <Users2 className="w-4 h-4" />, text: 'Strategy sessions' },
  { icon: <Shield className="w-4 h-4" />, text: 'All future upgrades included' },
];

export default function MigrateToGoogle() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'google' | 'email'>('google');
  const [signingIn, setSigningIn] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(true);
  const hasClaimed = useRef(false);

  const claimUpgrade = async (token: string) => {
    setClaiming(true);
    const patreonSourceUserId = sessionStorage.getItem('patreon_source_user_id');
    try {
      const { data, error } = await supabase.functions.invoke('claim-migration-upgrade', {
        headers: { Authorization: `Bearer ${token}` },
        body: patreonSourceUserId ? { patreon_source_user_id: patreonSourceUserId } : undefined,
      });
      if (error || data?.error) {
        toast.error(data?.error || 'Upgrade verification failed. Please contact support.');
        navigate('/dashboard');
        return;
      }
      if (data?.already_upgraded) {
        toast.info("You're already at the Creative Economy Lab tier!");
      } else {
        toast.success('🎉 Welcome to Creative Economy Lab! Your account has been upgraded.');
      }
      sessionStorage.removeItem('patreon_source_user_id');
      navigate('/dashboard');
    } catch {
      toast.error('Upgrade verification failed. Please contact support.');
      navigate('/dashboard');
    } finally {
      setClaiming(false);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !hasClaimed.current) {
        hasClaimed.current = true;
        setSession(data.session);
        claimUpgrade(data.session.access_token);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'SIGNED_IN' && s && !hasClaimed.current) {
        hasClaimed.current = true;
        setSession(s);
        claimUpgrade(s.access_token);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/migrate`,
      });
      if (result.error) {
        toast.error('Sign in failed. Please try again.');
        setSigningIn(false);
      }
    } catch {
      toast.error('Sign in failed. Please try again.');
      setSigningIn(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSigningIn(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.info('Check your email to confirm your account, then come back here.');
        setSigningIn(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange will handle the rest
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please try again.');
      setSigningIn(false);
    }
  };

  if (claiming) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying your membership...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo */}
        <div className="text-center">
          <Link to="/">
            <img src={logoCreamy} alt="Modern Nostalgia Club" className="h-10 mx-auto opacity-90" />
          </Link>
        </div>

        {/* Hero copy */}
        <div className="text-center space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl"
          >
            You've Been Here Since Day One.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-primary font-medium"
          >
            Here's Your Reward.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-sm leading-relaxed"
          >
            Sign in or create a new account — we'll link it to your Patreon membership and upgrade you to{' '}
            <strong className="text-foreground">Creative Economy Lab</strong> — free, permanently.
          </motion.p>
        </div>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3"
        >
          <p className="text-xs uppercase tracking-widest text-primary font-medium">What you get</p>
          <ul className="space-y-2.5">
            {PERKS.map((perk, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {perk.icon}
                </span>
                <span>{perk.text}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Auth Tabs + CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {!session ? (
            <>
              {/* Tab switcher */}
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setTab('google')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === 'google' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                >
                  Continue with Google
                </button>
                <button
                  onClick={() => setTab('email')}
                  className={`flex-1 py-2.5 text-sm font-medium transition-colors ${tab === 'email' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:text-foreground'}`}
                >
                  Use Email
                </button>
              </div>

              {tab === 'google' && (
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={signingIn}
                  size="lg"
                  className="w-full gap-3 text-base h-14"
                  variant="hero"
                >
                  {signingIn ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  {signingIn ? 'Signing in...' : 'Continue with Google'}
                  {!signingIn && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Button>
              )}

              {tab === 'email' && (
                <form onSubmit={handleEmailAuth} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-9"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder={isSignUp ? 'Create a password' : 'Your password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-9"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={signingIn}
                    size="lg"
                    className="w-full gap-2 text-base h-12"
                    variant="hero"
                  >
                    {signingIn && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSignUp ? 'Create Account & Claim Upgrade' : 'Sign In & Claim Upgrade'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
                  >
                    {isSignUp ? 'Already have an account? Sign in instead' : "Don't have an account? Sign up"}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-secondary-foreground">
              <CheckCircle2 className="w-4 h-4" />
              Signed in — verifying your membership...
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Your original Patreon membership is used to verify eligibility.
            If you have any issues, contact us at{' '}
            <a href="/contact" className="text-primary hover:underline">the support page</a>.
          </p>
        </motion.div>

        <div className="text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
