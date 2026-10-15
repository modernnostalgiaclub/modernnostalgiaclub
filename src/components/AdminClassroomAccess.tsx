import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { TIER_INFO, type PatreonTier } from '@/lib/types';

const TIERS: PatreonTier[] = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];
const tierLabel = (t: PatreonTier) =>
  t === 'lab-pass' ? `Free (${TIER_INFO[t].name})` : `${TIER_INFO[t].name} (${TIER_INFO[t].price})`;

interface CourseRow {
  id: string;
  title: string;
  min_tier: PatreonTier;
  is_published: boolean | null;
  sort_order: number | null;
}

export function AdminClassroomAccess() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<PatreonTier>('lab-pass');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('courses')
      .select('id, title, min_tier, is_published, sort_order')
      .order('sort_order', { ascending: true })
      .then(({ data, error }) => {
        if (error) toast.error('Could not load courses');
        setCourses((data as CourseRow[]) || []);
        setLoading(false);
      });
  }, []);

  const updateTier = async (id: string, tier: PatreonTier) => {
    setSaving(id);
    const { error } = await supabase.from('courses').update({ min_tier: tier }).eq('id', id);
    setSaving(null);
    if (error) return toast.error('Could not save tier');
    setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, min_tier: tier } : c)));
    toast.success('Course access updated');
  };

  const previewIdx = TIERS.indexOf(preview);
  const published = courses.filter((c) => c.is_published);
  const unlocked = published.filter((c) => TIERS.indexOf(c.min_tier) <= previewIdx);
  const locked = published.filter((c) => TIERS.indexOf(c.min_tier) > previewIdx);

  return (
    <div className="grid gap-6 lg:grid-cols-2 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Course access</CardTitle>
          <CardDescription>Choose the lowest Patreon tier that can open each course. Higher tiers get everything below them.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && courses.length === 0 && <p className="text-sm text-muted-foreground">No courses yet.</p>}
          {courses.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0">
              <div className="min-w-0">
                <p className="font-medium truncate">{c.title}</p>
                {!c.is_published && (
                  <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><EyeOff className="w-3 h-3" /> Hidden</span>
                )}
              </div>
              <Select value={c.min_tier} onValueChange={(v) => updateTier(c.id, v as PatreonTier)} disabled={saving === c.id}>
                <SelectTrigger className="w-56" aria-label={`Tier for ${c.title}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIERS.map((t) => <SelectItem key={t} value={t}>{tierLabel(t)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview as member</CardTitle>
          <CardDescription>See what a member on each tier can open in the classroom. Hidden courses are left out.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {TIERS.map((t) => (
              <Button key={t} size="sm" variant={preview === t ? 'default' : 'outline'} onClick={() => setPreview(t)}>
                {tierLabel(t)}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{unlocked.length} of {published.length} courses unlocked</p>
          <ul className="space-y-2">
            {unlocked.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm"><Unlock className="w-4 h-4 text-primary" />{c.title}</li>
            ))}
            {locked.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />{c.title}
                <Badge variant="outline" className="ml-auto">Needs {TIER_INFO[c.min_tier].name}</Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
