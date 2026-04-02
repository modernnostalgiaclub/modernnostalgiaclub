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
            <DialogTitle>{editingPlan ? 'Edit Membership Plan' : 'Create Membership Plan'}</DialogTitle>
            <DialogDescription>
              {editingPlan ? 'Update the plan details below.' : 'Fill in the details for the new membership plan.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Basic Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan-name">Plan Name *</Label>
                  <Input
                    id="plan-name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Club Pass"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan-sort">Sort Order</Label>
                  <Input
                    id="plan-sort"
                    type="number"
                    value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan-desc">Description</Label>
                <Textarea
                  id="plan-desc"
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of this membership tier..."
                  rows={3}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Pricing</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan-price">Price ($)</Label>
                  <Input
                    id="plan-price"
                    type="number"
                    min={0}
                    step={0.01}
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
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
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stripe-price">Stripe Price ID</Label>
                  <Input
                    id="stripe-price"
                    value={form.stripe_price_id || ''}
                    onChange={e => setForm(f => ({ ...f, stripe_price_id: e.target.value || null }))}
                    placeholder="price_..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripe-product">Stripe Product ID</Label>
                  <Input
                    id="stripe-product"
                    value={form.stripe_product_id || ''}
                    onChange={e => setForm(f => ({ ...f, stripe_product_id: e.target.value || null }))}
                    placeholder="prod_..."
                  />
                </div>
              </div>

              {/* Link to parent plan for multi-pricing */}
              <div className="space-y-2">
                <Label htmlFor="parent-plan">Parent Plan (for grouped pricing options)</Label>
                <Select
                  value={form.parent_plan_id || 'none'}
                  onValueChange={v => setForm(f => ({ ...f, parent_plan_id: v === 'none' ? null : v }))}
                >
                  <SelectTrigger id="parent-plan">
                    <SelectValue placeholder="None (standalone plan)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (standalone plan)</SelectItem>
                    {plans
                      .filter(p => p.id !== editingPlan?.id && !p.parent_plan_id)
                      .map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Features</h3>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={e => setNewFeature(e.target.value)}
                  placeholder="Add a feature..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" variant="outline" onClick={addFeature}>Add</Button>
              </div>
              {form.features.length > 0 && (
                <ul className="space-y-1">
                  {form.features.map((f, i) => (
                    <li key={i} className="flex items-center justify-between bg-muted/50 rounded px-3 py-1.5 text-sm">
                      <span>{f}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFeature(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Promo Codes */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Promo Codes</h3>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Code</Label>
                  <Input
                    value={newPromoCode}
                    onChange={e => setNewPromoCode(e.target.value)}
                    placeholder="WELCOME20"
                  />
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-xs">Discount %</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={newPromoDiscount}
                    onChange={e => setNewPromoDiscount(parseInt(e.target.value) || 0)}
                  />
                </div>
                <Button type="button" variant="outline" onClick={addPromoCode}>Add</Button>
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
            </div>

            {/* Administrative Controls */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Administrative Controls</h3>
              <div className="space-y-2">
                <Label htmlFor="grace-period">Grace Period (days)</Label>
                <Input
                  id="grace-period"
                  type="number"
                  min={0}
                  value={form.grace_period_days}
                  onChange={e => setForm(f => ({ ...f, grace_period_days: parseInt(e.target.value) || 0 }))}
                />
                <p className="text-xs text-muted-foreground">Number of days after payment due date before access is revoked.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Plan Active</Label>
                    <p className="text-xs text-muted-foreground">Members can sign up for this plan</p>
                  </div>
                  <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mark as Popular</Label>
                    <p className="text-xs text-muted-foreground">Highlights this plan as featured</p>
                  </div>
                  <Switch checked={form.is_popular} onCheckedChange={v => setForm(f => ({ ...f, is_popular: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Limit One per Email</Label>
                    <p className="text-xs text-muted-foreground">Restrict to one membership per email address</p>
                  </div>
                  <Switch checked={form.limit_one_per_email} onCheckedChange={v => setForm(f => ({ ...f, limit_one_per_email: v }))} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
