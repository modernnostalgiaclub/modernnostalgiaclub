import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  author_name: string;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image_url: '',
  author_name: 'ModernNostalgia.club',
  tags: '',
  is_published: false,
};

export function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts' as any)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { toast.error('Failed to load posts'); return; }
    setPosts((data as unknown as BlogPost[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const slugify = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditing(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image_url: post.cover_image_url || '',
      author_name: post.author_name,
      tags: (post.tags || []).join(', '),
      is_published: post.is_published,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) { toast.error('Title and slug are required'); return; }
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || null,
      content: form.content || null,
      cover_image_url: form.cover_image_url || null,
      author_name: form.author_name,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      is_published: form.is_published,
      published_at: form.is_published ? new Date().toISOString() : null,
    };

    if (editing) {
      const { error } = await (supabase.from('blog_posts' as any) as any).update(payload).eq('id', editing);
      if (error) { toast.error('Failed to update post'); setSaving(false); return; }
      toast.success('Post updated');
    } else {
      const { error } = await (supabase.from('blog_posts' as any) as any).insert(payload);
      if (error) { toast.error('Failed to create post: ' + error.message); setSaving(false); return; }
      toast.success('Post created');
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    const { error } = await (supabase.from('blog_posts' as any) as any).delete().eq('id', id);
    if (error) { toast.error('Failed to delete'); return; }
    toast.success('Post deleted');
    fetchPosts();
  };

  const togglePublish = async (post: BlogPost) => {
    const { error } = await (supabase.from('blog_posts' as any) as any)
      .update({ is_published: !post.is_published, published_at: !post.is_published ? new Date().toISOString() : null })
      .eq('id', post.id);
    if (error) { toast.error('Failed to update'); return; }
    toast.success(post.is_published ? 'Post unpublished' : 'Post published');
    fetchPosts();
  };

  if (showForm) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">{editing ? 'Edit Post' : 'New Post'}</h2>
          <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
        <div className="space-y-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))} placeholder="Post title" />
          </div>
          <div>
            <Label>Slug *</Label>
            <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="url-friendly-slug" />
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short summary shown in cards..." rows={2} />
          </div>
          <div>
            <Label>Content (Markdown)</Label>
            <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Full post content in markdown..." rows={12} className="font-mono text-sm" />
          </div>
          <div>
            <Label>Cover Image URL</Label>
            <Input value={form.cover_image_url} onChange={e => setForm(f => ({ ...f, cover_image_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <Label>Author Name</Label>
            <Input value={form.author_name} onChange={e => setForm(f => ({ ...f, author_name: e.target.value }))} />
          </div>
          <div>
            <Label>Tags (comma separated)</Label>
            <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="sync, licensing, business" />
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))} />
            <Label>Published</Label>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} variant="maroon">
          {saving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl">Blog Posts</h2>
          <p className="text-muted-foreground text-sm">Manage editorial content for the homepage and public blog.</p>
        </div>
        <Button onClick={handleNew} variant="maroon" className="gap-2">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No posts yet. Create your first post to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <Card key={post.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <CardTitle className="text-lg font-display">{post.title}</CardTitle>
                      <Badge variant={post.is_published ? 'default' : 'secondary'}>
                        {post.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">/{post.slug}</p>
                    {post.excerpt && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => togglePublish(post)} title={post.is_published ? 'Unpublish' : 'Publish'}>
                      {post.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
