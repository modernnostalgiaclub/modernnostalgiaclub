import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/SectionLabel';
import { PatreonBlog } from '@/components/PatreonBlog';
import { SyncReadinessQuiz } from '@/components/SyncReadinessQuiz';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import logoCream from '@/assets/logo-cream.png';
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
  Play,
  Newspaper,
} from 'lucide-react';

// ── Sounds from the Club ────────────────────────────────────────────────────
function SoundsFromTheClub() {
  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['landing-tracks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('artist_tracks')
        .select('id, title, artist_name, disco_url, cover_art_url, created_at')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  if (!isLoading && tracks.length === 0) return null;

  return (
    <section className="py-24 border-t border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <SectionLabel className="mb-4">Sounds from the Club</SectionLabel>
          <h2 className="text-3xl md:text-5xl font-display mb-12 tracking-wide">
            Music made here.<br />
            <span className="text-primary">Built for sync.</span>
          </h2>

          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="glass-card bg-card border border-border rounded-xl p-5 shrink-0 w-56 animate-pulse snap-start"
                  >
                    <div className="w-full aspect-square bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                ))
              : tracks.map((track, i) => (
                  <motion.div
                    key={track.id}
                    className="glass-card bg-card border border-border rounded-xl p-5 shrink-0 w-56 flex flex-col hover:border-primary/40 transition-colors snap-start"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                  >
                    {track.cover_art_url ? (
                      <img
                        src={track.cover_art_url}
                        alt={track.title}
                        className="w-full aspect-square object-cover rounded-lg mb-4"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-primary/10 rounded-lg mb-4 flex items-center justify-center">
                        <Play className="w-10 h-10 text-primary/40" />
                      </div>
                    )}
                    <h3 className="font-display text-sm leading-snug mb-1 truncate">{track.title}</h3>
                    {track.artist_name && (
                      <p className="text-xs text-muted-foreground truncate mb-3">{track.artist_name}</p>
                    )}
                    {track.disco_url && (
                      <a
                        href={track.disco_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        View on DISCO <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </motion.div>
                ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ── From the Lab ─────────────────────────────────────────────────────────────
function FromTheLab() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['landing-blog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, content, author_name, published_at, cover_image_url, slug')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
  });

  if (!isLoading && posts.length === 0) return null;

  return (
    <section className="py-24 border-t border-border/50 bg-card/30">
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
            Intelligence from inside<br />
            <span className="text-primary">the creative economy.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="glass-card bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                    <div className="aspect-video bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-5/6" />
                    </div>
                  </div>
                ))
              : posts.map((post, i) => {
                  const excerpt =
                    post.excerpt ||
                    (post.content ? post.content.replace(/[#*`>\-\[\]]/g, '').slice(0, 120) + '…' : '');
                  const date = post.published_at
                    ? new Date(post.published_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '';
                  return (
                    <motion.div
                      key={post.id}
                      className="glass-card bg-card border border-border rounded-xl overflow-hidden flex flex-col hover:border-primary/40 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {post.cover_image_url ? (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-video bg-primary/5 flex items-center justify-center">
                          <Newspaper className="w-12 h-12 text-primary/20" />
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-display text-lg leading-snug mb-2">{post.title}</h3>
                        {excerpt && (
                          <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{excerpt}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-3 border-t border-border/50">
                          <span>{post.author_name}</span>
                          <span>{date}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
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

// Featured products to show on landing page
const FEATURED_PRODUCT_IDS = ['catalog-audit', 'just-make-noise-bundle', 'be-loud-bundle'];

const coverImages: Record<string, string> = {
  'just-make-noise': coverJustMakeNoise,
  'be-loud': coverBeLoud,
};

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const featuredProducts = STORE_PRODUCTS.filter(p => FEATURED_PRODUCT_IDS.includes(p.id));

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      
      <main id="main-content" role="main">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 hero-gradient overflow-hidden" aria-labelledby="hero-heading">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1800&q=80)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
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
              className="text-4xl md:text-6xl font-display mb-6 text-foreground"
              variants={fadeIn}
            >
              A Creative Economy Lab for artists building sustainable income.
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
              variants={fadeIn}
            >
              Training, systems, and professional workflows for the modern music economy.
            </motion.p>
            
            <motion.div 
              className="flex flex-col items-center gap-4"
              variants={fadeIn}
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  variant="hero" 
                  size="xl" 
                  asChild
                >
                  <Link to="/login?tab=signup">
                    Join Free
                  </Link>
                </Button>
                <Button 
                  variant="heroOutline" 
                  size="xl" 
                  asChild
                >
                  <a href="#what-this-is">
                    Explore the Lab
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                <Link
                  to="/login"
                  className="hover:text-primary transition-colors underline underline-offset-2"
                >
                  Already a member? Log in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
      
      {/* What This Is */}
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
                  className="bg-card border border-border rounded-lg hover:border-maroon/30 transition-colors data-[state=open]:border-maroon/50"
                >
                  <AccordionTrigger className="p-6 hover:no-underline [&>svg]:hidden">
                    <div className="flex flex-col items-start text-left w-full">
                      <div className="flex items-center w-full mb-4">
                        <item.icon className="w-8 h-8 text-maroon" />
                      </div>
                      <h3 className="font-display text-xl mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {item.details}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        variant="maroon" 
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link to="/login?tab=signup">
                          Join Free
                          <ArrowRight className="w-3 h-3 ml-1.5" />
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                        className="flex-1"
                      >
                        <Link to="/lab-application">
                          Apply for Creator Lab
                          <ArrowRight className="w-3 h-3 ml-1.5" />
                        </Link>
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
      
      {/* How It Works */}
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
                  <span className="text-5xl font-display text-maroon/30">{step.num}</span>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-border/50">
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
            
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
              No contracts. No hidden fees. Cancel anytime.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Lab Pass - $5 */}
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
                    <span className="text-4xl font-display text-foreground">$5</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Get your foot in the door. Access the fundamentals.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Dashboard access',
                    'Classroom training tracks',
                    'Community discussions',
                    'Audio submissions',
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login?tab=signup">Get Started</Link>
                </Button>
              </motion.div>
              
              {/* Creator Accelerator - $10 */}
              <motion.div 
                className="bg-card border-2 border-maroon rounded-lg p-8 relative"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="absolute -top-3 left-6">
                  <span className="bg-maroon text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-display text-2xl mb-2">Creator Accelerator</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display text-maroon">$10</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-6">
                  Professional workflows. Priority access. Real feedback.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Lab Pass',
                    'Studio Floor access',
                    'Priority submissions',
                    'Professional feedback',
                    'Sync workflow training',
                    'Direct-to-fan systems',
                  ].map((feature, i) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${i === 0 ? 'text-muted-foreground' : 'text-maroon'}`} />
                      <span className={i === 0 ? 'text-muted-foreground' : 'text-foreground'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button variant="maroon" className="w-full" asChild>
                  <Link to="/login?tab=signup">Start Your Training</Link>
                </Button>
              </motion.div>

              {/* Creative Economy Lab - $150 one-time */}
              <motion.div 
                className="bg-card border border-border rounded-lg p-8 relative"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="absolute -top-3 left-6">
                  <span className="bg-amber/20 text-amber border border-amber/30 text-xs font-medium px-3 py-1 rounded-full">
                    By Application
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="font-display text-2xl mb-2">Creative Economy Lab</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-display text-amber">$150</span>
                    <span className="text-muted-foreground">one-time</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">
                  Serious artists only. Deep work, real results.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    'Everything in Creator Accelerator',
                    '1-on-1 strategy sessions',
                    'Sync catalog review',
                    'Priority feedback',
                    'Network access',
                  ].map((feature, i) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${i === 0 ? 'text-muted-foreground' : 'text-amber'}`} />
                      <span className={i === 0 ? 'text-muted-foreground' : 'text-foreground'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button variant="outline" className="w-full border-amber/50 text-amber hover:bg-amber/10" asChild>
                  <Link to="/lab-application">Apply Now</Link>
                </Button>
              </motion.div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-8">
              No contracts. Cancel anytime. Questions? <Link to="/contact" className="text-maroon hover:underline">Contact us</Link>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Store Section — NEW */}
      <section id="store" className="py-24 bg-maroon/5 border-y border-border/50">
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
                <h2 className="text-3xl md:text-5xl font-display mb-3 tracking-wide">
                  Tools you can buy today.
                </h2>
                <p className="text-lg text-muted-foreground">
                  No membership required. Instant access.
                </p>
              </div>
              <Button variant="maroonOutline" asChild className="shrink-0">
                <Link to="/store">
                  Browse the Full Store
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  className={`bg-card border rounded-lg overflow-hidden hover:border-maroon/50 transition-colors flex flex-col ${product.isService ? 'border-2 border-maroon' : 'border-border'}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  {/* Cover image or icon */}
                  {product.coverImage && coverImages[product.coverImage] ? (
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={coverImages[product.coverImage]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-maroon/10 flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-maroon/40" />
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {product.isService && (
                      <span className="text-xs font-medium text-maroon uppercase tracking-wider mb-2">Service</span>
                    )}
                    {product.isBundle && (
                      <span className="text-xs font-medium text-maroon uppercase tracking-wider mb-2">Bundle</span>
                    )}
                    <h3 className="font-display text-lg mb-2 leading-snug">{product.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-3">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xl font-display text-foreground">${product.price}</span>
                      <Button variant="maroon" size="sm" asChild>
                        <Link to="/store">View Details</Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Free Resources Section */}
      <section id="free-resources" className="py-24 border-t border-border/50">
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
            
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
              Explore free tools and resources to see if the Lab is right for you.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="bg-card border border-border rounded-lg p-6 hover:border-maroon/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <div className="w-12 h-12 bg-maroon/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-maroon" />
                </div>
                <h3 className="font-display text-xl mb-2">Sync Readiness Quiz</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Find out if your music is ready for sync licensing in 2 minutes.
                </p>
                <Button variant="maroonOutline" size="sm" asChild className="w-full">
                  <Link to="/sync-quiz">Take the Quiz</Link>
                </Button>
              </motion.div>
              
              <motion.div 
                className="bg-card border border-border rounded-lg p-6 hover:border-maroon/50 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-maroon/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-maroon" />
                </div>
                <h3 className="font-display text-xl mb-2">Artist Resources</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Free guides, industry examples, and reference materials.
                </p>
                <Button variant="maroonOutline" size="sm" asChild className="w-full">
                  <Link to="/reference">Browse Resources</Link>
                </Button>
              </motion.div>
              
              <motion.div 
                className="bg-card border-2 border-maroon rounded-lg p-6 relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="absolute -top-3 left-6">
                  <span className="bg-maroon text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                    Free Download
                  </span>
                </div>
                <div className="w-12 h-12 bg-maroon/10 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-maroon" />
                </div>
                <h3 className="font-display text-xl mb-2">Artist Survival Guide</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The free guide to building sustainable income as an independent artist.
                </p>
                <Button variant="maroon" size="sm" asChild className="w-full">
                  <Link to="/free-guide">Get the Free Guide</Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Why This Exists */}
      <section id="why-this-exists" className="py-24 bg-card/50 border-y border-border/50">
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
                'Professional sync workflows',
                'Industry-standard delivery via DISCO',
                'Direct-to-fan revenue systems',
                'Catalog organization that wins placements',
                'Service-based income strategies',
                'Ethical collaboration structures',
              ].map((item, i) => (
                <motion.div 
                  key={item}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <CheckCircle className="w-5 h-5 text-maroon shrink-0" />
                  <span className="text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sync Readiness Quiz Section */}
      <SyncReadinessQuiz />
      
      {/* Latest Updates (Patreon Blog — de-branded) */}
      <PatreonBlog />

      {/* Events Section */}
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
              From songwriter camps to community workshops, our events connect creators with opportunities. 
              Check out what's coming up and reserve your spot.
            </p>
            
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Calendar className="w-12 h-12 text-maroon mx-auto mb-4" />
              <h3 className="font-display text-xl mb-3">Browse Upcoming Events</h3>
              <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
                Workshops, networking sessions, and exclusive member events.
                <span className="block mt-1 text-sm font-medium text-maroon">
                  Members receive discounted pricing!
                </span>
              </p>
              <Button variant="maroon" asChild>
                <a 
                  href="https://modernnostalgiaclub.eventbrite.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View All Events on Eventbrite
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Partners & Sponsors Section */}
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
                {
                  icon: Briefcase,
                  title: 'Program Funding',
                  desc: 'Support workforce development, creative business training, and artist education initiatives.',
                  highlights: [
                    'Workshop and curriculum development',
                    'Scholarship funding for creators',
                    'Mentorship program support',
                    'Training equipment sponsorship'
                  ]
                },
                {
                  icon: Calendar,
                  title: 'Event Sponsorship',
                  desc: 'Power immersive creative experiences that produce real content and connect artists with opportunity.',
                  highlights: [
                    'Songwriter camps and sessions',
                    'Matchmaking events for businesses',
                    'Community workshops and showcases',
                    'Brand integration in content'
                  ]
                },
                {
                  icon: Building2,
                  title: 'Facility Development',
                  desc: 'Help transform community spaces into creative hubs with professional equipment and resources.',
                  highlights: [
                    'Studio and lab build-outs',
                    'Equipment and technology',
                    'Creative coworking spaces',
                    'Long-term infrastructure support'
                  ]
                }
              ].map((category, i) => (
                <motion.div
                  key={category.title}
                  className="bg-card border border-border rounded-lg p-6 hover:border-maroon/30 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <category.icon className="w-10 h-10 text-maroon mb-4" />
                  <h3 className="font-display text-xl mb-3">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{category.desc}</p>
                  <ul className="space-y-2">
                    {category.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-maroon shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
            
            <div className="bg-card/50 border border-border rounded-lg p-8 mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Handshake className="w-6 h-6 text-maroon" />
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
                    <span className="text-xs uppercase tracking-wider text-maroon font-medium">{level.tier}</span>
                    <p className="font-display text-lg mt-1">{level.range}</p>
                    <p className="text-xs text-muted-foreground mt-1">{level.desc}</p>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
                We work with private individuals, corporate sponsors, foundations, and government agencies. Whether you're exploring partnership possibilities or ready to invest in creative workforce development, we'd love to hear from you.
              </p>
            </div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Button 
                variant="maroon" 
                size="lg"
                onClick={() => window.open('https://form.jotform.com/253444517833056', '_blank', 'noopener,noreferrer')}
              >
                Become a Partner
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Complete our partnership inquiry form to start the conversation.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Sounds from the Club + From the Lab sections */}
      <SoundsFromTheClub />
      <FromTheLab />

      {/* Bottom CTA Section */}
      <section className="py-24 bg-card/50 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display mb-6 tracking-wide">
              Ready to build something sustainable?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join the lab. Start with what you have. Build what you need.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/login?tab=signup">
                  Create Free Account
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/login">
                  Log In
                </Link>
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
