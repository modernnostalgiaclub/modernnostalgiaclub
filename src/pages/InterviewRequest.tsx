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
import { CheckCircle, Mic } from 'lucide-react';

const RELEASE_STATUSES = ['Unreleased', 'Recently released', 'Coming soon', 'Catalog artist'];

const emptyForm = {
  name: '',
  email: '',
  artist_name: '',
  genre: '',
  location: '',
  links: '',
  story: '',
  topics: '',
  release_status: '',
  availability: '',
  referral_source: '',
};

export default function InterviewRequest() {
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

    if (!form.name.trim() || !form.email.trim() || !form.artist_name.trim() || !form.story.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('interview-request-submit', {
        body: { ...form, ...getSubmissionData() },
      });
      if (error || (data as { error?: string } | null)?.error) throw error || new Error('Failed');
      triggerCooldown();
      setForm(emptyForm);
      setSubmitted(true);
    } catch {
      toast({ title: 'Could not send your request', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Get Interviewed | Modern Nostalgia Club</title>
        <meta
          name="description"
          content="Artists: request an interview with Modern Nostalgia Club for our Patreon features. Tell us your story and what you want to talk about."
        />
        <link rel="canonical" href="https://modernnostalgia.club/interview" />
        <meta property="og:title" content="Get Interviewed | Modern Nostalgia Club" />
        <meta property="og:description" content="Request an artist interview for Modern Nostalgia Club Patreon features." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-6 py-16 max-w-2xl">
          <h1 className="font-anton text-4xl md:text-6xl uppercase tracking-tight leading-[1.05] text-gray-900">
            Get Interviewed
          </h1>
          <p className="mt-4 text-gray-600">
            We feature independent artists in interviews on our Patreon. Tell us who you are, what you're working on,
            and the story you want to tell. We read every request and reach out if it's a fit.
          </p>

          {submitted ? (
            <div className="mt-10 rounded-lg border border-gray-200 p-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-poppins text-xl font-semibold text-gray-900">Request received</h2>
              <p className="mt-2 text-sm text-gray-600">
                Thanks for sharing your story. If it's a fit, we'll email you to set up the interview.
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
                  <Label htmlFor="artist_name" className="text-sm font-semibold text-gray-900">Artist name *</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="artist_name" value={form.artist_name} maxLength={100} onChange={(e) => set('artist_name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-sm font-semibold text-gray-900">Genre / style</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="genre" value={form.genre} maxLength={100} onChange={(e) => set('genre', e.target.value)} placeholder="e.g. R&B, hip-hop, alt pop" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-semibold text-gray-900">Where are you based?</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="location" value={form.location} maxLength={120} onChange={(e) => set('location', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">Release status</Label>
                  <Select value={form.release_status} onValueChange={(v) => set('release_status', v)}>
                    <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {RELEASE_STATUSES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="links" className="text-sm font-semibold text-gray-900">Links to your music</Label>
                <Textarea className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 resize-y" id="links" rows={2} maxLength={1000} value={form.links} onChange={(e) => set('links', e.target.value)} placeholder="Spotify, DISCO, SoundCloud, website, socials" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="story" className="text-sm font-semibold text-gray-900">Your story *</Label>
                <Textarea className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 resize-y" id="story" rows={6} maxLength={3000} value={form.story} onChange={(e) => set('story', e.target.value)} placeholder="Who are you, what are you building, and why should we talk?" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topics" className="text-sm font-semibold text-gray-900">Topics you'd love to cover</Label>
                <Textarea className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 resize-y" id="topics" rows={3} maxLength={1000} value={form.topics} onChange={(e) => set('topics', e.target.value)} placeholder="e.g. sync licensing, ownership, your creative process" />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="availability" className="text-sm font-semibold text-gray-900">Availability</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="availability" value={form.availability} maxLength={300} onChange={(e) => set('availability', e.target.value)} placeholder="e.g. weekday mornings PT" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referral" className="text-sm font-semibold text-gray-900">How did you hear about us?</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="referral" value={form.referral_source} maxLength={200} onChange={(e) => set('referral_source', e.target.value)} />
                </div>
              </div>

              <Button type="submit" size="lg" disabled={sending || isInCooldown}>
                <Mic className="mr-2 h-4 w-4" />
                {sending ? 'Sending...' : 'Request an interview'}
              </Button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
