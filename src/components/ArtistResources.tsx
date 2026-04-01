import { Briefcase, Music, Mic, Monitor, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const resources = [
  {
    icon: Briefcase,
    title: 'Business Tools',
    description: 'Help independent artists level up their career.',
  },
  {
    icon: Music,
    title: 'Music Tools',
    description: 'Spanning to help with sync licensing, music delivery and more!',
  },
  {
    icon: Mic,
    title: 'Recording Tools',
    description: 'Helping you start recording and producing your own music at home.',
  },
  {
    icon: Monitor,
    title: 'Tech Tools',
    description: 'Platforms built to help you organize your music, collaboration spaces, toolkit.',
  },
];

export function ArtistResources() {
  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left side — phone mockup placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-center"
          >
            <div className="relative w-64 h-[480px] rounded-[2.5rem] border-2 border-primary-foreground/20 bg-primary-foreground/5 flex items-center justify-center">
              <div className="text-center px-6">
                <Music className="w-16 h-16 mx-auto mb-4 text-primary-foreground/60" />
                <p className="text-primary-foreground/60 text-sm font-medium">Artist Toolkit</p>
              </div>
            </div>
          </motion.div>

          {/* Right side — text + feature list */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60 mb-3">
              For Independent Artists
            </p>
            <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.05] text-primary-foreground mb-6">
              Artist Resources
            </h2>


            <div className="space-y-6 mt-8">
              {resources.map((resource) => (
                <div key={resource.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                    <resource.icon className="w-5 h-5 text-primary-foreground/80" />
                  </div>
                  <div>
                    <h3 className="font-anton text-sm uppercase tracking-wide text-primary-foreground font-bold">
                      {resource.title}
                    </h3>
                    <p className="text-primary-foreground/70 text-sm mt-1">
                      {resource.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to="/reference">
                Explore Resources <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
