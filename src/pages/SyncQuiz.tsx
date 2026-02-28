import { Helmet } from 'react-helmet-async';
import { SyncReadinessQuiz } from '@/components/SyncReadinessQuiz';
import { Footer } from '@/components/Footer';
import { Link } from 'react-router-dom';
import logoCream from '@/assets/logo-cream.png';

const SyncQuiz = () => {
  return (
    <>
      <Helmet>
        <title>Are You Sync Ready? | Free Music Licensing Quiz | Modern Nostalgia Club</title>
        <meta 
          name="description" 
          content="Take our free 2-minute quiz to discover if your music catalog is ready for sync licensing opportunities in TV, film, and advertising." 
        />
        <meta property="og:title" content="Are You Sync Ready? | Free Music Licensing Quiz" />
        <meta property="og:description" content="Discover if your music is ready for TV, film, and advertising placements. Take our free 2-minute assessment." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://modernnostalgiaclub.lovable.app/sync-quiz" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Minimal Header */}
        <header className="py-6 px-4 border-b border-border/50">
          <div className="container mx-auto flex justify-center">
            <Link to="/" className="block">
              <img 
                src={logoCream} 
                alt="Modern Nostalgia Club" 
                className="h-10 w-auto dark:block hidden"
              />
              <img 
                src={logoCream} 
                alt="Modern Nostalgia Club" 
                className="h-10 w-auto dark:hidden invert"
              />
            </Link>
          </div>
        </header>

        {/* Quiz Section - Full Focus */}
        <main className="flex-1">
          <SyncReadinessQuiz />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SyncQuiz;
