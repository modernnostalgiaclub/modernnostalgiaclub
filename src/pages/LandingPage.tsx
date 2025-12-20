import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/SectionLabel';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoCream from '@/assets/logo-cream.png';
import { 
  GraduationCap, 
  Music2, 
  Users, 
  TrendingUp,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header isLoggedIn={false} />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 hero-gradient overflow-hidden">
        <div className="container mx-auto px-6">
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
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              variants={fadeIn}
            >
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">
                  Log in with Patreon
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <a href="#what-this-is">
                  Explore the Lab
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Subtle gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>
      
      {/* What This Is */}
      <section id="what-this-is" className="py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: GraduationCap, title: 'Classroom', desc: 'Structured training tracks' },
                { icon: Music2, title: 'Studio Floor', desc: 'Professional submissions' },
                { icon: Users, title: 'Community', desc: 'Focused discussions' },
                { icon: TrendingUp, title: 'Reference Shelf', desc: 'Industry examples' },
              ].map((item, i) => (
                <motion.div 
                  key={item.title}
                  className="p-6 bg-card border border-border rounded-lg hover:border-amber/30 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <item.icon className="w-8 h-8 text-amber mb-4" />
                  <h3 className="font-display text-xl mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-card/50 border-y border-border/50">
        <div className="container mx-auto px-6">
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
                  <span className="text-5xl font-display text-amber/30">{step.num}</span>
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
                  <CheckCircle className="w-5 h-5 text-amber shrink-0" />
                  <span className="text-foreground">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
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
            <Button variant="hero" size="xl" asChild>
              <Link to="/dashboard">
                Log in with Patreon
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
