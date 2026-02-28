-- Create a table for reference shelf resources
CREATE TABLE public.reference_resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reference_resources ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage reference resources" 
ON public.reference_resources 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published reference resources" 
ON public.reference_resources 
FOR SELECT 
USING (is_published = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reference_resources_updated_at
BEFORE UPDATE ON public.reference_resources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();