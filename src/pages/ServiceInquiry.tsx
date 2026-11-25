import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HOME_SERVICES } from '@/lib/homepageOffers';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { serviceInquirySchema, selectedService } from '../../supabase/functions/_shared/service-inquiry-validation';

export default function ServiceInquiry() {
  const [params, setParams] = useSearchParams();
  const service = selectedService(params.get('service'));
  const offer = HOME_SERVICES.find((item) => item.id === service);
  const [form, setForm] = useState({ name: '', email: '', artist_name: '', needs: '', links: '', preferred_timing: '' });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const spam = useAntiSpam({ cooldownMs: 15000, storageKey: 'service_inquiry_cooldown' });
  const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = spam.validate();
    if (problem) { toast({ title: problem, variant: 'destructive' }); return; }
    if (Date.now() - spam.getSubmissionData()._ts < 2000) { toast({ title: 'Please wait a moment before submitting', variant: 'destructive' }); return; }
    const parsed = serviceInquirySchema.safeParse({ ...form, service });
    if (!parsed.success) { toast({ title: parsed.error.issues[0]?.message || 'Please check your answers', variant: 'destructive' }); return; }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('service-inquiry-submit', { body: { ...parsed.data, ...spam.getSubmissionData() } });
      if (error) {
        const detail = error instanceof FunctionsHttpError ? await error.context.json().catch(() => null) : null;
        throw new Error(detail?.error || 'Could not send your booking request. Please try again.');
      }
      if (data?.success !== true) throw new Error(data?.error || 'Could not send your booking request');
      setSubmitted(true);
      spam.triggerCooldown();
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (error) { toast({ title: error instanceof Error ? error.message : 'Could not send your booking request', variant: 'destructive' }); }
    finally { setSending(false); }
  }

  return <div className="public-editorial min-h-screen bg-paper text-ink flex flex-col">
    <Helmet>
      <title>Service Booking Request | Modern Nostalgia Club</title>
      <meta name="description" content="Request a Mogul Publishing Audit, 1-on-1 Sync Consult or Audit + Consult Bundle. Share your needs and preferred timing with Modern Nostalgia Club." />
      <link rel="canonical" href="https://www.modernnostalgia.club/service-inquiry" />
    </Helmet>
    <Header />
    <main className="flex-1 pt-20">
      <section className="container max-w-3xl px-6 py-12 md:py-16">
        <Link to="/#services" className="inline-flex items-center gap-2 text-sm text-ink-muted underline underline-offset-4"><ArrowLeft className="h-4 w-4" aria-hidden="true" />All services</Link>
        <p className="mt-8 mb-3 text-xs font-semibold uppercase text-khaki">Work with Ge Oh</p>
        <h1 className="font-anton text-4xl md:text-5xl uppercase leading-[1.15]">Service Booking Request</h1>
        {submitted ? <div role="status" className="mt-8 border-t border-rule py-8">
          <CheckCircle className="h-9 w-9 text-khaki" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-bold">Request received</h2>
          <p className="mt-3 text-ink-muted leading-relaxed">Your request for the {offer?.name || 'service'} is saved. Ge will review your needs and follow up by email. No appointment is confirmed and no payment has been collected.</p>
          <Button asChild variant="editorialOutline" className="mt-6"><Link to="/#services">Back to services<ArrowLeft aria-hidden="true" /></Link></Button>
        </div> : <>
          <p className="mt-4 text-ink-muted leading-relaxed">Tell me where you are with your music and what you need help with. This is an inquiry, not a confirmed appointment or a payment.</p>
          <form onSubmit={submit} className="mt-8 space-y-6 border-t border-rule pt-8">
            <input {...spam.honeypotProps} />
            <div className="space-y-2">
              <Label htmlFor="inquiry-service">Choose a service *</Label>
              <Select value={service} onValueChange={(value) => setParams({ service: value }, { replace: true })}>
                <SelectTrigger id="inquiry-service" className="h-auto min-h-12 bg-paper-muted [&>span]:line-clamp-none [&>span]:text-left [&>span]:whitespace-normal"><SelectValue placeholder="Choose a service" /></SelectTrigger>
                <SelectContent className="bg-paper text-ink border-rule">{HOME_SERVICES.map((item) => <SelectItem key={item.id} value={item.id} className="focus:bg-paper-muted focus:text-ink">{item.name}</SelectItem>)}</SelectContent>
              </Select>
              {offer && <p className="text-sm text-ink-muted leading-relaxed">{offer.description}</p>}
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="inquiry-name">Your name *</Label><Input id="inquiry-name" autoComplete="name" required maxLength={100} value={form.name} onChange={(e) => set('name', e.target.value)} className="bg-paper-muted" /></div>
              <div className="space-y-2"><Label htmlFor="inquiry-email">Email *</Label><Input id="inquiry-email" type="email" autoComplete="email" required maxLength={255} value={form.email} onChange={(e) => set('email', e.target.value)} className="bg-paper-muted" /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="inquiry-artist">Artist / stage name</Label><Input id="inquiry-artist" maxLength={100} value={form.artist_name} onChange={(e) => set('artist_name', e.target.value)} className="bg-paper-muted" /></div>
            <div className="space-y-2"><Label htmlFor="inquiry-needs">What do you need help with? *</Label><Textarea id="inquiry-needs" required maxLength={3000} rows={5} value={form.needs} onChange={(e) => set('needs', e.target.value)} className="bg-paper-muted" /></div>
            <div className="space-y-2"><Label htmlFor="inquiry-links">Music or project links</Label><Textarea id="inquiry-links" maxLength={1000} rows={2} value={form.links} onChange={(e) => set('links', e.target.value)} className="bg-paper-muted" /></div>
            <div className="space-y-2"><Label htmlFor="inquiry-timing">Preferred timing and time zone</Label><Textarea id="inquiry-timing" maxLength={500} rows={2} value={form.preferred_timing} onChange={(e) => set('preferred_timing', e.target.value)} className="bg-paper-muted" /></div>
            <Button variant="editorial" size="lg" type="submit" disabled={sending || spam.isInCooldown}><Send aria-hidden="true" />{sending ? 'Sending...' : spam.isInCooldown ? `Wait ${spam.cooldownRemaining}s` : 'Send booking request'}</Button>
          </form>
        </>}
      </section>
    </main><Footer />
  </div>;
}