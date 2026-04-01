import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import aboutHero from '@/assets/about-hero.jpg';
import founderImg from '@/assets/founder.jpg';
import mncLogo from '@/assets/mnc-circle-logo.png';

const fadeIn = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.15 } } };


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
                  Eugene Andrew "Ge Oh" Sarmiento is a songwriter, producer, and sync licensing strategist focused on redefining how music creates value in the modern era. With a catalog of hundreds of pre cleared songs and years of experience navigating both the creative and business sides of the industry, his work sits at the intersection of artistry, ownership, and infrastructure.
                </p>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-4">
                  As the founder of ModernNostalgia.club, Ge Oh built the platform to challenge a broken music economy, one where artists are often underpaid, undervalued, and disconnected from their audience. His approach centers on direct to fan monetization, sync licensing systems, and deal structures that prioritize independence without sacrificing scalability.
                </p>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-4">
                  Beyond music creation, he develops frameworks that teach artists how to generate consistent income, while also educating listeners on the real economics behind the music they love. His mission is simple but ambitious: to rebuild the bridge between artist and audience, making music sustainable again for both sides.
                </p>
                <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                  Through ModernNostalgia.club, Ge Oh is creating more than a platform — he's building a blueprint for the future of independent music.
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
