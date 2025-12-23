import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Lock, ExternalLink, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import DOMPurify from "dompurify";
interface PatreonPost {
  id: string;
  title: string;
  teaser: string;
  content: string;
  publishedAt: string;
  url: string;
  thumbnail: string | null;
  isFullAccess: boolean;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const PatreonBlog = () => {
  const [posts, setPosts] = useState<PatreonPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>("public");
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchPosts = async (cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const { data, error: fnError } = await supabase.functions.invoke("patreon-posts", {
        body: cursor ? { cursor } : {},
      });
      
      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (cursor) {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
      } else {
        setPosts(data.posts || []);
      }
      setUserTier(data.userTier || "public");
      setNextCursor(data.nextCursor || null);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError(err instanceof Error ? err.message : "Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Unable to load blog posts at this time.</p>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Latest from the Lab
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Livestreams, Op-Eds, and insights from the Creative Economy Lab
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {posts.map((post) => (
            <motion.div key={post.id} variants={fadeIn}>
              <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow group">
                {post.thumbnail && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!post.isFullAccess && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                          <Lock className="h-8 w-8 text-primary mx-auto mb-2" />
                          <p className="text-sm font-medium text-foreground">Members Only</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
                  </div>
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-muted-foreground text-sm line-clamp-3 mb-4 [&_p]:m-0 [&_br]:hidden [&_h3]:text-sm [&_h3]:font-normal [&_strong]:font-normal"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.teaser) }}
                  />
                  {post.isFullAccess ? (
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                    >
                      Read More <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <a href="/apply">
                        Join to Read <ArrowRight className="h-4 w-4 ml-1" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {nextCursor && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mt-10"
          >
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => fetchPosts(nextCursor)}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>Load More Posts</>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};
