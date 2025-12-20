import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { TierBadge } from '@/components/TierBadge';
import { useAuth, PatreonTier } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Tv, 
  Folder, 
  Users, 
  Target, 
  Book,
  Lock,
  ArrowRight,
  CheckCircle,
  Loader2,
  Play
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'dollar-sign': DollarSign,
  'tv': Tv,
  'folder': Folder,
  'users': Users,
  'target': Target,
  'book': Book,
};

const tierOrder: PatreonTier[] = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];

interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  icon: string | null;
  min_tier: PatreonTier;
  sort_order: number;
  lesson_count: number;
  completed_count: number;
}

interface Lesson {
  id: string;
  title: string;
  course_id: string;
  sort_order: number;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
  lessons: { course_id: string } | null;
}

interface ContinueData {
  courseSlug: string;
  courseTitle: string;
  lessonTitle: string;
}

export default function Classroom() {
  const { user, profile, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [continueData, setContinueData] = useState<ContinueData | null>(null);

  const userTier = (profile?.patreon_tier || 'lab-pass') as PatreonTier;
  const userTierIndex = tierOrder.indexOf(userTier);

  useEffect(() => {
    async function fetchCourses() {
      // Fetch courses with lesson counts
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(count)
        `)
        .eq('is_published', true)
        .order('sort_order');

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        setLoading(false);
        return;
      }

      // Fetch user's lesson progress if logged in
      let progressByCourse: Record<string, number> = {};
      let completedLessonIds: Set<string> = new Set();
      
      if (user) {
        const { data: progressData } = await supabase
          .from('user_lesson_progress')
          .select('lesson_id, completed, lessons!inner(course_id)')
          .eq('user_id', user.id)
          .eq('completed', true);

        if (progressData) {
          // Count completed lessons per course
          progressData.forEach((p: LessonProgress) => {
            const courseId = p.lessons?.course_id;
            if (courseId) {
              progressByCourse[courseId] = (progressByCourse[courseId] || 0) + 1;
            }
            completedLessonIds.add(p.lesson_id);
          });
        }
      }

      const coursesWithProgress = (coursesData || []).map(course => ({
        ...course,
        lesson_count: course.lessons?.[0]?.count || 0,
        completed_count: progressByCourse[course.id] || 0
      }));
      
      setCourses(coursesWithProgress);

      // Find the first incomplete lesson for "continue where you left off"
      if (user && coursesWithProgress.length > 0) {
        // Find courses with progress but not completed
        const inProgressCourse = coursesWithProgress.find(c => {
          const courseIndex = tierOrder.indexOf(c.min_tier);
          const isLocked = courseIndex > userTierIndex;
          return !isLocked && c.completed_count > 0 && c.completed_count < c.lesson_count;
        });

        if (inProgressCourse) {
          // Fetch lessons for this course to find the first incomplete one
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('id, title, course_id, sort_order')
            .eq('course_id', inProgressCourse.id)
            .eq('is_published', true)
            .order('sort_order');

          if (lessonsData) {
            const firstIncomplete = lessonsData.find((l: Lesson) => !completedLessonIds.has(l.id));
            if (firstIncomplete) {
              setContinueData({
                courseSlug: inProgressCourse.slug,
                courseTitle: inProgressCourse.title,
                lessonTitle: firstIncomplete.title
              });
            }
          }
        }
      }

      setLoading(false);
    }

    if (!authLoading) {
      fetchCourses();
    }
  }, [user, authLoading, userTierIndex]);

  // Redirect to home if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  const isCourseLocked = (courseTier: PatreonTier) => {
    const courseIndex = tierOrder.indexOf(courseTier);
    return courseIndex > userTierIndex;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-12 w-64 mb-4" />
                <Skeleton className="h-6 w-96" />
              </div>
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <Card key={i} variant="feature">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="mb-12">
              <SectionLabel className="mb-4">The Classroom</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Training Tracks
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Structured learning for professional music industry workflows. This is not content dumping—this is professional training.
              </p>
            </motion.div>
            
            {/* Continue where you left off banner */}
            {continueData && (
              <motion.div variants={fadeIn} className="mb-8">
                <Card variant="elevated" className="border-maroon/30 bg-maroon/5">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-maroon/20 rounded-lg">
                        <Play className="w-5 h-5 text-maroon" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">Continue where you left off</p>
                        <p className="font-medium truncate">
                          {continueData.courseTitle}: <span className="text-muted-foreground">{continueData.lessonTitle}</span>
                        </p>
                      </div>
                      <Button variant="maroon" size="sm" asChild>
                        <Link to={`/classroom/${continueData.courseSlug}`}>
                          Continue
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            <motion.div 
              variants={stagger}
              className="space-y-6"
            >
              {courses.map((course) => {
                const IconComponent = iconMap[course.icon || 'book'] || Book;
                const locked = isCourseLocked(course.min_tier);
                
                return (
                  <motion.div key={course.id} variants={fadeIn}>
                    <Card 
                      variant={locked ? "locked" : "feature"}
                      className={`transition-all ${locked ? 'opacity-75' : 'hover:scale-[1.01]'}`}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${locked ? 'bg-muted' : 'bg-maroon/20'}`}>
                            {locked ? (
                              <Lock className="w-6 h-6 text-muted-foreground" />
                            ) : (
                              <IconComponent className="w-6 h-6 text-maroon" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <CardTitle className={locked ? 'text-muted-foreground' : ''}>
                                {course.title}
                              </CardTitle>
                              {course.min_tier !== 'lab-pass' && (
                                <TierBadge tier={course.min_tier} size="sm" />
                              )}
                            </div>
                            <CardDescription className={locked ? 'text-muted-foreground/60' : ''}>
                              {course.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Progress bar for unlocked courses */}
                          {!locked && course.lesson_count > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {course.completed_count} of {course.lesson_count} complete
                                </span>
                                <span className="font-medium text-primary">
                                  {Math.round((course.completed_count / course.lesson_count) * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={(course.completed_count / course.lesson_count) * 100} 
                                className="h-1.5" 
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {course.lesson_count} {course.lesson_count === 1 ? 'lesson' : 'lessons'}
                            </span>
                            {locked ? (
                              <Button variant="outline" size="sm" asChild>
                                <a href="https://patreon.com" target="_blank" rel="noopener noreferrer">
                                  Upgrade to Unlock
                                </a>
                              </Button>
                            ) : (
                              <Button variant="maroon" size="sm" asChild>
                                <Link to={`/classroom/${course.slug}`}>
                                  {course.completed_count > 0 ? 'Continue' : 'Start'}
                                  <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="mt-12 p-6 bg-card/50 border border-border rounded-lg"
            >
              <p className="text-sm text-muted-foreground text-center">
                Tracks marked with higher tier requirements are visible but locked. 
                <a href="https://patreon.com" className="text-primary hover:text-maroon-glow ml-1" target="_blank" rel="noopener noreferrer">
                  Upgrade on Patreon
                </a> to unlock more content.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
