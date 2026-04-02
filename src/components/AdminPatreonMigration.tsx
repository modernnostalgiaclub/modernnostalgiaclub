import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Users2, Bell, CheckCircle2, Clock, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface PatreonMember {
  user_id: string;
  name: string | null;
  stage_name: string | null;
  patreon_tier: string | null;
  patreon_id: string | null;
  migration_status: string | null;
  notified_at: string | null;
  migrated_at: string | null;
  auth_method: string | null;
}

interface MigrationStats {
  total: number;
  pending: number;
  notified: number;
  migrated: number;
}

export function AdminPatreonMigration() {
  const [members, setMembers] = useState<PatreonMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MigrationStats>({ total: 0, pending: 0, notified: 0, migrated: 0 });
  const [notifying, setNotifying] = useState(false);
  const [notifyingId, setNotifyingId] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      // Fetch Patreon members from profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, name, stage_name, patreon_tier, patreon_id')
        .not('patreon_id', 'is', null)
        .order('name');

      if (error) throw error;

      // Fetch migration records
      const { data: migrations } = await supabase
        .from('patreon_migration')
        .select('patreon_user_id, migration_status, notified_at, migrated_at, auth_method');

      const migrationMap = new Map(
        (migrations || []).map((m: any) => [m.patreon_user_id, m])
      );

      const enriched: PatreonMember[] = (profiles || []).map((p: any) => {
        const mig = migrationMap.get(p.user_id);
        return {
          ...p,
          migration_status: mig?.migration_status ?? 'pending',
          notified_at: mig?.notified_at ?? null,
          migrated_at: mig?.migrated_at ?? null,
          auth_method: mig?.auth_method ?? null,
        };
      });

      setMembers(enriched);

      const total = enriched.length;
      const migrated = enriched.filter(m => m.migration_status === 'migrated').length;
      const notified = enriched.filter(m => m.migration_status === 'notified').length;
      const pending = total - migrated - notified;
      setStats({ total, pending, notified, migrated });
    } catch (err) {
      toast.error('Failed to load Patreon members');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (userId: string, userName: string) => {
    setNotifyingId(userId);
    try {
      // Insert notification
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: userId,
        title: '🎉 You\'re Getting a Free Upgrade',
        message: 'As a founding Patreon member, you\'re being upgraded to Artist Incubator — our highest tier — for free. Sign in with Google to claim your upgrade.',
        type: 'upgrade',
        link: '/migrate',
      });
      if (notifError) throw notifError;

      // Upsert migration record
      const { error: migError } = await supabase.from('patreon_migration').upsert({
        patreon_user_id: userId,
        migration_status: 'notified',
        notified_at: new Date().toISOString(),
      }, { onConflict: 'patreon_user_id' });
      if (migError) throw migError;

      toast.success(`Invite sent to ${userName || 'member'}`);
      loadMembers();
    } catch (err) {
      toast.error('Failed to send notification');
    } finally {
      setNotifyingId(null);
    }
  };

  const notifyAllPending = async () => {
    const pending = members.filter(m => m.migration_status === 'pending');
    if (pending.length === 0) {
      toast.info('No pending members to notify');
      return;
    }
    setNotifying(true);
    try {
      const now = new Date().toISOString();

      // Bulk insert notifications
      const notifications = pending.map(m => ({
        user_id: m.user_id,
        title: '🎉 You\'re Getting a Free Upgrade',
        message: 'As a founding Patreon member, you\'re being upgraded to Creative Economy Lab — our highest tier — for free. Sign in with Google to claim your upgrade.',
        type: 'upgrade',
        link: '/migrate',
      }));
      const { error: notifError } = await supabase.from('notifications').insert(notifications);
      if (notifError) throw notifError;

      // Bulk upsert migration records
      const migrationRecords = pending.map(m => ({
        patreon_user_id: m.user_id,
        migration_status: 'notified',
        notified_at: now,
      }));
      const { error: migError } = await supabase.from('patreon_migration').upsert(
        migrationRecords,
        { onConflict: 'patreon_user_id' }
      );
      if (migError) throw migError;

      toast.success(`Sent upgrade invites to ${pending.length} member${pending.length !== 1 ? 's' : ''}`);
      loadMembers();
    } catch (err) {
      toast.error('Failed to notify all pending members');
    } finally {
      setNotifying(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'migrated':
        return <Badge className="bg-secondary text-secondary-foreground border-border"><CheckCircle2 className="w-3 h-3 mr-1" />Migrated</Badge>;
      case 'notified':
        return <Badge className="bg-primary/10 text-primary border-primary/20"><Bell className="w-3 h-3 mr-1" />Notified</Badge>;
      default:
        return <Badge className="bg-muted text-muted-foreground"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-semibold flex items-center gap-2">
            <Users2 className="w-5 h-5 text-primary" />
            Patreon Migration
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Notify founding Patreon members to claim their free Creative Economy Lab upgrade
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadMembers} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Patreon', value: stats.total, color: 'text-foreground', icon: <Users2 className="w-4 h-4" /> },
          { label: 'Pending', value: stats.pending, color: 'text-muted-foreground', icon: <Clock className="w-4 h-4" /> },
          { label: 'Notified', value: stats.notified, color: 'text-primary', icon: <Bell className="w-4 h-4" /> },
          { label: 'Migrated', value: stats.migrated, color: 'text-accent-foreground', icon: <CheckCircle2 className="w-4 h-4" /> },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`${stat.color}`}>{stat.icon}</div>
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bulk Action */}
      {stats.pending > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-primary shrink-0" />
              <p className="text-sm">
                <strong>{stats.pending} member{stats.pending !== 1 ? 's' : ''}</strong> haven't been notified yet about their free upgrade.
              </p>
            </div>
            <Button
              variant="maroon"
              onClick={notifyAllPending}
              disabled={notifying}
              className="shrink-0 gap-2"
            >
              {notifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              Notify All Pending
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Member Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patreon Members ({stats.total})</CardTitle>
          <CardDescription>Members with connected Patreon accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Users2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No Patreon members found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notified</TableHead>
                    <TableHead>Migrated</TableHead>
                    <TableHead>Auth Method</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(member => (
                    <TableRow key={member.user_id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{member.stage_name || member.name || 'Unknown'}</p>
                          {member.stage_name && member.name && (
                            <p className="text-xs text-muted-foreground">{member.name}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {member.patreon_tier?.replace(/-/g, ' ') || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(member.migration_status)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {member.notified_at ? new Date(member.notified_at).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {member.migrated_at ? new Date(member.migrated_at).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground capitalize">
                        {member.auth_method ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        {member.migration_status !== 'migrated' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 h-7 text-xs"
                            onClick={() => sendNotification(member.user_id, member.stage_name || member.name || '')}
                            disabled={notifyingId === member.user_id}
                          >
                            {notifyingId === member.user_id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Bell className="w-3 h-3" />
                            )}
                            {member.migration_status === 'notified' ? 'Re-send' : 'Send Invite'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
