import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Search, RefreshCw, Mic, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface InterviewRequest {
  id: string;
  name: string;
  email: string;
  artist_name: string;
  genre: string | null;
  location: string | null;
  links: string | null;
  story: string;
  topics: string | null;
  release_status: string | null;
  availability: string | null;
  referral_source: string | null;
  status: string;
  created_at: string;
}

const STATUSES = ['new', 'reviewed', 'archived'];

export function AdminInterviewRequests() {
  const [rows, setRows] = useState<InterviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchRows();
  }, []);

  async function fetchRows() {
    setLoading(true);
    const { data, error } = await supabase
      .from('interview_requests' as never)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to load interview requests');
    } else {
      setRows((data as unknown as InterviewRequest[]) || []);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('interview_requests' as never).update({ status } as never).eq('id', id);
    if (error) {
      toast.error('Could not update status');
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  async function remove(id: string) {
    if (!confirm('Delete this request?')) return;
    const { error } = await supabase.from('interview_requests' as never).delete().eq('id', id);
    if (error) {
      toast.error('Could not delete request');
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    toast.success('Request deleted');
  }

  const filtered = rows.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.artist_name.toLowerCase().includes(q) ||
      r.story.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" aria-hidden="true" />
          Interview Requests
          <Badge variant="secondary">{rows.length}</Badge>
        </CardTitle>
        <CardDescription>Artists requesting Patreon interviews.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              className="pl-9"
              placeholder="Search name, email, artist"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search interview requests"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchRows} aria-label="Refresh requests">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No requests yet.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{r.artist_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.name} · <a className="underline" href={`mailto:${r.email}`}>{r.email}</a>
                      {r.genre ? ` · ${r.genre}` : ''}
                      {r.location ? ` · ${r.location}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(r.created_at), 'PPp')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)} aria-label="Delete request">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 grid gap-1 text-sm">
                  {r.release_status && <p><span className="text-muted-foreground">Release status:</span> {r.release_status}</p>}
                  {r.links && <p className="whitespace-pre-wrap"><span className="text-muted-foreground">Links:</span> {r.links}</p>}
                  {r.topics && <p className="whitespace-pre-wrap"><span className="text-muted-foreground">Topics:</span> {r.topics}</p>}
                  {r.availability && <p><span className="text-muted-foreground">Availability:</span> {r.availability}</p>}
                  {r.referral_source && <p><span className="text-muted-foreground">Heard via:</span> {r.referral_source}</p>}
                  <p className="whitespace-pre-wrap mt-1">{r.story}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
