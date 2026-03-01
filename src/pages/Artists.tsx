import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SectionLabel } from '@/components/SectionLabel';
import { Instagram, Music, Radio, ExternalLink } from 'lucide-react';

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

  const getInitials = (profile: PublicProfile) => {
    const name = profile.stage_name || profile.name || profile.username || '?';
    return name.slice(0, 2).toUpperCase();
  };

  const getDisplayName = (profile: PublicProfile) =>
    profile.stage_name || profile.name || profile.username || 'Unknown Artist';

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />

      <main id="main-content" role="main" className="pt-24 pb-24">
        {/* Hero */}
        <section className="relative py-20 hero-gradient border-b border-border/50">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SectionLabel className="mb-4">Artist Marketplace</SectionLabel>
              <h1 className="text-4xl md:text-6xl font-display mb-6">
                Discover the artists<br />
                <span className="text-primary">building the new economy.</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Independent creators from the Creative Economy Lab — browse their work, connect, and collaborate.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-muted rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : artists.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No public artist profiles yet.</p>
                <p className="text-sm mt-2">Artists can set their profile to public in Account settings.</p>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
              >
                {artists.map((artist) => (
                  <motion.div
                    key={artist.user_id}
                    className="glass-card bg-card border border-border rounded-xl p-6 flex flex-col hover:border-primary/40 transition-colors"
                    variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  >
                    {/* Header row */}
                    <div className="flex items-center gap-4 mb-4">
                      {artist.avatar_url ? (
                        <img
                          src={artist.avatar_url}
                          alt={getDisplayName(artist)}
                          className="w-14 h-14 rounded-full object-cover shrink-0 border border-border"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                          <span className="text-primary font-display text-lg">{getInitials(artist)}</span>
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-display text-lg leading-tight truncate">{getDisplayName(artist)}</h3>
                        {artist.username && (
                          <p className="text-sm text-muted-foreground truncate">@{artist.username}</p>
                        )}
                      </div>
                    </div>

                    {/* Bio */}
                    {artist.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {artist.bio}
                      </p>
                    )}
                    {!artist.bio && <div className="flex-1" />}

                    {/* Social icons */}
                    <div className="flex items-center gap-2 mb-4">
                      {artist.instagram && (
                        <a
                          href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                          aria-label="Instagram"
                        >
                          <Instagram className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                      {artist.spotify && (
                        <a
                          href={artist.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                          aria-label="Spotify"
                        >
                          <Music className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                      {artist.soundcloud && (
                        <a
                          href={artist.soundcloud}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                          aria-label="SoundCloud"
                        >
                          <Radio className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                    </div>

                    {/* CTA */}
                    {artist.username && (
                      <Button variant="maroon" size="sm" asChild className="w-full">
                        <Link to={`/artist/${artist.username}`}>
                          Connect
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
