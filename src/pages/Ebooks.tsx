import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface EbookItem {
  id: string;
  title: string;
  description: string | null;
  url: string;
  is_download?: boolean;
}

export default function Ebooks() {
  const [ebooks, setEbooks] = useState<EbookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEbooks = async () => {
      // Fetch from example_tracks where type contains 'ebook' or 'download'
      const { data: tracks } = await supabase
        .from('example_tracks')
        .select('id, title, description, link, is_download, type')
        .eq('is_published', true)
        .or('type.ilike.%ebook%,type.ilike.%download%')
        .order('sort_order', { ascending: true });

      // Also fetch from reference_resources in ebook category
      const { data: resources } = await supabase
        .from('reference_resources')
        .select('id, title, description, url, category')
        .eq('is_published', true)
        .or('category.ilike.%ebook%,category.ilike.%free download%')
        .order('sort_order', { ascending: true });

      const items: EbookItem[] = [
        ...(tracks || []).map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          url: t.link,
          is_download: t.is_download ?? false,
        })),
        ...(resources || []).map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          url: r.url,
          is_download: true,
        })),
      ];

      setEbooks(items);
      setLoading(false);
    };

    fetchEbooks();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          Ebooks &amp; Downloads
        </h1>
        <p className="mt-2 text-muted-foreground">
          Free guides, eBooks, and resources to level up your music career.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : ebooks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No ebooks available yet. Check back soon!
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {ebooks.map((ebook) => (
            <Card key={ebook.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{ebook.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {ebook.description && (
                  <p className="text-sm text-muted-foreground mb-4">{ebook.description}</p>
                )}
                <Button asChild variant="outline" size="sm">
                  <a
                    href={ebook.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    {ebook.is_download ? (
                      <><Download className="h-4 w-4" /> Download</>
                    ) : (
                      <><ExternalLink className="h-4 w-4" /> View</>
                    )}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
