import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionLabel } from '@/components/SectionLabel';
import { Instagram, Music, Radio, ExternalLink, Users } from 'lucide-react';

interface PublicProfile {
  user_id: string;
  stage_name: string | null;
  name: string | null;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  instagram: string | null;
  spotify: string | null;
  soundcloud: string | null;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Artists() {
  const { data: artists = [], isLoading } = useQuery({
    queryKey: ['public-artists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, stage_name, name, username, bio, avatar_url, instagram, spotify, soundcloud')
        .eq('profile_visibility', 'public')
        .not('username', 'is', null)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PublicProfile[];
    },
  });

  const getInitials = (p: PublicProfile) =>
    (p.stage_name || p.name || p.username || '?').slice(0, 2).toUpperCase();

  const getDisplayName = (p: PublicProfile) =>
    p.stage_name || p.name || p.username || 'Unknown Artist';

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />

      <main id="main-content" role="main">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-24 overflow-hidden">
          {/* Studio background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1600&q=80)` }}
          />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(160deg, hsl(222 47% 4% / 0.96) 0%, hsl(222 47% 4% / 0.85) 50%, hsl(217 60% 8% / 0.92) 100%)' }} />
          {/* Top spotlight line */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, hsl(217 100% 50% / 0.5), transparent)' }} />
          {/* Blue radial glow */}
          <div className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
            style={{ background: 'radial-gradient(circle, hsl(217 100% 50% / 0.08) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

          <div className="container mx-auto px-6 relative z-10">
            <motion.div
              className="max-w-3xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel className="mb-5">Artist Directory</SectionLabel>
              <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.05] mb-6">
                Independent Artists.<br />
                <span className="italic" style={{ color: 'hsl(217 100% 65%)' }}>
                  Professional Sound.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                Creators from the Club — browse their work, connect, and collaborate.
              </p>

              {!isLoading && artists.length > 0 && (
                <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{artists.length} public {artists.length === 1 ? 'profile' : 'profiles'}</span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* ── Grid ─────────────────────────────────────────────────────── */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border/30 p-6 animate-pulse"
                    style={{ background: 'hsl(222 40% 7%)' }}>
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 bg-muted rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2 mb-5">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                    <div className="h-9 bg-muted rounded-lg" />
                  </div>
                ))}
              </div>
            ) : artists.length === 0 ? (
              <div className="text-center py-32 text-muted-foreground max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'hsl(217 100% 50% / 0.08)', border: '1px solid hsl(217 100% 50% / 0.2)' }}>
                  <Music className="w-8 h-8 text-primary/40" />
                </div>
                <p className="font-serif text-xl font-semibold mb-2">No public profiles yet.</p>
                <p className="text-sm">Artists can set their profile to public in Account settings.</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              >
                {artists.map((artist) => (
                  <motion.div
                    key={artist.user_id}
                    variants={cardVariants}
                    className="group relative rounded-2xl border border-border/30 p-6 flex flex-col overflow-hidden transition-all duration-300 hover:border-primary/35"
                    style={{
                      background: 'hsl(222 40% 7%)',
                      backdropFilter: 'blur(12px)',
                    }}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Hover blue shimmer */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                      style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, hsl(217 100% 50% / 0.06) 0%, transparent 70%)' }} />

                    {/* Top accent line on hover */}
                    <div className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg, transparent, hsl(217 100% 50% / 0.5), transparent)' }} />

                    {/* Avatar + name */}
                    <div className="flex items-center gap-4 mb-4 relative">
                      {artist.avatar_url ? (
                        <img
                          src={artist.avatar_url}
                          alt={getDisplayName(artist)}
                          className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-border/50 group-hover:ring-primary/40 transition-all duration-300"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-lg font-serif font-bold transition-all duration-300 group-hover:ring-primary/40 ring-2 ring-border/30"
                          style={{ background: 'hsl(217 100% 50% / 0.1)', color: 'hsl(217 100% 70%)' }}
                        >
                          {getInitials(artist)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-serif font-semibold text-lg leading-tight truncate">
                          {getDisplayName(artist)}
                        </h3>
                        {artist.username && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">@{artist.username}</p>
                        )}
                      </div>
                    </div>

                    {/* Bio / Specialty */}
                    {artist.bio ? (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1 leading-relaxed">
                        {artist.bio}
                      </p>
                    ) : (
                      <div className="flex-1 mb-5">
                        <p className="text-sm text-muted-foreground/40 italic">No bio yet.</p>
                      </div>
                    )}

                    {/* Social icons */}
                    {(artist.instagram || artist.spotify || artist.soundcloud) && (
                      <div className="flex items-center gap-2 mb-4">
                        {artist.instagram && (
                          <a
                            href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg transition-all duration-150 hover:scale-110"
                            style={{ background: 'hsl(217 100% 50% / 0.08)', border: '1px solid hsl(217 100% 50% / 0.15)' }}
                            aria-label="Instagram"
                            onClick={e => e.stopPropagation()}
                          >
                            <Instagram className="w-3.5 h-3.5 text-primary" />
                          </a>
                        )}
                        {artist.spotify && (
                          <a
                            href={artist.spotify}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg transition-all duration-150 hover:scale-110"
                            style={{ background: 'hsl(217 100% 50% / 0.08)', border: '1px solid hsl(217 100% 50% / 0.15)' }}
                            aria-label="Spotify"
                            onClick={e => e.stopPropagation()}
                          >
                            <Music className="w-3.5 h-3.5 text-primary" />
                          </a>
                        )}
                        {artist.soundcloud && (
                          <a
                            href={artist.soundcloud}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg transition-all duration-150 hover:scale-110"
                            style={{ background: 'hsl(217 100% 50% / 0.08)', border: '1px solid hsl(217 100% 50% / 0.15)' }}
                            aria-label="SoundCloud"
                            onClick={e => e.stopPropagation()}
                          >
                            <Radio className="w-3.5 h-3.5 text-primary" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    {artist.username && (
                      <Button
                        size="sm"
                        className="w-full font-medium"
                        style={{ background: 'hsl(217 100% 50% / 0.15)', color: 'hsl(217 100% 72%)', border: '1px solid hsl(217 100% 50% / 0.25)' }}
                        asChild
                      >
                        <Link to={`/artist/${artist.username}`}>
                          View Profile
                          <ExternalLink className="w-3 h-3 ml-1.5" />
                        </Link>
                      </Button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
