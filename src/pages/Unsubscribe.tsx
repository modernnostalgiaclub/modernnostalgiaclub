import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type State = 'loading' | 'valid' | 'invalid' | 'done' | 'submitting';

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('invalid');
      setMessage('This unsubscribe link is missing its code.');
      return;
    }
    const validate = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
        );
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.valid !== false) {
          if (data?.already_unsubscribed) {
            setState('done');
            setMessage('You are already unsubscribed.');
          } else {
            setState('valid');
          }
        } else {
          setState('invalid');
          setMessage('This unsubscribe link is no longer valid.');
        }
      } catch {
        setState('invalid');
        setMessage('We could not check this link. Please try again later.');
      }
    };
    validate();
  }, [token]);

  const confirm = async () => {
    setState('submitting');
    const { error } = await supabase.functions.invoke('handle-email-unsubscribe', {
      body: { token },
    });
    if (error) {
      setState('invalid');
      setMessage('Something went wrong. Please try again later.');
    } else {
      setState('done');
      setMessage('You have been unsubscribed.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center border border-border rounded-lg p-8">
        <h1 className="font-anton text-2xl uppercase tracking-tight mb-4">Unsubscribe</h1>

        {(state === 'loading' || state === 'submitting') && (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
        )}

        {state === 'valid' && (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Confirm that you no longer want to receive emails from us.
            </p>
            <Button className="w-full" onClick={confirm}>Confirm unsubscribe</Button>
          </>
        )}

        {state === 'done' && (
          <div className="space-y-3">
            <CheckCircle className="w-8 h-8 text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">{message || 'You have been unsubscribed.'}</p>
          </div>
        )}

        {state === 'invalid' && (
          <div className="space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
