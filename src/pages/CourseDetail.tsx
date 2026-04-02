import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoPlayer } from '@/components/VideoPlayer';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { TierBadge } from '@/components/TierBadge';
import { useAuth, PatreonTier } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Lock,
  BookOpen
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const tierOrder: PatreonTier[] = ['lab-pass', 'creator-accelerator', 'creative-economy-lab'];

interface Course {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  icon: string | null;
  min_tier: PatreonTier;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  video_url: string | null;
  sort_order: number;
  is_published: boolean;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user, profile, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [togglingProgress, setTogglingProgress] = useState<string | null>(null);

  const userTier = (profile?.patreon_tier || 'lab-pass') as PatreonTier;
  const userTierIndex = tierOrder.indexOf(userTier);

  useEffect(() => {
    if (slug && user) {
      fetchCourseData();
    }
  }, [slug, user]);

  // Keyboard navigation for lessons
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!activeLesson || lessons.length <= 1) return;

      const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          setActiveLesson(lessons[currentIndex - 1]);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < lessons.length - 1) {
          setActiveLesson(lessons[currentIndex + 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLesson, lessons]);

  async function fetchCourseData() {
    // Fetch course
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle();

    if (courseError || !courseData) {
      console.error('Error fetching course:', courseError);
      setLoading(false);
      return;
    }

    setCourse(courseData);

    // Fetch lessons
    const { data: lessonsData, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseData.id)
      .eq('is_published', true)
      .order('sort_order');

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      setLoading(false);
      return;
    }
    
    setLessons(lessonsData || []);

    // Fetch user progress
    let progressData: LessonProgress[] = [];
    if (user) {
      const { data } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id);

      progressData = data || [];
      setProgress(progressData);
    }

    // Auto-select the first incomplete lesson, or first lesson if none started
    if (lessonsData && lessonsData.length > 0) {
      const completedIds = new Set(progressData.filter(p => p.completed).map(p => p.lesson_id));
      const firstIncomplete = lessonsData.find((l: Lesson) => !completedIds.has(l.id));
      setActiveLesson(firstIncomplete || lessonsData[0]);
    }

    setLoading(false);
  }

  async function toggleLessonComplete(lessonId: string) {
    if (!user) return;
    
    setTogglingProgress(lessonId);
    
    const existing = progress.find(p => p.lesson_id === lessonId);
    
    if (existing) {
      // Update existing progress
      const newCompleted = !existing.completed;
      const { error } = await supabase
        .from('user_lesson_progress')
        .update({ 
          completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null
        })
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId);

      if (error) {
        toast.error('Failed to update progress');
      } else {
        setProgress(prev => prev.map(p => 
          p.lesson_id === lessonId ? { ...p, completed: newCompleted } : p
        ));
        toast.success(newCompleted ? 'Lesson marked complete!' : 'Lesson marked incomplete');
      }
    } else {
      // Insert new progress
      const { error } = await supabase
        .from('user_lesson_progress')
        .insert({
          user_id: user.id,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) {
        toast.error('Failed to update progress');
      } else {
        setProgress(prev => [...prev, { lesson_id: lessonId, completed: true }]);
        toast.success('Lesson marked complete!');
      }
    }
    
    setTogglingProgress(null);
  }

  const isLessonComplete = (lessonId: string) => {
    return progress.find(p => p.lesson_id === lessonId)?.completed || false;
  };

  const completedCount = progress.filter(p => p.completed).length;
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full rounded-lg" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  // Check tier access
  const courseIndex = tierOrder.indexOf(course.min_tier);
  const isLocked = courseIndex > userTierIndex;

  if (isLocked) {
    return (
      <div className="min-h-screen bg-background studio-grain flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pt-24 pb-16">
          <div className="text-center">
            <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-display mb-2">Course Locked</h1>
            <p className="text-muted-foreground mb-6">
              This course requires <TierBadge tier={course.min_tier} /> membership.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link to="/courses">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Courses
                </Link>
              </Button>
              <Button variant="maroon" asChild>
                <a href="https://patreon.com" target="_blank" rel="noopener noreferrer">
                  Upgrade on Patreon
                </a>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background studio-grain flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* Header */}
            <motion.div variants={fadeIn} className="mb-8">
              <Link 
                to="/courses" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Courses
              </Link>
              
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <SectionLabel className="mb-2">{course.title}</SectionLabel>
                  <h1 className="text-3xl md:text-4xl font-display mb-2">
                    {course.title}
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    {course.description}
                  </p>
                </div>
                
                {course.min_tier !== 'lab-pass' && (
                  <TierBadge tier={course.min_tier} />
                )}
              </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div variants={fadeIn} className="mb-8">
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {completedCount} of {lessons.length} lessons complete
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Lesson Content */}
              <motion.div variants={fadeIn} className="lg:col-span-2">
                {activeLesson ? (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{activeLesson.title}</CardTitle>
                          <CardDescription>{activeLesson.description}</CardDescription>
                        </div>
                        <Button
                          variant={isLessonComplete(activeLesson.id) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleLessonComplete(activeLesson.id)}
                          disabled={togglingProgress === activeLesson.id}
                        >
                          {isLessonComplete(activeLesson.id) ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 h-4 mr-2" />
                              Mark Complete
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Video Player */}
                      {activeLesson.video_url && (
                        <VideoPlayer 
                          url={activeLesson.video_url} 
                          title={activeLesson.title} 
                        />
                      )}
                      
                      {/* Lesson Content */}
                      {activeLesson.content && (
                        <MarkdownRenderer content={activeLesson.content} />
                      )}

                      {!activeLesson.video_url && !activeLesson.content && (
                        <div className="py-12 text-center text-muted-foreground">
                          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Lesson content coming soon.</p>
                        </div>
                      )}
                      
                      {/* Next/Previous Navigation */}
                      {lessons.length > 1 && (
                        <div className="flex items-center justify-between pt-6 border-t border-border">
                          {(() => {
                            const currentIndex = lessons.findIndex(l => l.id === activeLesson.id);
                            const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
                            const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
                            
                            return (
                              <>
                                <Button
                                  variant="outline"
                                  onClick={() => prevLesson && setActiveLesson(prevLesson)}
                                  disabled={!prevLesson}
                                  className="gap-2"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                  <span className="hidden sm:inline">Previous</span>
                                </Button>
                                
                                <span className="text-sm text-muted-foreground">
                                  {currentIndex + 1} / {lessons.length}
                                </span>
                                
                                <Button
                                  variant={nextLesson ? "maroon" : "outline"}
                                  onClick={() => nextLesson && setActiveLesson(nextLesson)}
                                  disabled={!nextLesson}
                                  className="gap-2"
                                >
                                  <span className="hidden sm:inline">Next</span>
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No lessons available yet.</p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              {/* Lesson List */}
              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Lessons</CardTitle>
                    <CardDescription>
                      {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'} in this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {lessons.map((lesson, idx) => {
                        const isComplete = isLessonComplete(lesson.id);
                        const isActive = activeLesson?.id === lesson.id;
                        
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${
                              isActive ? 'bg-primary/10 border-l-2 border-primary' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 flex-shrink-0 ${isComplete ? 'text-green-500' : 'text-muted-foreground'}`}>
                                {isComplete ? (
                                  <CheckCircle className="w-5 h-5" />
                                ) : (
                                  <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs">
                                    {idx + 1}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${isComplete ? 'text-muted-foreground' : 'text-foreground'}`}>
                                  {lesson.title}
                                </p>
                                {lesson.description && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {lesson.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </main>
      
    </div>
  );
}
