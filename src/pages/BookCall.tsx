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
import { CalendarCheck, CheckCircle } from 'lucide-react';

const TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
];

const TOPICS = [
  'Sync licensing strategy',
  'Catalog audit',
  'Membership questions',
  'Production or beats',
  'Partnership or sponsorship',
  'Something else',
];

const emptyForm = {
  full_name: '',
  email: '',
  artist_name: '',
  phone: '',
  topic: '',
  preferred_date: '',
  preferred_time: '',
  alt_date: '',
  alt_time: '',
  notes: '',
};

const todayStr = new Date().toISOString().split('T')[0];
const inputClass = 'bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12';

export default function BookCall() {
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

    if (!form.full_name.trim() || !form.email.trim() || !form.preferred_date || !form.preferred_time) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data, error } = await supabase.functions.invoke('discovery-call-book', {
        body: { ...form, timezone, ...getSubmissionData() },
      });
      if (error || (data as { error?: string } | null)?.error) throw error || new Error('Failed');
      triggerCooldown();
      setForm(emptyForm);
      setSubmitted(true);
    } catch {
      toast({ title: 'Could not send your booking', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Book a Free Discovery Call | Modern Nostalgia Club</title>
        <meta
          name="description"
          content="Book a free 15-minute discovery call to talk through your catalog, sync goals and next steps with Modern Nostalgia Club."
        />
        <link rel="canonical" href="https://modernnostalgia.club/book-call" />
        <meta property="og:title" content="Book a Free Discovery Call" />
        <meta property="og:description" content="Pick a time and we will confirm your 15-minute discovery call by email." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-6 py-16 max-w-2xl">
          <h1 className="font-anton text-4xl md:text-6xl uppercase tracking-tight leading-[1.05] text-gray-900">
            Book a Discovery Call
          </h1>
          <p className="mt-4 text-gray-600">
            A free 15-minute call to talk through your catalog, your sync goals and the fastest next step.
            Pick a time that works and we will confirm by email.
          </p>

          {submitted ? (
            <div className="mt-10 rounded-lg border border-gray-200 p-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-poppins text-xl font-semibold text-gray-900">Booking request received</h2>
              <p className="mt-2 text-sm text-gray-600">
                Thanks. We will email you shortly to confirm your call time.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <input {...honeypotProps} />

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-semibold text-gray-900">Your name *</Label>
                  <Input className={inputClass} id="full_name" value={form.full_name} maxLength={100} onChange={(e) => set('full_name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-900">Email *</Label>
                  <Input className={inputClass} id="email" type="email" value={form.email} maxLength={255} onChange={(e) => set('email', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist_name" className="text-sm font-semibold text-gray-900">Artist or project name</Label>
                  <Input className={inputClass} id="artist_name" value={form.artist_name} maxLength={120} onChange={(e) => set('artist_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-900">Phone (optional)</Label>
                  <Input className={inputClass} id="phone" value={form.phone} maxLength={40} onChange={(e) => set('phone', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-900">What do you want to talk about?</Label>
                <Select value={form.topic} onValueChange={(v) => set('topic', v)}>
                  <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select a topic" /></SelectTrigger>
                  <SelectContent>
                    {TOPICS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-gray-50 p-5 space-y-6">
                <div className="flex items-center gap-2 text-gray-900 font-poppins font-semibold">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  Pick your time
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_date" className="text-sm font-semibold text-gray-900">Preferred date *</Label>
                    <Input className={inputClass} id="preferred_date" type="date" min={todayStr} value={form.preferred_date} onChange={(e) => set('preferred_date', e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Preferred time *</Label>
                    <Select value={form.preferred_time} onValueChange={(v) => set('preferred_time', v)}>
                      <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select a time" /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alt_date" className="text-sm font-semibold text-gray-900">Backup date</Label>
                    <Input className={inputClass} id="alt_date" type="date" min={todayStr} value={form.alt_date} onChange={(e) => set('alt_date', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Backup time</Label>
                    <Select value={form.alt_time} onValueChange={(v) => set('alt_time', v)}>
                      <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select a time" /></SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Times shown in your local timezone. Calls usually happen between 9am and 5pm Pacific.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-900">Anything we should know before the call?</Label>
                <Textarea className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 min-h-32" id="notes" value={form.notes} maxLength={1500} onChange={(e) => set('notes', e.target.value)} />
              </div>

              <Button type="submit" size="lg" variant="maroon" className="w-full" disabled={sending || isInCooldown}>
                {sending ? 'Sending...' : 'Request my call'}
              </Button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
