import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { BookOpen, FileText, Users, Plus, Pencil, Trash2, Eye, Check, X, Clock, AlertCircle, Shield, Search } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Course = Database['public']['Tables']['courses']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'] & {
  profiles?: { name: string | null; email: string | null } | null;
};
type PatreonTier = Database['public']['Enums']['patreon_tier'];
type SubmissionStatus = Database['public']['Enums']['submission_status'];

export default function Admin() {
  const { user, loading, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('courses');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-foreground/60">Loading...</div>
      </div>
    );
  }

  if (!user || (!hasRole('admin') && !hasRole('moderator'))) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage courses, lessons, and review submissions.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="lessons" className="gap-2">
              <FileText className="h-4 w-4" />
              Lessons
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <Users className="h-4 w-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Shield className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            <CoursesManager />
          </TabsContent>

          <TabsContent value="lessons">
            <LessonsManager />
          </TabsContent>

          <TabsContent value="submissions">
            <SubmissionsReviewer />
          </TabsContent>

          <TabsContent value="users">
            <UsersManager />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    icon: 'book',
    min_tier: 'lab-pass' as PatreonTier,
    is_published: false,
    sort_order: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('Failed to load courses');
      return;
    }
    setCourses(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!formData.title || !formData.slug) {
      toast.error('Title and slug are required');
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('courses')
        .update(formData)
        .eq('id', editing);

      if (error) {
        toast.error('Failed to update course');
        return;
      }
      toast.success('Course updated');
    } else {
      const { error } = await supabase
        .from('courses')
        .insert(formData);

      if (error) {
        toast.error('Failed to create course');
        return;
      }
      toast.success('Course created');
    }

    resetForm();
    fetchCourses();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure? This will also delete all lessons in this course.')) return;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete course');
      return;
    }
    toast.success('Course deleted');
    fetchCourses();
  }

  function startEdit(course: Course) {
    setFormData({
      title: course.title,
      slug: course.slug,
      description: course.description || '',
      icon: course.icon || 'book',
      min_tier: course.min_tier,
      is_published: course.is_published || false,
      sort_order: course.sort_order || 0
    });
    setEditing(course.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      slug: '',
      description: '',
      icon: 'book',
      min_tier: 'lab-pass',
      is_published: false,
      sort_order: 0
    });
    setEditing(null);
    setShowForm(false);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Course
        </Button>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Course' : 'New Course'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Course title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="course-slug"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="lucide icon name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier">Minimum Tier</Label>
                <Select
                  value={formData.min_tier}
                  onValueChange={(v: PatreonTier) => setFormData({ ...formData, min_tier: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lab-pass">Lab Pass</SelectItem>
                    <SelectItem value="creator-accelerator">Creator Accelerator</SelectItem>
                    <SelectItem value="creative-economy-lab">Creative Economy Lab</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Sort Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={formData.is_published}
                onCheckedChange={v => setFormData({ ...formData, is_published: v })}
              />
              <Label htmlFor="published">Published</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {courses.map(course => (
          <Card key={course.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">/{course.slug} • {course.min_tier}</p>
                </div>
                <Badge variant={course.is_published ? 'default' : 'secondary'}>
                  {course.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => startEdit(course)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LessonsManager() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    is_published: false,
    sort_order: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons();
    }
  }, [selectedCourse]);

  async function fetchCourses() {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .order('sort_order');
    
    setCourses(data || []);
    if (data && data.length > 0) {
      setSelectedCourse(data[0].id);
    }
    setLoading(false);
  }

  async function fetchLessons() {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', selectedCourse)
      .order('sort_order');

    if (error) {
      toast.error('Failed to load lessons');
      return;
    }
    setLessons(data || []);
  }

  async function handleSave() {
    if (!formData.title) {
      toast.error('Title is required');
      return;
    }

    const payload = { ...formData, course_id: selectedCourse };

    if (editing) {
      const { error } = await supabase
        .from('lessons')
        .update(payload)
        .eq('id', editing);

      if (error) {
        toast.error('Failed to update lesson');
        return;
      }
      toast.success('Lesson updated');
    } else {
      const { error } = await supabase
        .from('lessons')
        .insert(payload);

      if (error) {
        toast.error('Failed to create lesson');
        return;
      }
      toast.success('Lesson created');
    }

    resetForm();
    fetchLessons();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this lesson?')) return;

    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete lesson');
      return;
    }
    toast.success('Lesson deleted');
    fetchLessons();
  }

  function startEdit(lesson: Lesson) {
    setFormData({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      is_published: lesson.is_published || false,
      sort_order: lesson.sort_order || 0
    });
    setEditing(lesson.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      content: '',
      video_url: '',
      is_published: false,
      sort_order: 0
    });
    setEditing(null);
    setShowForm(false);
  }

  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Label>Course:</Label>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedCourse && !showForm && (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lesson
        </Button>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Lesson' : 'New Lesson'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lessonTitle">Title</Label>
                <Input
                  id="lessonTitle"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Lesson title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.video_url}
                  onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonDesc">Description</Label>
              <Textarea
                id="lessonDesc"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Lesson content in markdown..."
                rows={6}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lessonOrder">Sort Order</Label>
                <Input
                  id="lessonOrder"
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="lessonPublished"
                  checked={formData.is_published}
                  onCheckedChange={v => setFormData({ ...formData, is_published: v })}
                />
                <Label htmlFor="lessonPublished">Published</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {lessons.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No lessons yet. Add one to get started.
            </CardContent>
          </Card>
        ) : (
          lessons.map((lesson, idx) => (
            <Card key={lesson.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{lesson.title}</h3>
                    <p className="text-sm text-muted-foreground">{lesson.description || 'No description'}</p>
                  </div>
                  <Badge variant={lesson.is_published ? 'default' : 'secondary'}>
                    {lesson.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(lesson)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function SubmissionsReviewer() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [newStatus, setNewStatus] = useState<SubmissionStatus>('pending');
  const [filter, setFilter] = useState<SubmissionStatus | 'all'>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    const { data, error } = await supabase
      .from('submissions')
      .select('*, profiles!submissions_user_id_fkey(name, email)')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load submissions');
      return;
    }
    setSubmissions(data || []);
    setLoading(false);
  }

  async function handleUpdateSubmission() {
    if (!selectedSubmission || !user) return;

    const { error } = await supabase
      .from('submissions')
      .update({
        status: newStatus,
        reviewer_notes: reviewerNotes,
        internal_notes: internalNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', selectedSubmission.id);

    if (error) {
      toast.error('Failed to update submission');
      return;
    }

    toast.success('Submission updated');
    setSelectedSubmission(null);
    fetchSubmissions();
  }

  function openReview(submission: Submission) {
    setSelectedSubmission(submission);
    setReviewerNotes(submission.reviewer_notes || '');
    setInternalNotes(submission.internal_notes || '');
    setNewStatus(submission.status);
  }

  const filteredSubmissions = filter === 'all' 
    ? submissions 
    : submissions.filter(s => s.status === filter);

  const statusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in-review': return <Eye className="h-4 w-4" />;
      case 'reviewed': return <Check className="h-4 w-4" />;
      case 'needs-revision': return <AlertCircle className="h-4 w-4" />;
    }
  };

  const statusColor = (status: SubmissionStatus) => {
    switch (status) {
      case 'pending': return 'bg-muted text-muted-foreground';
      case 'in-review': return 'bg-blue-500/10 text-blue-500';
      case 'reviewed': return 'bg-green-500/10 text-green-500';
      case 'needs-revision': return 'bg-yellow-500/10 text-yellow-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Label>Filter:</Label>
        <Select value={filter} onValueChange={(v) => setFilter(v as SubmissionStatus | 'all')}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="needs-revision">Needs Revision</SelectItem>
          </SelectContent>
        </Select>
        <Badge variant="outline">{filteredSubmissions.length} submissions</Badge>
      </div>

      {selectedSubmission && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Review: {selectedSubmission.title}</span>
              <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              By {selectedSubmission.profiles?.name || selectedSubmission.profiles?.email || 'Unknown'} •
              {selectedSubmission.submission_type.replace('-', ' ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Disco URL:</p>
              <a 
                href={selectedSubmission.disco_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {selectedSubmission.disco_url}
              </a>
              {selectedSubmission.notes && (
                <>
                  <p className="text-sm font-medium mt-4 mb-2">User Notes:</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.notes}</p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={newStatus} onValueChange={(v: SubmissionStatus) => setNewStatus(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="needs-revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reviewer Notes (visible to user)</Label>
              <Textarea
                value={reviewerNotes}
                onChange={e => setReviewerNotes(e.target.value)}
                placeholder="Feedback for the user..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Internal Notes (only visible to moderators)</Label>
              <Textarea
                value={internalNotes}
                onChange={e => setInternalNotes(e.target.value)}
                placeholder="Private notes..."
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdateSubmission}>Save Review</Button>
              <Button variant="outline" onClick={() => setSelectedSubmission(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No submissions to review.
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map(submission => (
            <Card key={submission.id} className={selectedSubmission?.id === submission.id ? 'ring-2 ring-primary' : ''}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${statusColor(submission.status)}`}>
                    {statusIcon(submission.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{submission.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {submission.profiles?.name || submission.profiles?.email || 'Unknown'} •
                      {submission.submission_type.replace('-', ' ')} •
                      {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusColor(submission.status)}>
                    {submission.status.replace('-', ' ')}
                  </Badge>
                </div>
                <Button variant="outline" onClick={() => openReview(submission)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Review
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

type Profile = {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  patreon_tier: PatreonTier | null;
  avatar_url: string | null;
};

function UsersManager() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [selectedTier, setSelectedTier] = useState<PatreonTier>('lab-pass');

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    // Admins need to see all profiles - use service role via edge function or RLS policy
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load users');
      console.error('Error fetching profiles:', error);
      setLoading(false);
      return;
    }
    setProfiles(data || []);
    setLoading(false);
  }

  async function handleUpdateTier() {
    if (!editingUser) return;

    const { error } = await supabase
      .from('profiles')
      .update({ patreon_tier: selectedTier })
      .eq('id', editingUser.id);

    if (error) {
      toast.error('Failed to update user tier');
      console.error('Error updating tier:', error);
      return;
    }

    toast.success(`Updated ${editingUser.name || editingUser.email} to ${selectedTier}`);
    setEditingUser(null);
    fetchProfiles();
  }

  const filteredProfiles = profiles.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.name?.toLowerCase().includes(query) || false) ||
      (p.email?.toLowerCase().includes(query) || false)
    );
  });

  const tierLabel = (tier: PatreonTier | null) => {
    switch (tier) {
      case 'lab-pass': return 'Lab Pass';
      case 'creator-accelerator': return 'Creator Accelerator';
      case 'creative-economy-lab': return 'Creative Economy Lab';
      default: return 'Lab Pass';
    }
  };

  const tierColor = (tier: PatreonTier | null) => {
    switch (tier) {
      case 'creative-economy-lab': return 'bg-primary/20 text-primary border-primary/30';
      case 'creator-accelerator': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Search users and grant tier access</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {editingUser && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>Grant Access</CardTitle>
            <CardDescription>
              Updating tier for: {editingUser.name || editingUser.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Tier</Label>
              <Select value={selectedTier} onValueChange={(v: PatreonTier) => setSelectedTier(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab-pass">Lab Pass ($1)</SelectItem>
                  <SelectItem value="creator-accelerator">Creator Accelerator ($10)</SelectItem>
                  <SelectItem value="creative-economy-lab">Creative Economy Lab ($150)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdateTier}>Save Changes</Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {filteredProfiles.length} user{filteredProfiles.length !== 1 ? 's' : ''} found
        </p>
        
        {filteredProfiles.map(profile => (
          <Card key={profile.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.name || 'User'} 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{profile.name || 'Unnamed User'}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <Badge variant="outline" className={tierColor(profile.patreon_tier)}>
                  {tierLabel(profile.patreon_tier)}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEditingUser(profile);
                  setSelectedTier(profile.patreon_tier || 'lab-pass');
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Tier
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
