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
        className={isFooter ? 'bg-inverse/10 border-inverse/30 text-inverse placeholder:text-inverse-muted h-11' : 'h-11 rounded-none bg-paper text-ink border-rule placeholder:text-ink-muted'}
      />
      <Button type="submit" variant="editorial" disabled={disabled} className="h-11 sm:px-6 flex-shrink-0">
        {antiSpam.isInCooldown ? (
          <><Clock className="w-4 h-4 mr-1" />{antiSpam.cooldownRemaining}s</>
        ) : submitting ? '...' : 'Subscribe'}
      </Button>
    </form>
  );

  const doneMsg = (
    <div className={`flex items-center gap-2 ${isFooter ? 'text-inverse' : 'text-ink'}`} role="status">
      <CheckCircle className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-semibold">You're on the list. Check your inbox for a quick hello.</span>
    </div>
  );

  if (isFooter) {
    return (
      <div className="mt-10 pt-8 border-t border-inverse/10">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-inverse mb-1">Not ready for Patreon? Get Lab events and resources by email.</p>
          <p className="text-xs text-inverse-muted mb-3">Events and resources only. Unsubscribe anytime.</p>
          {done ? doneMsg : form}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-paper-muted py-14 md:py-20 border-t border-rule" aria-labelledby="lab-updates-heading">
      <div className="container mx-auto px-6">
        <div className="max-w-xl mx-auto text-center">
          <Mail className="w-6 h-6 text-khaki mx-auto mb-3" aria-hidden="true" />
          <h2 id="lab-updates-heading" className="font-serif text-2xl font-bold mb-3 text-ink">
            Not ready for Patreon yet?
          </h2>
          <p className="text-sm text-ink-muted mb-6">
            Get upcoming Lab events and resources by email. Events and resources only. Unsubscribe anytime.
          </p>
          {done ? <div className="flex justify-center">{doneMsg}</div> : form}
        </div>
      </div>
    </section>
  );
}
