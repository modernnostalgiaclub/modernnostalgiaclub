import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import logoCream from '@/assets/logo-cream.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  // MFA state
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaVerifying, setMfaVerifying] = useState(false);
  const [mfaError, setMfaError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await checkMfa();
        setReady(true);
      }
    };

    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      // Session will be set by the client; wait for auth state change
    } else {
      checkSession();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        await checkMfa();
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const checkMfa = async () => {
    try {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (data?.nextLevel === 'aal2' && data?.currentLevel !== 'aal2') {
        setMfaRequired(true);
      }
    } catch {
      // ignore — MFA check failure shouldn't block password reset
    }
  };

  const handleMfaVerify = async () => {
    if (mfaCode.length !== 6) return;
    setMfaVerifying(true);
    setMfaError('');
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factorsData.totp.find(f => f.status === 'verified');
      if (!totpFactor) throw new Error('No verified MFA factor found');

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: mfaCode.trim(),
      });
      if (verifyError) {
        setMfaError('Invalid code. Please try again.');
        return;
      }
      setMfaVerified(true);
      setMfaRequired(false);
    } catch (err: any) {
      setMfaError(err.message || 'Verification failed. Please try again.');
    } finally {
      setMfaVerifying(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/login');
    } catch (error: any) {
      toast({ title: 'Reset failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <Link to="/" className="mb-8">
        <img src={logoCream} alt="ModernNostalgia.club" className="h-16 w-auto" />
      </Link>

      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-display text-center text-foreground">Reset Your Password</h1>

        {!ready ? (
          <p className="text-center text-muted-foreground text-sm">
            Loading recovery session… If this persists, request a new reset link from the{' '}
            <Link to="/login" className="underline hover:text-foreground">login page</Link>.
          </p>
        ) : mfaRequired && !mfaVerified ? (
          /* MFA gate */
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your account has two-factor authentication enabled.<br />Enter your authenticator code to continue.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Authenticator Code</Label>
              <Input
                id="mfa-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={mfaCode}
                onChange={e => { setMfaCode(e.target.value.replace(/\D/g, '')); setMfaError(''); }}
                onKeyDown={e => { if (e.key === 'Enter' && mfaCode.length === 6) handleMfaVerify(); }}
                className="font-mono text-center text-2xl tracking-[0.5em] h-14"
                autoFocus
              />
              {mfaError && <p className="text-sm text-destructive">{mfaError}</p>}
            </div>
            <Button
              onClick={handleMfaVerify}
              disabled={mfaCode.length !== 6 || mfaVerifying}
              className="w-full"
            >
              {mfaVerifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : 'Verify'}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" variant="maroon" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Password'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
