import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
  Loader2
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
  lesson_count?: number;
  completed_count?: number;
}

export default function Classroom() {
  const { user, profile, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const userTier = (profile?.patreon_tier || 'lab-pass') as PatreonTier;
  const userTierIndex = tierOrder.indexOf(userTier);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          lessons:lessons(count)
        `)
        .order('sort_order');

      if (error) {
        console.error('Error fetching courses:', error);
      } else if (data) {
        const coursesWithCount = data.map(course => ({
          ...course,
          lesson_count: course.lessons?.[0]?.count || 0
        }));
        setCourses(coursesWithCount);
      }
      setLoading(false);
    }

    fetchCourses();
  }, []);

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
                                Enter Course
                                <ArrowRight className="ml-2 w-4 h-4" />
                              </Link>
                            </Button>
                          )}
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
