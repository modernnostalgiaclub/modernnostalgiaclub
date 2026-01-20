import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical, Link as LinkIcon, Save, X, ExternalLink } from 'lucide-react';

interface NetworkingLink {
  id: string;
  label: string;
  url: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
}

const iconOptions = [
  { value: 'home', label: 'Home' },
  { value: 'music', label: 'Music' },
  { value: 'handshake', label: 'Handshake' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'link', label: 'Link' },
];

export function AdminNetworkingLinks() {
  const [links, setLinks] = useState<NetworkingLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    url: '',
    icon: 'link',
    is_visible: true,
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  async function fetchLinks() {
    // Use service-level query to get all links including hidden ones
    const { data, error } = await supabase
      .from('networking_links')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('Failed to load links');
      console.error('Fetch error:', error);
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!formData.label.trim() || !formData.url.trim()) {
      toast.error('Label and URL are required');
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }

    setSaving(true);

    if (editing) {
      const { error } = await supabase
        .from('networking_links')
        .update({
          label: formData.label.trim(),
          url: formData.url.trim(),
          icon: formData.icon,
          is_visible: formData.is_visible,
        })
        .eq('id', editing);

      if (error) {
        toast.error('Failed to update link');
        console.error('Update error:', error);
      } else {
        toast.success('Link updated');
        fetchLinks();
        resetForm();
      }
    } else {
      const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.sort_order)) : 0;
      
      const { error } = await supabase
        .from('networking_links')
        .insert({
          label: formData.label.trim(),
          url: formData.url.trim(),
          icon: formData.icon,
          is_visible: formData.is_visible,
          sort_order: maxOrder + 1,
        });

      if (error) {
        toast.error('Failed to create link');
        console.error('Insert error:', error);
      } else {
        toast.success('Link created');
        fetchLinks();
        resetForm();
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this link?')) return;

    const { error } = await supabase
      .from('networking_links')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete link');
    } else {
      toast.success('Link deleted');
      setLinks(links.filter(l => l.id !== id));
    }
  }

  async function handleToggleVisibility(id: string, currentlyVisible: boolean) {
    const { error } = await supabase
      .from('networking_links')
      .update({ is_visible: !currentlyVisible })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update visibility');
    } else {
      setLinks(links.map(l => 
        l.id === id ? { ...l, is_visible: !currentlyVisible } : l
      ));
    }
  }

  async function moveLink(id: string, direction: 'up' | 'down') {
    const index = links.findIndex(l => l.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;

    const newLinks = [...links];
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];

    // Update sort_order for swapped items
    const updates = [
      { id: newLinks[index].id, sort_order: index },
      { id: newLinks[newIndex].id, sort_order: newIndex },
    ];

    for (const update of updates) {
      await supabase
        .from('networking_links')
        .update({ sort_order: update.sort_order })
        .eq('id', update.id);
    }

    setLinks(newLinks.map((l, i) => ({ ...l, sort_order: i })));
  }

  function startEdit(link: NetworkingLink) {
    setFormData({
      label: link.label,
      url: link.url,
      icon: link.icon,
      is_visible: link.is_visible,
    });
    setEditing(link.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({ label: '', url: '', icon: 'link', is_visible: true });
    setEditing(null);
    setShowForm(false);
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Networking Links
            </CardTitle>
            <CardDescription>
              Manage the links shown on your /connect page
            </CardDescription>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add/Edit Form */}
        {showForm && (
          <div className="p-4 bg-secondary/20 rounded-lg space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., My Website"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <select
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                >
                  {iconOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-7">
                <Switch
                  id="visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
                <Label htmlFor="visible" className="cursor-pointer">Visible</Label>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={resetForm} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        )}

        {/* Links List */}
        <div className="space-y-2">
          {links.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No links yet. Add your first link above.
            </div>
          ) : (
            links.map((link, index) => (
              <div
                key={link.id}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  link.is_visible ? 'bg-background' : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveLink(link.id, 'up')}
                    disabled={index === 0}
                  >
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => moveLink(link.id, 'down')}
                    disabled={index === links.length - 1}
                  >
                    <GripVertical className="h-4 w-4 rotate-90" />
                  </Button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium">{link.label}</div>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-maroon truncate block"
                  >
                    {link.url}
                    <ExternalLink className="inline h-3 w-3 ml-1" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={link.is_visible}
                    onCheckedChange={() => handleToggleVisibility(link.id, link.is_visible)}
                    aria-label={`Toggle visibility for ${link.label}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEdit(link)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(link.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Preview Link */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Preview your page:</p>
          <a
            href="/connect"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-maroon hover:underline"
          >
            /connect
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
