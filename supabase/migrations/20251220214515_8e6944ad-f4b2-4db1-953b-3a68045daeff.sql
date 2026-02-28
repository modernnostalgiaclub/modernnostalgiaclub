-- Create community sections table
CREATE TABLE public.community_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'message-square',
  color TEXT DEFAULT 'text-primary',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.community_sections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.community_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Community sections policies (public read)
CREATE POLICY "Anyone can view community sections"
ON public.community_sections FOR SELECT
USING (true);

CREATE POLICY "Admins can manage community sections"
ON public.community_sections FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Community posts policies
CREATE POLICY "Authenticated users can view all posts"
ON public.community_posts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON public.community_posts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.community_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.community_posts FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can manage all posts"
ON public.community_posts FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Community comments policies
CREATE POLICY "Authenticated users can view all comments"
ON public.community_comments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.community_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.community_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.community_comments FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can manage all comments"
ON public.community_comments FOR ALL
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Create indexes for performance
CREATE INDEX idx_community_posts_section_id ON public.community_posts(section_id);
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX idx_community_comments_user_id ON public.community_comments(user_id);

-- Add updated_at triggers
CREATE TRIGGER update_community_posts_updated_at
BEFORE UPDATE ON public.community_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_updated_at
BEFORE UPDATE ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for posts and comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;

-- Insert initial community sections
INSERT INTO public.community_sections (slug, title, description, icon, color, sort_order) VALUES
('wins', 'Wins', 'Share your victories. Placements, milestones, and breakthroughs.', 'trophy', 'text-maroon', 1),
('questions', 'Questions', 'Ask the community. No judgment, just answers.', 'help-circle', 'text-blue-400', 2),
('resources', 'Resources', 'Tools, templates, and helpful links shared by members.', 'folder', 'text-green-400', 3),
('opportunities', 'Opportunities', 'Briefs, collaborations, and openings.', 'briefcase', 'text-purple-400', 4);