import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Search, BookOpen, CheckCircle, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface UserProgress {
  user_id: string;
  profile: {
    name: string | null;
    stage_name: string | null;
    patreon_tier: string | null;
  } | null;
  completedLessons: number;
  totalLessons: number;
  lastActivity: string | null;
  lessonDetails: {
    lesson_id: string;
    lesson_title: string;
    course_title: string;
    completed: boolean;
    completed_at: string | null;
  }[];
}

export function AdminLessonProgress() {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  async function fetchUserProgress() {
    setLoading(true);
    try {
      // Fetch all user lesson progress with lesson and course details
      const { data: progressData, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select(`
          user_id,
          lesson_id,
          completed,
          completed_at,
          lessons (
            id,
            title,
            course_id,
            courses (
              title
            )
          )
        `)
        .order('completed_at', { ascending: false });

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        toast.error('Failed to load lesson progress');
        return;
      }

      // Fetch total lessons count
      const { count: totalLessons } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Fetch profiles for all users with progress
      const userIds = [...new Set(progressData?.map(p => p.user_id) || [])];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, stage_name, patreon_tier')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Group progress by user
      const progressByUser = (progressData || []).reduce((acc, item) => {
        if (!acc[item.user_id]) {
          acc[item.user_id] = [];
        }
        acc[item.user_id].push(item);
        return acc;
      }, {} as Record<string, typeof progressData>);

      // Create profile lookup
      const profileLookup = (profilesData || []).reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, typeof profilesData[0]>);

      // Build user progress array
      const userProgressArray: UserProgress[] = Object.entries(progressByUser).map(([userId, progress]) => {
        const completedCount = progress.filter(p => p.completed).length;
        const lastCompleted = progress
          .filter(p => p.completed_at)
          .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];

        return {
          user_id: userId,
          profile: profileLookup[userId] || null,
          completedLessons: completedCount,
          totalLessons: totalLessons || 0,
          lastActivity: lastCompleted?.completed_at || null,
          lessonDetails: progress.map(p => ({
            lesson_id: p.lesson_id,
            lesson_title: (p.lessons as any)?.title || 'Unknown Lesson',
            course_title: (p.lessons as any)?.courses?.title || 'Unknown Course',
            completed: p.completed || false,
            completed_at: p.completed_at,
          })),
        };
      });

      // Sort by last activity (most recent first)
      userProgressArray.sort((a, b) => {
        if (!a.lastActivity) return 1;
        if (!b.lastActivity) return -1;
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      });

      setUserProgress(userProgressArray);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load lesson progress');
    } finally {
      setLoading(false);
    }
  }

  const filteredProgress = userProgress.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const userName = user.profile?.name?.toLowerCase() || '';
    const stageName = user.profile?.stage_name?.toLowerCase() || '';
    return userName.includes(searchLower) || stageName.includes(searchLower);
  });

  const getTierBadgeVariant = (tier: string | null) => {
    switch (tier) {
      case 'creative-economy-lab':
        return 'default';
      case 'creator-accelerator':
        return 'secondary';
      case 'lab-pass':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatTierName = (tier: string | null) => {
    if (!tier) return 'No Tier';
    return tier.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
            User Lesson Progress
          </CardTitle>
          <CardDescription>
            View and track member progress through courses. Use this data to send tailored follow-up emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              placeholder="Search by name or stage name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label="Search users by name"
            />
          </div>

          {filteredProgress.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {searchTerm ? 'No users found matching your search.' : 'No lesson progress data available yet.'}
            </p>
          ) : (
            <div className="space-y-4" role="list" aria-label="User lesson progress list">
              {filteredProgress.map((user) => (
                <Card 
                  key={user.user_id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  role="listitem"
                >
                  <CardContent 
                    className="py-4"
                    onClick={() => setExpandedUser(expandedUser === user.user_id ? null : user.user_id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedUser(expandedUser === user.user_id ? null : user.user_id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-expanded={expandedUser === user.user_id}
                    aria-label={`View details for ${user.profile?.name || user.profile?.stage_name || 'Unknown User'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {user.profile?.name || user.profile?.stage_name || 'Unknown User'}
                          </h3>
                          {user.profile?.stage_name && user.profile?.name && (
                            <p className="text-sm text-muted-foreground">{user.profile.stage_name}</p>
                          )}
                        </div>
                        <Badge variant={getTierBadgeVariant(user.profile?.patreon_tier || null)}>
                          {formatTierName(user.profile?.patreon_tier || null)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" aria-hidden="true" />
                          <span aria-label={`${user.completedLessons} of ${user.totalLessons} lessons completed`}>
                            {user.completedLessons} / {user.totalLessons} lessons
                          </span>
                        </div>
                        {user.lastActivity && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                            <Calendar className="h-3 w-3" aria-hidden="true" />
                            Last active: {format(new Date(user.lastActivity), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3">
                      <Progress 
                        value={(user.completedLessons / Math.max(user.totalLessons, 1)) * 100} 
                        className="h-2"
                        aria-label={`Progress: ${Math.round((user.completedLessons / Math.max(user.totalLessons, 1)) * 100)}%`}
                      />
                    </div>

                    {expandedUser === user.user_id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <h4 className="text-sm font-medium mb-3">Lesson Details</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto" role="list" aria-label="Completed lessons">
                          {user.lessonDetails
                            .filter(l => l.completed)
                            .sort((a, b) => {
                              if (!a.completed_at) return 1;
                              if (!b.completed_at) return -1;
                              return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
                            })
                            .map((lesson, idx) => (
                              <div 
                                key={`${lesson.lesson_id}-${idx}`} 
                                className="flex items-center justify-between text-sm bg-muted/30 rounded-md p-2"
                                role="listitem"
                              >
                                <div>
                                  <p className="font-medium">{lesson.lesson_title}</p>
                                  <p className="text-xs text-muted-foreground">{lesson.course_title}</p>
                                </div>
                                {lesson.completed_at && (
                                  <span className="text-xs text-muted-foreground">
                                    {format(new Date(lesson.completed_at), 'MMM d, yyyy')}
                                  </span>
                                )}
                              </div>
                            ))}
                          {user.lessonDetails.filter(l => l.completed).length === 0 && (
                            <p className="text-sm text-muted-foreground">No lessons completed yet.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}