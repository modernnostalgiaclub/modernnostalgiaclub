import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SectionLabel } from '@/components/SectionLabel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Trophy, 
  HelpCircle, 
  Folder, 
  Briefcase,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Plus,
  Send,
  Loader2,
  Clock
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Map icon names to components
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'trophy': Trophy,
  'help-circle': HelpCircle,
  'folder': Folder,
  'briefcase': Briefcase,
  'message-square': MessageSquare,
};

interface Section {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  post_count?: number;
}

interface Post {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  user_id: string;
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
  comment_count?: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function Community() {
  const { user, profile, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [sections, setSections] = useState<Section[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  
  // Current view state
  const currentSection = searchParams.get('section');
  const currentPostId = searchParams.get('post');
  const currentPost = posts.find(p => p.id === currentPostId);
  
  // Form state
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [submittingPost, setSubmittingPost] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch sections with post counts
  useEffect(() => {
    async function fetchSections() {
      const { data, error } = await supabase
        .from('community_sections')
        .select(`
          *,
          community_posts(count)
        `)
        .order('sort_order');

      if (error) {
        console.error('Error fetching sections:', error);
      } else if (data) {
        const sectionsWithCount = data.map(section => ({
          ...section,
          post_count: section.community_posts?.[0]?.count || 0
        }));
        setSections(sectionsWithCount);
      }
      setLoading(false);
    }

    fetchSections();
  }, []);

  // Fetch posts when section changes
  useEffect(() => {
    if (!currentSection) {
      setPosts([]);
      return;
    }

    async function fetchPosts() {
      setPostsLoading(true);
      const section = sections.find(s => s.slug === currentSection);
      if (!section) {
        setPostsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles:user_id(name, avatar_url),
          community_comments(count)
        `)
        .eq('section_id', section.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
      } else if (data) {
        const postsWithCount = data.map(post => ({
          ...post,
          comment_count: post.community_comments?.[0]?.count || 0
        }));
        setPosts(postsWithCount);
      }
      setPostsLoading(false);
    }

    fetchPosts();
  }, [currentSection, sections]);

  // Fetch comments when post changes
  useEffect(() => {
    if (!currentPostId) {
      setComments([]);
      return;
    }

    async function fetchComments() {
      setCommentsLoading(true);
      const { data, error } = await supabase
        .from('community_comments')
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq('post_id', currentPostId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
      } else {
        setComments(data || []);
      }
      setCommentsLoading(false);
    }

    fetchComments();
  }, [currentPostId]);

  // Real-time subscription for new posts
  useEffect(() => {
    if (!currentSection) return;

    const section = sections.find(s => s.slug === currentSection);
    if (!section) return;

    const channel = supabase
      .channel('community-posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts',
          filter: `section_id=eq.${section.id}`
        },
        async (payload) => {
          // Fetch the full post with profile
          const { data } = await supabase
            .from('community_posts')
            .select(`
              *,
              profiles:user_id(name, avatar_url),
              community_comments(count)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setPosts(prev => [{
              ...data,
              comment_count: data.community_comments?.[0]?.count || 0
            }, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentSection, sections]);

  // Real-time subscription for new comments
  useEffect(() => {
    if (!currentPostId) return;

    const channel = supabase
      .channel('community-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_comments',
          filter: `post_id=eq.${currentPostId}`
        },
        async (payload) => {
          // Fetch the full comment with profile
          const { data } = await supabase
            .from('community_comments')
            .select(`
              *,
              profiles:user_id(name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setComments(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentPostId]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const section = sections.find(s => s.slug === currentSection);
    if (!section) return;

    setSubmittingPost(true);

    const { error } = await supabase
      .from('community_posts')
      .insert({
        section_id: section.id,
        user_id: user!.id,
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
      });

    if (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } else {
      toast.success('Post created!');
      setNewPostTitle('');
      setNewPostContent('');
      setShowNewPost(false);
    }

    setSubmittingPost(false);
  };

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);

    const { error } = await supabase
      .from('community_comments')
      .insert({
        post_id: currentPostId!,
        user_id: user!.id,
        content: newComment.trim(),
      });

    if (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to post comment');
    } else {
      setNewComment('');
    }

    setSubmittingComment(false);
  };

  const navigateToSection = (slug: string) => {
    setSearchParams({ section: slug });
  };

  const navigateToPost = (postId: string) => {
    setSearchParams({ section: currentSection!, post: postId });
  };

  const goBack = () => {
    if (currentPostId) {
      setSearchParams({ section: currentSection! });
    } else {
      setSearchParams({});
    }
  };

  // Redirect to home if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-12 w-64 mb-8" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // View: Post Detail
  if (currentPostId && currentPost) {
    const sectionData = sections.find(s => s.slug === currentSection);
    
    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-3xl mx-auto"
            >
              <motion.div variants={fadeIn} className="mb-6">
                <Button variant="ghost" onClick={goBack} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to {sectionData?.title}
                </Button>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card variant="elevated" className="mb-8">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={currentPost.profiles?.avatar_url || undefined} />
                        <AvatarFallback>
                          {currentPost.profiles?.name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl">{currentPost.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>{currentPost.profiles?.name || 'Anonymous'}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3" />
                          <span>{new Date(currentPost.created_at).toLocaleDateString()}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{currentPost.content}</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Comments Section */}
              <motion.div variants={fadeIn}>
                <h3 className="font-display text-xl mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments ({comments.length})
                </h3>

                {commentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    <AnimatePresence>
                      {comments.map((comment) => (
                        <motion.div
                          key={comment.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3 p-4 bg-card rounded-lg border border-border"
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {comment.profiles?.name?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {comment.profiles?.name || 'Anonymous'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {comments.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                )}

                {/* New Comment Form */}
                <form onSubmit={handleCreateComment} className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {profile?.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={submittingComment}
                    />
                    <Button 
                      type="submit" 
                      variant="maroon" 
                      size="icon"
                      disabled={submittingComment || !newComment.trim()}
                    >
                      {submittingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  // View: Posts List
  if (currentSection) {
    const sectionData = sections.find(s => s.slug === currentSection);
    const IconComponent = iconMap[sectionData?.icon || 'message-square'] || MessageSquare;

    return (
      <div className="min-h-screen bg-background studio-grain">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-3xl mx-auto"
            >
              <motion.div variants={fadeIn} className="mb-8">
                <Button variant="ghost" onClick={goBack} className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  All Sections
                </Button>
                <div className="flex items-center gap-4">
                  <IconComponent className={`w-8 h-8 ${sectionData?.color}`} />
                  <div>
                    <h1 className="text-3xl font-display">{sectionData?.title}</h1>
                    <p className="text-muted-foreground">{sectionData?.description}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="mb-6">
                {!showNewPost ? (
                  <Button variant="hero" onClick={() => setShowNewPost(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                ) : (
                  <Card variant="elevated">
                    <CardHeader>
                      <CardTitle>Create Post</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreatePost} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            placeholder="Enter post title..."
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content">Content</Label>
                          <Textarea
                            id="content"
                            placeholder="Share your thoughts..."
                            rows={4}
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button type="submit" variant="maroon" disabled={submittingPost}>
                            {submittingPost ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              'Post'
                            )}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowNewPost(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
              </motion.div>

              {postsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <motion.div variants={stagger} className="space-y-4">
                  <AnimatePresence>
                    {posts.map((post) => (
                      <motion.div
                        key={post.id}
                        variants={fadeIn}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        layout
                      >
                        <Card 
                          variant="feature" 
                          className="cursor-pointer hover:scale-[1.01] transition-transform"
                          onClick={() => navigateToPost(post.id)}
                        >
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={post.profiles?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {post.profiles?.name?.[0]?.toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <CardTitle className="text-lg">{post.title}</CardTitle>
                                <CardDescription className="flex items-center gap-3 mt-1">
                                  <span>{post.profiles?.name || 'Anonymous'}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(post.created_at).toLocaleDateString()}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    {post.comment_count || 0}
                                  </span>
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {post.content}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {posts.length === 0 && (
                    <Card variant="console" className="p-8 text-center">
                      <p className="text-muted-foreground">
                        No posts yet. Be the first to share something!
                      </p>
                    </Card>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  // View: Sections Overview
  return (
    <div className="min-h-screen bg-background studio-grain">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="mb-12">
              <SectionLabel className="mb-4">Community</SectionLabel>
              <h1 className="text-4xl md:text-5xl font-display mb-4">
                Focused Discussions
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                This is not a social feed. It's structured conversation around wins, questions, resources, and opportunities. No audio uploads here—just learning and connection.
              </p>
            </motion.div>
            
            <motion.div 
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {sections.map((section) => {
                const IconComponent = iconMap[section.icon || 'message-square'] || MessageSquare;
                
                return (
                  <motion.div key={section.id} variants={fadeIn}>
                    <Card 
                      variant="feature" 
                      className="h-full cursor-pointer hover:scale-[1.02] transition-transform"
                      onClick={() => navigateToSection(section.slug)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <IconComponent className={`w-8 h-8 ${section.color}`} />
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {section.post_count || 0}
                          </span>
                        </div>
                        <CardTitle className="mt-4">{section.title}</CardTitle>
                        <CardDescription>{section.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button variant="maroonOutline" size="sm" className="w-full">
                          Enter
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
            
            <motion.div 
              variants={fadeIn}
              className="mt-12 p-6 bg-card/50 border border-border rounded-lg text-center"
            >
              <p className="text-sm text-muted-foreground">
                Audio submissions and reviews happen in the <a href="/studio" className="text-primary hover:text-maroon-glow">Studio Floor</a>, not here.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
