import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Star, ToggleLeft, Crown, Clock, Tag, X } from 'lucide-react';

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  features: string[];
  billing_period: string;
  price: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  promo_codes: any;
  grace_period_days: number;
  is_active: boolean;
  is_popular: boolean;
  limit_one_per_email: boolean;
  sort_order: number;
  parent_plan_id: string | null;
  created_at: string;
  updated_at: string;
}

const emptyPlan: Omit<MembershipPlan, 'id' | 'created_at' | 'updated_at'> = {
  name: '',
  description: '',
  features: [],
  billing_period: 'monthly',
  price: 0,
  stripe_price_id: null,
  stripe_product_id: null,
  promo_codes: [],
  grace_period_days: 7,
  is_active: true,
  is_popular: false,
  limit_one_per_email: true,
  sort_order: 0,
  parent_plan_id: null,
};

export function AdminMembershipPlans() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [form, setForm] = useState(emptyPlan);
  const [newFeature, setNewFeature] = useState('');
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      toast.error('Failed to load membership plans');
    } else {
      setPlans((data as unknown as MembershipPlan[]) || []);
    }
    setLoading(false);
  };

  const openCreate = () => {
    setEditingPlan(null);
    setForm({ ...emptyPlan, sort_order: plans.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description || '',
      features: plan.features || [],
      billing_period: plan.billing_period,
      price: plan.price,
      stripe_price_id: plan.stripe_price_id,
      stripe_product_id: plan.stripe_product_id,
      promo_codes: plan.promo_codes || [],
      grace_period_days: plan.grace_period_days,
      is_active: plan.is_active,
      is_popular: plan.is_popular,
      limit_one_per_email: plan.limit_one_per_email,
      sort_order: plan.sort_order,
      parent_plan_id: plan.parent_plan_id,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Plan name is required');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      features: form.features,
      billing_period: form.billing_period,
      price: form.price,
      stripe_price_id: form.stripe_price_id,
      stripe_product_id: form.stripe_product_id,
      promo_codes: form.promo_codes,
      grace_period_days: form.grace_period_days,
      is_active: form.is_active,
      is_popular: form.is_popular,
      limit_one_per_email: form.limit_one_per_email,
      sort_order: form.sort_order,
      parent_plan_id: form.parent_plan_id,
    };

    if (editingPlan) {
      const { error } = await supabase
        .from('membership_plans')
        .update(payload as any)
        .eq('id', editingPlan.id);
      if (error) toast.error('Failed to update plan');
      else toast.success('Plan updated');
    } else {
      const { error } = await supabase
        .from('membership_plans')
        .insert(payload as any);
      if (error) toast.error('Failed to create plan');
      else toast.success('Plan created');
    }
    setSaving(false);
    setDialogOpen(false);
    fetchPlans();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    const { error } = await supabase
      .from('membership_plans')
      .delete()
      .eq('id', id);
    if (error) toast.error('Failed to delete plan');
    else {
      toast.success('Plan deleted');
      fetchPlans();
    }
  };

  const toggleActive = async (plan: MembershipPlan) => {
    const { error } = await supabase
      .from('membership_plans')
      .update({ is_active: !plan.is_active } as any)
      .eq('id', plan.id);
    if (error) toast.error('Failed to toggle status');
    else fetchPlans();
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setForm(f => ({ ...f, features: [...f.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setForm(f => ({ ...f, features: f.features.filter((_, i) => i !== index) }));
  };

  const addPromoCode = () => {
    if (newPromoCode.trim()) {
      const codes = Array.isArray(form.promo_codes) ? form.promo_codes : [];
      setForm(f => ({
        ...f,
        promo_codes: [...codes, { code: newPromoCode.trim().toUpperCase(), discount_percent: newPromoDiscount }],
      }));
      setNewPromoCode('');
      setNewPromoDiscount(10);
    }
  };

  const removePromoCode = (index: number) => {
    const codes = Array.isArray(form.promo_codes) ? form.promo_codes : [];
    setForm(f => ({ ...f, promo_codes: codes.filter((_: any, i: number) => i !== index) }));
  };

  const billingLabel = (period: string) => {
    switch (period) {
      case 'monthly': return '/month';
      case 'yearly': return '/year';
      case 'one-time': return 'one-time';
      default: return period;
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading membership plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Membership Plans</h2>
          <p className="text-muted-foreground">Create and manage membership tiers, pricing, and features.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => (
          <Card key={plan.id} className={`relative ${!plan.is_active ? 'opacity-60' : ''} ${plan.is_popular ? 'ring-2 ring-primary' : ''}`}>
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground gap-1">
                  <Star className="h-3 w-3" /> Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription className="mt-1">{plan.description}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(plan)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                <span className="text-muted-foreground text-sm">{billingLabel(plan.billing_period)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline">{plan.billing_period}</Badge>
                {plan.grace_period_days > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" /> {plan.grace_period_days}d grace
                  </Badge>
                )}
                {plan.limit_one_per_email && (
                  <Badge variant="outline">1 per email</Badge>
                )}
              </div>

              {plan.features && plan.features.length > 0 && (
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              {Array.isArray(plan.promo_codes) && plan.promo_codes.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {plan.promo_codes.map((p: any, i: number) => (
                    <Badge key={i} variant="outline" className="gap-1 text-xs">
                      <Tag className="h-3 w-3" /> {p.code} ({p.discount_percent}% off)
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => toggleActive(plan)}
              >
                <ToggleLeft className="h-4 w-4 mr-2" />
                {plan.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No membership plans yet. Click "New Plan" to create your first one.
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-anton uppercase tracking-tight">
              {editingPlan ? `Editing: ${editingPlan.name}` : 'Create Membership Plan'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Plan Name & Price */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input
                  id="plan-name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Club Pass"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-price">Price (USD)</Label>
                <Input
                  id="plan-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Billing Period & Description */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="plan-billing">Billing Period</Label>
                <Select
                  value={form.billing_period}
                  onValueChange={v => setForm(f => ({ ...f, billing_period: v }))}
                >
                  <SelectTrigger id="plan-billing">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                    <SelectItem value="one-time">One-Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-desc">Description</Label>
                <Input
                  id="plan-desc"
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this tier..."
                />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <Label>Features (one per line)</Label>
              <Textarea
                value={form.features.join('\n')}
                onChange={e => setForm(f => ({ ...f, features: e.target.value.split('\n').filter(line => line.trim()) }))}
                placeholder={"Submit remixes, mashups\nTrack submission status\nCreator dashboard access"}
                rows={4}
              />
            </div>

            {/* Stripe Price ID — read-only info */}
            <div className="space-y-1">
              <Label className="text-sm">Stripe Price ID</Label>
              {form.stripe_price_id ? (
                <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded px-3 py-2">{form.stripe_price_id}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Will be auto-generated when you save this paid plan.</p>
              )}
            </div>

            {/* Free Trial — toggle section */}
            <Card className="border-border/50">
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm text-foreground">Free Trial</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.grace_period_days > 0}
                    onCheckedChange={v => setForm(f => ({ ...f, grace_period_days: v ? 7 : 0 }))}
                  />
                  <span className="text-sm text-muted-foreground">Enable Free Trial</span>
                </div>
              </CardContent>
            </Card>

            {/* Sale & Promo Code — toggle section */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm text-foreground">Sale & Promo Code</span>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={Array.isArray(form.promo_codes) && form.promo_codes.length > 0}
                    onCheckedChange={v => {
                      if (!v) setForm(f => ({ ...f, promo_codes: [] }));
                    }}
                  />
                  <span className="text-sm text-muted-foreground">Put on Sale</span>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Apply Promo Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newPromoCode}
                      onChange={e => setNewPromoCode(e.target.value)}
                      placeholder="e.g., NEWYEAR24"
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addPromoCode())}
                    />
                    <div className="w-24">
                      <Input
                        type="number"
                        min={1}
                        max={100}
                        value={newPromoDiscount}
                        onChange={e => setNewPromoDiscount(parseInt(e.target.value) || 0)}
                        placeholder="%"
                      />
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addPromoCode}>Add</Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Link a promo code that applies to this plan</p>
                </div>

                {Array.isArray(form.promo_codes) && form.promo_codes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.promo_codes.map((p: any, i: number) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {p.code} ({p.discount_percent}% off)
                        <button onClick={() => removePromoCode(i)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Limit 1 Membership per Email */}
            <Card className="border-primary/30">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-sm text-foreground">Limit to 1 Membership per Email</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Prevents users from purchasing this plan more than once with the same email</p>
                  </div>
                  <Switch checked={form.limit_one_per_email} onCheckedChange={v => setForm(f => ({ ...f, limit_one_per_email: v }))} />
                </div>
              </CardContent>
            </Card>

            {/* Grace Period */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="py-4 space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="font-semibold text-sm text-foreground">Grace Period (Payment Failures)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">When a payment fails, members keep access during the grace period before being downgraded.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.grace_period_days > 0}
                    onCheckedChange={v => setForm(f => ({ ...f, grace_period_days: v ? 7 : 0 }))}
                  />
                  <span className="text-sm">Enable Grace Period</span>
                  {form.grace_period_days > 0 && (
                    <Input
                      type="number"
                      min={1}
                      className="w-20"
                      value={form.grace_period_days}
                      onChange={e => setForm(f => ({ ...f, grace_period_days: parseInt(e.target.value) || 0 }))}
                    />
                  )}
                  {form.grace_period_days > 0 && <span className="text-sm text-muted-foreground">days</span>}
                </div>
                {form.grace_period_days > 0 && (
                  <p className="text-xs text-green-500">✓ Members will have {form.grace_period_days} days to update their payment method before losing access</p>
                )}
              </CardContent>
            </Card>

            {/* Plan Active / Mark as Popular */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                <span className="text-sm font-medium">Plan Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_popular} onCheckedChange={v => setForm(f => ({ ...f, is_popular: v }))} />
                <span className="text-sm font-medium">Mark as Popular</span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="gap-2">
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? 'Saving...' : '💾 Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
