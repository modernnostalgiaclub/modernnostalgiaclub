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
} from 'lucide-react';

const fadeIn = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

// ── The Feed ─────────────────────────────────────────────────────────────────
// Merges blog posts + artist tracks into one scrollable editorial feed
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
          <div className="flex items-end justify-between mb-12">
            <div>
              <SectionLabel className="mb-3">The Feed</SectionLabel>
              <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
                Sounds & Stories<br />
                <span className="text-primary italic">from the Club.</span>
              </h2>
            </div>
            <Link
              to="/artists"
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              All Artists <ArrowRight className="w-4 h-4" />
            </Link>
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
                      {/* Type badge */}
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
        </motion.div>
      </div>
    </section>
  );
}

// ── Artist Grid ───────────────────────────────────────────────────────────────
function ArtistGrid() {
  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['landing-artists'],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_public_profiles');
      return (data || []).slice(0, 8);
    },
  });

  if (!isLoading && artists.length === 0) return null;

  return (
    <section className="py-28 border-t border-border/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-end justify-between mb-12">
            <div>
              <SectionLabel className="mb-3">The Artists</SectionLabel>
              <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
                Independent Artists.<br />
                <span className="text-primary italic">Professional Sound.</span>
              </h2>
            </div>
            <Link
              to="/artists"
              className="hidden md:flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Full Directory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="feed-card rounded-xl p-5 animate-pulse">
                  <div className="w-14 h-14 rounded-full bg-muted mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {artists.map((artist, i) => (
                <motion.div
                  key={artist.user_id}
                  className="feed-card rounded-xl p-5 flex flex-col group"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-primary/10 mb-3 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                    {artist.avatar_url ? (
                      <img src={artist.avatar_url} alt={artist.stage_name ?? ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary/40 text-xl font-serif font-bold">
                        {(artist.stage_name ?? 'A')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="font-serif font-semibold text-sm leading-snug truncate">{artist.stage_name}</p>
                  {artist.pro && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{artist.pro}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" size="sm" asChild>
              <Link to="/artists">View All Artists <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
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
          className="max-w-5xl mx-auto"
        >
          <SectionLabel className="mb-4">What's Inside</SectionLabel>
          <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
            This is not a course.<br />
            <span className="text-primary italic">This is a working lab.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-16 max-w-2xl">
            Artists learn how money actually moves, build catalogs the right way, and practice professional workflows used in sync, licensing, and direct-to-fan careers.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                className="feed-card rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <pillar.icon className="w-8 h-8 text-primary mb-4" />
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
  },
  {
    name: 'Creator Accelerator',
    price: '$15/mo',
    desc: 'Full classroom access and professional track submissions.',
    cta: 'Join the Lab',
    href: 'https://www.patreon.com/modernnostalgiaclub',
    features: ['Everything in Lab Pass', 'Full Classroom', 'Studio Floor Submissions', 'Beat Library'],
    highlighted: true,
  },
  {
    name: 'Creative Economy Lab',
    price: '$30/mo',
    desc: 'The complete institutional experience for serious artists.',
    cta: 'Join the Lab',
    href: 'https://www.patreon.com/modernnostalgiaclub',
    features: ['Everything in Accelerator', 'Catalog Audit Service', 'Direct Strategy Sessions', 'Priority Review'],
    highlighted: false,
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
                  {tier.href.startsWith('http')
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
              className="max-w-4xl"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeIn} className="mb-8">
                <img
                  src={logoCream}
                  alt="ModernNostalgia.club"
                  className="h-16 md:h-20 w-auto"
                />
              </motion.div>

              <motion.div variants={fadeIn}>
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
                className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed"
                variants={fadeIn}
              >
                Training, systems, and professional workflows for independent artists building sustainable music careers.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row items-start gap-4"
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
