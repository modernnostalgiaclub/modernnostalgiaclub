import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, RefreshCw, Music } from 'lucide-react';
import { format } from 'date-fns';
import { CAMPS, type CampSlug } from '@/lib/camps';

interface Row {
  id: string; camp: CampSlug; name: string; email: string; artist_name: string; roles: string[];
  heritage: string | null; city: string | null; attendance: string | null; links: string; why: string;
  referral_source: string | null; details: Record<string, string>; status: string; created_at: string;
}

const STATUSES = ['new', 'reviewed', 'accepted', 'declined'];
const DETAIL_LABELS: Record<string, string> = {
  genres: 'Genres', prior_sync: 'Prior sync', sync_details: 'Sync details', ownership: 'Owns masters/publishing', pro: 'PRO',
  instruments: 'Instruments', home_recording: 'Home recording', royalty_free_ok: 'Royalty-free OK',
};

export function AdminCampApplications() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [campFilter, setCampFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => { fetchRows(); }, []);

  async function fetchRows() {
    setLoading(true);
    const { data, error } = await supabase.from('camp_applications' as never).select('*').order('created_at', { ascending: false });
    if (error) toast.error('Failed to load camp applications');
    else setRows((data as unknown as Row[]) || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('camp_applications' as never).update({ status } as never).eq('id', id);
    if (error) { toast.error('Could not update status'); return; }
    setRows((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  const q = search.toLowerCase();
  const filtered = rows.filter((r) =>
    (campFilter === 'All' || r.camp === campFilter) &&
    (statusFilter === 'All' || r.status === statusFilter) &&
    (!q || [r.name, r.email, r.artist_name, r.why].some((v) => v.toLowerCase().includes(q))));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" aria-hidden="true" /> Camp Applications <Badge variant="secondary">{rows.length}</Badge>
        </CardTitle>
        <CardDescription>Filipino songwriting camp applicants.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input className="pl-9" placeholder="Search name, email, artist" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search camp applications" />
          </div>
          <Select value={campFilter} onValueChange={setCampFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All camps</SelectItem>
              {(Object.keys(CAMPS) as CampSlug[]).map((c) => <SelectItem key={c} value={c}>{CAMPS[c].short}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchRows} aria-label="Refresh applications"><RefreshCw className="h-4 w-4" /></Button>
        </div>
        {loading ? <Skeleton className="h-20 w-full" /> : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{r.artist_name} <Badge variant="outline" className="ml-2">{CAMPS[r.camp]?.short ?? r.camp}</Badge></p>
                    <p className="text-sm text-muted-foreground">
                      {r.name} · <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>{r.city ? ` · ${r.city}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(r.created_at), 'PPp')}</p>
                  </div>
                  <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                    <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="mt-3 grid gap-1 text-sm">
                  {r.roles?.length > 0 && <p><span className="text-muted-foreground">Roles:</span> {r.roles.join(', ')}</p>}
                  {r.heritage && <p><span className="text-muted-foreground">Heritage:</span> {r.heritage}</p>}
                  {r.attendance && <p><span className="text-muted-foreground">Attendance:</span> {r.attendance}</p>}
                  {Object.entries(r.details || {}).map(([k, v]) => (
                    <p key={k} className="whitespace-pre-wrap"><span className="text-muted-foreground">{DETAIL_LABELS[k] ?? k}:</span> {v}</p>
                  ))}
                  <p className="whitespace-pre-wrap"><span className="text-muted-foreground">Links:</span> {r.links}</p>
                  {r.referral_source && <p><span className="text-muted-foreground">Heard via:</span> {r.referral_source}</p>}
                  <p className="whitespace-pre-wrap mt-1">{r.why}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
