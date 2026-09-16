import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Mail, RefreshCw } from 'lucide-react';

type Kind = 'Sponsor inquiry' | 'Playlist submission' | 'Discovery call' | 'Catalog audit';

interface Entry {
  id: string;
  kind: Kind;
  name: string;
  email: string;
  detail: string;
  createdAt: string;
}

const KINDS: Kind[] = ['Sponsor inquiry', 'Playlist submission', 'Discovery call', 'Catalog audit'];

const badgeColor: Record<Kind, string> = {
  'Sponsor inquiry': 'bg-primary/10 text-primary',
  'Playlist submission': 'bg-emerald-500/10 text-emerald-600',
  'Discovery call': 'bg-amber-500/10 text-amber-600',
  'Catalog audit': 'bg-purple-500/10 text-purple-600',
};

export function AdminFormActivity() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState<'all' | Kind>('all');

  const load = async () => {
    setLoading(true);
    const [sponsors, playlists, calls, audits] = await Promise.all([
      supabase.from('sponsor_inquiries').select('id, name, email, company, partnership_type, created_at').order('created_at', { ascending: false }),
      supabase.from('playlist_submissions').select('id, name, email, artist_name, song_title, created_at').order('created_at', { ascending: false }),
      supabase.from('discovery_call_bookings').select('id, full_name, email, topic, preferred_date, preferred_time, created_at').order('created_at', { ascending: false }),
      supabase.from('catalog_audit_submissions').select('id, full_name, email, artist_name, catalog_size, created_at').order('created_at', { ascending: false }),
    ]);

    const all: Entry[] = [
      ...(sponsors.data ?? []).map((r) => ({
        id: r.id, kind: 'Sponsor inquiry' as Kind, name: r.name, email: r.email,
        detail: [r.company, r.partnership_type].filter(Boolean).join(' · ') || '—', createdAt: r.created_at,
      })),
      ...(playlists.data ?? []).map((r) => ({
        id: r.id, kind: 'Playlist submission' as Kind, name: r.name, email: r.email,
        detail: [r.artist_name, r.song_title].filter(Boolean).join(' · ') || '—', createdAt: r.created_at,
      })),
      ...(calls.data ?? []).map((r) => ({
        id: r.id, kind: 'Discovery call' as Kind, name: r.full_name, email: r.email,
        detail: [r.topic, `${r.preferred_date} at ${r.preferred_time}`].filter(Boolean).join(' · '), createdAt: r.created_at,
      })),
      ...(audits.data ?? []).map((r) => ({
        id: r.id, kind: 'Catalog audit' as Kind, name: r.full_name, email: r.email,
        detail: [r.artist_name, r.catalog_size].filter(Boolean).join(' · ') || '—', createdAt: r.created_at,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setEntries(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return KINDS.map((kind) => {
      const rows = entries.filter((e) => e.kind === kind);
      return {
        kind,
        total: rows.length,
        recent: rows.filter((e) => new Date(e.createdAt).getTime() >= weekAgo).length,
        last: rows[0]?.createdAt,
      };
    });
  }, [entries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (kindFilter !== 'all' && e.kind !== kindFilter) return false;
      if (!q) return true;
      return [e.name, e.email, e.detail].join(' ').toLowerCase().includes(q);
    });
  }, [entries, search, kindFilter]);

  const replyLink = (e: Entry) =>
    `mailto:${e.email}?subject=${encodeURIComponent(`Re: your ${e.kind.toLowerCase()} — Modern Nostalgia Club`)}&body=${encodeURIComponent(`Hi ${e.name},\n\n`)}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.kind} className="p-4">
            <p className="text-sm text-muted-foreground">{s.kind}</p>
            <p className="text-3xl font-semibold">{s.total}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {s.recent} in the last 7 days
              {s.last ? ` · last ${new Date(s.last).toLocaleDateString()}` : ' · none yet'}
            </p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Tabs value={kindFilter} onValueChange={(v) => setKindFilter(v as 'all' | Kind)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {KINDS.map((k) => <TabsTrigger key={k} value={k}>{k}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <Input
          placeholder="Search name, email or details"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="p-0 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading submissions
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">No submissions found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Reply</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={`${e.kind}-${e.id}`}>
                  <TableCell><Badge className={badgeColor[e.kind]} variant="secondary">{e.kind}</Badge></TableCell>
                  <TableCell className="font-medium">{e.name}</TableCell>
                  <TableCell className="text-muted-foreground">{e.email}</TableCell>
                  <TableCell className="max-w-xs truncate">{e.detail}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {new Date(e.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild size="sm" variant="outline">
                      <a href={replyLink(e)}>
                        <Mail className="w-4 h-4 mr-1" /> Reply
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
