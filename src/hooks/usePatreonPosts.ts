import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import day63Cover from '@/assets/rb-aboy-day-63-cover.png.asset.json';

export interface PatreonPost {
  id: string;
  title: string;
  teaser: string;
  publishedAt: string;
  url: string;
  thumbnail: string | null;
  isPublic: boolean;
  isFullAccess: boolean;
}

interface PatreonPage {
  posts: PatreonPost[];
  nextOffset: number | null;
  total: number;
}

export const PATREON_URL = 'https://www.patreon.com/modernnostalgiaclub';

export function usePatreonPosts(pageSize = 9) {
  return useInfiniteQuery({
    queryKey: ['patreon-posts', pageSize],
    initialPageParam: 0,
    queryFn: async ({ pageParam }): Promise<PatreonPage> => {
      const { data, error } = await supabase.functions.invoke('patreon-posts', {
        body: { offset: pageParam, pageSize },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const page = data as PatreonPage;
      return {
        ...page,
        posts: page.posts.map((post) => post.id === '172159367'
          ? { ...post, thumbnail: day63Cover.url }
          : post),
      };
    },
    getNextPageParam: (last) => last.nextOffset ?? undefined,
    staleTime: 5 * 60 * 1000,
  });
}
