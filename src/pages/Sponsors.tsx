import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import { CheckCircle, Send } from 'lucide-react';

const PARTNERSHIP_TYPES = [
  'Event sponsorship',
  'Playlist / content sponsorship',
  'Product placement',
  'Artist support',
  'Other',
];
const BUDGETS = ['Under $500', '$500 - $2,500', '$2,500 - $10,000', '$10,000+', 'Not sure yet'];
const TIMELINES = ['This month', 'Next 1-3 months', 'Later this year', 'Flexible'];

const emptyForm = {
  name: '',
  email: '',
  company: '',
  website: '',
  role: '',
  partnership_type: '',
  budget_range: '',
  timeline: '',
  goals: '',
  referral_source: '',
};

export default function Sponsors() {
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { isInCooldown, honeypotProps, validate, triggerCooldown, getSubmissionData } = useAntiSpam({ cooldownMs: 15000 });

  const set = (field: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInCooldown) return;
    const spamError = validate();
    if (spamError) { toast({ title: spamError, variant: 'destructive' }); return; }

    if (!form.name.trim() || !form.email.trim() || !form.company.trim() || !form.goals.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('sponsor-inquiry-submit', {
        body: { ...form, ...getSubmissionData() },
      });
      if (error || (data as { error?: string } | null)?.error) throw error || new Error('Failed');
      triggerCooldown();
      setForm(emptyForm);
      setSubmitted(true);
    } catch {
      toast({ title: 'Could not send your inquiry', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Sponsor Modern Nostalgia Club | Partnership Inquiries</title>
        <meta
          name="description"
          content="Partner with Modern Nostalgia Club. Tell us about your brand, budget and goals and we will follow up with sponsorship options."
        />
        <link rel="canonical" href="https://modernnostalgia.club/sponsors" />
        <meta property="og:title" content="Sponsor Modern Nostalgia Club" />
        <meta property="og:description" content="Partnership and sponsorship inquiries for Modern Nostalgia Club." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-6 py-16 max-w-2xl">
          <h1 className="font-anton text-4xl md:text-6xl uppercase tracking-tight leading-[1.05] text-gray-900">
            Become a Sponsor
          </h1>
          <p className="mt-4 text-gray-600">
            We work with brands, labels and music tech partners on events, content and artist support. Tell us what you
            have in mind and we will get back to you.
          </p>

          {submitted ? (
            <div className="mt-10 rounded-lg border border-gray-200 p-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-poppins text-xl font-semibold text-gray-900">Thanks, we got it</h2>
              <p className="mt-2 text-sm text-gray-600">
                We review every inquiry and usually reply within a few business days.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <input {...honeypotProps} />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-900">Your name *</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="name" value={form.name} maxLength={100} onChange={(e) => set('name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-900">Email *</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="email" type="email" value={form.email} maxLength={255} onChange={(e) => set('email', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold text-gray-900">Company or brand *</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="company" value={form.company} maxLength={200} onChange={(e) => set('company', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-semibold text-gray-900">Website or social link</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="website" value={form.website} maxLength={300} onChange={(e) => set('website', e.target.value)} placeholder="https://" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-900">Role / title</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="role" value={form.role} maxLength={120} onChange={(e) => set('role', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referral" className="text-sm font-semibold text-gray-900">How did you hear about us?</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="referral" value={form.referral_source} maxLength={200} onChange={(e) => set('referral_source', e.target.value)} />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">Partnership type</Label>
                  <Select value={form.partnership_type} onValueChange={(v) => set('partnership_type', v)}>
                    <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {PARTNERSHIP_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">Estimated budget</Label>
                  <Select value={form.budget_range} onValueChange={(v) => set('budget_range', v)}>
                    <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {BUDGETS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">Timeline</Label>
                  <Select value={form.timeline} onValueChange={(v) => set('timeline', v)}>
                    <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {TIMELINES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals" className="text-sm font-semibold text-gray-900">Tell us about your goals *</Label>
                <Textarea className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 resize-y" id="goals" rows={6} maxLength={2000} value={form.goals} onChange={(e) => set('goals', e.target.value)} required />
              </div>

              <Button type="submit" size="lg" disabled={sending || isInCooldown}>
                <Send className="mr-2 h-4 w-4" />
                {sending ? 'Sending...' : 'Send inquiry'}
              </Button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
