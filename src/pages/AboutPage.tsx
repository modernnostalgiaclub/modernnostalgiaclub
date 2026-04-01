import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Music2, GraduationCap, ArrowRight, Star, Users, Heart } from 'lucide-react';
import aboutHero from '@/assets/about-hero.jpg';
import founderImg from '@/assets/founder.jpg';
import mncLogo from '@/assets/mnc-circle-logo.png';

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
                We believe the best music discovery still comes from human ears with taste. Our editorial playlists and blog exist to surface independent artists whose music deserves to be heard — not just streamed.
              </motion.p>
              <motion.p className="text-sm md:text-base text-gray-500 leading-relaxed" variants={fadeIn}>
                MN.C works with independent artists to develop catalog intentionally — music crafted with placement, sync licensing, and closed-audience discovery in mind. This is music built to work.
              </motion.p>
              <motion.p className="text-sm md:text-base text-gray-500 leading-relaxed" variants={fadeIn}>
                The Creator Economy Lab gives artists the training, systems, and professional workflows to build income through sync licensing, direct-to-fan, and sustainable career infrastructure — not just Spotify streams.
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


        {/* ── Our Values (dark card grid) ─────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl uppercase tracking-tight text-foreground leading-[1.05]">
                Our Values
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Star, title: 'Intentional Artistry', body: 'Every track, every playlist, every lesson is crafted with purpose. We don\'t do filler, we do music that works.' },
                { icon: Users, title: 'Community Driven', body: 'We\'re building more than a platform, we\'re building a community of independent artists who support each other.' },
                { icon: Heart, title: 'By Artists, For Artists', body: 'We understand what you need because we\'re in the studio right alongside you.' },
              ].map((value, i) => (
                <motion.div
                  key={value.title}
                  className="rounded-xl border border-border/30 p-8 text-center"
                  style={{ background: 'hsl(var(--card))' }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-5">
                    <value.icon className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-anton text-sm md:text-base uppercase tracking-tight text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Meet the Founder (white background) ─────────────────── */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center max-w-5xl mx-auto">
              <div className="lg:w-1/2">
                <div className="rounded-xl overflow-hidden">
                  <img
                    src={founderImg}
                    alt="Founder in the studio"
                    className="w-full h-auto object-cover aspect-[4/3]"
                  />
                </div>
              </div>
              <div className="lg:w-1/2">
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-400 mb-3">
                  Behind the Vision
                </p>
                <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl uppercase tracking-tight text-black leading-[1.05] mb-6">
                  Meet the Founder
                </h2>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-4">
                  ModernNostalgia.club was built by a music creator who saw firsthand how difficult it is for independent artists to turn talent into sustainable income.
                </p>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  What started as a personal mission to understand sync licensing, catalog development, and the business side of music became a full creative economy designed to help other artists do the same.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Manifesto quote ──────────────────────────────────────── */}
        <section className="py-28" style={{ background: 'hsl(var(--primary))' }}>
          <div className="container mx-auto px-6">
            <motion.blockquote
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-2xl md:text-3xl font-serif font-bold italic leading-snug mb-6 text-white">
                "The future of music is independent artists with professional infrastructure."
              </p>
              <cite className="text-sm text-white/70 not-italic uppercase tracking-widest">
                — ModernNostalgia.club
              </cite>
            </motion.blockquote>
          </div>
        </section>

        {/* ── Join the Club (split layout, white bg) ───────────── */}
        <section className="bg-white py-20 border-t border-gray-200">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 max-w-5xl mx-auto">
              {/* Left: text + CTA */}
              <div className="lg:w-1/2">
                <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl text-black uppercase tracking-tight leading-[1.05] mb-4">
                  Join the Club
                </h2>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-8 max-w-md">
                  Become a member of MNC. This gives independent musicians the training, systems, and professional workflows to monetize their music beyond streaming.
                </p>
                <Button
                  size="lg"
                  className="text-base px-8 h-14 font-semibold"
                  style={{ background: 'hsl(var(--primary))', color: '#fff' }}
                  asChild
                >
                  <Link to="/join">
                    Join the Club <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
              {/* Right: MNC logo */}
              <div className="lg:w-1/2 flex justify-center">
                <img src={mncLogo} alt="MNC Logo" className="w-40 md:w-52 h-auto" />
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
