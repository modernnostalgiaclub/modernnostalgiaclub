import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import logoMnc from '@/assets/logo-mnc.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const { user, signInWithPatreon } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const loginInputClassName = 'auth-input-clean h-12';

  const redirectTo = searchParams.get('redirect');

  useEffect(() => {
    if (user) navigate(redirectTo || '/dashboard', { replace: true });
  }, [user, navigate, redirectTo]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const redirectUri = redirectTo 
        ? `${window.location.origin}${redirectTo}${searchParams.get('plan') ? `?plan=${searchParams.get('plan')}` : ''}`
        : window.location.origin;
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: redirectUri,
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: 'Google sign-in failed', description: error.message, variant: 'destructive' });
      setGoogleLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast({ title: 'Enter your email first', variant: 'destructive' });
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({ title: 'Password reset email sent', description: 'Check your inbox for the reset link.' });
    } catch (error: any) {
      toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
    } finally {
      setResetLoading(false);
    }
  };

  const handlePatreon = async () => {
    try {
      await signInWithPatreon();
    } catch (error) {
      toast({ title: 'Patreon login failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 relative">
      <Link
        to="/"
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-gray-600" />
      </Link>

      <Link to="/" className="mb-8">
        <img src={logoMnc} alt="ModernNostalgia.club" className="h-16 w-auto" />
      </Link>

      <div className="w-full max-w-sm space-y-5">
        <Button
          variant="outline"
          className="w-full h-12 text-base font-medium border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-900 hover:text-gray-900 flex items-center gap-3"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">or</span>
          </div>
        </div>

        <Button variant="patreon" className="w-full h-12 text-base font-medium" onClick={handlePatreon}>
          Continue with Patreon
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email" className="text-gray-700">Email</Label>
            <Input
              id="signin-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={loginInputClassName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password" className="text-gray-700">Password</Label>
            <Input
              id="signin-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={loginInputClassName}
            />
          </div>
          <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
          </Button>
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors w-full text-center"
          >
            {resetLoading ? 'Sending…' : 'Forgot password?'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Not a member?{' '}
          <Link to="/join" className="underline hover:text-gray-700">Join the Club</Link>
        </p>
      </div>
    </div>
  );
}
