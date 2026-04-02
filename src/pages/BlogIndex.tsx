import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SectionLabel } from '@/components/SectionLabel';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const POSTS_PER_PAGE = 9;

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function BlogIndex() {
  const [page, setPage] = useState(1);

  const { data: allPosts = [], isLoading } = useQuery({
    queryKey: ['blog-all-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, cover_image_url, author_name, published_at, slug')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      return data || [];
    },
  });

  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPosts = allPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content" role="main">
        {/* Hero */}
        <section className="border-b border-gray-200">
          <div className="container mx-auto px-6 pt-32 pb-16">
            <SectionLabel className="mb-4">Editorial</SectionLabel>
            <h1 className="font-anton text-5xl md:text-7xl uppercase tracking-tight leading-[1.05] mb-4 text-black">
              The Blog
            </h1>
            <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
              Music stories, artist features, and industry perspective from ModernNostalgia.club.
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
                    <div className="aspect-[3/4] max-h-[480px] bg-gray-200 rounded" />
                    <div className="mt-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : allPosts.length === 0 ? (
              <div className="text-center py-20">
                <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No blog posts published yet.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {paginatedPosts.map((post, i) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
                      <motion.article
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="aspect-[3/4] max-h-[480px] overflow-hidden bg-gray-100 rounded">
                          {post.cover_image_url ? (
                            <img
                              src={post.cover_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Newspaper className="w-10 h-10 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <h2 className="font-anton text-sm md:text-base uppercase tracking-tight leading-snug text-gray-800 group-hover:text-gray-500 transition-colors">
                            {post.title}
                          </h2>
                          <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                            By {post.author_name}
                          </p>
                        </div>
                      </motion.article>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                          key={p}
                          variant={p === currentPage ? 'default' : 'ghost'}
                          size="sm"
                          className="w-9 h-9"
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
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
              <Link to="/lab">
                Join the Club <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}