import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import logoMnc from '@/assets/logo-mnc.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, X, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PLAN_OPTIONS = [
  { value: 'club-pass', label: 'Club Pass ($10/mo)' },
  { value: 'accelerator', label: 'Accelerator ($50/mo)' },
];

const PLAN_LABELS: Record<string, string> = {
  'club-pass': 'Club Pass',
  'accelerator': 'Accelerator',
  'artist-incubator': 'Artist Incubator',
};

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const planParam = searchParams.get('plan');

  const [accountType, setAccountType] = useState(planParam && PLAN_OPTIONS.some(p => p.value === planParam) ? planParam : '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [subscribe, setSubscribe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const selectedPlan = accountType || planParam || '';

  useEffect(() => {
    if (user) {
      navigate(selectedPlan ? `/checkout?plan=${selectedPlan}` : '/dashboard', { replace: true });
    }
  }, [user, navigate, selectedPlan]);

  const handleGoogleSignUp = async () => {
    if (!accountType) {
      toast({ title: 'Select an account type', description: 'Please choose a membership plan before continuing.', variant: 'destructive' });
      return;
    }
    setGoogleLoading(true);
    try {
      const redirectUri = `${window.location.origin}/checkout?plan=${accountType}`;
      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: redirectUri,
      });
      if (error) throw error;
    } catch (error: any) {
      toast({ title: 'Google sign-up failed', description: error.message, variant: 'destructive' });
      setGoogleLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountType) {
      toast({ title: 'Select an account type', description: 'Please choose a membership plan.', variant: 'destructive' });
      return;
    }
    if (!agreeTerms) {
      toast({ title: 'Terms required', description: 'You must agree to the Terms of Service and Privacy Policy.', variant: 'destructive' });
      return;
    }
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            subscribe_newsletter: subscribe,
          },
          emailRedirectTo: `${window.location.origin}/checkout?plan=${accountType}`,
        },
      });
      if (error) throw error;
      toast({
        title: 'Check your email',
        description: 'We sent you a confirmation link to verify your account.',
      });
    } catch (error: any) {
      toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12 relative">
      <Link
        to={selectedPlan ? `/join` : '/'}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        aria-label="Close"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </Link>

      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <img src={logoMnc} alt="ModernNostalgia.club" className="h-14 w-auto" />
        </Link>

        <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900 mb-1" style={{ fontFamily: 'Anton, sans-serif' }}>
          Create Account
        </h1>
        <p className="text-sm text-gray-600 mb-8">
          Sign up to access courses, community, and member-only resources.
        </p>

        <form onSubmit={handleSignUp} className="space-y-5">
          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="account-type" className="text-sm font-semibold text-foreground">
              Account Type <span className="text-red-500">*</span>
            </Label>
            <Select value={accountType} onValueChange={setAccountType}>
              <SelectTrigger id="account-type" className="h-12 bg-white border-border text-foreground">
                <SelectValue placeholder="Select a membership plan" />
              </SelectTrigger>
              <SelectContent>
                {PLAN_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name" className="text-sm font-semibold text-foreground">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="first-name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                className="h-12 bg-white border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name" className="text-sm font-semibold text-foreground">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="last-name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                autoComplete="family-name"
                className="h-12 bg-white border-border"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-sm font-semibold text-foreground">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-12 bg-white border-border"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-sm font-semibold text-foreground">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="h-12 bg-white border-border pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
          </div>

          {/* Newsletter */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="subscribe"
              checked={subscribe}
              onCheckedChange={(checked) => setSubscribe(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="subscribe" className="text-sm text-muted-foreground font-normal cursor-pointer leading-snug">
              Subscribe for updates, drops, and announcements.
            </Label>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree-terms"
              checked={agreeTerms}
              onCheckedChange={(checked) => setAgreeTerms(checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="agree-terms" className="text-sm text-muted-foreground font-normal cursor-pointer leading-snug">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline" target="_blank">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>
              {' '}<span className="text-red-500">*</span>
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold uppercase tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-muted-foreground">or</span>
          </div>
        </div>

        {/* Google */}
        <Button
          variant="outline"
          className="w-full h-12 text-base font-medium border-border hover:border-foreground/30 bg-white hover:bg-muted text-foreground flex items-center gap-3"
          onClick={handleGoogleSignUp}
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

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link
            to={selectedPlan ? `/login?redirect=/checkout&plan=${selectedPlan}` : '/login'}
            className="font-semibold text-foreground hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
