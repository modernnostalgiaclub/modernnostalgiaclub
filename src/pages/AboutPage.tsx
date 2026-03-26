import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { SectionLabel } from '@/components/SectionLabel';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Headphones, Music2, GraduationCap, ArrowRight } from 'lucide-react';

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

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="border-b border-border/40 relative overflow-hidden">
          {/* Grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, hsl(var(--border)/0.5) 0px, hsl(var(--border)/0.5) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, hsl(var(--border)/0.5) 0px, hsl(var(--border)/0.5) 1px, transparent 1px, transparent 60px)',
            }}
          />
          <div className="container mx-auto px-6 pt-36 pb-24 relative z-10">
            <motion.div
              className="max-w-4xl"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeIn}>
                <SectionLabel className="mb-6">About</SectionLabel>
              </motion.div>
              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-[0.95] mb-8 text-foreground break-words"
                variants={fadeIn}
              >
                ModernNostalgia.club<br />
                <span className="italic text-primary">is a Creative Firm.</span>
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
                variants={fadeIn}
              >
                We curate, create, and educate at the intersection of timeless artistry and the modern music economy.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── Three Pillars ─────────────────────────────────────────────── */}
        <section className="border-b border-border/40">
          <div className="container mx-auto px-6 py-24">
            <motion.div
              className="mb-16 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <SectionLabel className="mb-4">What We Do</SectionLabel>
              <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
                Three things.<br />
                <span className="text-primary italic">Done with intention.</span>
              </h2>
            </motion.div>

            <div className="space-y-6">
              {PILLARS.map((pillar, i) => (
                <motion.div
                  key={pillar.verb}
                  className="group rounded-2xl p-8 md:p-10 border border-border/40 flex flex-col md:flex-row md:items-start gap-8 transition-all duration-300 hover:border-border"
                  style={{ background: 'hsl(var(--card)/0.4)' }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                >
                  {/* Number + icon */}
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

                  {/* Content */}
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

        {/* ── Manifesto quote ───────────────────────────────────────────── */}
        <section className="border-b border-border/40 bg-card/20">
          <div className="container mx-auto px-6 py-24">
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

        {/* ── CTA Strip ─────────────────────────────────────────────────── */}
        <section>
          <div className="container mx-auto px-6 py-20">
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <SectionLabel className="mb-6">What's Next</SectionLabel>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-10 leading-tight">
                Explore the music.<br />
                <span className="italic text-primary">Join the Lab.</span>
              </h2>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button size="lg" asChild>
                  <Link to="/">
                    Explore the Music <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/lab">
                    Join the Creator Economy Lab
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
