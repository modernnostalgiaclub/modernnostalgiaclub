import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import blogHero from '@/assets/blog-hero.jpg';
import { usePatreonPosts, PATREON_URL } from '@/hooks/usePatreonPosts';
import { PatreonPostCard } from '@/components/PatreonPostCard';

export default function BlogIndex() {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePatreonPosts(9);
  const allPosts = data?.pages.flatMap((p) => p.posts) ?? [];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content" role="main">
        {/* Hero */}
        <section className="relative h-[50vh] overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${blogHero})` }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, hsl(222 47% 4% / 0.85) 0%, hsl(222 47% 4% / 0.6) 50%, hsl(217 100% 10% / 0.5) 100%)' }} />
          
        </section>

        {/* Title */}
        <section>
          <div className="container mx-auto px-6 pt-12 pb-8">
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-400 mb-3">Editorial</p>
            <h1 className="font-anton text-5xl md:text-7xl uppercase tracking-tight leading-[1.05] mb-4 text-black">
              The Blog
            </h1>
            <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
              Fresh from our Patreon. Artist tips, articles, and music for listeners and indie musicians making human music.
            </p>
          </div>
        </section>

        {/* Posts Grid */}
        <section>
          <div className="container mx-auto px-6 py-16">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 rounded" />
                    <div className="mt-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError || allPosts.length === 0 ? (
              <div className="text-center py-20">
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-6">Catch every post directly on Patreon.</p>
                <Button asChild>
                  <a href={PATREON_URL} target="_blank" rel="noopener noreferrer">
                    Visit our Patreon <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {allPosts.map((post) => (
                    <PatreonPostCard key={post.id} post={post} />
                  ))}
                </div>
                {hasNextPage && (
                  <div className="flex justify-center mt-14">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading</>
                      ) : (
                        'Load more posts'
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-gray-200">
          <div className="container mx-auto px-6 py-16 text-center">
            <p className="text-gray-500 text-lg mb-6">
              Independent artist? Learn how to monetize your music beyond streaming.
            </p>
            <Button size="lg" asChild>
              <a href="https://www.patreon.com/modernnostalgiaclub" target="_blank" rel="noopener noreferrer">
                Join the Club <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}