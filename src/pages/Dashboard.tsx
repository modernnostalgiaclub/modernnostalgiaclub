import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TierBadge } from '@/components/TierBadge';
import { HelloSkipAgent } from '@/components/HelloSkipAgent';
import { MemberDownloads } from '@/components/MemberDownloads';
import { useAuth, PatreonTier } from '@/contexts/AuthContext';
import { TIER_INFO } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  GraduationCap, 
  Music2, 
  Users, 
  BookOpen,
  ArrowRight,
  Zap,
  TrendingUp,
  UserCircle,
  MessageSquare,
  CheckCircle2,
  Circle,
  Calendar,
  X,
  Link2,
  Copy,
  ExternalLink
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
  const navigate = useNavigate();
  const [migrationBannerDismissed, setMigrationBannerDismissed] = useState(false);
  const [profileLinkCopied, setProfileLinkCopied] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [hasCommented, setHasCommented] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasStartedTracker, setHasStartedTracker] = useState(false);
  const [checklistLoading, setChecklistLoading] = useState(true);

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

  // Fetch checklist status
  useEffect(() => {
    const fetchChecklistStatus = async () => {
      if (!user) {
        setChecklistLoading(false);
        return;
      }
      
      try {
        // Check if user has commented
        const { count: commentCount } = await supabase
          .from('community_comments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        setHasCommented((commentCount || 0) > 0);

        // Check if user has submitted to Studio Floor via secure RPC
        const { data: submissionsData } = await supabase.rpc('get_user_submissions');
        const submissionCount = (submissionsData || []).length;
        
        setHasSubmitted(submissionCount > 0);

        // Check if user has started the 30-day tracker
        const { count: trackerCount } = await supabase
          .from('tracker_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        setHasStartedTracker((trackerCount || 0) > 0);
      } catch (error) {
        console.error('Error fetching checklist status:', error);
      } finally {
        setChecklistLoading(false);
      }
    };
    
    fetchChecklistStatus();
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
            {/* Migration Banner for legacy Patreon members */}
            {!migrationBannerDismissed && profile?.patreon_id && profile?.patreon_tier !== 'creative-economy-lab' && (
              <motion.div variants={fadeIn} className="mb-8">
                <Card className="border-maroon/50 bg-maroon/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-maroon/5 to-transparent pointer-events-none" />
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <p className="font-display text-lg text-foreground">
                          You're a founding Patreon member 🎉
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Upgrade to Creative Economy Lab — free, permanently. No credit card needed.
                        </p>
                      </div>
              <div className="flex items-center gap-3 shrink-0">
                        <Button
                          variant="maroon"
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => {
                            if (user?.id) sessionStorage.setItem('patreon_source_user_id', user.id);
                            navigate('/migrate');
                          }}
                        >
                          Claim Your Free Upgrade →
                        </Button>
                        <button
                          onClick={() => setMigrationBannerDismissed(true)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Dismiss banner"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

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
                      You're here to turn creative work into sustainable income. Need help? Our AI assistant is available in the bottom-right corner.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Profile completion banner — shown when no stage_name set */}
            {!profile?.stage_name && !checklistLoading && (
              <motion.div variants={fadeIn} className="mb-8">
                <Card className="border-primary/40 bg-primary/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Link2 className="w-4 h-4 text-primary" />
                          <p className="text-xs uppercase tracking-widest text-primary font-medium">Your Artist Profile</p>
                        </div>
                        <p className="font-display text-lg text-foreground">
                          Your artist profile is your link in bio.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Set your stage name, add your music, and get a shareable URL at{' '}
                          <span className="text-foreground font-mono text-xs">modernnostalgia.club/artist/[username]</span>
                        </p>
                      </div>
                      <Button asChild variant="maroon" size="sm" className="whitespace-nowrap shrink-0">
                        <Link to="/account">Set Up Your Profile →</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Public profile link card — shown once profile is set up */}
            {profile?.username && profile?.stage_name && (
              <motion.div variants={fadeIn} className="mb-8">
                <Card className="border-border/50 bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Link2 className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Your artist link</p>
                        <p className="text-sm font-mono truncate text-foreground">
                          modernnostalgia.club/artist/{profile.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5"
                          onClick={() => {
                            navigator.clipboard.writeText(`https://modernnostalgia.club/artist/${profile.username}`);
                            setProfileLinkCopied(true);
                            setTimeout(() => setProfileLinkCopied(false), 2000);
                          }}
                        >
                          {profileLinkCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                          {profileLinkCopied ? 'Copied!' : 'Copy'}
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="h-8">
                          <Link to={`/artist/${profile.username}`} target="_blank">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Getting Started Checklist */}
            <motion.div variants={fadeIn} className="mb-12">
              <Card variant="elevated" className="p-6 border-maroon/20">
                <h2 className="font-display text-xl mb-4">Getting Started Checklist</h2>
                {checklistLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* 1. Set up your artist profile (link-in-bio) */}
                    <Link to="/account" className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/50">
                      {profile?.stage_name && profile?.username ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <UserCircle className="w-5 h-5 text-maroon flex-shrink-0" />
                      <div className="flex-1">
                        <span className={profile?.stage_name && profile?.username ? 'text-muted-foreground line-through' : 'font-medium'}>
                          Set up your artist profile
                        </span>
                        {!profile?.stage_name && (
                          <span className="ml-2 text-xs text-primary">← your link-in-bio</span>
                        )}
                      </div>
                    </Link>

                    {/* 2. Complete your first course */}
                    <Link to="/classroom" className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/50">
                      {(progress?.completed || 0) > 0 ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <GraduationCap className="w-5 h-5 text-maroon flex-shrink-0" />
                      <span className={(progress?.completed || 0) > 0 ? 'text-muted-foreground line-through' : ''}>
                        Start your first course in the Classroom
                      </span>
                    </Link>

                    {/* 3. Comment in the community */}
                    <Link to="/community" className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/50">
                      {hasCommented ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <MessageSquare className="w-5 h-5 text-maroon flex-shrink-0" />
                      <span className={hasCommented ? 'text-muted-foreground line-through' : ''}>
                        Comment in the Community
                      </span>
                    </Link>

                    {/* 4. Submit to Studio Floor */}
                    <Link 
                      to={tier !== 'lab-pass' ? '/studio' : '#'} 
                      className={`flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/50 ${tier === 'lab-pass' ? 'opacity-60 pointer-events-none' : ''}`}
                    >
                      {hasSubmitted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <Music2 className="w-5 h-5 text-maroon flex-shrink-0" />
                      <span className={hasSubmitted ? 'text-muted-foreground line-through' : ''}>
                        Submit to the Studio Floor
                        {tier === 'lab-pass' && <span className="text-xs text-muted-foreground ml-2">(Higher tier)</span>}
                      </span>
                    </Link>

                    {/* 5. Start 30-Day Tracker */}
                    <Link to="/reference/30-day-tracker" className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/50">
                      {hasStartedTracker ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <Calendar className="w-5 h-5 text-maroon flex-shrink-0" />
                      <span className={hasStartedTracker ? 'text-muted-foreground line-through' : ''}>
                        Start the 30-Day Implementation Tracker
                      </span>
                    </Link>

                    {/* 6. Check out Artist Resources */}
                    <Link to="/reference" className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/50">
                      <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <BookOpen className="w-5 h-5 text-maroon flex-shrink-0" />
                      <span>Check out Artist Resources</span>
                    </Link>
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Member Downloads */}
            <MemberDownloads />
            
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
                    title: 'Artist Resources', 
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

            {/* HelloSkip AI Agent - loads script only */}
            <HelloSkipAgent />
          </motion.div>
        </div>
      </main>
    </div>
  );
}