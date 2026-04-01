import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SectionLabel } from '@/components/SectionLabel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Newspaper, Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const POSTS_PER_PAGE = 9;

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function BlogIndex() {
  const [page, setPage] = useState(1);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const { data: allPosts = [], isLoading } = useQuery({
    queryKey: ['blog-all-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, cover_image_url, author_name, published_at, slug, tags')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      return data || [];
    },
  });

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    allPosts.forEach((post) => {
      post.tags?.forEach((tag: string) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [allPosts]);

  // Filter by tag
  const filteredPosts = useMemo(() => {
    if (!activeTag) return allPosts;
    return allPosts.filter((p) => p.tags?.includes(activeTag));
  }, [allPosts, activeTag]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleTagClick = (tag: string) => {
    setActiveTag((prev) => (prev === tag ? null : tag));
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" role="main">
        {/* Hero */}
        <section className="border-b border-border/40">
          <div className="container mx-auto px-6 pt-32 pb-16">
            <SectionLabel className="mb-4">Editorial</SectionLabel>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.0] mb-4 text-foreground">
              The Blog
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Music stories, artist features, and industry perspective from ModernNostalgia.club.
            </p>
          </div>
        </section>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <section className="border-b border-border/40">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2">Filter:</span>
                <Badge
                  variant={activeTag === null ? 'default' : 'outline'}
                  className="cursor-pointer text-xs"
                  onClick={() => { setActiveTag(null); setPage(1); }}
                >
                  All
                </Badge>
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={activeTag === tag ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section>
          <div className="container mx-auto px-6 py-16">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden animate-pulse bg-card/50">
                    <div className="aspect-video bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-20">
                <Newspaper className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  {activeTag ? `No posts tagged "${activeTag}" yet.` : 'No blog posts published yet.'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedPosts.map((post, i) => (
                    <Link key={post.id} to={`/blog/${post.slug}`} className="block">
                      <motion.article
                        className="group rounded-xl overflow-hidden flex flex-col bg-card/40 border border-border/40 hover:border-border transition-all duration-300"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeIn}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="relative aspect-video overflow-hidden bg-muted">
                          {post.cover_image_url ? (
                            <img
                              src={post.cover_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Newspaper className="w-10 h-10 text-primary/20" />
                            </div>
                          )}
                          {post.tags && post.tags.length > 0 && (
                            <div className="absolute top-3 left-3 flex gap-1 flex-wrap">
                              {post.tags.slice(0, 2).map((tag: string) => (
                                <span
                                  key={tag}
                                  className="text-[10px] uppercase tracking-widest font-medium px-2 py-0.5 rounded-full backdrop-blur-sm"
                                  style={{
                                    background: 'hsl(var(--primary)/0.2)',
                                    color: 'hsl(var(--primary)/0.9)',
                                    border: '1px solid hsl(var(--primary)/0.3)',
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h2 className="font-serif text-base font-semibold leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h2>
                          {post.excerpt && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="mt-auto pt-3 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                            <span>{post.author_name}</span>
                            {post.published_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(post.published_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
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
        <section className="border-t border-border/40">
          <div className="container mx-auto px-6 py-16 text-center">
            <p className="text-muted-foreground text-lg mb-6">
              Independent artist? Learn how to monetize your music beyond streaming.
            </p>
            <Button size="lg" asChild>
              <Link to="/lab">
                Explore the Creator Economy Lab <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
