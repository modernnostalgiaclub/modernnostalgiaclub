import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, ShieldCheck, ShieldOff, Loader2, QrCode, KeyRound } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type MFAFactor = {
  id: string;
  friendly_name?: string;
  factor_type: string;
  status: 'verified' | 'unverified';
};

type EnrollmentState = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export function TwoFactorSettings() {
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollment, setEnrollment] = useState<EnrollmentState | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [factorToDisable, setFactorToDisable] = useState<string | null>(null);

  const fetchFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        console.error('Error fetching MFA factors:', error);
        return;
      }
      setFactors(data.totp || []);
    } catch (error) {
      console.error('Error fetching MFA factors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactors();
  }, []);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data) {
        setEnrollment({
          factorId: data.id,
          qrCode: data.totp.qr_code,
          secret: data.totp.secret,
        });
      }
    } catch (error) {
      console.error('Error enrolling MFA:', error);
      toast.error('Failed to start 2FA enrollment');
    } finally {
      setEnrolling(false);
    }
  };

  const handleVerifyEnrollment = async () => {
    if (!enrollment || !verifyCode.trim()) return;

    setVerifying(true);
    try {
      // Challenge the factor first
      const challengeResponse = await supabase.auth.mfa.challenge({
        factorId: enrollment.factorId,
      });

      if (challengeResponse.error) {
        toast.error(challengeResponse.error.message);
        return;
      }

      // Verify the code
      const verifyResponse = await supabase.auth.mfa.verify({
        factorId: enrollment.factorId,
        challengeId: challengeResponse.data.id,
        code: verifyCode.trim(),
      });

      if (verifyResponse.error) {
        toast.error(verifyResponse.error.message);
        return;
      }

      toast.success('Two-factor authentication enabled successfully!');
      setEnrollment(null);
      setVerifyCode('');
      fetchFactors();
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast.error('Failed to verify code');
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelEnrollment = async () => {
    if (enrollment) {
      // Unenroll the unverified factor
      await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId });
    }
    setEnrollment(null);
    setVerifyCode('');
  };

  const handleDisable = async () => {
    if (!factorToDisable) return;

    setDisabling(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factorToDisable,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('Two-factor authentication disabled');
      setShowDisableDialog(false);
      setFactorToDisable(null);
      fetchFactors();
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast.error('Failed to disable 2FA');
    } finally {
      setDisabling(false);
    }
  };

  const verifiedFactors = factors.filter(f => f.status === 'verified');
  const is2FAEnabled = verifiedFactors.length > 0;

  if (loading) {
    return (
      <Card variant="elevated">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className={is2FAEnabled ? 'border-green-500/30' : 'border-amber-500/30'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {is2FAEnabled ? (
            <ShieldCheck className="w-5 h-5 text-green-500" />
          ) : (
            <Shield className="w-5 h-5 text-amber-500" />
          )}
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {is2FAEnabled
            ? 'Your account is protected with an authenticator app'
            : 'Add an extra layer of security to your admin account'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show enrollment flow */}
        {enrollment ? (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <QrCode className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Scan this QR code with your authenticator app</p>
                  <p className="text-xs text-muted-foreground">
                    Use Google Authenticator, Authy, 1Password, or any TOTP-compatible app
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center py-4">
                <div className="bg-white p-3 rounded-lg">
                  <img 
                    src={enrollment.qrCode} 
                    alt="QR Code for 2FA setup" 
                    className="w-48 h-48"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <KeyRound className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Or enter this secret manually:</p>
                  <code className="text-xs bg-background px-2 py-1 rounded font-mono break-all">
                    {enrollment.secret}
                  </code>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verify-code">Enter the 6-digit code from your app</Label>
              <div className="flex gap-2">
                <Input
                  id="verify-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  className="font-mono text-center text-lg tracking-widest"
                />
                <Button 
                  onClick={handleVerifyEnrollment}
                  disabled={verifyCode.length !== 6 || verifying}
                >
                  {verifying ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>

            <Button 
              variant="ghost" 
              onClick={handleCancelEnrollment}
              className="w-full"
            >
              Cancel Setup
            </Button>
          </div>
        ) : is2FAEnabled ? (
          /* Show enabled state */
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-500">2FA is enabled</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setFactorToDisable(verifiedFactors[0].id);
                  setShowDisableDialog(true);
                }}
              >
                <ShieldOff className="w-4 h-4 mr-2" />
                Disable
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              You'll need to enter a code from your authenticator app when signing in to verify your identity.
            </p>
          </div>
        ) : (
          /* Show setup prompt */
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app in addition to your password.
            </p>
            <Button onClick={handleEnroll} disabled={enrolling}>
              {enrolling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Enable Two-Factor Authentication
                </>
              )}
            </Button>
          </div>
        )}

        {/* Disable confirmation dialog */}
        <AlertDialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ShieldOff className="w-5 h-5 text-destructive" />
                Disable Two-Factor Authentication?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the extra security layer from your account. You can re-enable it at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={disabling}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDisable}
                disabled={disabling}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {disabling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Disabling...
                  </>
                ) : (
                  'Disable 2FA'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
