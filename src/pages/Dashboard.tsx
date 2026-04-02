import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TierBadge } from '@/components/TierBadge';
import { HelloSkipAgent } from '@/components/HelloSkipAgent';
import { MemberDownloads } from '@/components/MemberDownloads';
import { SectionLabel } from '@/components/SectionLabel';
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
  ExternalLink,
  Mic2,
  Radio,
} from 'lucide-react';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

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

  useEffect(() => {
    if (searchParams.get('welcome') === 'true' && profile) {
      const userName = profile.name || 'back';
      toast.success(`Welcome ${userName}!`, {
        description: "You're backstage. Let's get to work.",
        duration: 4000,
      });
      searchParams.delete('welcome');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, profile]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) { setProgressLoading(false); return; }
      try {
        const { count: totalLessons } = await supabase
          .from('lessons').select('*', { count: 'exact', head: true }).eq('is_published', true);
        const { count: completedLessons } = await supabase
          .from('user_lesson_progress').select('*', { count: 'exact', head: true })
          .eq('user_id', user.id).eq('completed', true);
        setProgress({ completed: completedLessons || 0, total: totalLessons || 0 });
      } catch (error) {
        console.error('Error fetching progress:', error);
      } finally {
        setProgressLoading(false);
      }
    };
    fetchProgress();
  }, [user]);

  useEffect(() => {
    const fetchChecklistStatus = async () => {
      if (!user) { setChecklistLoading(false); return; }
      try {
        const { count: commentCount } = await supabase
          .from('community_comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        setHasCommented((commentCount || 0) > 0);
        const { data: submissionsData } = await supabase.rpc('get_user_submissions');
        setHasSubmitted((submissionsData || []).length > 0);
        const { count: trackerCount } = await supabase
          .from('tracker_sessions').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
        setHasStartedTracker((trackerCount || 0) > 0);
      } catch (error) {
        console.error('Error fetching checklist status:', error);
      } finally {
        setChecklistLoading(false);
      }
    };
    fetchChecklistStatus();
  }, [user]);

  if (!loading && !user) return <Navigate to="/" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
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
        return { text: 'Submit one track for professional review', link: '/studio' };
      case 'creative-economy-lab':
        return { text: 'Review your strategy roadmap', link: '/classroom' };
    }
  };
  const nextAction = getNextAction();

  const checklistItems = [
    {
      done: !!(profile?.stage_name && profile?.username),
      icon: UserCircle,
      label: 'Set up your artist profile',
      sublabel: !profile?.stage_name ? '← your link-in-bio' : undefined,
      href: '/account',
      locked: false,
    },
    {
      done: (progress?.completed || 0) > 0,
      icon: GraduationCap,
      label: 'Start your first course in the Classroom',
      href: '/classroom',
      locked: false,
    },
    {
      done: hasCommented,
      icon: MessageSquare,
      label: 'Drop a post in the Community',
      href: '/community',
      locked: false,
    },
    {
      done: hasSubmitted,
      icon: Music2,
      label: 'Submit a track to the Studio Floor',
      sublabel: tier === 'lab-pass' ? '(Creator Accelerator+)' : undefined,
      href: tier !== 'lab-pass' ? '/studio' : '#',
      locked: tier === 'lab-pass',
    },
    {
      done: hasStartedTracker,
      icon: Calendar,
      label: 'Start the 30-Day Implementation Tracker',
      href: '/artistresources/30-day-tracker',
      locked: false,
    },
    {
      done: false,
      icon: BookOpen,
      label: 'Explore Artist Resources',
      href: '/artistresources',
      locked: false,
    },
  ];

  const pillars = [
    { icon: GraduationCap, title: 'Classroom', desc: 'Training tracks', link: '/classroom', available: true },
    { icon: Music2, title: 'Studio Floor', desc: 'Submissions & reviews', link: '/studio', available: tier !== 'lab-pass' },
    { icon: Users, title: 'Community', desc: 'Focused discussions', link: '/community', available: true },
    { icon: BookOpen, title: 'Resources', desc: 'Case studies & tools', link: '/artistresources', available: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">
        <div className="container mx-auto px-6 pt-8">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-5xl mx-auto space-y-8">

            {/* ── Migration Banner ─────────────────────────────────────── */}
            {!migrationBannerDismissed && profile?.patreon_id && profile?.patreon_tier !== 'creative-economy-lab' && (
              <motion.div variants={fadeIn}>
                <div className="relative rounded-xl p-5 border overflow-hidden"
                  style={{ background: 'hsl(217 100% 50% / 0.08)', borderColor: 'hsl(217 100% 50% / 0.3)' }}>
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, hsl(217 100% 50% / 0.05) 0%, transparent 100%)' }} />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-serif font-semibold text-foreground">You're a founding Patreon member 🎉</p>
                      <p className="text-sm text-muted-foreground mt-1">Upgrade to Creative Economy Lab — free, permanently. No credit card needed.</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Button size="sm" className="whitespace-nowrap"
                        style={{ background: 'hsl(217 100% 50%)', color: '#fff' }}
                        onClick={async () => {
                          if (user?.id) sessionStorage.setItem('patreon_source_user_id', user.id);
                          if (user?.email) sessionStorage.setItem('patreon_source_email', user.email);
                          await supabase.auth.signOut();
                          navigate('/migrate');
                        }}>
                        Claim Free Upgrade →
                      </Button>
                      <button onClick={() => setMigrationBannerDismissed(true)}
                        className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Dismiss">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Backstage Header ─────────────────────────────────────── */}
            <motion.div variants={fadeIn}>
              <div className="relative rounded-2xl overflow-hidden border border-border/30"
                style={{ background: 'linear-gradient(135deg, hsl(222 40% 7%) 0%, hsl(222 47% 5%) 60%, hsl(217 60% 8%) 100%)' }}>
                {/* Blue glow accent */}
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, hsl(217 100% 50% / 0.1) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
                {/* Stage light line */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, hsl(217 100% 50% / 0.6), transparent)' }} />

                <div className="relative p-8">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <SectionLabel>Backstage</SectionLabel>
                        <span className="flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: 'hsl(142 71% 55%)' }}>
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(142 71% 55%)' }} />
                          Live
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight">
                        Welcome back,<br />
                        <span style={{ color: 'hsl(217 100% 65%)' }}>{userName}.</span>
                      </h1>
                      <p className="text-muted-foreground max-w-md">
                        You're here to turn creative work into sustainable income. Everything you need is in the sidebar.
                      </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                      <TierBadge tier={tier} />
                      {profile?.username && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Radio className="w-3 h-3 text-primary" />
                          <span className="font-mono">modernnostalgia.club/artist/{profile.username}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Profile setup banner ─────────────────────────────────── */}
            {!profile?.stage_name && !checklistLoading && (
              <motion.div variants={fadeIn}>
                <div className="rounded-xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{ background: 'hsl(217 100% 50% / 0.06)', borderColor: 'hsl(217 100% 50% / 0.25)' }}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link2 className="w-4 h-4 text-primary" />
                      <p className="text-xs uppercase tracking-widest text-primary font-medium">Your Artist Profile</p>
                    </div>
                    <p className="font-serif font-semibold text-foreground">Your artist profile is your link in bio.</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Set your stage name and get a shareable URL at{' '}
                      <span className="text-foreground font-mono text-xs">modernnostalgia.club/artist/[username]</span>
                    </p>
                  </div>
                  <Button size="sm" className="whitespace-nowrap shrink-0" asChild
                    style={{ background: 'hsl(217 100% 50%)', color: '#fff' }}>
                    <Link to="/account">Set Up Profile →</Link>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Profile link ─────────────────────────────────────────── */}
            {profile?.username && profile?.stage_name && (
              <motion.div variants={fadeIn}>
                <div className="rounded-xl border border-border/40 bg-card p-4 flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ background: 'hsl(217 100% 50% / 0.12)' }}>
                    <Link2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Your artist link</p>
                    <p className="text-sm font-mono truncate">modernnostalgia.club/artist/{profile.username}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="h-8 gap-1.5"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://modernnostalgia.club/artist/${profile.username}`);
                        setProfileLinkCopied(true);
                        setTimeout(() => setProfileLinkCopied(false), 2000);
                      }}>
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
              </motion.div>
            )}

            {/* ── Four Pillars ─────────────────────────────────────────── */}
            <motion.div variants={fadeIn}>
              <SectionLabel className="mb-4">Enter the Lab</SectionLabel>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {pillars.map((item, i) => (
                  <Link key={item.title} to={item.available ? item.link : '#'}
                    className={!item.available ? 'pointer-events-none' : ''}>
                    <motion.div
                      className={`rounded-xl p-5 border h-full flex flex-col transition-all duration-200 ${
                        item.available
                          ? 'hover:border-primary/40 cursor-pointer'
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      style={{
                        background: item.available
                          ? 'hsl(222 40% 7% / 0.8)'
                          : 'hsl(222 30% 6%)',
                        borderColor: 'hsl(222 25% 16%)',
                        backdropFilter: 'blur(12px)',
                      }}
                      whileHover={item.available ? { y: -2 } : {}}
                      transition={{ duration: 0.15 }}
                    >
                      <item.icon className={`w-7 h-7 mb-3 ${item.available ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="font-serif font-semibold text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.available ? item.desc : 'Higher tier required'}
                      </p>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* ── Getting Started Checklist ─────────────────────────────── */}
            <motion.div variants={fadeIn}>
              <div className="rounded-2xl border border-border/30 overflow-hidden"
                style={{ background: 'hsl(222 40% 7%)' }}>
                <div className="px-6 py-5 border-b border-border/30 flex items-center justify-between">
                  <div>
                    <SectionLabel className="mb-1">Onboarding</SectionLabel>
                    <h2 className="font-serif font-bold text-xl">Getting Started Checklist</h2>
                  </div>
                  {!checklistLoading && (
                    <div className="text-right">
                      <span className="text-2xl font-serif font-bold" style={{ color: 'hsl(217 100% 65%)' }}>
                        {checklistItems.filter(c => c.done).length}
                        <span className="text-muted-foreground text-lg">/{checklistItems.length}</span>
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  {checklistLoading
                    ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)
                    : checklistItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-150 group ${
                            item.locked
                              ? 'opacity-50 pointer-events-none'
                              : 'hover:bg-white/5'
                          }`}
                        >
                          {item.done
                            ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: 'hsl(142 71% 55%)' }} />
                            : <Circle className="w-5 h-5 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors" />
                          }
                          <item.icon className={`w-4 h-4 shrink-0 ${item.done ? 'text-muted-foreground' : 'text-primary'}`} />
                          <div className="flex-1 flex items-center gap-2">
                            <span className={`text-sm ${item.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {item.label}
                            </span>
                            {item.sublabel && (
                              <span className="text-xs text-muted-foreground">{item.sublabel}</span>
                            )}
                          </div>
                          {!item.done && !item.locked && (
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                          )}
                        </Link>
                      ))
                  }
                </div>
              </div>
            </motion.div>

            {/* ── Member Downloads ──────────────────────────────────────── */}
            <MemberDownloads />

            {/* ── Learning Progress + Next Action (side by side) ────────── */}
            <motion.div variants={fadeIn} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Learning Progress */}
              <div className="rounded-xl border border-border/30 p-6"
                style={{ background: 'hsl(222 40% 7%)' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2.5 rounded-lg" style={{ background: 'hsl(217 100% 50% / 0.12)' }}>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold">Learning Progress</h3>
                    <p className="text-xs text-muted-foreground">Overall course completion</p>
                  </div>
                  {!progressLoading && progress && (
                    <span className="ml-auto text-2xl font-serif font-bold" style={{ color: 'hsl(217 100% 65%)' }}>
                      {progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%
                    </span>
                  )}
                </div>
                {progressLoading ? (
                  <Skeleton className="h-2 w-full rounded-full" />
                ) : progress && progress.total > 0 ? (
                  <div className="space-y-2">
                    <Progress value={(progress.completed / progress.total) * 100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {progress.completed} of {progress.total} lessons completed
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No lessons available yet — check back soon.</p>
                )}
              </div>

              {/* Next Recommended Action */}
              <div className="rounded-xl border p-6 flex flex-col justify-between"
                style={{
                  background: 'linear-gradient(135deg, hsl(217 100% 50% / 0.1) 0%, hsl(222 40% 7%) 100%)',
                  borderColor: 'hsl(217 100% 50% / 0.25)',
                }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-lg" style={{ background: 'hsl(217 100% 50% / 0.15)' }}>
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif font-semibold">Next Up</h3>
                    <p className="text-xs text-muted-foreground">Recommended action</p>
                  </div>
                </div>
                <p className="text-sm text-foreground mb-5 leading-relaxed">{nextAction.text}</p>
                <Button asChild style={{ background: 'hsl(217 100% 50%)', color: '#fff' }}>
                  <Link to={nextAction.link}>
                    Go <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* ── Tier Features ─────────────────────────────────────────── */}
            <motion.div variants={fadeIn}>
              <div className="rounded-2xl border border-border/30 p-6" style={{ background: 'hsl(222 40% 7%)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <SectionLabel className="mb-1">Access Level</SectionLabel>
                    <h2 className="font-serif font-bold text-xl">Your {tierInfo.name} Features</h2>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/account">Upgrade <ArrowRight className="ml-1.5 w-3.5 h-3.5" /></Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tierInfo.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: 'hsl(222 30% 10%)' }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'hsl(217 100% 50%)' }} />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>

      {/* AI Agent */}
      <HelloSkipAgent />
    </div>
  );
}
