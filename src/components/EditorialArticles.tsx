import { usePatreonPosts } from '@/hooks/usePatreonPosts';
import { PatreonPostCard } from '@/components/PatreonPostCard';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EditorialArticles() {
  const { data, isLoading } = usePatreonPosts(3);
  const posts = data?.pages[0]?.posts ?? [];

  return (
    <section id="blog" aria-labelledby="blog-heading" className="home-section bg-paper py-14 md:py-20">
      <div className="container mx-auto px-6">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase text-ink-muted">From the Club</p>
            <h2 id="blog-heading" className="font-anton text-4xl md:text-5xl text-ink uppercase leading-[1.15]">The Blog</h2>
            <p className="mt-4 text-sm md:text-base text-ink-muted">Artist teachings, independent music and the business behind it.</p>
          </div>
          <Button variant="link" asChild className="shrink-0 px-0 text-ink"><Link to="/blog">All posts<ArrowRight aria-hidden="true" /></Link></Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-paper-muted rounded" />
                <div className="mt-4 h-5 bg-paper-muted rounded w-3/4" />
                <div className="mt-2 h-4 bg-paper-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? null : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PatreonPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
