import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAntiSpam } from '@/hooks/useAntiSpam';
import { CalendarCheck, CheckCircle, Clock } from 'lucide-react';

export const TIME_SLOTS = [
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM',
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
  notes: '',
};

const inputClass = 'bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 h-12';

/** Local date -> YYYY-MM-DD without timezone drift. */
function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isBookableDay(date: Date): boolean {
  const day = date.getDay(); // 1 = Monday ... 4 = Thursday
  return day >= 1 && day <= 4;
}

export default function BookCall() {
  const [form, setForm] = useState(emptyForm);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({});
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const { isInCooldown, honeypotProps, validate, triggerCooldown, getSubmissionData } = useAntiSpam({ cooldownMs: 15000 });

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const maxDate = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 60);
    return d;
  }, [today]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.rpc('get_booked_call_slots');
      if (cancelled || !data) return;
      const map: Record<string, string[]> = {};
      for (const row of data as { preferred_date: string; preferred_time: string }[]) {
        map[row.preferred_date] = [...(map[row.preferred_date] ?? []), row.preferred_time];
      }
      setBookedSlots(map);
    })();
    return () => { cancelled = true; };
  }, []);

  const set = (field: keyof typeof emptyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const dateKey = selectedDate ? toDateString(selectedDate) : '';
  const takenForDate = dateKey ? bookedSlots[dateKey] ?? [] : [];

  const handleSelectDate = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInCooldown) return;
    const spamError = validate();
    if (spamError) { toast({ title: spamError, variant: 'destructive' }); return; }

    if (!form.full_name.trim() || !form.email.trim() || !dateKey || !selectedTime) {
      toast({ title: 'Please pick a day and time and fill in your name and email', variant: 'destructive' });
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
        body: {
          ...form,
          preferred_date: dateKey,
          preferred_time: selectedTime,
          timezone,
          ...getSubmissionData(),
        },
      });
      const returned = (data as { error?: string } | null)?.error;
      if (error || returned) throw new Error(returned || 'Failed');
      triggerCooldown();
      setBookedSlots((prev) => ({ ...prev, [dateKey]: [...(prev[dateKey] ?? []), selectedTime] }));
      setForm(emptyForm);
      setSelectedTime('');
      setSelectedDate(undefined);
      setSubmitted(true);
    } catch (err) {
      toast({
        title: 'Could not book your call',
        description: err instanceof Error && err.message !== 'Failed' ? err.message : 'Please try again in a moment.',
        variant: 'destructive',
      });
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
          content="Pick a day and time on the calendar for a free 15-minute discovery call about your catalog, sync goals and next steps."
        />
        <link rel="canonical" href="https://modernnostalgia.club/book-call" />
        <meta property="og:title" content="Book a Free Discovery Call" />
        <meta property="og:description" content="Choose your slot on the calendar and get an instant confirmation email." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header />

      <main className="flex-1">
        <section className="container mx-auto max-w-3xl px-6 pb-16 pt-28 md:pt-32">
          <h1 className="font-anton text-4xl md:text-6xl uppercase tracking-tight leading-[1.05] text-gray-900">
            Book a Discovery Call
          </h1>
          <p className="mt-4 text-gray-600">
            A free 15-minute call to talk through your catalog, your sync goals and the fastest next step.
            Pick a day and time below. Calls run Monday to Thursday, 6am to 11am and 1pm to 6pm Pacific.
          </p>

          {submitted ? (
            <div className="mt-10 rounded-lg border border-gray-200 p-8 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-primary" />
              <h2 className="mt-4 font-poppins text-xl font-semibold text-gray-900">Your call is booked</h2>
              <p className="mt-2 text-sm text-gray-600">
                A confirmation is on its way to your inbox, and we will email you the meeting link before the call.
                You will also get a reminder the day before.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <input {...honeypotProps} />

              <div className="rounded-lg bg-gray-50 p-5">
                <div className="flex items-center gap-2 text-gray-900 font-poppins font-semibold">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  Pick your day
                </div>

                <div className="mt-4 grid gap-6 md:grid-cols-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleSelectDate}
                    disabled={(date) => date < today || date > maxDate || !isBookableDay(date)}
                    className="rounded-md border border-gray-200 bg-white p-3 pointer-events-auto"
                  />

                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Clock className="h-4 w-4 text-primary" />
                      {selectedDate
                        ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                        : 'Choose a day first'}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">All times Pacific</p>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const taken = takenForDate.includes(slot);
                        const disabled = !selectedDate || taken;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={disabled}
                            onClick={() => setSelectedTime(slot)}
                            className={`rounded-md border px-2 py-2 text-xs font-medium transition ${
                              selectedTime === slot
                                ? 'border-primary bg-primary text-primary-foreground'
                                : disabled
                                ? 'border-gray-200 bg-gray-100 text-gray-400 line-through'
                                : 'border-gray-200 bg-white text-gray-900 hover:border-primary'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-900">Anything we should know before the call?</Label>
                <Textarea className="bg-gray-100 border-0 text-gray-900 placeholder:text-gray-400 min-h-32" id="notes" value={form.notes} maxLength={1500} onChange={(e) => set('notes', e.target.value)} />
              </div>

              <Button type="submit" size="lg" variant="maroon" className="w-full" disabled={sending || isInCooldown}>
                {sending ? 'Booking...' : selectedTime && selectedDate
                  ? `Book ${selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${selectedTime} PT`
                  : 'Book my call'}
              </Button>
              <p className="text-center text-xs text-gray-500">
                We will email your confirmation right away, the meeting link before the call, and a reminder the day before.
              </p>
            </form>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
