import { useState } from 'react';
import { z } from 'zod';
import { CheckCircle, Clock, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const emailSchema = z.string().trim().email('Please enter a valid email address').max(255);

interface Props {
  variant?: 'card' | 'footer';
}

export function LabUpdatesSignup({ variant = 'card' }: Props) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const antiSpam = useAntiSpam({ storageKey: 'lab_updates_cooldown', cooldownMs: 15000 });
  const isFooter = variant === 'footer';
  const disabled = submitting || antiSpam.isInCooldown;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const spamError = antiSpam.validate();
    if (spamError) {
      toast.error(spamError);
      return;
    }
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('capture-download-email', {
        body: {
          email: parsed.data.toLowerCase(),
          trackId: 'lab-updates',
          trackTitle: 'Lab events and resources updates',
          ...antiSpam.getSubmissionData(),
        },
      });
      if (error) throw error;
      antiSpam.triggerCooldown();
      setDone(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const form = (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-2" aria-label="Lab events and resources email signup">
      <input {...antiSpam.honeypotProps} />
      <label htmlFor={`lab-updates-email-${variant}`} className="sr-only">Email address</label>
      <Input
        id={`lab-updates-email-${variant}`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        maxLength={255}
        disabled={disabled}
        className={isFooter ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40 h-10' : 'h-11 bg-white'}
      />
      <Button type="submit" disabled={disabled} className="h-10 sm:h-auto sm:px-6 flex-shrink-0">
        {antiSpam.isInCooldown ? (
          <><Clock className="w-4 h-4 mr-1" />{antiSpam.cooldownRemaining}s</>
        ) : submitting ? '...' : 'Subscribe'}
      </Button>
    </form>
  );

  const doneMsg = (
    <div className={`flex items-center gap-2 ${isFooter ? 'text-white' : 'text-foreground'}`} role="status">
      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
      <span className="text-sm font-semibold">You're on the list. Check your inbox for a quick hello.</span>
    </div>
  );

  if (isFooter) {
    return (
      <div className="mt-10 pt-8 border-t border-white/10">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-white mb-1">Not ready for Patreon? Get Lab events and resources by email.</p>
          <p className="text-xs text-white/60 mb-3">Events and resources only. Unsubscribe anytime.</p>
          {done ? doneMsg : form}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white py-14 border-t border-border/30" aria-labelledby="lab-updates-heading">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center rounded-2xl border border-border bg-muted/40 p-8">
          <Mail className="w-6 h-6 text-primary mx-auto mb-3" aria-hidden="true" />
          <h2 id="lab-updates-heading" className="font-poppins text-xl font-bold mb-2 text-foreground">
            Not ready for Patreon yet?
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Get upcoming Lab events and resources by email. Events and resources only. Unsubscribe anytime.
          </p>
          {done ? <div className="flex justify-center">{doneMsg}</div> : form}
        </div>
      </div>
    </section>
  );
}
