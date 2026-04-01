import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/SectionLabel';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Music2, GraduationCap, ArrowRight } from 'lucide-react';
import aboutHero from '@/assets/about-hero.jpg';
import logoCream from '@/assets/logo-cream.png';

const fadeIn = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };

const PILLARS = [
  {
    icon: Headphones,
    verb: 'Curate',
    headline: 'Human music for active listeners.',
    body: 'We believe the best music discovery still comes from human ears with taste. Our editorial playlists and blog exist to surface independent artists whose music deserves to be heard — not just streamed.',
    accent: 'hsl(var(--primary))',
    accentBg: 'hsl(var(--primary)/0.08)',
    accentBorder: 'hsl(var(--primary)/0.2)',
  },
  {
    icon: Music2,
    verb: 'Create',
    headline: 'Music built for Closed Audience Playlists and Sync Licensing.',
    body: 'MN.C works with independent artists to develop catalog intentionally — music crafted with placement, sync licensing, and closed-audience discovery in mind. This is music built to work.',
    accent: 'hsl(142 70% 55%)',
    accentBg: 'hsl(142 70% 45% / 0.08)',
    accentBorder: 'hsl(142 70% 45% / 0.2)',
  },
  {
    icon: GraduationCap,
    verb: 'Educate',
    headline: 'Independent musicians on how to monetize beyond streaming.',
    body: 'The Creator Economy Lab gives artists the training, systems, and professional workflows to build income through sync licensing, direct-to-fan, and sustainable career infrastructure — not just Spotify streams.',
    accent: 'hsl(38 95% 60%)',
    accentBg: 'hsl(38 95% 50% / 0.08)',
    accentBorder: 'hsl(38 95% 50% / 0.2)',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main">

        {/* ── Hero (mirrors home page) ──────────────────────────────── */}
        <section
          className="relative min-h-screen flex items-center overflow-hidden"
          aria-labelledby="about-heading"
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${aboutHero})` }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(222 47% 4% / 0.97) 0%, hsl(222 47% 4% / 0.8) 50%, hsl(217 100% 10% / 0.7) 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, hsl(217 100% 50% / 0.08) 0%, transparent 70%)' }} />

          <div className="container mx-auto px-6 relative z-10 pt-28 pb-20">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeIn} className="mb-8 flex justify-center">
                <img src={logoCream} alt="ModernNostalgia.club" className="h-16 md:h-20 w-auto" />
              </motion.div>

              <motion.div variants={fadeIn} className="flex justify-center">
                <SectionLabel className="mb-5">About</SectionLabel>
              </motion.div>

              <motion.h1
                id="about-heading"
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold mb-8 leading-[1.05] text-foreground"
                variants={fadeIn}
              >
                About{' '}
                <span className="italic" style={{ color: 'hsl(217 100% 65%)' }}>Us.</span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
                variants={fadeIn}
              >
                A creative firm at the intersection of timeless artistry and the modern music economy.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── About Content ─────────────────────────────────────────── */}
        <section className="py-28 border-t border-border/30">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2
                className="font-anton text-3xl md:text-5xl lg:text-6xl uppercase tracking-tight text-foreground leading-[1.05] mb-8"
                variants={fadeIn}
              >
                Who We Are
              </motion.h2>
              <motion.h3
                className="text-3xl md:text-4xl font-serif font-bold leading-tight mb-8 text-foreground"
                variants={fadeIn}
              >
                ModernNostalgia.club<br />
                <span className="italic" style={{ color: 'hsl(217 100% 65%)' }}>is a Creative Firm.</span>
              </motion.h3>
              <motion.p
                className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6"
                variants={fadeIn}
              >
                At the intersection of timeless artistry and the modern music economy — we curate, create, and educate, helping artists move beyond just making music and into building sustainable, independent careers.
              </motion.p>
              <motion.p
                className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6"
                variants={fadeIn}
              >
                Modern Nostalgia Club is a creative economy designed for artists who want to turn their craft into income. Through training, systems, and real-world workflows, we equip artists with the tools to operate like modern businesses.
              </motion.p>
              <motion.p
                className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                variants={fadeIn}
              >
                Because it's not just about creating music — it's about building a structure around your creativity so it can actually work for you.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── Three Pillars ─────────────────────────────────────────── */}
        <section className="py-28 border-t border-border/30">
          <div className="container mx-auto px-6">
            <motion.div
              className="mb-16 max-w-4xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <SectionLabel className="mb-5">What We Do</SectionLabel>
              <h2 className="text-4xl md:text-6xl font-serif font-bold leading-tight text-foreground">
                Three things.<br />
                <span className="italic" style={{ color: 'hsl(217 100% 65%)' }}>Done with intention.</span>
              </h2>
            </motion.div>

            <div className="space-y-6 max-w-4xl mx-auto">
              {PILLARS.map((pillar, i) => (
                <motion.div
                  key={pillar.verb}
                  className="group rounded-2xl p-8 md:p-10 border border-border/30 flex flex-col md:flex-row md:items-start gap-8 transition-all duration-300 hover:border-border/60"
                  style={{ background: 'hsl(var(--card))' }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                >
                  <div className="shrink-0 flex items-start gap-4 md:flex-col md:gap-3 md:w-28">
                    <span
                      className="text-7xl md:text-8xl font-serif font-bold leading-none select-none"
                      style={{ color: pillar.accent, opacity: 0.25 }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: pillar.accentBg, border: `1px solid ${pillar.accentBorder}` }}
                    >
                      <pillar.icon className="w-6 h-6" style={{ color: pillar.accent }} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs uppercase tracking-widest font-semibold mb-2"
                      style={{ color: pillar.accent }}
                    >
                      {pillar.verb}
                    </p>
                    <h3 className="text-2xl md:text-3xl font-serif font-bold leading-tight mb-4 text-foreground">
                      {pillar.headline}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-base max-w-2xl">
                      {pillar.body}
                    </p>
                  </div>
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
        <section className="py-28 border-t border-border/30">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel className="mb-5">What's Next</SectionLabel>
              <h2 className="text-4xl md:text-6xl font-serif font-bold mb-10 leading-tight text-foreground">
                Explore the music.<br />
                <span className="italic" style={{ color: 'hsl(217 100% 65%)' }}>Join the Club.</span>
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="text-base px-8 h-14 font-semibold"
                  style={{ background: 'hsl(217 100% 50%)', color: '#fff', boxShadow: '0 0 24px hsl(217 100% 50% / 0.4)' }}
                  asChild
                >
                  <Link to="/">
                    Explore the Music <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="text-base px-8 h-14" asChild>
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
