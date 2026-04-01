import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

export function EditorialArticles() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['editorial-articles'],
    queryFn: async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, cover_image_url, author_name, published_at, slug')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(3);
      return data || [];
    },
  });

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        {/* Anton heading */}
        <h2 className="font-anton text-2xl md:text-3xl text-black uppercase tracking-tight mb-10 text-center">
          For Real Music Lovers
        </h2>

        {/* Articles grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-gray-200 rounded" />
                <div className="mt-4 h-5 bg-gray-200 rounded w-3/4" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? null : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/blog/${post.slug}`} className="group block">
                  <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                    {post.cover_image_url ? (
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-16 h-16 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 font-serif text-lg md:text-xl font-bold text-black uppercase leading-tight group-hover:text-gray-600 transition-colors">
                    {post.title}
                  </h3>
                  {post.author_name && (
                    <p className="mt-1 text-xs text-gray-500 uppercase tracking-widest">
                      By {post.author_name}
                    </p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
