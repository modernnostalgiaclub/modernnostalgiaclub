import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, Users, DollarSign, Search, Crown } from 'lucide-react';

interface MemberSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  locked_price: number;
  locked_billing_period: string;
  is_grandfathered: boolean;
  status: string;
  stripe_subscription_id: string | null;
  started_at: string;
  notes: string | null;
  member_name?: string;
  plan_name?: string;
  current_plan_price?: number;
}

export function AdminGrandfatheredMembers() {
  const [subscriptions, setSubs] = useState<MemberSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'grandfathered' | 'new'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);

    // Fetch subscriptions with profile name
    const { data: subs, error: subErr } = await supabase
      .from('member_subscriptions')
      .select('*')
      .order('started_at', { ascending: true });

    if (subErr) {
      toast.error('Failed to load subscriptions');
      setLoading(false);
      return;
    }

    // Fetch profiles and plans for display
    const userIds = [...new Set((subs || []).map((s: any) => s.user_id))];
    const planIds = [...new Set((subs || []).map((s: any) => s.plan_id).filter(Boolean))];

    const [profilesRes, plansRes] = await Promise.all([
      userIds.length > 0
        ? supabase.from('profiles').select('user_id, name, stage_name').in('user_id', userIds)
        : { data: [] },
      planIds.length > 0
        ? supabase.from('membership_plans').select('id, name, price').in('id', planIds)
        : { data: [] },
    ]);

    const profileMap = Object.fromEntries(
      ((profilesRes as any).data || []).map((p: any) => [p.user_id, p.stage_name || p.name || 'Unknown'])
    );
    const planMap = Object.fromEntries(
      ((plansRes as any).data || []).map((p: any) => [p.id, { name: p.name, price: p.price }])
    );

    const enriched = (subs || []).map((s: any) => ({
      ...s,
      member_name: profileMap[s.user_id] || 'Unknown',
      plan_name: planMap[s.plan_id]?.name || 'Unknown Plan',
      current_plan_price: planMap[s.plan_id]?.price || 0,
    }));

    setSubs(enriched);
    setLoading(false);
  };

  const filtered = subscriptions.filter(s => {
    if (filter === 'grandfathered' && !s.is_grandfathered) return false;
    if (filter === 'new' && s.is_grandfathered) return false;
    if (search && !s.member_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grandfatheredCount = subscriptions.filter(s => s.is_grandfathered).length;
  const newCount = subscriptions.filter(s => !s.is_grandfathered).length;
  const grandfatheredRevenue = subscriptions
    .filter(s => s.is_grandfathered && s.status === 'active')
    .reduce((sum, s) => sum + Number(s.locked_price), 0);
  const newRevenue = subscriptions
    .filter(s => !s.is_grandfathered && s.status === 'active')
    .reduce((sum, s) => sum + Number(s.locked_price), 0);

  const handleUpgradeToCurrentPricing = async (sub: MemberSubscription) => {
    if (!confirm(`Remove grandfathered status for ${sub.member_name}? They will be moved to current pricing ($${sub.current_plan_price}).`)) return;
    
    const { error } = await supabase
      .from('member_subscriptions')
      .update({
        is_grandfathered: false,
        locked_price: sub.current_plan_price,
        notes: (sub.notes || '') + `\nUpgraded from grandfathered pricing ($${sub.locked_price}) on ${new Date().toLocaleDateString()}`,
      } as any)
      .eq('id', sub.id);

    if (error) toast.error('Failed to update');
    else {
      toast.success(`${sub.member_name} moved to current pricing`);
      fetchSubscriptions();
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading member subscriptions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Shield className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{grandfatheredCount}</p>
                <p className="text-xs text-muted-foreground">Grandfathered Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{newCount}</p>
                <p className="text-xs text-muted-foreground">New Pricing Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  ${grandfatheredRevenue + newRevenue}
                </p>
                <p className="text-xs text-muted-foreground">
                  ${grandfatheredRevenue} legacy / ${newRevenue} new
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members..."
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={v => setFilter(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members ({subscriptions.length})</SelectItem>
            <SelectItem value="grandfathered">Grandfathered ({grandfatheredCount})</SelectItem>
            <SelectItem value="new">New Pricing ({newCount})</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Member Subscriptions</CardTitle>
          <CardDescription>
            Grandfathered members keep their original pricing. New members pay current rates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Member</th>
                  <th className="pb-3 font-medium text-muted-foreground">Plan</th>
                  <th className="pb-3 font-medium text-muted-foreground">Locked Price</th>
                  <th className="pb-3 font-medium text-muted-foreground">Current Price</th>
                  <th className="pb-3 font-medium text-muted-foreground">Status</th>
                  <th className="pb-3 font-medium text-muted-foreground">Type</th>
                  <th className="pb-3 font-medium text-muted-foreground">Since</th>
                  <th className="pb-3 font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(sub => {
                  const savings = Number(sub.current_plan_price) - Number(sub.locked_price);
                  return (
                    <tr key={sub.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 font-medium text-foreground">{sub.member_name}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {sub.plan_name}
                        </div>
                      </td>
                      <td className="py-3 font-mono">
                        {Number(sub.locked_price) === 0 ? (
                          <span className="text-green-500 font-semibold">Free</span>
                        ) : (
                          <>
                            ${sub.locked_price}
                            <span className="text-muted-foreground text-xs ml-1">
                              /{sub.locked_billing_period === 'one-time' ? 'once' : sub.locked_billing_period === 'monthly' ? 'mo' : 'yr'}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="py-3 font-mono">
                        ${sub.current_plan_price}
                        {savings > 0 && sub.is_grandfathered && (
                          <span className="text-green-500 text-xs ml-1">(-${savings})</span>
                        )}
                      </td>
                      <td className="py-3">
                        <Badge variant={sub.status === 'active' ? 'default' : 'secondary'}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {sub.is_grandfathered ? (
                          <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-500">
                            <Shield className="h-3 w-3" /> Legacy
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <Crown className="h-3 w-3" /> New
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(sub.started_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        {sub.is_grandfathered && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleUpgradeToCurrentPricing(sub)}
                          >
                            Move to Current Pricing
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No members match your filter.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
