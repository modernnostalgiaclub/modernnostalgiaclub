import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import aboutHero from '@/assets/about-hero.jpg';
import mncLogo from '@/assets/mnc-circle-logo.png';

const fadeIn = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };


export default function AboutPage() {
  return (
    <div className="public-editorial min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main">

        {/* ── Hero — clean image with just the title ────────────────── */}
        <section className="relative h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${aboutHero})` }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(222 47% 4% / 0.85) 0%, hsl(222 47% 4% / 0.6) 50%, hsl(217 100% 10% / 0.5) 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ── Who We Are (white editorial section) ─────────────────── */}
        <section className="bg-paper py-20">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h1
                className="font-anton text-3xl md:text-5xl lg:text-6xl text-ink uppercase  leading-[1.05]"
                variants={fadeIn}
              >
                Who We Are
              </motion.h1>
              <motion.p
                className="mt-4 text-sm md:text-base text-ink-muted uppercase tracking-[0.2em]"
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
              <motion.p className="text-sm md:text-base text-ink-muted leading-relaxed" variants={fadeIn}>
                At the intersection of timeless artistry and the modern music economy, we curate, create, and educate, helping artists move beyond just making music and into building sustainable, independent careers.
              </motion.p>
              <motion.p className="text-sm md:text-base text-ink-muted leading-relaxed" variants={fadeIn}>
                We believe the best music discovery still comes from human ears with taste. Our editorial playlists and blog exist to surface independent artists whose music deserves to be heard, not just streamed.
              </motion.p>
              <motion.p className="text-sm md:text-base text-ink-muted leading-relaxed" variants={fadeIn}>
                MN.C works with independent artists to develop catalog intentionally, music crafted with placement, sync licensing, and closed audience discovery in mind. This is music built to work.
              </motion.p>
              <motion.p className="text-sm md:text-base text-ink-muted leading-relaxed" variants={fadeIn}>
                The Creator Economy Lab gives artists the training, systems, and professional workflows to build income through sync licensing, direct to fan, and sustainable career infrastructure, not just Spotify streams.
              </motion.p>
              <motion.p className="text-sm md:text-base text-ink-muted leading-relaxed" variants={fadeIn}>
                Modern Nostalgia Club is a creative economy designed for artists who want to turn their craft into income. Through training, systems, and real-world workflows, we equip artists with the tools to operate like modern businesses.
              </motion.p>
              <motion.p className="text-sm md:text-base text-ink-muted leading-relaxed" variants={fadeIn}>
                Because it's not just about creating music, it's about building a structure around your creativity so it can actually work for you.
              </motion.p>
            </motion.div>
          </div>
        </section>


        <section aria-labelledby="pillars-heading" className="bg-paper py-16 md:py-20 border-t border-rule">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 id="pillars-heading" className="font-anton text-3xl md:text-5xl uppercase leading-[1.15] mb-10 text-ink">What We Stand For</h2>
            <div className="border-t-2 border-khaki">
              {[
                { title: 'Human First Music', description: 'Music made by people, for people. We are open about how songs get made and we back artists who document their process.' },
                { title: 'Ownership', description: 'Know what you own, register it properly and collect what you are owed. Publishing, splits and rights come before promotion.' },
                { title: 'Income Beyond Streams', description: 'Sync licensing, direct to fan support and services that pay. Streaming is one channel, not the plan.' },
                { title: 'Community Over Competition', description: 'Camps, workshops and playlists that put independent artists in the same room, with a focus on lifting Filipino and API creators.' },
              ].map((pillar, index) => (
                <div key={pillar.title} className="grid grid-cols-[2rem_1fr] md:grid-cols-[3rem_1fr_1.5fr] gap-x-5 gap-y-3 border-b border-rule py-7 md:py-9">
                  <span className="text-ink-muted text-sm font-semibold pt-1">0{index + 1}</span>
                  <h3 className="font-serif text-xl md:text-2xl font-semibold text-ink">{pillar.title}</h3>
                  <p className="col-start-2 md:col-start-3 text-ink-muted text-sm md:text-base leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Manifesto quote ──────────────────────────────────────── */}
        <section className="py-28 bg-action">
          <div className="container mx-auto px-6">
            <motion.blockquote
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-2xl md:text-3xl font-serif font-bold italic leading-snug mb-6 text-action-foreground">
                "The future of music is independent artists with professional infrastructure."
              </p>
              <cite className="text-sm text-action-foreground not-italic uppercase tracking-widest">
                ModernNostalgia.club
              </cite>
            </motion.blockquote>
          </div>
        </section>

        <section aria-labelledby="about-contact-heading" className="bg-paper py-16 md:py-20 border-b border-rule">
          <div className="container mx-auto px-6 max-w-5xl">
            <h2 id="about-contact-heading" className="font-anton text-3xl md:text-5xl uppercase leading-[1.15] mb-5 text-ink">Contact</h2>
            <p className="text-ink-muted max-w-xl leading-relaxed mb-4">Have a question, a project in mind or an idea for working together? Get in touch with the club.</p>
            <a href="mailto:support@modernnostalgia.club" className="text-ink underline underline-offset-4 break-words">support@modernnostalgia.club</a>
            <div className="flex flex-wrap gap-4 mt-7">
              <Button variant="editorial" size="lg" asChild><Link to="/contact">Contact Us <ArrowRight aria-hidden="true" /></Link></Button>
              <Button variant="editorialOutline" size="lg" asChild><Link to="/connect">Connect with the Club <ArrowRight aria-hidden="true" /></Link></Button>
            </div>
          </div>
        </section>

        {/* ── Join the Club (split layout, white bg) ───────────── */}
        <section className="bg-paper py-20 border-t border-rule">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 max-w-5xl mx-auto">
              {/* Left: text + CTA */}
              <div className="lg:w-1/2">
                <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl text-ink uppercase  leading-[1.05] mb-4">
                  Join the Club
                </h2>
                <p className="text-sm md:text-base text-ink-muted leading-relaxed mb-8 max-w-md">
                  Become a member of MNC. This gives independent musicians the training, systems, and professional workflows to monetize their music beyond streaming.
                </p>
                <Button
                  size="lg"
                  className="text-base px-8 h-14 font-semibold"
                  variant="editorial"
                  asChild
                >
                  <a href="https://www.patreon.com/modernnostalgiaclub" target="_blank" rel="noopener noreferrer">
                    Join the Club <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </div>
              {/* Right: MNC logo */}
              <div className="lg:w-1/2 flex justify-center">
                <img src={mncLogo} alt="MNC Logo" className="w-56 md:w-72 lg:w-80 h-auto" />
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
