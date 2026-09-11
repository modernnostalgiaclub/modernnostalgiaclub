import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import { CheckCircle, Send } from 'lucide-react';

const CLEARANCE = ['Yes, fully cleared and owned', 'Partly cleared', 'Not sure'];
const VOCAL_TYPES = ['Instrumental', 'Vocal', 'Both'];
const RELEASE_STATUS = ['Unreleased', 'Released', 'Coming soon'];

const emptyForm = {
  name: '',
  email: '',
  artist_name: '',
  song_title: '',
  song_url: '',
  genre: '',
  clearance: '',
  vocal_type: '',
  release_status: '',
  notes: '',
};

export default function PlaylistSubmission() {
  const [form, setForm] = useState(emptyForm);
  const [consent, setConsent] = useState(false);
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

    if (!form.name.trim() || !form.email.trim() || !form.artist_name.trim() || !form.song_title.trim() || !form.song_url.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    try {
      const parsed = new URL(form.song_url.trim());
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('bad');
    } catch {
      toast({ title: 'Please enter a valid link to your song', variant: 'destructive' });
      return;
    }
    if (!consent) {
      toast({ title: 'Please confirm we can share your song with supervisors', variant: 'destructive' });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('playlist-submission-submit', {
        body: { ...form, consent: true, ...getSubmissionData() },
      });
      if (error || (data as { error?: string } | null)?.error) throw error || new Error('Failed');
      triggerCooldown();
      setForm(emptyForm);
      setConsent(false);
      setSubmitted(true);
    } catch {
      toast({ title: 'Could not send your submission', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Submit Your Music to Our Playlists | Modern Nostalgia Club</title>
        <meta
          name="description"
          content="Submit your song for our curated playlists, reviewed by music supervisors, editors, directors and screenwriters."
        />
        <link rel="canonical" href="https://modernnostalgia.club/playlist-submit" />
        <meta property="og:title" content="Submit Your Music to Our Playlists" />
        <meta property="og:description" content="Send your song for playlist consideration at Modern Nostalgia Club." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-6 py-16 max-w-2xl">
          <h1 className="font-anton text-4xl md:text-6xl uppercase tracking-tight leading-[1.05] text-gray-900">
            Submit to Our Playlists
          </h1>
          <p className="mt-4 text-gray-600">
            Our curated playlists are frequently reviewed by screenwriters, directors, music supervisors and editors.
            Send us your song and we will listen.
          </p>

          {submitted ? (
            <div className="mt-10 rounded-lg border border-gray-200 p-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-poppins text-xl font-semibold text-gray-900">Submission received</h2>
              <p className="mt-2 text-sm text-gray-600">
                Thanks for sending your music. We only reply when a song is a fit for a playlist or a placement.
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
                  <Label htmlFor="artist" className="text-sm font-semibold text-gray-900">Artist name *</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="artist" value={form.artist_name} maxLength={120} onChange={(e) => set('artist_name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="song" className="text-sm font-semibold text-gray-900">Song title *</Label>
                  <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="song" value={form.song_title} maxLength={200} onChange={(e) => set('song_title', e.target.value)} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link" className="text-sm font-semibold text-gray-900">Link to the song *</Label>
                <Input
                  className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12"
                  id="link"
                  value={form.song_url}
                  maxLength={500}
                  onChange={(e) => set('song_url', e.target.value)}
                  placeholder="Spotify, DISCO, SoundCloud or a private link"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre" className="text-sm font-semibold text-gray-900">Genre / mood</Label>
                <Input className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12" id="genre" value={form.genre} maxLength={200} onChange={(e) => set('genre', e.target.value)} placeholder="e.g. soul, moody, cinematic" />
              </div>

              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">Fully cleared and owned by you?</Label>
                  <Select value={form.clearance} onValueChange={(v) => set('clearance', v)}>
                    <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {CLEARANCE.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">Instrumental or vocal?</Label>
                  <Select value={form.vocal_type} onValueChange={(v) => set('vocal_type', v)}>
                    <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {VOCAL_TYPES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-900">Release status</Label>
                  <Select value={form.release_status} onValueChange={(v) => set('release_status', v)}>
                    <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {RELEASE_STATUS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-900">Anything we should know about the song?</Label>
                <Textarea className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 resize-y" id="notes" rows={5} maxLength={1500} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
              </div>

              <div className="flex items-start gap-3">
                <Checkbox id="consent" checked={consent} onCheckedChange={(v) => setConsent(v === true)} />
                <Label htmlFor="consent" className="text-sm font-normal leading-snug text-gray-600">
                  I agree that Modern Nostalgia Club may share this song with music supervisors and playlist partners. *
                </Label>
              </div>

              <Button type="submit" size="lg" disabled={sending || isInCooldown}>
                <Send className="mr-2 h-4 w-4" />
                {sending ? 'Sending...' : 'Submit song'}
              </Button>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
