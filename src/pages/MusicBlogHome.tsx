import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/SectionLabel';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowRight,
  Play,
  Newspaper,
  Calendar,
  Music,
  CalendarDays,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { MNCPlayer } from '@/components/MNCPlayer';
import { PlaylistSubmit } from '@/components/PlaylistSubmit';
import { ArtistResources } from '@/components/ArtistResources';
import { SyncReadyCTA } from '@/components/SyncReadyCTA';
import { EditorialArticles } from '@/components/EditorialArticles';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayer, type PlayerTrack } from '@/contexts/PlayerContext';
import heroBg from '@/assets/hero-bg.jpg';
import mncLogo from '@/assets/mnc-logo.png';
import mncHeroLogo from '@/assets/mnc-hero-logo.png';
import mncLogoBlue from '@/assets/mnc-logo-blue.png';
import syncPerformer from '@/assets/sync-performer.jpg';

const fadeIn = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

// ── Masthead / Hero ────────────────────────────────────────────────────────────
function Masthead() {
  return (
    <section
      className="relative border-b border-border/40 overflow-hidden flex items-center justify-center pt-20 pb-8 sm:pb-10 min-h-[280px] md:pt-0 md:pb-0 md:min-h-[95vh]"
    >
      <div className="absolute inset-0 bg-cover bg-[center_7%] md:bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0" style={{ background: 'rgba(10,10,10,0.6)' }} />

      <div className="relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col items-center"
        >
          <motion.h1 variants={fadeIn}>
            <img src={mncHeroLogo} alt="Modern Nostalgia Club" width={640} height={320} fetchPriority="high" decoding="async" className="h-11 sm:h-14 md:h-32 lg:h-40 w-auto mx-auto" />
          </motion.h1>
        </motion.div>
      </div>
    </section>
  );
}

// ── Upcoming Events ────────────────────────────────────────────────────────────
function UpcomingEvents() {
  const { data, isLoading } = useQuery({
    queryKey: ['eventbrite-upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('eventbrite-events', {
        body: {},
      });
      if (error) throw error;
      return data?.events as Array<{
        id: string;
        title: string;
        description: string;
        url: string;
        startUtc: string;
        startLocal: string;
        endUtc: string;
        endLocal: string;
        imageUrl: string | null;
        venueName: string | null;
        venueAddress: string | null;
        status: string;
      }>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const events = data || [];

  if (!isLoading && events.length === 0) return null;

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel className="mb-2">Community</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-black">Upcoming Events</h2>
          </div>
          <a
            href="https://modernnostalgiaclub.eventbrite.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-500 hover:text-black transition-colors hidden md:flex items-center gap-1"
          >
            View all <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse bg-gray-100 border border-gray-200">
                <div className="aspect-[16/9] bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, i) => {
              const startDate = event.startLocal
                ? new Date(event.startLocal)
                : new Date(event.startUtc);
              const dateString = startDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const timeString = startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                timeZoneName: 'short',
              });
              const location = [event.venueName, event.venueAddress]
                .filter(Boolean)
                .join(' · ');

              return (
                <motion.article
                  key={event.id}
                  className="group rounded-xl overflow-hidden flex flex-col bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CalendarDays className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full bg-[#1194ff]/10 text-[#1194ff] border border-[#1194ff]/20">
                      Event
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-serif text-base font-semibold leading-snug mb-2 line-clamp-2 text-black group-hover:text-[#1194ff] transition-colors">
                      {event.title}
                    </h3>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{dateString} · {timeString}</span>
                      </div>
                      {location && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="line-clamp-1">{location}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-auto pt-3 border-t border-gray-100">
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-[#1194ff] hover:underline"
                      >
                        Get tickets <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Featured Post ──────────────────────────────────────────────────────────────
function FeaturedPost() {
  const { data: post } = useQuery({
    queryKey: ['featured-post'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, cover_image_url, author_name, published_at, slug')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  if (!post) return null;

  return (
    <section className="border-b border-border/40 bg-card/20">
      <div className="container mx-auto px-6 py-16">
        <SectionLabel className="mb-8">Featured</SectionLabel>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Cover */}
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
            {post.cover_image_url ? (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Newspaper className="w-20 h-20 text-primary/20" />
              </div>
            )}
            {/* Overlay tag */}
            <span
              className="absolute top-4 left-4 text-[10px] uppercase tracking-widest font-semibold px-3 py-1 rounded-full backdrop-blur-sm"
              style={{
                background: 'hsl(var(--primary)/0.2)',
                color: 'hsl(var(--primary-foreground))',
                border: '1px solid hsl(var(--primary)/0.35)',
              }}
            >
              Editorial
            </span>
          </div>

          {/* Copy */}
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 uppercase tracking-widest">
              <Calendar className="w-3 h-3" />
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent'}
              {post.author_name && (
                <>
                  <span className="mx-1">·</span>
                  <span>{post.author_name}</span>
                </>
              )}
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-4">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}
            <Button variant="outline" asChild>
              <Link to={`/blog/${post.slug}`} aria-label={`Read the full article: ${post.title}`}>
                Read the full article <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── Latest Posts Grid ──────────────────────────────────────────────────────────
function LatestPostsGrid() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['blog-home-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, cover_image_url, author_name, published_at, slug')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(1, 6); // skip the first (featured)
      return data || [];
    },
  });

  if (!isLoading && posts.length === 0) return null;

  return (
    <section id="posts" className="border-b border-border/40">
      <div className="container mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel className="mb-2">Latest</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">The Blog</h2>
          </div>
          <Link
            to="/artists"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden md:flex items-center gap-1"
          >
            All Artists <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse bg-card/50">
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
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                className="group rounded-xl overflow-hidden flex flex-col bg-card/40 border border-border/40 hover:border-border transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-10 h-10 text-primary/20" />
                    </div>
                  )}
                  <span
                    className="absolute top-3 left-3 text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
                    style={{
                      background: 'hsl(var(--primary)/0.2)',
                      color: 'hsl(var(--primary)/0.9)',
                      border: '1px solid hsl(var(--primary)/0.3)',
                    }}
                  >
                    Editorial
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-serif text-base font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author_name}</span>
                    {post.published_at && (
                      <span>
                        {new Date(post.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Featured Playlists ─────────────────────────────────────────────────────────
const FEATURED_PLAYLISTS = [
  { id: '23H7AOjNmwl33goQTlmQNF', title: 'modernnostalgia.club: R&B(aboy)', src: 'https://open.spotify.com/embed/playlist/23H7AOjNmwl33goQTlmQNF?utm_source=generator&theme=0' },
  { id: '2vXjR8Th4LrRpIAa6vcW8P', title: 'modernnostalgia.club: SA(RAP)', src: 'https://open.spotify.com/embed/playlist/2vXjR8Th4LrRpIAa6vcW8P?utm_source=generator' },
];

function FeaturedPlaylists() {
  return (
    <section className="border-b border-border/40">
      <div className="container mx-auto px-6 py-16">
        <div className="mb-10">
          <SectionLabel className="mb-2">New Music</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-serif font-bold">Featured Playlists</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURED_PLAYLISTS.map((p) => (
            <iframe
              key={p.id}
              title={p.title}
              src={p.src}
              width="100%"
              height="352"
              style={{ borderRadius: 12, border: 0 }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Playlists Section ──────────────────────────────────────────────────────────
function PlaylistsSection() {
  return (
    <>
      <MNCPlayer />
      <PlaylistSubmit />
      <SyncReadyCTA />
      <section className="w-full relative">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#1a1a1a] to-transparent z-10" />
        <img src={syncPerformer} alt="Artist performing on stage" className="w-full h-[60vh] object-cover object-[center_30%]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
      </section>
    </>
  );
}

// ── Lab CTA Strip ──────────────────────────────────────────────────────────────
function LabCTA() {
  return (
    <section className="bg-white">
      <div className="container mx-auto px-6 py-20">
        <div className="flex items-center justify-between gap-12">
          <motion.div
            className="max-w-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-anton text-4xl md:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.05] text-black">
              Join the Club
            </h2>
            <p className="text-black/50 text-lg mb-8 mt-4 max-w-xl leading-relaxed">
              Become a member of MNC. This gives independent musicians the training, systems, and professional workflows to monetize their music beyond streaming.
            </p>
            <Button size="lg" asChild>
              <Link to="/join">
                Join the Club <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
          <div className="hidden md:flex items-center justify-center flex-shrink-0">
            <img src={mncLogoBlue} alt="" className="h-40 w-auto" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MusicBlogHome() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main">
        <Masthead />
        <EditorialArticles />
        <div className="bg-white py-4 pb-16 text-center">
          <Button size="lg" asChild className="bg-[hsl(210,100%,53%)] hover:bg-[hsl(210,100%,45%)] text-white">
            <Link to="/blog">Explore the blog <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
        <UpcomingEvents />
        <ArtistResources />
        <FeaturedPlaylists />
        <PlaylistsSection />
        <LabCTA />
      </main>
      <Footer />
    </div>
  );
}
