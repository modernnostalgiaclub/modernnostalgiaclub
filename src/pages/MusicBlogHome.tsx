import { ArrowRight, ExternalLink } from 'lucide-react';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MNCPlayer } from '@/components/MNCPlayer';
import { ArtistResources } from '@/components/ArtistResources';
import { LabUpdatesSignup } from '@/components/LabUpdatesSignup';
import { EditorialArticles } from '@/components/EditorialArticles';
import { BlackFridayAnnouncement } from '@/components/home/BlackFridayAnnouncement';
import { HomeServices } from '@/components/home/HomeServices';
import { HomeEvents } from '@/components/home/HomeEvents';
import { HomeTools } from '@/components/home/HomeTools';
import { PATREON_PAGE_URL } from '@/lib/siteNavigation';
import heroBg from '@/assets/hero-bg.jpg';
import mncHeroLogo from '@/assets/mnc-hero-logo.png';

function Masthead() {
  return (
    <section className="home-hero relative flex items-center overflow-hidden bg-chrome text-inverse">
      <img src={heroBg} alt="Artist performing live" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover object-[center_7%] md:object-center" />
      <div className="absolute inset-0 bg-veil/65" aria-hidden="true" />
      <div className="container relative z-10 mx-auto px-6 py-12 text-center md:py-14">
        <img src={mncHeroLogo} alt="Modern Nostalgia Club" width={640} height={320} className="mx-auto mb-6 h-14 w-auto sm:h-20 md:h-24" />
        <h1 className="mx-auto max-w-4xl font-anton text-4xl uppercase leading-[1.15] sm:text-5xl md:text-6xl lg:text-7xl">Where Timeless Art Meets the Modern Economy</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-inverse-muted md:text-base">1-on-1 support, live writing sessions and practical tools for independent artists building a life in music.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button variant="editorial" size="lg" asChild className="w-full sm:w-auto"><a href="#services">Book a Service<ArrowRight aria-hidden="true" /></a></Button>
          <Button variant="inverseOutline" size="lg" asChild className="w-full whitespace-normal text-center sm:w-auto"><a href="#events">Upcoming Camps &amp; Workshops<ArrowRight aria-hidden="true" /></a></Button>
        </div>
      </div>
    </section>
  );
}

function RollNLumpia() {
  return (
    <section className="border-b border-rule bg-paper py-10 md:py-14" aria-labelledby="roll-n-lumpia-heading">
      <div className="container mx-auto flex flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase text-ink-muted">Featured</p>
          <h2 id="roll-n-lumpia-heading" className="font-anton text-4xl uppercase leading-[1.15] md:text-5xl">Roll N Lumpia</h2>
          <p className="mt-4 leading-relaxed text-ink-muted">The API entertainment network connecting Asian and Pacific Islander artists to shows, playlists and each other. Submit your music or find a show.</p>
        </div>
        <Button variant="editorial" size="lg" asChild className="w-full shrink-0 sm:w-auto">
          <a href="https://rollnlumpia.com" target="_blank" rel="noopener noreferrer">Visit Roll N Lumpia<ExternalLink aria-hidden="true" /></a>
        </Button>
      </div>
    </section>
  );
}

function JoinTheClub() {
  return (
    <section className="border-b border-rule bg-paper py-14 md:py-20" aria-labelledby="club-heading">
      <div className="container mx-auto flex flex-col items-start justify-between gap-7 px-6 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase text-ink-muted">Keep building with us</p>
          <h2 id="club-heading" className="font-anton text-4xl md:text-5xl uppercase leading-[1.15]">Join the Club</h2>
          <p className="mt-4 text-ink-muted leading-relaxed">Daily artist teachings, a community that cares about human-made music, and live workshops included for Patreon Club members.</p>
        </div>
        <Button variant="editorial" size="lg" asChild className="shrink-0"><a href={PATREON_PAGE_URL} target="_blank" rel="noopener noreferrer">Join the Club<ArrowRight aria-hidden="true" /></a></Button>
      </div>
    </section>
  );
}

export default function MusicBlogHome() {
  const { hash } = useLocation();
  useLayoutEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.slice(1));
    target?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [hash]);

  return (
    <div className="public-editorial min-h-screen bg-background text-foreground">
      <Header sticky announcement={<BlackFridayAnnouncement />} />
      <main id="main-content" role="main">
        <Masthead />
        <RollNLumpia />
        <HomeServices />
        <HomeEvents />
        <HomeTools />
        <MNCPlayer />
        <ArtistResources />
        <JoinTheClub />
        <EditorialArticles />
        <LabUpdatesSignup />
      </main>
      <Footer showEmailSignup={false} />
    </div>
  );
}
