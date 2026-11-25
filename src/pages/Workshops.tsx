import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CheckCircle, ExternalLink, Send } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useEventListings, eventDate } from '@/hooks/useEventListings';
import { workshopSchema, WORKSHOP_TOPICS, WORKSHOP_ATTENDANCE } from '../../supabase/functions/_shared/workshop-validation';

export default function Workshops() {
  const [form, setForm] = useState({ name: '', email: '', artist_name: '', city: '', links: '', notes: '', attendance: 'Either', topics: [] as string[] });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const { toast } = useToast();
  const spam = useAntiSpam({ cooldownMs: 15000, storageKey: 'workshop_cooldown' });
  const { data: events = [] } = useEventListings();
  const event = events.find((e) => e.slot === 'workshops');
  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = spam.validate();
    if (problem) { toast({ title: problem, variant: 'destructive' }); return; }
    if (Date.now() - spam.getSubmissionData()._ts < 2000) { toast({ title: 'Please wait a moment before submitting', variant: 'destructive' }); return; }
    const parsed = workshopSchema.safeParse(form);
    if (!parsed.success) { toast({ title: parsed.error.issues[0]?.message || 'Check your answers', variant: 'destructive' }); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('workshop-signup-submit', { body: { ...parsed.data, ...spam.getSubmissionData() } });
      if (error) {
        const details = error instanceof FunctionsHttpError ? await error.context.json().catch(() => null) : null;
        throw new Error(details?.error || 'Could not send your signup. Please try again.');
      }
      if (data?.success !== true) throw new Error(data?.error || 'Could not send your signup');
      setConfirmationSent(data.confirmationSent === true);
      setSubmitted(true);
      spam.triggerCooldown();
    } catch (error) { toast({ title: error instanceof Error ? error.message : 'Could not send your signup', variant: 'destructive' }); }
    finally { setSending(false); }
  }

  return <div className="public-editorial min-h-screen bg-paper text-ink flex flex-col">
    <Helmet><title>Artist Workshops | Modern Nostalgia Club</title><meta name="description" content="Register your interest in artist workshops on sync pitching, publishing and independent rollouts. Confirmed sessions open on Eventbrite." /><link rel="canonical" href="https://www.modernnostalgia.club/workshops" /></Helmet>
    <Header />
    <main className="flex-1 pt-20">
      <section className="container max-w-3xl px-6 py-12 md:py-16">
        <Link to="/#events" className="text-sm text-ink-muted underline underline-offset-4">All camps and events</Link>
        <p className="mt-8 mb-3 text-xs font-semibold uppercase text-khaki">Modern Nostalgia Club</p>
        <h1 className="font-anton text-4xl md:text-5xl uppercase leading-[1.15]">Artist Workshops</h1>
        <p className="mt-4 text-ink-muted leading-relaxed">Working sessions on sync pitching, publishing and independent rollouts. Share what you want to work on.</p>
        {event && <article className="mt-8 border-y border-rule py-6">
          <p className="text-xs font-semibold uppercase text-khaki">Next confirmed session</p>
          <h2 className="mt-2 text-xl font-bold">{event.title}</h2>
          <p className="mt-2 text-sm text-ink-muted">{eventDate(event)}{event.venue ? ` · ${event.venue}` : ''}</p>
          <Button asChild variant="editorial" className="mt-4"><a href={event.url} target="_blank" rel="noopener noreferrer">Register on Eventbrite<ExternalLink aria-hidden="true" /></a></Button>
        </article>}
        {submitted ? <div role="status" className="mt-10 border-t border-rule py-8">
          <CheckCircle className="h-9 w-9 text-khaki" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-bold">You're on the interest list</h2>
          <p className="mt-3 text-ink-muted">Your signup is saved.{confirmationSent ? ' A confirmation is on its way to your inbox.' : ''} This does not reserve a seat. Confirmed dates and ticket links will be posted here.</p>
        </div> : <form onSubmit={submit} className="mt-10 space-y-6 border-t border-rule pt-8">
          <h2 className="text-xl font-bold">Workshop interest signup</h2>
          <p className="text-sm text-ink-muted">Dates are being confirmed. Joining this list is not a ticket purchase or a reserved seat.</p>
          <input {...spam.honeypotProps} />
          <div className="grid gap-6 sm:grid-cols-2">
            {([{ key: 'name', label: 'Your name', required: true, max: 100 }, { key: 'email', label: 'Email', required: true, max: 255 }, { key: 'artist_name', label: 'Artist / stage name', required: false, max: 100 }, { key: 'city', label: 'City', required: false, max: 120 }] as const).map((field) => <div key={field.key} className="space-y-2">
              <Label htmlFor={`workshop-${field.key}`}>{field.label}{field.required ? ' *' : ''}</Label>
              <Input id={`workshop-${field.key}`} type={field.key === 'email' ? 'email' : 'text'} autoComplete={field.key === 'name' ? 'name' : field.key === 'email' ? 'email' : undefined} required={field.required} maxLength={field.max} value={form[field.key]} onChange={(e) => set(field.key, e.target.value)} className="bg-paper-muted" />
            </div>)}
          </div>
          <fieldset><legend className="mb-3 text-sm font-semibold">What would you like to work on? *</legend><div className="grid gap-3 sm:grid-cols-2">
            {WORKSHOP_TOPICS.map((topic) => <label key={topic} className="flex items-center gap-3 text-sm min-h-11"><Checkbox checked={form.topics.includes(topic)} onCheckedChange={(checked) => setForm((p) => ({ ...p, topics: checked ? [...p.topics, topic] : p.topics.filter((t) => t !== topic) }))} />{topic}</label>)}
          </div></fieldset>
          <fieldset><legend className="mb-3 text-sm font-semibold">Preferred attendance</legend><RadioGroup value={form.attendance} onValueChange={(v) => set('attendance', v)} className="flex flex-wrap gap-5">{WORKSHOP_ATTENDANCE.map((value) => <div key={value} className="flex items-center gap-2"><RadioGroupItem value={value} id={`attendance-${value}`} /><Label htmlFor={`attendance-${value}`}>{value}</Label></div>)}</RadioGroup></fieldset>
          <div className="space-y-2"><Label htmlFor="workshop-links">Music or social links</Label><Textarea id="workshop-links" maxLength={1000} rows={2} value={form.links} onChange={(e) => set('links', e.target.value)} className="bg-paper-muted" /></div>
          <div className="space-y-2"><Label htmlFor="workshop-notes">What are you working on? Any questions?</Label><Textarea id="workshop-notes" maxLength={3000} rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)} className="bg-paper-muted" /></div>
          <Button variant="editorial" size="lg" type="submit" disabled={sending || spam.isInCooldown}><Send aria-hidden="true" />{sending ? 'Sending...' : spam.isInCooldown ? `Wait ${spam.cooldownRemaining}s` : 'Join the interest list'}</Button>
        </form>}
      </section>
    </main><Footer />
  </div>;
}