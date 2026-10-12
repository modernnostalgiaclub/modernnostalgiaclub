import { usePatreonPosts } from '@/hooks/usePatreonPosts';
import { PatreonPostCard } from '@/components/PatreonPostCard';

export function EditorialArticles() {
  const { data, isLoading } = usePatreonPosts(3);
  const posts = data?.pages[0]?.posts ?? [];

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl text-black uppercase tracking-tight leading-[1.05]">
            Where Timeless Art<br />Meets the Modern Economy
          </h2>
          <p className="mt-4 text-sm md:text-base text-gray-500 uppercase tracking-[0.2em]">
            highlighting Indie music and everything in between
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded" />
                <div className="mt-4 h-5 bg-gray-200 rounded w-3/4" />
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/2" />
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
