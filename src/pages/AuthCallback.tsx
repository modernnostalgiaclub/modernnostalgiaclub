import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Processing your Patreon login...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(`Patreon authorization failed: ${errorParam}`);
        return;
      }

      if (!code) {
        setError('No authorization code received from Patreon');
        return;
      }

      try {
        setStatus('Verifying your Patreon membership...');
        
        const redirectUri = `${window.location.origin}/auth/patreon/callback`;
        
        // Call the edge function to handle the OAuth callback
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/patreon-auth?action=callback&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to complete Patreon authentication');
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Authentication failed');
        }

        setStatus('Signing you in...');

        // Sign in using the token hash
        if (data.token_hash && data.email) {
          const { error: signInError } = await supabase.auth.verifyOtp({
            email: data.email,
            token: data.token_hash,
            type: 'magiclink',
          });

          if (signInError) {
            console.error('Sign in error:', signInError);
            // Try alternative sign in method - directly set session if available
            throw new Error('Failed to complete sign in. Please try again.');
          }
        }

        setStatus('Welcome to ModernNostalgia.club!');
        
        // Redirect to dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header showNav={false} />
      
      <main className="pt-24 pb-16 flex items-center justify-center">
        <div className="container mx-auto px-6">
          <Card variant="elevated" className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              {error ? (
                <div className="space-y-4">
                  <div className="text-destructive text-lg font-medium">
                    Authentication Error
                  </div>
                  <p className="text-muted-foreground">{error}</p>
                  <button
                    onClick={() => navigate('/')}
                    className="text-primary hover:text-maroon-glow transition-colors"
                  >
                    Return to Home
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-lg font-medium">{status}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}