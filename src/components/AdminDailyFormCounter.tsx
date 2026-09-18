import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Row = { label: string; today: number; week: number; total: number };

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const sevenDaysAgo = () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

/**
 * Admin-only snapshot of how many form submissions arrive each day.
 * Renders nothing for visitors and non-admin members.
 */
export function AdminDailyFormCounter() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('admin');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const today = startOfToday();
    const week = sevenDaysAgo();

    const tables = [
      { label: 'Sponsor inquiries', table: 'sponsor_inquiries' as const },
      { label: 'Playlist submissions', table: 'playlist_submissions' as const },
      { label: 'Catalog audits', table: 'catalog_audit_submissions' as const },
      { label: 'Discovery calls', table: 'discovery_call_bookings' as const },
    ];

    const results = await Promise.all(
      tables.map(async ({ label, table }) => {
        const [todayRes, weekRes, totalRes] = await Promise.all([
          supabase.from(table).select('id', { count: 'exact', head: true }).gte('created_at', today),
          supabase.from(table).select('id', { count: 'exact', head: true }).gte('created_at', week),
          supabase.from(table).select('id', { count: 'exact', head: true }),
        ]);
        return {
          label,
          today: todayRes.count ?? 0,
          week: weekRes.count ?? 0,
          total: totalRes.count ?? 0,
        };
      }),
    );

    setRows(results);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div className="mb-4 rounded-xl border border-cream/15 bg-cream/5 p-4 text-left">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-poppins text-sm font-semibold text-cream">Today's activity</p>
          <p className="text-xs text-cream/50">Only visible to you as an admin</p>
        </div>
        <Button variant="ghost" size="sm" className="text-cream/70 hover:text-cream" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {rows === null ? (
        <p className="text-sm text-cream/60">Loading counts...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg bg-cream/10 p-3">
              <p className="text-2xl font-semibold text-cream">{row.today}</p>
              <p className="text-xs font-medium text-cream/90">{row.label}</p>
              <p className="mt-1 text-[11px] text-cream/50">
                {row.week} this week · {row.total} all time
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
