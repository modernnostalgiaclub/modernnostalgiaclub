import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/SectionLabel';
import { PatreonBlog } from '@/components/PatreonBlog';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoCream from '@/assets/logo-cream.png';
import bgHero from '@/assets/bg-hero.jpg';
import bgSection1 from '@/assets/bg-section-1.jpg';
import bgSection2 from '@/assets/bg-section-2.jpg';
import { 
  GraduationCap, 
  Music2, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Loader2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

const PATREON_PAGE_URL = 'https://www.patreon.com/modernnostalgiaclub';

export default function LandingPage() {
  const { user, loading, signInWithPatreon } = useAuth();

  // Redirect to dashboard if already logged in
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleJoinPatreon = () => {
    window.open(PATREON_PAGE_URL, '_blank', 'noopener,noreferrer');
  };

  const handleMemberLogin = async () => {
    try {
      await signInWithPatreon();
    } catch (error) {
      console.error('Failed to initiate Patreon login:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 hero-gradient overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${bgHero})` }}
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
                  onClick={handleJoinPatreon}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Join on Patreon
                      <ExternalLink className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
                <Button 
                  variant="heroOutline" 
                  size="xl" 
                  onClick={handleMemberLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Log In with Patreon'
                  )}
                </Button>
              </div>
              <a 
                href="#what-this-is"
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
              >
                Explore the Lab
              </a>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Subtle gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
      
      {/* What This Is */}
      <section id="what-this-is" className="relative py-24 border-t border-border/50 overflow-hidden">
        {/* Background Image */}
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
            
            <h2 className="text-3xl md:text-5xl font-display mb-8">
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
                  title: 'Reference Shelf', 
                  desc: 'Industry examples',
                  details: 'Real-world case studies of successful sync placements, licensing deals, and artist business models. See exactly how other artists structure their income streams and learn from their strategies.'
                },
              ].map((item, i) => (
                <AccordionItem 
                  key={item.title} 
                  value={item.title}
                  className="bg-card border border-border rounded-lg hover:border-maroon/30 transition-colors data-[state=open]:border-maroon/50"
                >
                  <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
                    <div className="flex flex-col items-start text-left w-full">
                      <div className="flex items-center justify-between w-full mb-4">
                        <item.icon className="w-8 h-8 text-maroon" />
                        <ChevronDown className="chevron w-5 h-5 text-muted-foreground transition-transform duration-200" />
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
                        onClick={handleJoinPatreon}
                        className="flex-1"
                      >
                        Join on Patreon
                        <ExternalLink className="w-3 h-3 ml-1.5" />
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
        {/* Background Image */}
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
            
            <h2 className="text-3xl md:text-5xl font-display mb-12">
              Three steps to sustainable income.
            </h2>
            
            <div className="space-y-8">
              {[
                { num: '01', title: 'Join via Patreon', desc: 'Choose the tier that fits your stage. Start with Lab Pass ($1) or unlock more with Creator Accelerator ($10).' },
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
      
      {/* Why This Exists */}
      <section id="why-this-exists" className="py-24">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionLabel className="mb-4">Why This Exists</SectionLabel>
            
            <h2 className="text-3xl md:text-5xl font-display mb-8">
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
      
      {/* Blog Section - Patreon Posts */}
      <PatreonBlog />
      
      {/* CTA Section */}
      <section className="py-24 bg-card/50 border-t border-border/50">
        <div className="container mx-auto px-6">
          <motion.div 
            className="max-w-2xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display mb-6">
              Ready to build something sustainable?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join the lab. Start with what you have. Build what you need.
            </p>
            <Button 
              variant="hero" 
              size="xl" 
              onClick={handleJoinPatreon}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Join on Patreon
                  <ExternalLink className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
            <button
              onClick={handleMemberLogin}
              className="mt-4 text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              Already a member? Log in
            </button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}