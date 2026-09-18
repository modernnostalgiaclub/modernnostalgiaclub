import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import { CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';

const CATALOG_SIZES = ['Under 5 songs', '5 to 10 songs', '10 to 25 songs', '25 to 50 songs', '50+ songs'];
const OWNERSHIP = ['I own everything', 'Mostly mine, some co-writes', 'Shared with a label or publisher', 'Not sure'];
const SPLITS = ['Yes, all documented', 'Some documented', 'None documented', 'Not sure'];

interface Props {
  onContinueToPayment: (email?: string) => void;
  disabled?: boolean;
}

export function CatalogAuditForm({ onContinueToPayment, disabled }: Props) {
  const { toast } = useToast();
  const { isInCooldown, honeypotProps, validate, triggerCooldown, getSubmissionData } = useAntiSpam({ cooldownMs: 15000 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    artist_name: '',
    catalog_size: '',
    catalog_link: '',
    ownership_status: '',
    splits_documented: '',
    pro_affiliation: '',
    goals: '',
    notes: '',
  });

  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const spamError = validate();
    if (spamError) {
      toast({ title: 'Please wait', description: spamError, variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('catalog-audit-submit', {
        body: { ...form, ...getSubmissionData() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      triggerCooldown();
      setSubmitted(true);
      toast({ title: 'Catalog details received', description: 'Check your email for a confirmation.' });
      onContinueToPayment(form.email);
    } catch (err) {
      toast({
        title: 'Something went wrong',
        description: err instanceof Error ? err.message : 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <CheckCircle2 className="w-10 h-10 text-maroon mx-auto mb-4" />
        <h3 className="text-2xl font-display mb-2">Catalog details received</h3>
        <p className="text-muted-foreground mb-6">
          A confirmation is on its way to {form.email}. Finish checkout to lock in your audit slot.
        </p>
        <Button variant="maroon" size="lg" className="w-full" onClick={() => onContinueToPayment(form.email)}>
          Continue to payment - $249
          <ExternalLink className="w-5 h-5 ml-2" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="text-left space-y-5">
      <input {...honeypotProps} />

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ca-name">Your name *</Label>
          <Input id="ca-name" required maxLength={100} value={form.full_name} onChange={(e) => set('full_name')(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ca-email">Email *</Label>
          <Input id="ca-email" type="email" required value={form.email} onChange={(e) => set('email')(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ca-artist">Artist or project name</Label>
          <Input id="ca-artist" maxLength={120} value={form.artist_name} onChange={(e) => set('artist_name')(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ca-pro">PRO (ASCAP, BMI, etc.)</Label>
          <Input id="ca-pro" maxLength={120} value={form.pro_affiliation} onChange={(e) => set('pro_affiliation')(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>How many finished songs?</Label>
          <Select value={form.catalog_size} onValueChange={set('catalog_size')}>
            <SelectTrigger><SelectValue placeholder="Choose one" /></SelectTrigger>
            <SelectContent>
              {CATALOG_SIZES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Who controls the songs?</Label>
          <Select value={form.ownership_status} onValueChange={set('ownership_status')}>
            <SelectTrigger><SelectValue placeholder="Choose one" /></SelectTrigger>
            <SelectContent>
              {OWNERSHIP.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Are your splits documented?</Label>
          <Select value={form.splits_documented} onValueChange={set('splits_documented')}>
            <SelectTrigger><SelectValue placeholder="Choose one" /></SelectTrigger>
            <SelectContent>
              {SPLITS.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="ca-link">Link to your catalog</Label>
          <Input
            id="ca-link"
            type="url"
            placeholder="DISCO, Spotify, Drive, SoundCloud"
            value={form.catalog_link}
            onChange={(e) => set('catalog_link')(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ca-goals">What do you want out of this audit? *</Label>
        <Textarea id="ca-goals" required rows={4} maxLength={2000} value={form.goals} onChange={(e) => set('goals')(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ca-notes">Anything else we should know?</Label>
        <Textarea id="ca-notes" rows={3} maxLength={1500} value={form.notes} onChange={(e) => set('notes')(e.target.value)} />
      </div>

      <Button type="submit" variant="maroon" size="lg" className="w-full" disabled={submitting || isInCooldown || disabled}>
        {submitting ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending your details</>) : 'Send details and continue to payment'}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        You will be taken to secure checkout right after your details are saved.
      </p>
    </form>
  );
}
