import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, AlertTriangle } from 'lucide-react';

interface ReauthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  actionLabel?: string;
  destructive?: boolean;
}

/**
 * Re-authentication dialog for sensitive admin actions.
 * Requires MFA code verification before allowing the action to proceed.
 */
export function ReauthDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Confirm Sensitive Action',
  description = 'This action requires re-authentication. Please enter your 2FA code to continue.',
  actionLabel = 'Confirm',
  destructive = false,
}: ReauthDialogProps) {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    if (code.length !== 6) return;

    setVerifying(true);
    setError('');

    try {
      // Get the TOTP factors
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
      
      if (factorsError) {
        setError(factorsError.message);
        setVerifying(false);
        return;
      }

      const totpFactor = factorsData.totp?.find(f => f.status === 'verified');
      
      if (!totpFactor) {
        setError('No verified authenticator found. Please set up 2FA first.');
        setVerifying(false);
        return;
      }

      // Challenge the factor
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: totpFactor.id,
      });

      if (challengeError) {
        setError(challengeError.message);
        setVerifying(false);
        return;
      }

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: totpFactor.id,
        challengeId: challengeData.id,
        code: code.trim(),
      });

      if (verifyError) {
        setError('Invalid code. Please try again.');
        setVerifying(false);
        return;
      }

      // Success - proceed with the action
      setCode('');
      onOpenChange(false);
      onConfirm();
    } catch (err) {
      console.error('Re-auth verification error:', err);
      setError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {destructive ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <Shield className="w-5 h-5 text-primary" />
            )}
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reauth-code">Authenticator Code</Label>
            <Input
              id="reauth-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && code.length === 6) {
                  handleVerify();
                }
              }}
              className="font-mono text-center text-xl tracking-[0.3em]"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the 6-digit code from your authenticator app to confirm this action.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={verifying}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleVerify}
            disabled={code.length !== 6 || verifying}
            variant={destructive ? 'destructive' : 'default'}
          >
            {verifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
