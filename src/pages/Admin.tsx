import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

import { ReauthDialog } from '@/components/ReauthDialog';
import { useReauth } from '@/hooks/useReauth';
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
import { BookOpen, FileText, Users, Plus, Pencil, Trash2, Eye, Check, X, Clock, AlertCircle, Shield, Search, Wrench, Music, BarChart3, DollarSign, GraduationCap, Accessibility, Bell, Settings, Mail, Target, Link as LinkIcon, Database as DatabaseIcon, Users2 } from 'lucide-react';
import { SiteAnalytics } from '@/components/SiteAnalytics';
import { BeatLicenseManager } from '@/components/BeatLicenseManager';
import { AdminLessonProgress } from '@/components/AdminLessonProgress';
import { AccessibilityTester } from '@/components/AccessibilityTester';
import { AdminNotificationSender } from '@/components/AdminNotificationSender';
import { AdminSiteSettings } from '@/components/AdminSiteSettings';
import { AdminEmailCaptures } from '@/components/AdminEmailCaptures';
import { AdminSyncQuizResults } from '@/components/AdminSyncQuizResults';
import { AdminNetworkingContacts } from '@/components/AdminNetworkingContacts';
import { AdminNetworkingLinks } from '@/components/AdminNetworkingLinks';
import { AdminDatabaseBackup } from '@/components/AdminDatabaseBackup';
import { AdminPatreonMigration } from '@/components/AdminPatreonMigration';
import { AdminArtistTracks } from '@/components/AdminArtistTracks';
import { useAuditLog } from '@/hooks/useAuditLog';
import type { Database } from '@/integrations/supabase/types';

type Course = Database['public']['Tables']['courses']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];
type Submission = Database['public']['Tables']['submissions']['Row'] & {
  profiles?: { name: string | null } | null;
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
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">Manage courses, lessons, and review submissions.</p>
            </div>
            {hasRole('admin') && (
              <Link to="/admin/security">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Security Docs
                </Button>
              </Link>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 md:grid-cols-10 lg:w-auto lg:inline-grid h-auto gap-1" role="tablist" aria-label="Admin panel sections">
              <TabsTrigger value="analytics" className="gap-2" aria-label="View site analytics">
                <BarChart3 className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2" aria-label="View user lesson progress">
                <GraduationCap className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2" aria-label="Manage courses">
                <BookOpen className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="lessons" className="gap-2" aria-label="Manage lessons">
                <FileText className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Lessons
              </TabsTrigger>
              <TabsTrigger value="resources" className="gap-2" aria-label="Manage resources">
                <Wrench className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="tracks" className="gap-2" aria-label="Manage tracks">
                <Music className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Tracks
              </TabsTrigger>
              <TabsTrigger value="artist-tracks" className="gap-2" aria-label="Manage artist tracks">
                <Music className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Artist Tracks
              </TabsTrigger>
              <TabsTrigger value="submissions" className="gap-2" aria-label="Review submissions">
                <Users className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Submissions
              </TabsTrigger>
              <TabsTrigger value="licenses" className="gap-2" aria-label="Manage licenses">
                <DollarSign className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Licenses
              </TabsTrigger>
              <TabsTrigger value="emails" className="gap-2" aria-label="View captured emails">
                <Mail className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Emails
              </TabsTrigger>
              <TabsTrigger value="quiz" className="gap-2" aria-label="View sync quiz results">
                <Target className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-2" aria-label="Manage users">
                <Shield className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Users
              </TabsTrigger>
              <TabsTrigger value="accessibility" className="gap-2" aria-label="Accessibility testing">
                <Accessibility className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                A11y
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2" aria-label="Send notifications">
                <Bell className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Notify
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2" aria-label="Site settings">
                <Settings className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="networking" className="gap-2" aria-label="Networking contacts">
                <LinkIcon className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Connect
              </TabsTrigger>
              <TabsTrigger value="backup" className="gap-2" aria-label="Database backup">
                <DatabaseIcon className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Backup
              </TabsTrigger>
              <TabsTrigger value="migration" className="gap-2" aria-label="Patreon migration">
                <Users2 className="h-4 w-4 hidden sm:block" aria-hidden="true" />
                Migration
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <AnalyticsManager />
            </TabsContent>

            <TabsContent value="progress">
              <AdminLessonProgress />
            </TabsContent>

            <TabsContent value="courses">
              <CoursesManager />
            </TabsContent>

            <TabsContent value="lessons">
              <LessonsManager />
            </TabsContent>

            <TabsContent value="resources">
              <ResourcesManager />
            </TabsContent>

            <TabsContent value="tracks">
              <TracksManager />
            </TabsContent>

            <TabsContent value="artist-tracks">
              <AdminArtistTracks />
            </TabsContent>

            <TabsContent value="submissions">
              <SubmissionsReviewer />
            </TabsContent>

            <TabsContent value="licenses">
              <BeatLicenseManager />
            </TabsContent>

            <TabsContent value="emails">
              <AdminEmailCaptures />
            </TabsContent>

            <TabsContent value="quiz">
              <AdminSyncQuizResults />
            </TabsContent>

            <TabsContent value="users">
              <UsersManager />
            </TabsContent>

            <TabsContent value="accessibility">
              <AccessibilityTester />
            </TabsContent>

            <TabsContent value="notifications">
              <AdminNotificationSender />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSiteSettings />
            </TabsContent>

            <TabsContent value="networking">
              <div className="space-y-6">
                <AdminNetworkingContacts />
                <AdminNetworkingLinks />
              </div>
            </TabsContent>

            <TabsContent value="backup">
              <AdminDatabaseBackup />
            </TabsContent>

            <TabsContent value="migration">
              <AdminPatreonMigration />
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    
  );
}

function AnalyticsManager() {
  const [analyticsData, setAnalyticsData] = useState<{
    visitors: number;
    pageviews: number;
    pageviewsPerVisit: number;
    sessionDuration: number;
    bounceRate: number;
    dailyData: { date: string; visitors: number; pageviews: number }[];
    topPages: { page: string; views: number }[];
    sources: { source: string; visits: number }[];
    devices: { device: string; count: number }[];
    countries: { country: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('get-project-analytics', {
        body: {
          startDate: dateRange.start,
          endDate: dateRange.end,
          granularity: 'daily',
        },
      });

      if (response.error) {
        toast.error('Failed to load analytics');
        return;
      }

      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="space-y-1">
            <Label htmlFor="start-date">From</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="end-date">To</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-40"
            />
          </div>
        </div>
        <Button variant="outline" onClick={fetchAnalytics} className="gap-2">
          <BarChart3 className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <SiteAnalytics data={analyticsData} />
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
                    <SelectItem value="lab-pass">Club Pass</SelectItem>
                    <SelectItem value="creator-accelerator">Accelerator</SelectItem>
                    <SelectItem value="creative-economy-lab">Artist Incubator</SelectItem>
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
    // Use the secure RPC function for fetching submissions
    const { data, error } = await supabase.rpc('get_user_submissions');

    if (error) {
      toast.error('Failed to load submissions');
      return;
    }
    
    // Fetch profile names and internal_notes separately for admin view
    const userIds = [...new Set((data || []).map(s => s.user_id))];
    const submissionIds = (data || []).map(s => s.id);
    
    const [profilesResult, internalDataResult] = await Promise.all([
      supabase.from('profiles').select('user_id, name').in('user_id', userIds),
      supabase.from('submissions').select('id, internal_notes').in('id', submissionIds)
    ]);
    
    const profileMap = new Map(profilesResult.data?.map(p => [p.user_id, p.name]) || []);
    const internalNotesMap = new Map(internalDataResult.data?.map(s => [s.id, s.internal_notes]) || []);
    
    const submissionsWithProfiles = (data || [])
      .map(s => ({
        ...s,
        internal_notes: internalNotesMap.get(s.id) || null,
        profiles: { name: profileMap.get(s.user_id) || null }
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setSubmissions(submissionsWithProfiles);
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
              By {selectedSubmission.profiles?.name || 'Unknown'} •
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
                      {submission.profiles?.name || 'Unknown'} •
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
  patreon_tier: PatreonTier | null;
  avatar_url: string | null;
};

type UserRole = {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
};

type AppRole = 'admin' | 'moderator' | 'user';

function UsersManager() {
  const { logAccess } = useAuditLog();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, AppRole[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [selectedTier, setSelectedTier] = useState<PatreonTier>('lab-pass');
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  
  // Re-auth for tier updates
  const tierReauth = useReauth({
    title: 'Confirm Tier Update',
    description: 'Changing a user\'s membership tier is a sensitive action. Please verify with your 2FA code.',
    actionLabel: 'Update Tier',
  });
  
  // Re-auth for role updates
  const roleReauth = useReauth({
    title: 'Confirm Role Change',
    description: 'Modifying user roles is a highly sensitive action. Please verify with your 2FA code.',
    actionLabel: 'Update Roles',
    destructive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Log when admin views user profiles list
  useEffect(() => {
    if (profiles.length > 0) {
      logAccess({
        tableName: 'profiles',
        action: 'view_list',
        details: { count: profiles.length },
      });
    }
  }, [profiles.length]);

  async function fetchData() {
    setLoading(true);
    
    // Fetch profiles and roles in parallel
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('*')
    ]);

    if (profilesRes.error) {
      toast.error('Failed to load users');
      console.error('Error fetching profiles:', profilesRes.error);
      setLoading(false);
      return;
    }

    // Group roles by user_id
    const rolesMap: Record<string, AppRole[]> = {};
    if (rolesRes.data) {
      for (const role of rolesRes.data) {
        if (!rolesMap[role.user_id]) {
          rolesMap[role.user_id] = [];
        }
        rolesMap[role.user_id].push(role.role as AppRole);
      }
    }

    setProfiles(profilesRes.data || []);
    setUserRoles(rolesMap);
    setLoading(false);
  }

  async function handleUpdateTier() {
    if (!editingUser) return;

    const previousTier = editingUser.patreon_tier;
    
    const { error } = await supabase
      .from('profiles')
      .update({ patreon_tier: selectedTier })
      .eq('id', editingUser.id);

    if (error) {
      toast.error('Failed to update user tier');
      console.error('Error updating tier:', error);
      return;
    }

    // Send notification to user about tier upgrade/change
    const isUpgrade = tierHierarchy.indexOf(selectedTier) > tierHierarchy.indexOf(previousTier || 'lab-pass');
    const notificationTitle = isUpgrade ? '🎉 Membership Upgraded!' : 'Membership Updated';
    const notificationMessage = isUpgrade 
      ? `Congratulations! Your membership has been upgraded to ${tierLabel(selectedTier)}. Enjoy your new benefits!`
      : `Your membership has been updated to ${tierLabel(selectedTier)}.`;

    await supabase.from('notifications').insert({
      user_id: editingUser.user_id,
      title: notificationTitle,
      message: notificationMessage,
      type: 'info',
      link: '/dashboard',
    });

    // Log the tier update
    logAccess({
      tableName: 'profiles',
      action: 'update_tier',
      recordId: editingUser.id,
      details: { 
        previous_tier: previousTier,
        new_tier: selectedTier,
        user_name: editingUser.name,
      },
    });

    toast.success(`Updated ${editingUser.name || 'user'} tier to ${tierLabel(selectedTier)}`);
    setEditingUser(null);
    fetchData();
  }

  // Tier hierarchy for upgrade detection
  const tierHierarchy: PatreonTier[] = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];

  async function handleUpdateRoles() {
    if (!editingUser) return;

    const userId = editingUser.user_id;
    const currentRoles = userRoles[userId] || [];

    // Determine roles to add and remove
    const rolesToAdd = selectedRoles.filter(r => !currentRoles.includes(r));
    const rolesToRemove = currentRoles.filter(r => !selectedRoles.includes(r));

    // Remove roles
    for (const role of rolesToRemove) {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      
      if (error) {
        toast.error(`Failed to remove ${role} role`);
        console.error('Error removing role:', error);
        return;
      }
    }

    // Add roles
    for (const role of rolesToAdd) {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });
      
      if (error) {
        toast.error(`Failed to add ${role} role`);
        console.error('Error adding role:', error);
        return;
      }
    }

    // Log the role update
    logAccess({
      tableName: 'user_roles',
      action: 'update_roles',
      details: { 
        target_user_id: userId,
        user_name: editingUser.name,
        roles_added: rolesToAdd,
        roles_removed: rolesToRemove,
        final_roles: selectedRoles,
      },
    });

    toast.success(`Updated roles for ${editingUser.name || 'user'}`);
    setEditingUser(null);
    fetchData();
  }

  function toggleRole(role: AppRole) {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  }

  const filteredProfiles = profiles.filter(p => {
    const query = searchQuery.toLowerCase();
    return (
      (p.name?.toLowerCase().includes(query) || false)
    );
  });

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <>
      {/* Re-auth dialogs for sensitive actions */}
      <ReauthDialog {...tierReauth.dialogProps} />
      <ReauthDialog {...roleReauth.dialogProps} />
      
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Search users, grant tier access, and manage roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
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
            <CardTitle>Edit User</CardTitle>
            <CardDescription>
              Managing: {editingUser.name || 'User'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tier Selection */}
            <div className="space-y-2">
              <Label>Membership Tier</Label>
              <Select value={selectedTier} onValueChange={(v: PatreonTier) => setSelectedTier(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lab-pass">Club Pass ($10)</SelectItem>
                  <SelectItem value="creator-accelerator">Accelerator ($50)</SelectItem>
                  <SelectItem value="creative-economy-lab">Artist Incubator ($300)</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => tierReauth.requireReauth(handleUpdateTier)} size="sm" className="mt-2">
                Update Tier
              </Button>
            </div>

            {/* Role Selection */}
            <div className="space-y-2 pt-4 border-t border-border">
              <Label>User Roles</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select roles to grant special permissions
              </p>
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
              <Button onClick={() => roleReauth.requireReauth(handleUpdateRoles)} size="sm" className="mt-2">
                Update Roles
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {filteredProfiles.length} user{filteredProfiles.length !== 1 ? 's' : ''} found
        </p>
        
        {filteredProfiles.map(profile => {
          const roles = userRoles[profile.user_id] || [];
          
          return (
            <Card key={profile.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4 flex-wrap">
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
                    <p className="text-sm text-muted-foreground">ID: {profile.user_id.slice(0, 8)}...</p>
                  </div>
                  <Badge variant="outline" className={tierColor(profile.patreon_tier)}>
                    {tierLabel(profile.patreon_tier)}
                  </Badge>
                  {roles.map(role => (
                    <Badge key={role} variant="outline" className={roleColor(role)}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setEditingUser(profile);
                    setSelectedTier(profile.patreon_tier || 'lab-pass');
                    setSelectedRoles(userRoles[profile.user_id] || []);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    </>
  );
}

type ReferenceResource = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
  sort_order: number | null;
  is_published: boolean | null;
  created_at: string;
  updated_at: string;
};

function ResourcesManager() {
  const [resources, setResources] = useState<ReferenceResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'General',
    sort_order: 0,
    is_published: true
  });

  useEffect(() => {
    fetchResources();
  }, []);

  async function fetchResources() {
    const { data, error } = await supabase
      .from('reference_resources')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('Failed to load resources');
      return;
    }
    setResources(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!formData.title || !formData.url) {
      toast.error('Title and URL are required');
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('reference_resources')
        .update(formData)
        .eq('id', editing);

      if (error) {
        toast.error('Failed to update resource');
        return;
      }
      toast.success('Resource updated');
    } else {
      const { error } = await supabase
        .from('reference_resources')
        .insert(formData);

      if (error) {
        toast.error('Failed to create resource');
        return;
      }
      toast.success('Resource created');
    }

    resetForm();
    fetchResources();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    const { error } = await supabase
      .from('reference_resources')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete resource');
      return;
    }
    toast.success('Resource deleted');
    fetchResources();
  }

  function startEdit(resource: ReferenceResource) {
    setFormData({
      title: resource.title,
      description: resource.description || '',
      url: resource.url,
      category: resource.category,
      sort_order: resource.sort_order || 0,
      is_published: resource.is_published ?? true
    });
    setEditing(resource.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      url: '',
      category: 'General',
      sort_order: 0,
      is_published: true
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
          Add Resource
        </Button>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Resource' : 'New Resource'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="resourceTitle">Title</Label>
                <Input
                  id="resourceTitle"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Resource title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceUrl">URL</Label>
                <Input
                  id="resourceUrl"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resourceDesc">Description</Label>
              <Textarea
                id="resourceDesc"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the resource"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="resourceCategory">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={v => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Music Tools">Music Tools</SelectItem>
                    <SelectItem value="Tech Tools">Tech Tools</SelectItem>
                    <SelectItem value="Recording">Recording</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resourceOrder">Sort Order</Label>
                <Input
                  id="resourceOrder"
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="resourcePublished"
                  checked={formData.is_published}
                  onCheckedChange={v => setFormData({ ...formData, is_published: v })}
                />
                <Label htmlFor="resourcePublished">Published</Label>
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
        {resources.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No resources yet. Add one to get started.
            </CardContent>
          </Card>
        ) : (
          resources.map(resource => (
            <Card key={resource.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Wrench className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground">{resource.category} • {resource.url.slice(0, 40)}...</p>
                  </div>
                  <Badge variant={resource.is_published ? 'default' : 'secondary'}>
                    {resource.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(resource)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(resource.id)}>
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

type ExampleTrack = Database['public']['Tables']['example_tracks']['Row'];

function TracksManager() {
  const [tracks, setTracks] = useState<ExampleTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    type: 'Approved Example',
    description: '',
    link: '',
    is_download: false,
    is_internal: false,
    sort_order: 0,
    is_published: true
  });

  useEffect(() => {
    fetchTracks();
  }, []);

  async function fetchTracks() {
    const { data, error } = await supabase
      .from('example_tracks')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('Failed to load tracks');
      return;
    }
    setTracks(data || []);
    setLoading(false);
  }

  async function handleSave() {
    if (!formData.title || !formData.link || !formData.artist) {
      toast.error('Title, artist, and link are required');
      return;
    }

    if (editing) {
      const { error } = await supabase
        .from('example_tracks')
        .update(formData)
        .eq('id', editing);

      if (error) {
        toast.error('Failed to update track');
        return;
      }
      toast.success('Track updated');
    } else {
      const { error } = await supabase
        .from('example_tracks')
        .insert(formData);

      if (error) {
        toast.error('Failed to create track');
        return;
      }
      toast.success('Track created');
    }

    resetForm();
    fetchTracks();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this track?')) return;

    const { error } = await supabase
      .from('example_tracks')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete track');
      return;
    }
    toast.success('Track deleted');
    fetchTracks();
  }

  function startEdit(track: ExampleTrack) {
    setFormData({
      title: track.title,
      artist: track.artist,
      type: track.type,
      description: track.description || '',
      link: track.link,
      is_download: track.is_download ?? false,
      is_internal: track.is_internal ?? false,
      sort_order: track.sort_order || 0,
      is_published: track.is_published ?? true
    });
    setEditing(track.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      artist: '',
      type: 'Approved Example',
      description: '',
      link: '',
      is_download: false,
      is_internal: false,
      sort_order: 0,
      is_published: true
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
          Add Track
        </Button>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editing ? 'Edit Track' : 'New Track'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="trackTitle">Title</Label>
                <Input
                  id="trackTitle"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Track title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackArtist">Artist</Label>
                <Input
                  id="trackArtist"
                  value={formData.artist}
                  onChange={e => setFormData({ ...formData, artist: e.target.value })}
                  placeholder="Artist name"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="trackType">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={v => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Approved Example">Approved Example</SelectItem>
                    <SelectItem value="Free Download">Free Download</SelectItem>
                    <SelectItem value="Interactive Tool">Interactive Tool</SelectItem>
                    <SelectItem value="Incubator Members Only">Incubator Members Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackLink">Link</Label>
                <Input
                  id="trackLink"
                  value={formData.link}
                  onChange={e => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://... or /path"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackDesc">Description</Label>
              <Textarea
                id="trackDesc"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the track"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="trackOrder">Sort Order</Label>
                <Input
                  id="trackOrder"
                  type="number"
                  value={formData.sort_order}
                  onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="trackDownload"
                  checked={formData.is_download}
                  onCheckedChange={v => setFormData({ ...formData, is_download: v })}
                />
                <Label htmlFor="trackDownload">Download</Label>
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="trackInternal"
                  checked={formData.is_internal}
                  onCheckedChange={v => setFormData({ ...formData, is_internal: v })}
                />
                <Label htmlFor="trackInternal">Internal Link</Label>
              </div>
              <div className="flex items-center gap-2 pt-8">
                <Switch
                  id="trackPublished"
                  checked={formData.is_published}
                  onCheckedChange={v => setFormData({ ...formData, is_published: v })}
                />
                <Label htmlFor="trackPublished">Published</Label>
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
        {tracks.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No tracks yet. Add one to get started.
            </CardContent>
          </Card>
        ) : (
          tracks.map(track => (
            <Card key={track.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Music className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{track.title}</h3>
                    <p className="text-sm text-muted-foreground">{track.artist} • {track.type}</p>
                  </div>
                  <Badge variant={track.is_published ? 'default' : 'secondary'}>
                    {track.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  {track.is_download && <Badge variant="outline">Download</Badge>}
                  {track.is_internal && <Badge variant="outline">Internal</Badge>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(track)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(track.id)}>
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
