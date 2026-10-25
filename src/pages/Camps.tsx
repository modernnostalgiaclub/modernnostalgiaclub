import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Film, Drum } from 'lucide-react';
import { CAMPS } from '@/lib/camps';

const cards = [
  { slug: 'sync-album' as const, icon: Film, cta: 'Apply for the Sync Album Camp' },
  { slug: 'loop-pack' as const, icon: Drum, cta: 'Apply for the Loop Pack Camp' },
];

export default function Camps() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Helmet>
        <title>Filipino Songwriting Camps | Modern Nostalgia Club</title>
        <meta name="description" content="Apply to two songwriting camps for Filipino artists, producers and instrumentalists: a sync compilation album and an OPM loop pack." />
        <link rel="canonical" href="https://modernnostalgia.club/camps" />
        <meta property="og:title" content="Filipino Songwriting Camps | Modern Nostalgia Club" />
        <meta property="og:description" content="Filipino artists, producers and instrumentalists: apply for our Sync Album and OPM Loop Pack camps." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Header />
      <main className="flex-1 pt-20">
        <section className="container mx-auto px-6 py-16 max-w-5xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">Now accepting applications</p>
          <h1 className="mt-3 font-anton text-4xl md:text-6xl uppercase tracking-tight leading-[1.15] text-gray-900">
            Filipino Songwriting Camps
          </h1>
          <p className="mt-5 max-w-2xl text-gray-600 text-lg">
            I am actively looking for Filipino artists, producers and instrumentalists for two major upcoming songwriting camps.
            Pick the project that fits you, or apply to both.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {cards.map(({ slug, icon: Icon, cta }) => (
              <div key={slug} className="flex flex-col rounded-xl border border-gray-200 bg-gray-50 p-8">
                <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
                <h2 className="mt-4 font-poppins text-2xl font-semibold text-gray-900">{CAMPS[slug].short}</h2>
                <p className="mt-3 flex-1 text-gray-600">{CAMPS[slug].pitch}</p>
                <Button asChild size="lg" className="mt-6 self-start">
                  <Link to={`/camps/${slug}`}>{cta} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-500">Want in on both? Submit both applications. Each takes about 3 minutes.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
