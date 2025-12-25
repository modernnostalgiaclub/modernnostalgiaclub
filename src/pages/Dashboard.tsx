import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TierBadge } from '@/components/TierBadge';
import { useAuth, PatreonTier } from '@/contexts/AuthContext';
import { TIER_INFO } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  Music2, 
  Users, 
  BookOpen,
  ArrowRight,
  Zap,
  TrendingUp
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

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);

  // Show welcome toast for returning members
  useEffect(() => {
    if (searchParams.get('welcome') === 'true' && profile) {
      const userName = profile.name || 'back';
      toast.success(`Welcome ${userName}!`, {
        description: "You're logged in and ready to go.",
        duration: 4000,
      });
      // Remove the welcome param from URL without refresh
      searchParams.delete('welcome');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, profile]);
  
  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setProgressLoading(false);
        return;
      }
      
      try {
        // Fetch total published lessons
        const { count: totalLessons } = await supabase
          .from('lessons')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);
        
        // Fetch user's completed lessons
        const { count: completedLessons } = await supabase
          .from('user_lesson_progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true);
        
        setProgress({
          completed: completedLessons || 0,
          total: totalLessons || 0
        });
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setProgressLoading(false);
      }
    };
    
    fetchProgress();
  }, [user]);
  
  // Redirect to home if not logged in
  if (!loading && !user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              {/* Welcome Panel Skeleton */}
              <div className="mb-12">
                <Card variant="elevated" className="p-8 border-maroon/20">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-6 w-28 rounded-full" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-10 w-64" />
                      <Skeleton className="h-5 w-80" />
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Primary Actions Skeleton */}
              <div className="mb-12">
                <Skeleton className="h-8 w-36 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} variant="feature" className="h-full">
                      <CardHeader>
                        <Skeleton className="w-8 h-8 mb-2 rounded" />
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-32 mt-2" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
              
              {/* Next Action Skeleton */}
              <Card variant="console" className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-20 rounded-md" />
                </div>
              </Card>
              
              {/* Tier Features Skeleton */}
              <div className="mt-12">
                <Skeleton className="h-8 w-64 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
                      <Skeleton className="w-2 h-2 rounded-full" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const tier = (profile?.patreon_tier || 'lab-pass') as PatreonTier;
  const tierInfo = TIER_INFO[tier];
  const userName = profile?.name || user?.email?.split('@')[0] || 'Artist';
  
  const getNextAction = () => {
    switch (tier) {
      case 'lab-pass':
        return { text: 'Start with Foundations of Artist Income', link: '/classroom' };
      case 'creator-accelerator':
        return { text: 'Submit one track for review', link: '/studio' };
      case 'creative-economy-lab':
        return { text: 'Review your strategy roadmap', link: '/classroom' };
    }
  };
  
  const nextAction = getNextAction();
  
  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-5xl mx-auto"
          >
            {/* Welcome Panel */}
            <motion.div variants={fadeIn} className="mb-12">
              <Card variant="elevated" className="p-8 border-maroon/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <TierBadge tier={tier} />
                      <span className="text-sm text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full" />
                        Active
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display">
                      Welcome back, {userName}
                    </h1>
                    <p className="text-muted-foreground">
                      You're here to turn creative work into sustainable income.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            {/* Primary Actions */}
            <motion.div variants={fadeIn} className="mb-12">
              <h2 className="font-display text-2xl mb-6">Enter the Lab</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                  { 
                    icon: GraduationCap, 
                    title: 'Classroom', 
                    desc: 'Training tracks',
                    link: '/classroom',
                    available: true
                  },
                  { 
                    icon: Music2, 
                    title: 'Studio Floor', 
                    desc: 'Submissions & reviews',
                    link: '/studio',
                    available: tier !== 'lab-pass'
                  },
                  { 
                    icon: Users, 
                    title: 'Community', 
                    desc: 'Discussions',
                    link: '/community',
                    available: true
                  },
                  { 
                    icon: BookOpen, 
                    title: 'Reference Shelf', 
                    desc: 'Examples & case studies',
                    link: '/reference',
                    available: true
                  },
                ].map((item) => (
                  <Link 
                    key={item.title} 
                    to={item.available ? item.link : '#'}
                    className={!item.available ? 'pointer-events-none' : ''}
                  >
                    <Card 
                      variant={item.available ? "feature" : "locked"}
                      className="h-full hover:scale-[1.02] transition-transform"
                    >
                      <CardHeader>
                        <item.icon className={`w-8 h-8 mb-2 ${item.available ? 'text-maroon' : 'text-muted-foreground'}`} />
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <CardDescription>
                          {item.available ? item.desc : 'Available in higher tiers'}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
            {/* Learning Progress */}
            <motion.div variants={fadeIn} className="mb-8">
              <Card variant="elevated" className="p-6 border-maroon/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-maroon/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-maroon" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg">Learning Progress</h3>
                    <p className="text-sm text-muted-foreground">Your overall course completion</p>
                  </div>
                  {!progressLoading && progress && (
                    <span className="text-2xl font-display text-maroon">
                      {progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%
                    </span>
                  )}
                </div>
                {progressLoading ? (
                  <Skeleton className="h-3 w-full" />
                ) : progress && progress.total > 0 ? (
                  <div className="space-y-2">
                    <Progress value={(progress.completed / progress.total) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground text-right">
                      {progress.completed} of {progress.total} lessons completed
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No lessons available yet. Check back soon!</p>
                )}
              </Card>
            </motion.div>
            
            {/* Next Recommended Action */}
            <motion.div variants={fadeIn}>
              <Card variant="console" className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-maroon/20 rounded-lg">
                    <Zap className="w-6 h-6 text-maroon" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-lg mb-1">Next Recommended Action</h3>
                    <p className="text-muted-foreground">{nextAction.text}</p>
                  </div>
                  <Button variant="maroon" asChild>
                    <Link to={nextAction.link}>
                      Go
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
            
            {/* Tier Features */}
            <motion.div variants={fadeIn} className="mt-12">
              <h2 className="font-display text-2xl mb-6">Your {tierInfo.name} Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tierInfo.features.map((feature) => (
                  <div 
                    key={feature}
                    className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg"
                  >
                    <span className="w-2 h-2 bg-maroon rounded-full" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/account">
                    View all tier options
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}