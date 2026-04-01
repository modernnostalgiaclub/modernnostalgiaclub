import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Music2, GraduationCap, ArrowRight } from 'lucide-react';
import aboutHero from '@/assets/about-hero.jpg';

const fadeIn = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const PILLARS = [
  {
    icon: Headphones,
    verb: 'Curate',
    headline: 'Human music for active listeners.',
    body: 'We believe the best music discovery still comes from human ears with taste. Our editorial playlists and blog exist to surface independent artists whose music deserves to be heard — not just streamed.',
  },
  {
    icon: Music2,
    verb: 'Create',
    headline: 'Music built for Closed Audience Playlists and Sync Licensing.',
    body: 'MN.C works with independent artists to develop catalog intentionally — music crafted with placement, sync licensing, and closed-audience discovery in mind. This is music built to work.',
  },
  {
    icon: GraduationCap,
    verb: 'Educate',
    headline: 'Independent musicians on how to monetize beyond streaming.',
    body: 'The Creator Economy Lab gives artists the training, systems, and professional workflows to build income through sync licensing, direct-to-fan, and sustainable career infrastructure — not just Spotify streams.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main">

        {/* ── Hero — clean image with just the title ────────────────── */}
        <section className="relative h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${aboutHero})` }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(222 47% 4% / 0.85) 0%, hsl(222 47% 4% / 0.6) 50%, hsl(217 100% 10% / 0.5) 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ── Who We Are (white editorial section) ─────────────────── */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2
                className="font-anton text-3xl md:text-5xl lg:text-6xl text-black uppercase tracking-tight leading-[1.05]"
                variants={fadeIn}
              >
                Who We Are
              </motion.h2>
              <motion.p
                className="mt-4 text-sm md:text-base text-gray-500 uppercase tracking-[0.2em]"
                variants={fadeIn}
              >
                ModernNostalgia.club is a Creative Firm
              </motion.p>
            </motion.div>

            <motion.div
              className="max-w-3xl mx-auto text-center space-y-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.p className="text-sm md:text-base text-gray-500 leading-relaxed" variants={fadeIn}>
                At the intersection of timeless artistry and the modern music economy, we curate, create, and educate, helping artists move beyond just making music and into building sustainable, independent careers.
              </motion.p>
              <motion.p className="text-sm md:text-base text-gray-500 leading-relaxed" variants={fadeIn}>
                Modern Nostalgia Club is a creative economy designed for artists who want to turn their craft into income. Through training, systems, and real-world workflows, we equip artists with the tools to operate like modern businesses.
              </motion.p>
              <motion.p className="text-sm md:text-base text-gray-500 leading-relaxed" variants={fadeIn}>
                Because it's not just about creating music, it's about building a structure around your creativity so it can actually work for you.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── What We Do (white editorial section with image grid) ── */}
        <section className="bg-white py-20 border-t border-gray-200">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl text-black uppercase tracking-tight leading-[1.05]">
                What We Do
              </h2>
              <p className="mt-4 text-sm md:text-base text-gray-500 uppercase tracking-[0.2em]">
                Three things. Done with intention.
              </p>
            </div>

            {/* 3-column pillar grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PILLARS.map((pillar, i) => (
                <motion.div
                  key={pillar.verb}
                  className="text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                >
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-5">
                    <pillar.icon className="w-7 h-7 text-gray-800" />
                  </div>
                  <h3 className="font-anton text-lg md:text-xl uppercase tracking-tight text-black mb-3">
                    {pillar.verb}
                  </h3>
                  <p className="font-serif text-base md:text-lg font-bold text-black leading-snug mb-3">
                    {pillar.headline}
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {pillar.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Manifesto quote ──────────────────────────────────────── */}
        <section className="py-28 border-t border-border/30">
          <div className="container mx-auto px-6">
            <motion.blockquote
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-3xl md:text-4xl font-serif font-bold italic leading-snug mb-6 text-foreground">
                "The future of music is independent artists with professional infrastructure."
              </p>
              <cite className="text-sm text-muted-foreground not-italic uppercase tracking-widest">
                — ModernNostalgia.club
              </cite>
            </motion.blockquote>
          </div>
        </section>

        {/* ── CTA Strip ────────────────────────────────────────────── */}
        <section className="bg-white py-20 border-t border-gray-200">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl text-black uppercase tracking-tight leading-[1.05] mb-4">
                Join the Club
              </h2>
              <p className="mt-4 text-sm md:text-base text-gray-500 uppercase tracking-[0.2em] mb-10">
                Explore the music. Build your career.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="text-base px-8 h-14 font-semibold bg-black text-white hover:bg-black/90"
                  asChild
                >
                  <Link to="/">
                    Explore the Music <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-base px-8 h-14 border-gray-300 text-black hover:bg-gray-100" asChild>
                  <Link to="/join">
                    Join the Club
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
