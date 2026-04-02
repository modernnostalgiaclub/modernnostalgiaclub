import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-24 pb-16 container mx-auto px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-[60vh] bg-gray-200 rounded" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
              <div className="h-4 bg-gray-200 rounded w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 pb-16 container mx-auto px-6 text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Article not found</h1>
          <Button asChild variant="outline">
            <Link to="/blog"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Blog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main id="main-content" role="main">
        {/* Back link */}
        <div className="container mx-auto px-6 pt-32 pb-4">
          <Link
            to="/blog"
            className="inline-flex items-center text-sm text-gray-500 hover:text-black transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        {/* Article header */}
        <div className="container mx-auto px-6 pb-8 max-w-4xl">
          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex gap-2 mb-4">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-[11px] uppercase tracking-[0.15em] font-medium text-gray-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-anton text-3xl md:text-5xl lg:text-6xl text-gray-800 uppercase leading-[1.05] mb-6">
            {post.title}
          </h1>

          {/* Author & date */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
            <span className="uppercase tracking-widest font-medium">By {post.author_name}</span>
            {post.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>

        {/* Hero image — full width */}
        {post.cover_image_url && (
          <div className="w-full mb-12">
            <div className="max-w-5xl mx-auto px-6">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-auto max-h-[70vh] object-cover rounded-lg"
                loading="eager"
              />
            </div>
          </div>
        )}

        {/* Article body */}
        <div className="container mx-auto px-6 pb-20 max-w-3xl">
          {post.content ? (
            <MarkdownRenderer
              content={post.content}
              className="prose-lg prose-gray !text-gray-800 prose-headings:text-gray-800 prose-headings:font-bold prose-a:text-gray-800 prose-a:underline prose-blockquote:border-gray-300 prose-blockquote:text-gray-600"
            />
          ) : (
            <p className="text-gray-500 italic">This article has no content yet.</p>
          )}

          {/* Bottom divider */}
          <hr className="my-12 border-gray-200" />

          {/* Back to blog CTA */}
          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="border-black text-black hover:bg-black hover:text-white">
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                More Articles
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
