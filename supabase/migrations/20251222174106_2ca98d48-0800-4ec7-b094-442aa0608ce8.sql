-- Create example_tracks table for dynamic track management
CREATE TABLE public.example_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Approved Example',
  description TEXT,
  link TEXT NOT NULL,
  is_download BOOLEAN DEFAULT false,
  is_internal BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.example_tracks ENABLE ROW LEVEL SECURITY;

-- Admins can manage all tracks
CREATE POLICY "Admins can manage example tracks"
ON public.example_tracks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view published tracks
CREATE POLICY "Anyone can view published example tracks"
ON public.example_tracks
FOR SELECT
USING (is_published = true);

-- Add trigger for updated_at
CREATE TRIGGER update_example_tracks_updated_at
BEFORE UPDATE ON public.example_tracks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();