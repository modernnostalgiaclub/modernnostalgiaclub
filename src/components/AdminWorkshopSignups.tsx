import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type Row = Database['public']['Tables']['workshop_signups']['Row'];
export function AdminWorkshopSignups() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('workshop_signups').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Could not load workshop signups');
    else setRows(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function update(id: string, status: string) {
    const { error } = await supabase.from('workshop_signups').update({ status }).eq('id', id);
    if (error) { toast.error('Could not update signup'); return; }
    setRows((p) => p.map((r) => r.id === id ? { ...r, status } : r));
  }
  const filtered = rows.filter((r) => [r.name, r.email, r.artist_name, r.topics.join(' ')].join(' ').toLowerCase().includes(search.toLowerCase()));
  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold">Workshop Signups ({rows.length})</h2><Button variant="outline" onClick={load} disabled={loading}><RefreshCw aria-hidden="true" />Refresh</Button></div>
    <Input aria-label="Search workshop signups" placeholder="Search name, email or topic" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
    {loading ? <p className="text-muted-foreground">Loading signups...</p> : filtered.length === 0 ? <p className="text-muted-foreground">No workshop signups found.</p> : filtered.map((r) => <article key={r.id} className="rounded-lg border border-border p-5 space-y-3">
      <div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{r.name}{r.artist_name ? ` · ${r.artist_name}` : ''}</h3><p className="text-sm text-muted-foreground break-all">{r.email}</p><p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</p></div><Select value={r.status} onValueChange={(v) => update(r.id, v)}><SelectTrigger aria-label={`Status for ${r.name}`} className="w-36"><SelectValue /></SelectTrigger><SelectContent>{['new', 'reviewed', 'contacted'].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
      <p className="text-sm">{r.topics.join(', ')} · {r.attendance}{r.city ? ` · ${r.city}` : ''}</p>
      {r.links && <p className="text-sm whitespace-pre-wrap break-words">{r.links}</p>}{r.notes && <p className="text-sm whitespace-pre-wrap break-words">{r.notes}</p>}
      <Button asChild variant="outline" size="sm"><a href={`mailto:${encodeURIComponent(r.email)}?subject=${encodeURIComponent('Re: your artist workshop signup')}`}><Mail aria-hidden="true" />Reply</a></Button>
    </article>)}
  </section>;
}