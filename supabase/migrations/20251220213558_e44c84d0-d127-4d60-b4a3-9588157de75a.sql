-- Create courses table for training tracks
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT DEFAULT 'book',
  min_tier patreon_tier NOT NULL DEFAULT 'lab-pass',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user lesson progress table
CREATE TABLE public.user_lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create submission status enum
CREATE TYPE public.submission_status AS ENUM ('pending', 'in-review', 'reviewed', 'needs-revision');

-- Create submission type enum  
CREATE TYPE public.submission_type AS ENUM ('sync-review', 'catalog-audit', 'branding', 'project-proposal');

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  submission_type submission_type NOT NULL,
  disco_url TEXT NOT NULL,
  notes TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  reviewer_notes TEXT,
  internal_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(user_id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Courses policies (public read for published, admin write)
CREATE POLICY "Anyone can view published courses"
ON public.courses FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Lessons policies (public read for published, admin write)
CREATE POLICY "Anyone can view published lessons"
ON public.lessons FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage lessons"
ON public.lessons FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- User lesson progress policies
CREATE POLICY "Users can view their own progress"
ON public.user_lesson_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_lesson_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_lesson_progress FOR UPDATE
USING (auth.uid() = user_id);

-- Submissions policies
CREATE POLICY "Users can view their own submissions"
ON public.submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins and moderators can view all submissions"
ON public.submissions FOR SELECT
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Users can create their own submissions"
ON public.submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending submissions"
ON public.submissions FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins and moderators can update any submission"
ON public.submissions FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Users can delete their own pending submissions"
ON public.submissions FOR DELETE
USING (auth.uid() = user_id AND status = 'pending');

-- Create indexes for performance
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);
CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);

-- Add updated_at triggers
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
BEFORE UPDATE ON public.submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial course data
INSERT INTO public.courses (title, description, slug, icon, min_tier, sort_order, is_published) VALUES
('Foundations of Artist Income', 'Understand how money actually moves in the music industry. This is the starting point for every artist in the lab.', 'foundations', 'dollar-sign', 'lab-pass', 1, true),
('Sync Licensing Basics', 'Learn the fundamentals of sync licensing—what it is, how it works, and how to position your music.', 'sync-basics', 'tv', 'lab-pass', 2, true),
('Catalog Organization', 'Build a professional catalog that''s ready for licensing opportunities. Metadata, structure, and delivery.', 'catalog-org', 'folder', 'creator-accelerator', 3, true),
('Direct-to-Fan Revenue', 'Build sustainable income directly from your audience without relying on streaming platforms.', 'direct-fan', 'users', 'creator-accelerator', 4, true),
('Advanced Sync Strategy', 'Deep dive into sync placements, music supervisor relationships, and positioning for TV/Film.', 'advanced-sync', 'target', 'creative-economy-lab', 5, true);

-- Insert initial lessons for first course
INSERT INTO public.lessons (course_id, title, description, content, sort_order, is_published)
SELECT 
  c.id,
  lesson.title,
  lesson.description,
  lesson.content,
  lesson.sort_order,
  true
FROM public.courses c
CROSS JOIN (VALUES
  ('How Money Actually Moves', 'Understanding the music industry revenue streams', 'Content for lesson 1...', 1),
  ('The Four Income Pillars', 'Breaking down sync, streaming, direct sales, and services', 'Content for lesson 2...', 2),
  ('Mindset Shift: From Artist to Business', 'Treating your music career as a sustainable business', 'Content for lesson 3...', 3)
) AS lesson(title, description, content, sort_order)
WHERE c.slug = 'foundations';