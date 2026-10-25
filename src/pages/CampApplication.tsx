import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
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
import { CAMPS, CAMP_ATTENDANCE, CAMP_ROLES, type CampSlug } from '@/lib/camps';

const inputCls = 'bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12';
const areaCls = 'bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 resize-y';
const labelCls = 'text-sm font-semibold text-gray-900';

const emptyBase = { name: '', email: '', artist_name: '', heritage: '', city: '', attendance: '', links: '', why: '', referral_source: '' };

function Pick({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label className={labelCls}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-gray-100 border-0 text-gray-900 h-12"><SelectValue placeholder="Select" /></SelectTrigger>
        <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

export default function CampApplication() {
  const { camp } = useParams<{ camp: string }>();
  const [form, setForm] = useState(emptyBase);
  const [roles, setRoles] = useState<string[]>([]);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { isInCooldown, honeypotProps, validate, triggerCooldown, getSubmissionData } = useAntiSpam({ cooldownMs: 15000 });

  if (!camp || !(camp in CAMPS)) return <Navigate to="/camps" replace />;
  const slug = camp as CampSlug;
  const info = CAMPS[slug];

  const set = (k: keyof typeof emptyBase, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const setD = (k: string, v: string) => setDetails((p) => ({ ...p, [k]: v }));
  const toggleRole = (r: string) => setRoles((p) => (p.includes(r) ? p.filter((x) => x !== r) : [...p, r]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInCooldown) return;
    const spamError = validate();
    if (spamError) { toast({ title: spamError, variant: 'destructive' }); return; }
    if (!form.name.trim() || !form.email.trim() || !form.artist_name.trim() || !form.links.trim() || !form.why.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      toast({ title: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('camp-application-submit', {
        body: { camp: slug, ...form, roles, details, ...getSubmissionData() },
      });
      if (error || (data as { error?: string } | null)?.error) throw error || new Error('Failed');
      triggerCooldown();
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      toast({ title: 'Could not send your application', description: 'Please try again in a moment.', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const other: CampSlug = slug === 'sync-album' ? 'loop-pack' : 'sync-album';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>{`Apply: ${info.name} | Modern Nostalgia Club`}</title>
        <meta name="description" content={`Filipino artists, producers and instrumentalists: apply for the ${info.name}. ${info.pitch}`.slice(0, 160)} />
        <link rel="canonical" href={`https://modernnostalgia.club/camps/${slug}`} />
        <meta property="og:title" content={`Apply: ${info.name}`} />
        <meta property="og:description" content={info.pitch} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Header />
      <main className="flex-1 pt-20">
        <section className="container mx-auto px-6 py-16 max-w-2xl">
          <Link to="/camps" className="text-sm text-primary hover:underline">← All camps</Link>
          <h1 className="mt-4 font-anton text-4xl md:text-5xl uppercase tracking-tight leading-[1.15] text-gray-900">{info.name}</h1>
          <p className="mt-4 text-gray-600">{info.pitch}</p>

          {submitted ? (
            <div className="mt-10 rounded-lg border border-gray-200 p-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-poppins text-xl font-semibold text-gray-900">Application received</h2>
              <p className="mt-2 text-sm text-gray-600">Check your inbox for a confirmation. If it's a fit, we'll email you next steps.</p>
              <Button asChild variant="outline" className="mt-6">
                <Link to={`/camps/${other}`}>Also apply for the {CAMPS[other].short}</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <input {...honeypotProps} />
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className={labelCls}>Your name *</Label>
                  <Input id="name" className={inputCls} maxLength={100} value={form.name} onChange={(e) => set('name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className={labelCls}>Email *</Label>
                  <Input id="email" type="email" className={inputCls} maxLength={255} value={form.email} onChange={(e) => set('email', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="artist_name" className={labelCls}>Artist / stage name *</Label>
                  <Input id="artist_name" className={inputCls} maxLength={100} value={form.artist_name} onChange={(e) => set('artist_name', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className={labelCls}>Where are you based?</Label>
                  <Input id="city" className={inputCls} maxLength={120} value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
              </div>

              <fieldset className="space-y-3">
                <legend className={labelCls}>What do you do? (pick any)</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {CAMP_ROLES.map((r) => (
                    <label key={r} className="flex items-center gap-3 rounded-md bg-gray-100 px-4 py-3 text-sm text-gray-900 cursor-pointer">
                      <Checkbox checked={roles.includes(r)} onCheckedChange={() => toggleRole(r)} />
                      {r}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="heritage" className={labelCls}>Your Filipino heritage or connection</Label>
                <Input id="heritage" className={inputCls} maxLength={300} value={form.heritage} onChange={(e) => set('heritage', e.target.value)} placeholder="e.g. Fil-Am, born in Cebu, Ilocano roots" />
              </div>

              <Pick label="Can you attend in person?" value={form.attendance} options={CAMP_ATTENDANCE} onChange={(v) => set('attendance', v)} />

              {slug === 'sync-album' ? (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="genres" className={labelCls}>Genres you write in</Label>
                      <Input id="genres" className={inputCls} maxLength={200} value={details.genres || ''} onChange={(e) => setD('genres', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pro" className={labelCls}>PRO affiliation</Label>
                      <Input id="pro" className={inputCls} maxLength={100} value={details.pro || ''} onChange={(e) => setD('pro', e.target.value)} placeholder="ASCAP, BMI, none yet" />
                    </div>
                    <Pick label="Had a sync placement before?" value={details.prior_sync || ''} options={['Yes', 'No']} onChange={(v) => setD('prior_sync', v)} />
                    <Pick label="Do you own your masters and publishing?" value={details.ownership || ''} options={['Yes', 'Partly', 'Not sure']} onChange={(v) => setD('ownership', v)} />
                  </div>
                  {details.prior_sync === 'Yes' && (
                    <div className="space-y-2">
                      <Label htmlFor="sync_details" className={labelCls}>Tell us about your placements</Label>
                      <Textarea id="sync_details" className={areaCls} rows={3} maxLength={1000} value={details.sync_details || ''} onChange={(e) => setD('sync_details', e.target.value)} />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="instruments" className={labelCls}>Instruments you play</Label>
                    <Textarea id="instruments" className={areaCls} rows={3} maxLength={500} value={details.instruments || ''} onChange={(e) => setD('instruments', e.target.value)} placeholder="Include native instruments like kulintang, bandurria, rondalla, kubing, gangsa" />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Pick label="Can you record at home in good quality?" value={details.home_recording || ''} options={['Yes', 'No', 'With help']} onChange={(v) => setD('home_recording', v)} />
                    <Pick label="OK with loops licensed royalty-free to producers?" value={details.royalty_free_ok || ''} options={['Yes', 'Want to discuss']} onChange={(v) => setD('royalty_free_ok', v)} />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="links" className={labelCls}>Links to your music *</Label>
                <Textarea id="links" className={areaCls} rows={2} maxLength={1000} value={form.links} onChange={(e) => set('links', e.target.value)} placeholder="Spotify, DISCO, SoundCloud, YouTube, socials" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="why" className={labelCls}>Why do you want to be part of this? *</Label>
                <Textarea id="why" className={areaCls} rows={5} maxLength={3000} value={form.why} onChange={(e) => set('why', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral" className={labelCls}>How did you hear about us?</Label>
                <Input id="referral" className={inputCls} maxLength={200} value={form.referral_source} onChange={(e) => set('referral_source', e.target.value)} />
              </div>

              <Button type="submit" size="lg" disabled={sending || isInCooldown}>
                <Send className="mr-2 h-4 w-4" />
                {sending ? 'Sending...' : 'Submit application'}
              </Button>
            </form>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
