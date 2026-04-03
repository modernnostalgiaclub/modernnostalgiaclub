import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Users, Shield, Crown, Pencil, Check, X, UserPlus } from 'lucide-react';
import { ReauthDialog } from '@/components/ReauthDialog';
import { useReauth } from '@/hooks/useReauth';
import { useAuditLog } from '@/hooks/useAuditLog';
import type { Database } from '@/integrations/supabase/types';

type PatreonTier = Database['public']['Enums']['patreon_tier'];
type AppRole = 'admin' | 'moderator' | 'user';

interface EnrichedProfile {
  id: string;
  user_id: string;
  name: string | null;
  stage_name: string | null;
  avatar_url: string | null;
  patreon_tier: PatreonTier | null;
  created_at: string;
  email?: string;
  roles: AppRole[];
  subscription?: {
    plan_name: string;
    locked_price: number;
    locked_billing_period: string;
    is_grandfathered: boolean;
    status: string;
    started_at: string;
    stripe_subscription_id: string | null;
  } | null;
}

export function AdminUserManagement() {
  const { logAccess } = useAuditLog();
  const [users, setUsers] = useState<EnrichedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'legacy' | 'current' | 'no-plan'>('all');
  const [editingUser, setEditingUser] = useState<EnrichedProfile | null>(null);
  const [selectedTier, setSelectedTier] = useState<PatreonTier>('lab-pass');
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    tier: 'lab-pass' as PatreonTier,
    locked_price: '',
    locked_billing_period: 'monthly',
    is_grandfathered: false,
    billing_status: 'active',
    notes: '',
  });
  const [plans, setPlans] = useState<{ id: string; name: string }[]>([]);
  const tierReauth = useReauth({
    title: 'Confirm Tier Update',
    description: "Changing a user's membership tier is a sensitive action. Please verify with your 2FA code.",
    actionLabel: 'Update Tier',
  });

  const roleReauth = useReauth({
    title: 'Confirm Role Change',
    description: 'Modifying user roles is a highly sensitive action. Please verify with your 2FA code.',
    actionLabel: 'Update Roles',
    destructive: true,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      logAccess({ tableName: 'profiles', action: 'view_list', details: { count: users.length } });
    }
  }, [users.length]);

  async function fetchAllData() {
    setLoading(true);

    const [profilesRes, rolesRes, subsRes, plansRes, emailsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*'),
      supabase.from('member_subscriptions').select('*'),
      supabase.from('membership_plans').select('id, name'),
      supabase.functions.invoke('admin-list-users'),
    ]);

    if (profilesRes.error) {
      toast.error('Failed to load users');
      setLoading(false);
      return;
    }

    const rolesMap: Record<string, AppRole[]> = {};
    (rolesRes.data || []).forEach((r: any) => {
      if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
      rolesMap[r.user_id].push(r.role as AppRole);
    });

    const planMap: Record<string, string> = {};
    (plansRes.data || []).forEach((p: any) => { planMap[p.id] = p.name; });
    setPlans((plansRes.data || []).map((p: any) => ({ id: p.id, name: p.name })));

    const subsMap: Record<string, any> = {};
    (subsRes.data || []).forEach((s: any) => {
      if (!subsMap[s.user_id] || s.status === 'active') {
        subsMap[s.user_id] = {
          plan_name: planMap[s.plan_id] || 'Unknown Plan',
          locked_price: s.locked_price,
          locked_billing_period: s.locked_billing_period,
          is_grandfathered: s.is_grandfathered,
          status: s.status,
          started_at: s.started_at,
          stripe_subscription_id: s.stripe_subscription_id,
        };
      }
    });

    const emailMap: Record<string, string> = emailsRes.data?.emails || {};

    const enriched: EnrichedProfile[] = (profilesRes.data || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      name: p.name,
      stage_name: p.stage_name,
      avatar_url: p.avatar_url,
      patreon_tier: p.patreon_tier,
      created_at: p.created_at,
      email: emailMap[p.user_id] || '',
      roles: rolesMap[p.user_id] || [],
      subscription: subsMap[p.user_id] || null,
    }));

    setUsers(enriched);
    setLoading(false);
  }

  const tierLabel = (tier: PatreonTier | null) => {
    switch (tier) {
      case 'lab-pass': return 'Club Pass';
      case 'creator-accelerator': return 'Accelerator';
      case 'creative-economy-lab': return 'Artist Incubator';
      default: return 'Club Pass';
    }
  };

  const tierColor = (tier: PatreonTier | null) => {
    switch (tier) {
      case 'creative-economy-lab': return 'bg-primary/20 text-primary border-primary/30';
      case 'creator-accelerator': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const roleColor = (role: AppRole) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'moderator': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const billingLabel = (period: string) => {
    switch (period) {
      case 'monthly': return '/mo';
      case 'yearly': return '/yr';
      case 'one-time': return ' once';
      default: return '';
    }
  };

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.stage_name?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    switch (filterType) {
      case 'legacy': return u.subscription?.is_grandfathered === true;
      case 'current': return u.subscription && !u.subscription.is_grandfathered;
      case 'no-plan': return !u.subscription;
      default: return true;
    }
  });

  const legacyCount = users.filter(u => u.subscription?.is_grandfathered).length;
  const currentCount = users.filter(u => u.subscription && !u.subscription.is_grandfathered).length;
  const noPlanCount = users.filter(u => !u.subscription).length;

  async function handleUpdateTier() {
    if (!editingUser) return;
    const previousTier = editingUser.patreon_tier;

    const { error } = await supabase
      .from('profiles')
      .update({ patreon_tier: selectedTier })
      .eq('id', editingUser.id);

    if (error) { toast.error('Failed to update tier'); return; }

    const isUpgrade = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'].indexOf(selectedTier) >
      ['lab-pass', 'creator-accelerator', 'creative-economy-lab'].indexOf(previousTier || 'lab-pass');

    await supabase.from('notifications').insert({
      user_id: editingUser.user_id,
      title: isUpgrade ? '🎉 Membership Upgraded!' : 'Membership Updated',
      message: isUpgrade
        ? `Congratulations! Your membership has been upgraded to ${tierLabel(selectedTier)}.`
        : `Your membership has been updated to ${tierLabel(selectedTier)}.`,
      type: 'info',
      link: '/dashboard',
    });

    logAccess({
      tableName: 'profiles', action: 'update_tier', recordId: editingUser.id,
      details: { previous_tier: previousTier, new_tier: selectedTier, user_name: editingUser.name },
    });

    toast.success(`Updated ${editingUser.name || 'user'} to ${tierLabel(selectedTier)}`);
    setEditingUser(null);
    fetchAllData();
  }

  async function handleUpdateRoles() {
    if (!editingUser) return;
    const userId = editingUser.user_id;
    const currentRoles = editingUser.roles;

    const rolesToAdd = selectedRoles.filter(r => !currentRoles.includes(r));
    const rolesToRemove = currentRoles.filter(r => !selectedRoles.includes(r));

    for (const role of rolesToRemove) {
      const { error } = await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role);
      if (error) { toast.error(`Failed to remove ${role} role`); return; }
    }
    for (const role of rolesToAdd) {
      const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });
      if (error) { toast.error(`Failed to add ${role} role`); return; }
    }

    logAccess({
      tableName: 'user_roles', action: 'update_roles',
      details: { target_user_id: userId, user_name: editingUser.name, roles_added: rolesToAdd, roles_removed: rolesToRemove, final_roles: selectedRoles },
    });

    toast.success(`Updated roles for ${editingUser.name || 'user'}`);
    setEditingUser(null);
    fetchAllData();
  }

  function toggleRole(role: AppRole) {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <>
      <ReauthDialog {...tierReauth.dialogProps} />
      <ReauthDialog {...roleReauth.dialogProps} />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-xs text-muted-foreground">Total Members</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-500" />
                <p className="text-2xl font-bold text-foreground">{legacyCount}</p>
              </div>
              <p className="text-xs text-muted-foreground">Legacy (Grandfathered)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" />
                <p className="text-2xl font-bold text-foreground">{currentCount}</p>
              </div>
              <p className="text-xs text-muted-foreground">Current Pricing</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-muted-foreground">{noPlanCount}</p>
              <p className="text-xs text-muted-foreground">No Active Plan</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>User Management</CardTitle>
            <CardDescription>View all members with their plan, pricing, billing, and legacy status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[220px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or stage name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={v => setFilterType(v as any)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Members ({users.length})</SelectItem>
                  <SelectItem value="legacy">Legacy / Grandfathered ({legacyCount})</SelectItem>
                  <SelectItem value="current">Current Pricing ({currentCount})</SelectItem>
                  <SelectItem value="no-plan">No Active Plan ({noPlanCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {editingUser && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                Edit: {editingUser.name || 'User'}
                {editingUser.email && <span className="text-sm font-normal text-muted-foreground">({editingUser.email})</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Membership Tier</Label>
                <Select value={selectedTier} onValueChange={(v: PatreonTier) => setSelectedTier(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab-pass">Club Pass</SelectItem>
                    <SelectItem value="creator-accelerator">Accelerator</SelectItem>
                    <SelectItem value="creative-economy-lab">Artist Incubator</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => tierReauth.requireReauth(handleUpdateTier)} size="sm" className="mt-2">Update Tier</Button>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <Label>User Roles</Label>
                <div className="flex flex-wrap gap-2">
                  {(['admin', 'moderator'] as AppRole[]).map(role => (
                    <Button
                      key={role}
                      variant={selectedRoles.includes(role) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleRole(role)}
                      className={selectedRoles.includes(role) ? roleColor(role) : ''}
                    >
                      {selectedRoles.includes(role) && <Check className="h-3 w-3 mr-1" />}
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Button>
                  ))}
                </div>
                <Button onClick={() => roleReauth.requireReauth(handleUpdateRoles)} size="sm" className="mt-2">Update Roles</Button>
              </div>

              <div className="pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setEditingUser(null)}>Close</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} member{filtered.length !== 1 ? 's' : ''} found</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium text-muted-foreground">Member</th>
                    <th className="pb-3 font-medium text-muted-foreground">Email</th>
                    <th className="pb-3 font-medium text-muted-foreground">Plan</th>
                    <th className="pb-3 font-medium text-muted-foreground">Paying</th>
                    <th className="pb-3 font-medium text-muted-foreground">Type</th>
                    <th className="pb-3 font-medium text-muted-foreground">Status</th>
                    <th className="pb-3 font-medium text-muted-foreground">Since</th>
                    <th className="pb-3 font-medium text-muted-foreground">Roles</th>
                    <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Users className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-foreground">{user.name || 'Unnamed'}</p>
                            {user.stage_name && <p className="text-xs text-muted-foreground">{user.stage_name}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground text-xs max-w-[180px] truncate">
                        {user.email || '—'}
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className={tierColor(user.patreon_tier)}>
                          {tierLabel(user.patreon_tier)}
                        </Badge>
                      </td>
                      <td className="py-3 font-mono text-foreground">
                        {user.subscription ? (
                          Number(user.subscription.locked_price) === 0 ? (
                            <span className="text-green-500 font-semibold">Free</span>
                          ) : (
                            <span>
                              ${user.subscription.locked_price}
                              <span className="text-muted-foreground text-xs">{billingLabel(user.subscription.locked_billing_period)}</span>
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        {user.subscription?.is_grandfathered ? (
                          <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-500">
                            <Shield className="h-3 w-3" /> Legacy
                          </Badge>
                        ) : user.subscription ? (
                          <Badge variant="outline" className="gap-1">
                            <Crown className="h-3 w-3" /> Current
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        {user.subscription ? (
                          <Badge variant={user.subscription.status === 'active' ? 'default' : 'secondary'}>
                            {user.subscription.status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground text-xs">
                        {user.subscription ? new Date(user.subscription.started_at).toLocaleDateString() : new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {user.roles.map(role => (
                            <Badge key={role} variant="outline" className={`text-xs ${roleColor(role)}`}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user);
                            setSelectedTier(user.patreon_tier || 'lab-pass');
                            setSelectedRoles(user.roles);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">No members match your search.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
