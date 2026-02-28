import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/SectionLabel';
import { PatreonBlog } from '@/components/PatreonBlog';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import logoCream from '@/assets/logo-cream.png';
import bgHero from '@/assets/bg-hero.jpg';
import bgSection1 from '@/assets/bg-section-1.jpg';
import bgSection2 from '@/assets/bg-section-2.jpg';
import coverJustMakeNoise from '@/assets/cover-just-make-noise.jpg';
import coverBeLoud from '@/assets/cover-be-loud.jpg';
import { 
  GraduationCap, 
  Music2, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Building2,
  Calendar,
  Briefcase,
  Handshake,
  ShoppingBag,
  Music,
  User,
  Headphones,
  DollarSign,
  Globe,
  BookOpen,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { STORE_PRODUCTS } from '@/lib/storeProducts';

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

const FEATURED_PRODUCT_IDS = ['catalog-audit', 'just-make-noise-bundle', 'be-loud-bundle'];

const coverImages: Record<string, string> = {
  'just-make-noise': coverJustMakeNoise,
  'be-loud': coverBeLoud,
};

const FEATURED_PLAYLISTS = [
  {
    title: 'Modern Nostalgia Selections',
    description: 'Handpicked indie sounds from across the Club. Undiscovered artists ready for your playlist.',
    url: 'https://music.youtube.com/playlist?list=PL8vMWEFhhyIIDZ8xoN-2jM0UbXxLUFgKZ',
    platform: 'YouTube Music',
    mood: 'Discover',
  },
  {
    title: 'Sync-Ready Catalog',
    description: 'Tracks from Club artists crafted for sync licensing, film, TV, and advertising.',
    url: 'https://music.youtube.com/playlist?list=PL8vMWEFhhyIL7pHJSKNzrqS3mq0OC5InH',
    platform: 'YouTube Music',
    mood: 'License',
  },
];

interface PublicProfile {
  id: string;
  user_id: string;
  stage_name: string | null;
  avatar_url: string | null;
  username?: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_name: string;
  published_at: string | null;
  tags: string[] | null;
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [artists, setArtists] = useState<PublicProfile[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Load public artist profiles
    supabase.rpc('get_public_profiles').then(({ data }) => {
      if (data) setArtists((data as unknown as PublicProfile[]).slice(0, 12));
    });
    // Load recent published blog posts
    (supabase.from('blog_posts' as any) as any)
      .select('id, title, slug, excerpt, cover_image_url, author_name, published_at, tags')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(3)
      .then(({ data }: { data: BlogPost[] | null }) => {
        if (data) setBlogPosts(data);
      });
  }, []);

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const featuredProducts = STORE_PRODUCTS.filter(p => FEATURED_PRODUCT_IDS.includes(p.id));

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      
      <main id="main-content" role="main">

      {/* ── HERO ── */}
      <section className="relative pt-32 pb-24 hero-gradient overflow-hidden" aria-labelledby="hero-heading">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${bgHero})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/55 to-background" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeIn}>
              <img 
                src={logoCream} 
                alt="ModernNostalgia.club" 
                className="h-24 md:h-32 w-auto mx-auto mb-8"
              />
            </motion.div>
            
            <motion.h1 
              id="hero-heading"
              className="text-4xl md:text-6xl font-display mb-4 text-foreground"
              variants={fadeIn}
            >
              A Creative Economy Lab for artists building sustainable income.
            </motion.h1>
            
            <motion.p 
              className="text-base md:text-lg text-muted-foreground mb-3 max-w-2xl mx-auto"
              variants={fadeIn}
            >
              Training, systems, and professional workflows for the modern music economy.
            </motion.p>

            <motion.p
              className="text-sm text-primary/80 mb-10 max-w-xl mx-auto"
              variants={fadeIn}
            >
              Or just here for the music? Discover independent artists from the Club below.
            </motion.p>
            
            <motion.div 
              className="flex flex-col items-center gap-4"
              variants={fadeIn}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="hero" size="xl" asChild>
                  <Link to="/login?tab=signup">Join the Lab</Link>
                </Button>
                <Button variant="heroOutline" size="xl" asChild>
                  <a href="#discover">
                    <Headphones className="w-4 h-4 mr-2" />
                    Discover Music
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                <Link to="/login" className="hover:text-primary transition-colors underline underline-offset-2">
                  Already a member? Log in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── DISCOVER: SOUNDS FROM THE CLUB ── */}
      <section id="discover" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">Sounds from the Club</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-display mb-4 tracking-wide">
              Discover Independent Artists.
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
              Curated playlists featuring undiscovered indie music from artists who are part of the Lab.
            </p>

            {/* Playlist Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {FEATURED_PLAYLISTS.map((pl, i) => (
                <motion.a
                  key={pl.title}
                  href={pl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 flex flex-col"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Music className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-widest text-primary font-medium">{pl.mood}</span>
                      <h3 className="font-display text-lg leading-snug">{pl.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">{pl.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{pl.platform}</span>
                    <span className="text-xs font-medium text-primary group-hover:underline flex items-center gap-1">
                      Listen <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Artist Grid */}
            {artists.length > 0 && (
              <>
                <h3 className="font-display text-2xl mb-6">Artists of the Club</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {artists.map((artist, i) => (
                    <motion.div
                      key={artist.user_id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                    >
                      {artist.username ? (
                        <Link
                          to={`/artist/${artist.username}`}
                          className="group flex flex-col items-center text-center gap-2 p-3 rounded-xl hover:bg-primary/5 transition-colors"
                        >
                          <ArtistAvatar artist={artist} />
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {artist.stage_name}
                          </span>
                        </Link>
                      ) : (
                        <div className="flex flex-col items-center text-center gap-2 p-3">
                          <ArtistAvatar artist={artist} />
                          <span className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
                            {artist.stage_name}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── BLOG: FROM THE LAB ── */}
      {blogPosts.length > 0 && (
        <section id="blog" className="py-24 bg-card/30 border-y border-border/50">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel className="mb-4">From the Lab</SectionLabel>
              <h2 className="text-3xl md:text-5xl font-display mb-12 tracking-wide">
                Insights & Editorial.
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {blogPosts.map((post, i) => (
                  <motion.article
                    key={post.id}
                    className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-colors group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {post.cover_image_url ? (
                      <div className="aspect-video overflow-hidden">
                        <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-primary/40" />
                      </div>
                    )}
                    <div className="p-5">
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2">
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs text-primary uppercase tracking-wider">{tag}</span>
                          ))}
                        </div>
                      )}
                      <h3 className="font-display text-lg leading-snug mb-2">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{post.excerpt}</p>}
                      <p className="text-xs text-muted-foreground">{post.author_name}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── WHAT THIS IS ── */}
      <section id="what-this-is" className="relative py-24 border-t border-border/50 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${bgSection1})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">What This Is</SectionLabel>
            
            <h2 className="text-3xl md:text-5xl font-display mb-8 tracking-wide">
              This is not a course.<br />
              <span className="text-primary">This is a working lab.</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
              Artists learn how money actually moves, build catalogs the right way, and practice professional workflows used in sync, licensing, and direct-to-fan careers.
            </p>
            
            <Accordion type="single" collapsible className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { 
                  icon: GraduationCap, 
                  title: 'Classroom', 
                  desc: 'Structured training tracks',
                  details: 'Deep-dive courses on sync licensing, catalog building, direct-to-fan revenue, and the business side of music. Learn professional workflows used by working artists: not theory, but practical systems you can implement today.'
                },
                { 
                  icon: Music2, 
                  title: 'Studio Floor', 
                  desc: 'Professional submissions',
                  details: 'Submit your tracks for professional feedback and review. Get actionable notes on mix quality, sync-readiness, and market positioning. This is where your music gets the honest critique it needs to compete.'
                },
                { 
                  icon: Users, 
                  title: 'Community', 
                  desc: 'Focused discussions',
                  details: 'Connect with other artists building sustainable careers. Share wins, ask questions, and collaborate on opportunities. No fluff, just focused conversations about what actually works in the modern music economy.'
                },
                { 
                  icon: TrendingUp, 
                  title: 'Artist Resources', 
                  desc: 'Industry examples',
                  details: 'Real-world case studies of successful sync placements, licensing deals, and artist business models. See exactly how other artists structure their income streams and learn from their strategies.'
                },
              ].map((item) => (
                <AccordionItem 
                  key={item.title} 
                  value={item.title}
                  className="bg-card border border-border rounded-lg hover:border-primary/30 transition-colors data-[state=open]:border-primary/50"
                >
                  <AccordionTrigger className="p-6 hover:no-underline [&>svg]:hidden">
                    <div className="flex flex-col items-start text-left w-full">
                      <div className="flex items-center w-full mb-4">
                        <item.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-display text-xl mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <p className="text-muted-foreground mb-6 leading-relaxed">{item.details}</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="maroon" size="sm" asChild className="flex-1">
                        <Link to="/login?tab=signup">Join Free <ArrowRight className="w-3 h-3 ml-1.5" /></Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild className="flex-1">
                        <Link to="/lab-application">Apply for Creator Lab <ArrowRight className="w-3 h-3 ml-1.5" /></Link>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
      
      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative py-24 bg-card/50 border-y border-border/50 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${bgSection2})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">How It Works</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-display mb-12 tracking-wide">
              Three steps to sustainable income.
            </h2>
            <div className="space-y-8">
              {[
                { num: '01', title: 'Create your free account', desc: 'Sign up in seconds with Google, email, or Patreon. No credit card required — start with a free account and explore the Lab.' },
                { num: '02', title: 'Access the Lab', desc: 'Enter the Classroom, Studio Floor, and Community. Learn professional workflows. Submit work for review.' },
                { num: '03', title: 'Build systems, not guesses', desc: 'Replace uncertainty with proven processes. Build a catalog that works. Create income streams that last.' },
              ].map((step, i) => (
                <motion.div 
                  key={step.num}
                  className="flex gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="text-5xl font-display text-primary/30">{step.num}</span>
                  <div>
                    <h3 className="font-display text-2xl mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOUR PILLARS (from the deck) ── */}
      <section id="pillars" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">The Four Pillars</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-display mb-4 tracking-wide">
              Creators lack business literacy.<br />
              <span className="text-primary">We fix both sides of that.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
              The Creative Economy Lab bridges the gap between independent artists and sustainable income — through education, infrastructure, and community.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: User, title: 'Direct-to-Fan', desc: 'Artists build direct revenue streams without relying on platforms or labels.' },
                { icon: Globe, title: 'Alt Media Distribution', desc: 'Sync licensing, TV, film, and non-traditional placement pathways.' },
                { icon: GraduationCap, title: 'Workforce Development', desc: 'Training creative professionals to participate in the broader economy.' },
                { icon: DollarSign, title: 'Financial Literacy', desc: 'Real money skills: royalties, splits, taxes, and business structures.' },
              ].map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <pillar.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg mb-2">{pillar.title}</h3>
                  <p className="text-sm text-muted-foreground">{pillar.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">Simple Pricing</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-display mb-6 tracking-wide">
              Choose your path.<br />
              <span className="text-primary">Start building today.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl">No contracts. No hidden fees. Cancel anytime.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div 
                className="bg-card border border-border rounded-lg p-8 relative"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="mb-6">
                  <h3 className="font-display text-2xl mb-2">Lab Pass</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display text-foreground">$1</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">Get your foot in the door. Access the fundamentals.</p>
                <ul className="space-y-3 mb-8">
                  {['Dashboard access','Classroom training tracks','Community discussions','Audio submissions'].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login?tab=signup">Get Started</Link>
                </Button>
              </motion.div>
              
              <motion.div 
                className="bg-card border-2 border-primary rounded-lg p-8 relative"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute -top-3 left-6">
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Most Popular</span>
                </div>
                <div className="mb-6">
                  <h3 className="font-display text-2xl mb-2">Creator Accelerator</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display text-primary">$10</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6">Professional workflows. Priority access. Real feedback.</p>
                <ul className="space-y-3 mb-8">
                  {['Everything in Lab Pass','Studio Floor access','Priority submissions','Professional feedback','Sync workflow training','Direct-to-fan systems'].map((f, i) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${i === 0 ? 'text-muted-foreground' : 'text-primary'}`} />
                      <span className={i === 0 ? 'text-muted-foreground' : 'text-foreground'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="maroon" className="w-full" asChild>
                  <Link to="/login?tab=signup">Start Your Training</Link>
                </Button>
              </motion.div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-8">
              Looking for more?{' '}
              <Link to="/lab-application" className="text-primary hover:underline">
                Apply for the Creative Economy Lab ($150/mo)
              </Link>{' '}
              — includes 1-on-1 strategy sessions and priority review.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── STORE ── */}
      <section id="store" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">The Store</SectionLabel>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-display mb-3 tracking-wide">Tools you can buy today.</h2>
                <p className="text-lg text-muted-foreground">No membership required. Instant access.</p>
              </div>
              <Button variant="maroonOutline" asChild className="shrink-0">
                <Link to="/store">Browse the Full Store <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  className={`bg-card border rounded-lg overflow-hidden hover:border-primary/50 transition-colors flex flex-col ${product.isService ? 'border-2 border-primary' : 'border-border'}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {product.coverImage && coverImages[product.coverImage] ? (
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img src={coverImages[product.coverImage]} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-square bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-primary/40" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    {product.isService && <span className="text-xs font-medium text-primary uppercase tracking-wider mb-2">Service</span>}
                    {product.isBundle && <span className="text-xs font-medium text-primary uppercase tracking-wider mb-2">Bundle</span>}
                    <h3 className="font-display text-lg mb-2 leading-snug">{product.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-display text-foreground">${product.price}</span>
                      <Button variant="maroon" size="sm" asChild><Link to="/store">View Details</Link></Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FREE RESOURCES ── */}
      <section id="free-resources" className="py-24 bg-card/30 border-y border-border/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">Start Free</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-display mb-6 tracking-wide">
              Try before you join.<br />
              <span className="text-primary">No login required.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl">Explore free tools and resources to see if the Lab is right for you.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: CheckCircle, title: 'Sync Readiness Quiz', desc: 'Find out if your music is ready for sync licensing in 2 minutes.', cta: 'Take the Quiz', to: '/sync-quiz', variant: 'maroonOutline' as const },
                { icon: TrendingUp, title: 'Artist Resources', desc: 'Free guides, industry examples, and reference materials.', cta: 'Browse Resources', to: '/reference', variant: 'maroonOutline' as const },
                { icon: GraduationCap, title: 'Artist Survival Guide', desc: 'The free guide to building sustainable income as an independent artist.', cta: 'Get the Free Guide', to: '/free-guide', variant: 'maroon' as const, featured: true },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  className={`bg-card border rounded-lg p-6 hover:border-primary/50 transition-colors ${card.featured ? 'border-2 border-primary relative' : 'border-border'}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {card.featured && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">Free Download</span>
                    </div>
                  )}
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <card.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-xl mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{card.desc}</p>
                  <Button variant={card.variant} size="sm" asChild className="w-full">
                    <Link to={card.to}>{card.cta}</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* ── WHY THIS EXISTS ── */}
      <section id="why-this-exists" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">Why This Exists</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-display mb-8 tracking-wide">
              The industry didn't disappear.<br />
              <span className="text-primary">The pathways changed.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
              This Lab exists to help artists adapt without losing ownership or dignity. We teach professional standards, not hacks. We build systems, not dreams.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Professional sync workflows','Industry-standard delivery via DISCO','Direct-to-fan revenue systems',
                'Catalog organization that wins placements','Service-based income strategies','Ethical collaboration structures',
              ].map((item, i) => (
                <motion.div 
                  key={item}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── LATEST UPDATES (Patreon) ── */}
      <PatreonBlog />

      {/* ── EVENTS ── */}
      <section id="events" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">Upcoming Events</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-display mb-6 tracking-wide">
              Join Us In Person.<br />
              <span className="text-primary">Build Your Network.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
              From songwriter camps to community workshops, our events connect creators with opportunities. Check out what's coming up and reserve your spot.
            </p>
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-xl mb-3">Browse Upcoming Events</h3>
              <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
                Workshops, networking sessions, and exclusive member events.
                <span className="block mt-1 text-sm font-medium text-primary">Members receive discounted pricing!</span>
              </p>
              <Button variant="maroon" asChild>
                <a href="https://modernnostalgiaclub.eventbrite.com" target="_blank" rel="noopener noreferrer">
                  View All Events on Eventbrite <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* ── PARTNERS & SPONSORS ── */}
      <section id="partners" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">Partners & Sponsors</SectionLabel>
            <h2 className="text-3xl md:text-5xl font-display mb-6 tracking-wide">
              Invest in the creative workforce.<br />
              <span className="text-primary">Build the economy of tomorrow.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-3xl">
              The Creative Economy Lab bridges the gap between creators and opportunity. Partner with us to fund programs, sponsor events, or help build creative facilities that empower the next generation of artists and creative professionals.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { icon: Briefcase, title: 'Program Funding', desc: 'Support workforce development, creative business training, and artist education initiatives.', highlights: ['Workshop and curriculum development','Scholarship funding for creators','Mentorship program support','Training equipment sponsorship'] },
                { icon: Calendar, title: 'Event Sponsorship', desc: 'Power immersive creative experiences that produce real content and connect artists with opportunity.', highlights: ['Songwriter camps and sessions','Matchmaking events for businesses','Community workshops and showcases','Brand integration in content'] },
                { icon: Building2, title: 'Facility Development', desc: 'Help transform community spaces into creative hubs with professional equipment and resources.', highlights: ['Studio and lab build-outs','Equipment and technology','Creative coworking spaces','Long-term infrastructure support'] }
              ].map((category, i) => (
                <motion.div
                  key={category.title}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <category.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-display text-xl mb-3">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{category.desc}</p>
                  <ul className="space-y-2">
                    {category.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
            
            <div className="bg-card/50 border border-border rounded-lg p-8 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Handshake className="w-6 h-6 text-primary" />
                <h3 className="font-display text-2xl">Sponsorship Levels</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { tier: 'Starter', range: '$500 – $2,000', desc: 'Individual supporters and small contributors' },
                  { tier: 'Community', range: '$2,500 – $10,000', desc: 'Local businesses and organizations' },
                  { tier: 'Impact', range: '$10,000 – $50,000', desc: 'Foundations and mid-size sponsors' },
                  { tier: 'Strategic', range: '$50,000+', desc: 'Corporate and government partners' }
                ].map((level, i) => (
                  <motion.div
                    key={level.tier}
                    className="text-center p-4 rounded-lg bg-background/50 border border-border/50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="text-xs uppercase tracking-wider text-primary font-medium">{level.tier}</span>
                    <p className="font-display text-lg mt-1">{level.range}</p>
                    <p className="text-xs text-muted-foreground mt-1">{level.desc}</p>
                  </motion.div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
                We work with private individuals, corporate sponsors, foundations, and government agencies. Whether you're exploring partnership possibilities or ready to invest in creative workforce development, we'd love to hear from you.
              </p>
            </div>

            <div className="text-center">
              <Button variant="maroon" size="lg" asChild>
                <Link to="/contact">Become a Partner <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-display mb-6">
              Ready to build something real?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">Join the Lab. Build the career.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/login?tab=signup">Join Free</Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/lab-application">Apply for Creator Lab</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
}

function ArtistAvatar({ artist }: { artist: PublicProfile }) {
  return (
    <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-border group-hover:border-primary/40 transition-colors">
      {artist.avatar_url ? (
        <img src={artist.avatar_url} alt={artist.stage_name || ''} className="w-full h-full object-cover" />
      ) : (
        <User className="w-7 h-7 text-primary/40" />
      )}
    </div>
  );
}
