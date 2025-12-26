import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, Loader2, ExternalLink } from 'lucide-react';
import { MFAVerification } from './MFAVerification';
import { useNavigate } from 'react-router-dom';

interface AdminMFAGateProps {
  children: React.ReactNode;
}

/**
 * Gate component that enforces MFA for admin users.
 * If admin doesn't have MFA enabled, shows a prompt to set it up.
 * If admin has MFA but hasn't verified this session, shows verification.
 */
export function AdminMFAGate({ children }: AdminMFAGateProps) {
  const { hasRole, mfaVerified, refreshMFAStatus } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasMFAEnrolled, setHasMFAEnrolled] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    checkMFAEnrollment();
  }, [isAdmin]);

  const checkMFAEnrollment = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) {
        console.error('Error checking MFA factors:', error);
        setLoading(false);
        return;
      }

      const verifiedFactors = data.totp?.filter(f => f.status === 'verified') || [];
      const hasEnrolled = verifiedFactors.length > 0;
      setHasMFAEnrolled(hasEnrolled);

      // Check if they need to verify (have MFA but session isn't aal2)
      if (hasEnrolled) {
        const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        const needsToVerify = aalData?.currentLevel === 'aal1' && aalData?.nextLevel === 'aal2';
        setNeedsVerification(needsToVerify);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking MFA enrollment:', error);
      setLoading(false);
    }
  };

  const handleVerified = async () => {
    await refreshMFAStatus();
    setNeedsVerification(false);
  };

  // Non-admin users pass through
  if (!isAdmin) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Admin without MFA enrolled - require setup
  if (!hasMFAEnrolled) {
    return (
      <div className="min-h-screen bg-background studio-grain flex items-center justify-center p-4">
        <Card variant="elevated" className="w-full max-w-md border-amber-500/30">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8 text-amber-500" />
            </div>
            <CardTitle>Two-Factor Authentication Required</CardTitle>
            <CardDescription>
              Admin accounts must have 2FA enabled for security. Please set up two-factor authentication to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Why is this required?</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Admin accounts have access to sensitive user data</li>
                <li>2FA protects against unauthorized access</li>
                <li>It only takes a few minutes to set up</li>
              </ul>
            </div>
            <Button 
              onClick={() => navigate('/account')} 
              className="w-full gap-2"
            >
              <Shield className="w-4 h-4" />
              Set Up 2FA Now
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin with MFA enrolled but not verified this session
  if (needsVerification && !mfaVerified) {
    return (
      <MFAVerification 
        onVerified={handleVerified}
        onCancel={() => navigate('/dashboard')}
      />
    );
  }

  // Admin with MFA verified - allow access
  return <>{children}</>;
}
