import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, RefreshCw, Music, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface PlaylistSubmission {
  id: string;
  name: string;
  email: string;
  artist_name: string;
  song_title: string;
  song_url: string;
  genre: string | null;
  clearance: string | null;
  vocal_type: string | null;
  release_status: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

const STATUSES = ['new', 'reviewed', 'archived'];

export function AdminPlaylistSubmissions() {
  const [rows, setRows] = useState<PlaylistSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchRows();
  }, []);

  async function fetchRows() {
    setLoading(true);
    const { data, error } = await supabase
      .from('playlist_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load playlist submissions');
    } else {
      setRows((data as PlaylistSubmission[]) || []);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('playlist_submissions').update({ status }).eq('id', id);
    if (error) {
      toast.error('Could not update status');
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function remove(id: string) {
    if (!confirm('Delete this submission?')) return;
    const { error } = await supabase.from('playlist_submissions').delete().eq('id', id);
    if (error) {
      toast.error('Could not delete submission');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success('Submission deleted');
  }

  const filtered = rows.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.artist_name.toLowerCase().includes(q) ||
      r.song_title.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" aria-hidden="true" />
          Playlist Submissions
          <Badge variant="secondary">{rows.length}</Badge>
        </CardTitle>
        <CardDescription>Songs sent in through the playlist submission page.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              className="pl-9"
              placeholder="Search artist, song, email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search playlist submissions"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchRows} aria-label="Refresh submissions">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No submissions yet.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{r.artist_name} — {r.song_title}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.name} · <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{format(new Date(r.created_at), 'PPp')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete submission">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 grid gap-1 text-sm">
                  <a
                    href={r.song_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary underline break-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    {r.song_url}
                  </a>
                  {r.genre && <p><span className="text-muted-foreground">Genre:</span> {r.genre}</p>}
                  {r.clearance && <p><span className="text-muted-foreground">Clearance:</span> {r.clearance}</p>}
                  {r.vocal_type && <p><span className="text-muted-foreground">Type:</span> {r.vocal_type}</p>}
                  {r.release_status && <p><span className="text-muted-foreground">Release:</span> {r.release_status}</p>}
                  {r.notes && <p className="whitespace-pre-wrap mt-1">{r.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
