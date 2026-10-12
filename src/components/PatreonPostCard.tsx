import { Lock, ExternalLink } from 'lucide-react';
import mncLogo from '@/assets/mnc-logo.png';
import type { PatreonPost } from '@/hooks/usePatreonPosts';

export function PatreonPostCard({ post }: { post: PatreonPost }) {
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block h-full"
      aria-label={`${post.title} (opens on Patreon)`}
    >
      <article className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded bg-gray-100">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              alt=""
              loading="lazy"
              className={post.id === '172159367'
                ? 'h-full w-full object-contain'
                : 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1a1a1a]">
              <img src={mncLogo} alt="" className="h-16 w-auto opacity-80" />
            </div>
          )}
          {!post.isPublic && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
              <Lock className="h-3 w-3" /> Members
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-1 flex-col">
          <p className="text-xs uppercase tracking-widest text-gray-500">{date}</p>
          <h3 className="mt-1 font-anton text-lg uppercase leading-snug tracking-tight text-black transition-colors group-hover:text-[#1194ff]">
            {post.title}
          </h3>
          {post.teaser && (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">{post.teaser}</p>
          )}
          <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-medium text-[#1194ff]">
            {post.isPublic ? 'Read on Patreon' : 'Unlock on Patreon'}
            <ExternalLink className="h-3.5 w-3.5" />
          </span>
        </div>
      </article>
    </a>
  );
}
