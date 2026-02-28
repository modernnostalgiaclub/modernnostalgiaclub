-- Create table for 30-day tracker progress
CREATE TABLE public.tracker_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);

-- Create table for weekly reflections
CREATE TABLE public.tracker_reflections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 4),
  reflection_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_number)
);

-- Create table for tracker start date
CREATE TABLE public.tracker_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracker_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracker_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tracker_progress
CREATE POLICY "Users can view their own progress"
ON public.tracker_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.tracker_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.tracker_progress FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
ON public.tracker_progress FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for tracker_reflections
CREATE POLICY "Users can view their own reflections"
ON public.tracker_reflections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reflections"
ON public.tracker_reflections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections"
ON public.tracker_reflections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections"
ON public.tracker_reflections FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for tracker_sessions
CREATE POLICY "Users can view their own session"
ON public.tracker_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own session"
ON public.tracker_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own session"
ON public.tracker_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own session"
ON public.tracker_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_tracker_progress_updated_at
BEFORE UPDATE ON public.tracker_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracker_reflections_updated_at
BEFORE UPDATE ON public.tracker_reflections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tracker_sessions_updated_at
BEFORE UPDATE ON public.tracker_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();