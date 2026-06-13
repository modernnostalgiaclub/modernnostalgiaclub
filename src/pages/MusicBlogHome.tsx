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
} from 'lucide-react';
import { MNCPlayer } from '@/components/MNCPlayer';
import { PlaylistSubmit } from '@/components/PlaylistSubmit';
import { ArtistResources } from '@/components/ArtistResources';
import { SyncReadyCTA } from '@/components/SyncReadyCTA';
import { EditorialArticles } from '@/components/EditorialArticles';
import { useAuth } from '@/contexts/AuthContext';
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
      className="relative border-b border-border/40 overflow-hidden min-h-[95vh] flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroBg})` }} />
      <div className="absolute inset-0" style={{ background: 'rgba(10,10,10,0.6)' }} />

      <div className="relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col items-center"
        >
          <motion.h1 variants={fadeIn}>
            <img src={mncHeroLogo} alt="Modern Nostalgia Club" className="h-20 md:h-32 lg:h-40 mx-auto" />
          </motion.h1>
        </motion.div>
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
              <span className="cursor-pointer">
                Read More <ArrowRight className="w-4 h-4 ml-2" />
              </span>
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

// ── Latest Tracks ──────────────────────────────────────────────────────────────
// Card grid backed by published artist_tracks. Clicking a card hands the queue
// to the global persistent player.
import { usePlayer, type PlayerTrack } from '@/contexts/PlayerContext';

function LatestTracks() {
  const { playQueue, current, isPlaying, togglePlay } = usePlayer();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['public-playable-tracks'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_public_playable_tracks', { p_limit: 12 });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        title: string;
        artist_name: string | null;
        cover_art_url: string | null;
        duration: string | null;
        audio_path: string | null;
      }>;
    },
  });

  if (!isLoading && tracks.length === 0) return null;

  const queueTracks: PlayerTrack[] = tracks.map((t) => ({
    id: t.id,
    title: t.title,
    artist_name: t.artist_name,
    cover_art_url: t.cover_art_url,
  }));

  return (
    <section className="border-b border-border/40">
      <div className="container mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <SectionLabel className="mb-2">New Music</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-serif font-bold">Latest Tracks</h2>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-muted" />
                <div className="h-3 bg-muted rounded w-3/4 mt-3" />
                <div className="h-3 bg-muted rounded w-1/2 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tracks.map((t, i) => {
              const isCurrent = current?.id === t.id;
              const showPause = isCurrent && isPlaying;
              return (
                <motion.button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (isCurrent) {
                      togglePlay();
                    } else {
                      playQueue(queueTracks, i);
                    }
                  }}
                  className="group text-left"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border/40">
                    <img
                      src={t.cover_art_url || mncLogo}
                      alt={t.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = mncLogo;
                      }}
                    />
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity ${
                        isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <span className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                        {showPause ? (
                          <Music className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </span>
                    </div>
                  </div>
                  <h3 className="mt-3 font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {t.artist_name || 'Modern Nostalgia Club'}
                  </p>
                </motion.button>
              );
            })}
          </div>
        )}
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
      <ArtistResources />
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
            <Link to="/blog">Read More <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
        {!user && <LatestTracks />}
        <PlaylistsSection />
        <LabCTA />
      </main>
      <Footer />
    </div>
  );
}
