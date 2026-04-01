import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/SectionLabel';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logoCream from '@/assets/logo-cream.png';
import {
  ArrowRight,
  ExternalLink,
  Play,
  Newspaper,
  GraduationCap,
  Music2,
  Users,
  TrendingUp,
  CheckCircle,
  Lock,
  Music,
} from 'lucide-react';
import { MNCPlayer } from '@/components/MNCPlayer';
import { PlaylistSubmit } from '@/components/PlaylistSubmit';

const fadeIn = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

// ── The Feed ─────────────────────────────────────────────────────────────────
function TheFeed() {
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['feed-blog'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, cover_image_url, author_name, published_at, slug')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(4);
      return (data || []).map(p => ({ ...p, kind: 'post' as const }));
    },
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['feed-tracks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('artist_tracks')
        .select('id, title, artist_name, disco_url, cover_art_url, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(4);
      return (data || []).map(t => ({ ...t, kind: 'track' as const }));
    },
  });

  const isLoading = postsLoading || tracksLoading;
  const feed = [...posts, ...tracks].sort((a, b) => {
    const aDate = 'published_at' in a ? a.published_at : a.created_at;
    const bDate = 'published_at' in b ? b.published_at : b.created_at;
    return new Date(bDate ?? 0).getTime() - new Date(aDate ?? 0).getTime();
  }).slice(0, 6);

  if (!isLoading && feed.length === 0) return null;

  return (
    <section id="feed" className="py-28 border-t border-border/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <SectionLabel className="mb-3">The Feed</SectionLabel>
            <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              Sounds & Stories<br />
              <span className="text-primary italic">from the Club.</span>
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="feed-card rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feed.map((item, i) => {
                const isPost = item.kind === 'post';
                const title = item.title;
                const coverUrl = isPost
                  ? (item as typeof posts[0]).cover_image_url
                  : (item as typeof tracks[0]).cover_art_url;
                const sub = isPost
                  ? (item as typeof posts[0]).author_name
                  : (item as typeof tracks[0]).artist_name;
                const date = isPost
                  ? (item as typeof posts[0]).published_at
                  : (item as typeof tracks[0]).created_at;

                return (
                  <motion.div
                    key={item.id}
                    className="feed-card rounded-xl overflow-hidden flex flex-col group cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {isPost
                            ? <Newspaper className="w-12 h-12 text-primary/20" />
                            : <Play className="w-12 h-12 text-primary/20" />
                          }
                        </div>
                      )}
                      <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
                        style={{ background: 'hsl(217 100% 50% / 0.2)', color: 'hsl(217 100% 75%)', border: '1px solid hsl(217 100% 50% / 0.3)' }}>
                        {isPost ? 'Editorial' : 'Track'}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-serif text-base font-semibold leading-snug mb-1 line-clamp-2">{title}</h3>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/30">
                        <span className="text-xs text-muted-foreground truncate">{sub}</span>
                        {!isPost && (item as typeof tracks[0]).disco_url && (
                          <a
                            href={(item as typeof tracks[0]).disco_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            DISCO <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {isPost && date && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="mt-10 text-center">
            <Button variant="outline" size="sm" asChild>
              <Link to="/artists">All Artists <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


// ── Artist Grid (Members-Only) ────────────────────────────────────────────────
// Placeholder avatars for blurred preview
const PLACEHOLDER_NAMES = [
  'J.R.', 'M.K.', 'A.T.', 'D.L.',
  'S.B.', 'N.P.', 'C.W.', 'R.O.',
];

function ArtistGrid() {
  return (
    <section className="py-28 border-t border-border/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <SectionLabel className="mb-3">The Artists</SectionLabel>
            <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              Independent Artists.<br />
              <span className="text-primary italic">Professional Sound.</span>
            </h2>
          </div>

          {/* Blurred grid + overlay */}
          <div className="relative">
            {/* Blurred placeholder grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 select-none pointer-events-none"
              style={{ filter: 'blur(8px)', opacity: 0.45 }}>
              {PLACEHOLDER_NAMES.map((name, i) => (
                <div key={i} className="feed-card rounded-xl p-5 flex flex-col">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 mb-3 ring-2 ring-primary/20 flex items-center justify-center text-primary/40 text-lg font-serif font-bold">
                    {name[0]}
                  </div>
                  <p className="font-serif font-semibold text-sm leading-snug truncate">{name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">MN.C Member</p>
                </div>
              ))}
            </div>

            {/* Lock overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
              style={{ background: 'linear-gradient(to bottom, transparent 0%, hsl(222 47% 4% / 0.6) 30%, hsl(222 47% 4% / 0.92) 70%)' }}>
              <div className="flex items-center justify-center w-14 h-14 rounded-full mb-4"
                style={{ background: 'hsl(217 100% 50% / 0.15)', border: '1px solid hsl(217 100% 50% / 0.3)' }}>
                <Lock className="w-6 h-6" style={{ color: 'hsl(217 100% 65%)' }} />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-semibold uppercase tracking-widest"
                style={{ background: 'hsl(217 100% 50% / 0.15)', color: 'hsl(217 100% 75%)', border: '1px solid hsl(217 100% 50% / 0.25)' }}>
                <Users className="w-3 h-3" /> 40+ Patreon Members
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">Members Only</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Join the lab to access the full artist directory and connect with fellow members.
              </p>
              <Button size="lg" asChild
                style={{ background: 'hsl(217 100% 50%)', color: '#fff', boxShadow: '0 0 20px hsl(217 100% 50% / 0.35)' }}>
                <Link to="/login">Join to See Members <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── What's Inside ─────────────────────────────────────────────────────────────
const PILLARS = [
  { icon: GraduationCap, title: 'Classroom', desc: 'Structured training on sync, licensing, and the business of music.' },
  { icon: Music2, title: 'Studio Floor', desc: 'Professional track submissions with actionable feedback.' },
  { icon: Users, title: 'Community', desc: 'Focused discussions with artists building sustainable careers.' },
  { icon: TrendingUp, title: 'Artist Resources', desc: 'Real-world case studies, sync examples, and industry tools.' },
];

function WhatsInside() {
  return (
    <section id="what-this-is" className="py-28 border-t border-border/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto text-center"
        >
          <SectionLabel className="mb-4">What's Inside</SectionLabel>
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            This is not a course.<br />
            <span className="text-primary italic">This is a working lab.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto">
            Artists learn how money actually moves, build catalogs the right way, and practice professional workflows used in sync, licensing, and direct-to-fan careers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                className="feed-card rounded-xl p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <pillar.icon className="w-8 h-8 text-primary mb-4 mx-auto" />
                <h3 className="font-serif font-semibold text-lg mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Pricing / Join the Lab ────────────────────────────────────────────────────
const TIERS = [
  {
    name: 'Lab Pass',
    price: 'Free',
    desc: 'Core access to the community, resources, and essential tools.',
    cta: 'Join Free',
    href: '/login?tab=signup',
    features: ['Community Forum', 'Artist Resources', 'Sync Quiz', 'Public Artist Profile'],
    highlighted: false,
    external: false,
  },
  {
    name: 'Creator Accelerator',
    price: '$15/mo',
    desc: 'Full classroom access and professional track submissions.',
    cta: 'Join the Lab',
    href: 'https://www.patreon.com/modernnostalgiaclub',
    features: ['Everything in Lab Pass', 'Full Classroom', 'Studio Floor Submissions', 'Beat Library'],
    highlighted: true,
    external: true,
  },
  {
    name: 'Artist Incubator',
    price: '$150',
    desc: 'One-time payment. By application only — for serious artists ready to level up.',
    cta: 'Apply Now',
    href: 'https://pci.jotform.com/form/253309376850058',
    features: ['Everything in Accelerator', 'Catalog Audit Service', 'Direct Strategy Sessions', 'Priority Review', 'Application-Based Admission'],
    highlighted: false,
    external: true,
    badge: 'One-Time',
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="py-28 border-t border-border/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-16">
            <SectionLabel className="mb-4">Join the Lab</SectionLabel>
            <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
              Choose Your<br />
              <span className="text-primary italic">Access Level.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map((tier, i) => (
              <motion.div
                key={tier.name}
                className={`rounded-xl p-7 flex flex-col relative overflow-hidden transition-all duration-300 ${
                  tier.highlighted
                    ? 'border-2 border-primary'
                    : 'feed-card'
                }`}
                style={tier.highlighted ? {
                  background: 'hsl(217 100% 50% / 0.08)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 0 40px hsl(217 100% 50% / 0.15), inset 0 1px 0 hsl(217 100% 50% / 0.2)',
                } : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                {tier.highlighted && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full"
                      style={{ background: 'hsl(217 100% 50% / 0.2)', color: 'hsl(217 100% 75%)' }}>
                      Popular
                    </span>
                  </div>
                )}
                {'badge' in tier && tier.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full"
                      style={{ background: 'hsl(142 70% 45% / 0.2)', color: 'hsl(142 70% 65%)', border: '1px solid hsl(142 70% 45% / 0.3)' }}>
                      {tier.badge}
                    </span>
                  </div>
                )}
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{tier.name}</p>
                <p className="text-4xl font-serif font-bold mb-2">{tier.price}</p>
                <p className="text-sm text-muted-foreground mb-6 flex-shrink-0">{tier.desc}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.highlighted ? 'default' : 'outline'}
                  className="w-full"
                  asChild
                >
                  {tier.external
                    ? <a href={tier.href} target="_blank" rel="noopener noreferrer">{tier.cta} <ArrowRight className="w-4 h-4 ml-1" /></a>
                    : <Link to={tier.href}>{tier.cta} <ArrowRight className="w-4 h-4 ml-1" /></Link>
                  }
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />

      <main id="main-content" role="main">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex items-center overflow-hidden"
          aria-labelledby="hero-heading"
        >
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&q=80)`,
            }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(222 47% 4% / 0.97) 0%, hsl(222 47% 4% / 0.8) 50%, hsl(217 100% 10% / 0.7) 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />

          {/* Subtle blue glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, hsl(217 100% 50% / 0.08) 0%, transparent 70%)' }} />

          <div className="container mx-auto px-6 relative z-10 pt-28 pb-20">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeIn} className="mb-8 flex justify-center">
                <img
                  src={logoCream}
                  alt="ModernNostalgia.club"
                  className="h-16 md:h-20 w-auto"
                />
              </motion.div>

              <motion.div variants={fadeIn} className="flex justify-center">
                <SectionLabel className="mb-5">Creative Economy Lab</SectionLabel>
              </motion.div>

              <motion.h1
                id="hero-heading"
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-[1.05] text-foreground"
                variants={fadeIn}
              >
                Where Timeless Art<br />
                Meets the{' '}
                <span
                  className="italic"
                  style={{ color: 'hsl(217 100% 65%)' }}
                >
                  Modern Economy.
                </span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
                variants={fadeIn}
              >
                Training, systems, and professional workflows for independent artists building sustainable music careers.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                variants={fadeIn}
              >
                <Button
                  size="lg"
                  className="text-base px-8 h-14 font-semibold"
                  style={{ background: 'hsl(217 100% 50%)', color: '#fff', boxShadow: '0 0 24px hsl(217 100% 50% / 0.4)' }}
                  asChild
                >
                  <a href="#pricing">
                    Join the Lab <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 h-14"
                  asChild
                >
                  <Link to="/artists">
                    Explore Artists
                  </Link>
                </Button>
              </motion.div>

              <motion.p variants={fadeIn} className="mt-6 text-sm text-muted-foreground">
                Already a member?{' '}
                <Link to="/login" className="text-primary hover:underline underline-offset-2">
                  Log in here
                </Link>
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── The Feed ─────────────────────────────────────────────── */}
        <TheFeed />

        {/* ── MNC Player ───────────────────────────────────────────── */}
        <MNCPlayer />
        <PlaylistSubmit />

        {/* ── Artist Grid ──────────────────────────────────────────── */}
        <ArtistGrid />

        {/* ── What's Inside ────────────────────────────────────────── */}
        <WhatsInside />

        {/* ── Pricing ──────────────────────────────────────────────── */}
        <PricingSection />
      </main>

      <Footer />
    </div>
  );
}
