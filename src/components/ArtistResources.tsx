import { Briefcase, Music, Mic, Monitor, ArrowRight, ExternalLink, Headphones } from 'lucide-react';
import artistResourcesImg from '@/assets/artist-resources.jpg';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
  {
    icon: ExternalLink,
    title: 'Tunegoody',
    description: 'Music marketing and career growth platform for independent artists.',
    url: 'https://www.tunegoody.com/landing?ref=modern-nostalgia-e2b60f',
  },
  {
    icon: Headphones,
    title: 'Build Better Crates',
    description: 'Exclusive mashups, remixes, and DJ tools for building unique, professional-sounding crates.',
    url: 'https://buildbettercrates.com',
  },
];

export function ArtistResources() {
  return (
    <section id="resources" aria-labelledby="artist-resources-heading" className="home-section py-14 md:py-20 bg-primary">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left side — phone mockup placeholder */}
          <div className="flex min-w-0 justify-center">
            <img 
              src={artistResourcesImg} 
              alt="Artist working in a studio" 
              className="rounded-lg object-cover w-full max-w-md h-[360px] md:h-[480px]"
              loading="lazy"
            />
          </div>

          {/* Right side — text + feature list */}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] text-primary-foreground/60 mb-3">
              For Independent Artists
            </p>
            <h2 id="artist-resources-heading" className="font-anton text-4xl md:text-5xl uppercase leading-[1.15] text-primary-foreground mb-6">
              Artist Resources
            </h2>


            <div className="space-y-6 mt-8">
              {resources.map((resource) => (
                <div key={resource.title} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                    <resource.icon className="w-5 h-5 text-primary-foreground/80" />
                  </div>
                  <div className="min-w-0">
                    {resource.url ? (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-anton text-sm uppercase tracking-wide text-primary-foreground font-bold hover:underline inline-flex items-center gap-1"
                      >
                        {resource.title} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <h3 className="font-anton text-sm uppercase tracking-wide text-primary-foreground font-bold">
                        {resource.title}
                      </h3>
                    )}
                    <p className="text-primary-foreground/70 text-sm mt-1">
                      {resource.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to="/artistresources">
                Explore Resources <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
