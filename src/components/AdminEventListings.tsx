import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, Save, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EVENT_LABELS, type EventListing, eventDate } from '@/hooks/useEventListings';
import { eventbriteId, isUpcomingEvent } from '../../supabase/functions/_shared/eventbrite-listings';

type Slot = keyof typeof EVENT_LABELS;
export function AdminEventListings() {
  const [rows, setRows] = useState<EventListing[]>([]);
  const [slot, setSlot] = useState<Slot>('workshops');
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<EventListing | null>(null);
  const [busy, setBusy] = useState(false);
  const cache = useQueryClient();
  async function load() {
    const { data, error } = await supabase.from('event_listings').select('*').order('start_utc');
    if (error) toast.error('Could not load events');
    else setRows(data || []);
  }
  useEffect(() => { load(); }, []);
  async function importEvent(inputUrl: string, inputSlot: Slot, save: boolean) {
    if (!eventbriteId(inputUrl)) { toast.error('Enter a full Eventbrite ticket URL'); return; }
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-eventbrite-listing', { body: { slot: inputSlot, url: inputUrl, save } });
      if (error) {
        const detail = error instanceof FunctionsHttpError ? await error.context.json().catch(() => null) : null;
        throw new Error(detail?.error || 'Could not load Eventbrite details');
      }
      if (!data?.listing) throw new Error(data?.error || 'Event details were not returned');
      if (save) {
        toast.success('Event details saved'); setPreview(null); setUrl(''); await load();
        await cache.invalidateQueries({ queryKey: ['public-event-listings'] });
      } else setPreview(data.listing);
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not import the event'); }
    finally { setBusy(false); }
  }
  async function remove(row: EventListing) {
    if (!window.confirm(`Remove ${row.title} from the site? Applications and workshop signups will remain.`)) return;
    const { error } = await supabase.from('event_listings').delete().eq('id', row.id);
    if (error) { toast.error('Could not remove event'); return; }
    await load(); await cache.invalidateQueries({ queryKey: ['public-event-listings'] });
  }
  return <section className="space-y-6">
    <div><h2 className="flex items-center gap-2 text-xl font-semibold"><Calendar aria-hidden="true" />Eventbrite Events</h2></div>
    <form onSubmit={(e) => { e.preventDefault(); importEvent(url, slot, false); }} className="space-y-4 border-y border-border py-6">
      <div className="space-y-2"><Label htmlFor="event-slot">Camp or workshop</Label><Select value={slot} onValueChange={(v) => { setSlot(v as Slot); setPreview(null); }}><SelectTrigger id="event-slot" className="max-w-sm"><SelectValue /></SelectTrigger><SelectContent>{Object.entries(EVENT_LABELS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="eventbrite-url">Eventbrite ticket link</Label><Input id="eventbrite-url" type="url" maxLength={2000} value={url} onChange={(e) => { setUrl(e.target.value); setPreview(null); }} placeholder="https://www.eventbrite.com/e/..." required /></div>
      <Button type="submit" disabled={busy}><Download aria-hidden="true" />{busy ? 'Loading...' : 'Load event details'}</Button>
    </form>
    {preview && <article className="border border-border rounded-lg p-5 space-y-3">
      <h3 className="text-lg font-semibold">{preview.title}</h3><p className="text-sm text-muted-foreground">{eventDate(preview)} · {preview.venue || 'Venue to be confirmed'}</p>
      <p className="text-sm whitespace-pre-wrap break-words">{preview.description.slice(0, 600)}</p>
      {!isUpcomingEvent(preview) && <p className="text-sm text-destructive">This event is not live and upcoming. It will not appear on the public site.</p>}
      <Button disabled={busy || !isUpcomingEvent(preview)} onClick={() => importEvent(url, slot, true)}><Save aria-hidden="true" />Save to site</Button>
    </article>}
    {rows.length === 0 ? <p className="text-sm text-muted-foreground">No Eventbrite links saved yet.</p> : rows.map((r) => <article key={r.id} className="border-b border-border py-5 flex flex-wrap justify-between items-start gap-4">
      <div className="min-w-0"><p className="text-xs text-muted-foreground">{EVENT_LABELS[r.slot as Slot]}</p><h3 className="mt-1 font-semibold">{r.title}</h3><p className="mt-1 text-sm text-muted-foreground">{eventDate(r)} · {isUpcomingEvent(r) ? 'Visible on site' : 'Past or unpublished'}</p><a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm underline break-all">View on Eventbrite</a></div>
      <div className="flex gap-2"><Button variant="outline" disabled={busy} onClick={() => importEvent(r.url, r.slot as Slot, true)}><RefreshCw aria-hidden="true" />Refresh</Button><Button variant="outline" size="icon" aria-label={`Remove ${r.title}`} title="Remove event" onClick={() => remove(r)}><Trash2 aria-hidden="true" /></Button></div>
    </article>)}
  </section>;
}