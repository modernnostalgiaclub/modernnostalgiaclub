import { useEffect, useState } from 'react';
import { Mail, RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SERVICE_NAMES, SERVICE_REQUEST_STATUSES, selectedService } from '../../supabase/functions/_shared/service-inquiry-validation';

type Row = Database['public']['Tables']['service_booking_requests']['Row'];
export function AdminServiceRequests() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('service_booking_requests').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Could not load service requests');
    else setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function update(row: Row, changes: { status?: string; admin_notes?: string }) {
    if (changes.status && !SERVICE_REQUEST_STATUSES.some((status) => status === changes.status)) return;
    if (changes.admin_notes && changes.admin_notes.length > 3000) return;
    setSaving(row.id);
    const { error } = await supabase.from('service_booking_requests').update(changes).eq('id', row.id);
    if (error) toast.error('Could not update request');
    else { setRows((p) => p.map((r) => r.id === row.id ? { ...r, ...changes } : r)); toast.success('Request updated'); }
    setSaving(null);
  }
  const filtered = rows.filter((r) => (statusFilter === 'all' || r.status === statusFilter) && [r.name, r.email, r.artist_name, r.needs].join(' ').toLowerCase().includes(search.toLowerCase()));
  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Service Booking Requests ({rows.length})</h2><Button variant="outline" onClick={load} disabled={loading}><RefreshCw aria-hidden="true" />Refresh</Button></div>
    <div className="flex flex-wrap gap-3"><Input aria-label="Search service requests" placeholder="Search name, email or needs" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" /><Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40" aria-label="Filter request status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{SERVICE_REQUEST_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
    {loading ? <p className="text-muted-foreground">Loading requests...</p> : filtered.length === 0 ? <p className="text-muted-foreground">No service requests found.</p> : filtered.map((row) => {
      const serviceId = selectedService(row.service);
      const serviceName = serviceId ? SERVICE_NAMES[serviceId] : row.service;
      return <article key={row.id} className="rounded-lg border border-border p-5 space-y-4">
        <div className="flex flex-wrap justify-between gap-3"><div className="min-w-0"><p className="text-sm text-primary">{serviceName}</p><h3 className="mt-1 font-semibold break-words">{row.name}{row.artist_name ? ` · ${row.artist_name}` : ''}</h3><p className="text-sm text-muted-foreground break-all">{row.email}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(row.created_at).toLocaleString()}</p></div><Select value={row.status} onValueChange={(status) => update(row, { status })} disabled={saving === row.id}><SelectTrigger aria-label={`Status for ${row.name}`} className="w-36"><SelectValue /></SelectTrigger><SelectContent>{SERVICE_REQUEST_STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div>
        <p className="whitespace-pre-wrap break-words text-sm">{row.needs}</p>
        {row.links && <div><p className="text-xs font-semibold text-muted-foreground">Music or project links</p><p className="whitespace-pre-wrap break-words text-sm">{row.links}</p></div>}
        {row.preferred_timing && <div><p className="text-xs font-semibold text-muted-foreground">Preferred timing</p><p className="whitespace-pre-wrap break-words text-sm">{row.preferred_timing}</p></div>}
        <div className="space-y-2"><Label htmlFor={`request-notes-${row.id}`}>Private notes</Label><Textarea id={`request-notes-${row.id}`} maxLength={3000} rows={2} value={drafts[row.id] ?? row.admin_notes} onChange={(e) => setDrafts((p) => ({ ...p, [row.id]: e.target.value }))} /></div>
        <div className="flex flex-wrap gap-3"><Button size="sm" variant="outline" disabled={saving === row.id || (drafts[row.id] ?? row.admin_notes) === row.admin_notes} onClick={() => update(row, { admin_notes: drafts[row.id] ?? row.admin_notes })}><Save aria-hidden="true" />Save notes</Button><Button asChild size="sm" variant="outline"><a href={`mailto:${encodeURIComponent(row.email)}?subject=${encodeURIComponent(`Re: ${serviceName} booking request`)}&body=${encodeURIComponent(`Hi ${row.name},\n\n`)}`}><Mail aria-hidden="true" />Reply</a></Button></div>
      </article>;
    })}
  </section>;
}