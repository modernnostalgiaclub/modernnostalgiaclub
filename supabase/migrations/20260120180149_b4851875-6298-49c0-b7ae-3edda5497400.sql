-- Create networking_contacts table for capturing event contacts
CREATE TABLE public.networking_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  role TEXT NOT NULL DEFAULT 'Other',
  notes TEXT,
  event_tag TEXT DEFAULT 'NAMM',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create networking_links table for admin-editable links
CREATE TABLE public.networking_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT DEFAULT 'link',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.networking_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.networking_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for networking_contacts
-- Anyone can submit (public form)
CREATE POLICY "Anyone can submit contact form"
ON public.networking_contacts
FOR INSERT
WITH CHECK (true);

-- Only admins can view contacts
CREATE POLICY "Admins can view all contacts"
ON public.networking_contacts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update contacts
CREATE POLICY "Admins can update contacts"
ON public.networking_contacts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete contacts
CREATE POLICY "Admins can delete contacts"
ON public.networking_contacts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for networking_links
-- Anyone can view visible links (public display)
CREATE POLICY "Anyone can view visible links"
ON public.networking_links
FOR SELECT
USING (is_visible = true);

-- Admins can view all links
CREATE POLICY "Admins can view all links"
ON public.networking_links
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can manage links
CREATE POLICY "Admins can insert links"
ON public.networking_links
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update links"
ON public.networking_links
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete links"
ON public.networking_links
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger for networking_contacts
CREATE TRIGGER update_networking_contacts_updated_at
BEFORE UPDATE ON public.networking_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for networking_links
CREATE TRIGGER update_networking_links_updated_at
BEFORE UPDATE ON public.networking_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default links
INSERT INTO public.networking_links (label, url, icon, sort_order, is_visible) VALUES
  ('Modern Nostalgia Club', 'https://modernnostalgia.club', 'home', 1, true),
  ('HRMNY', 'https://hrmny.pro', 'music', 2, true),
  ('Sponsors', 'https://form.jotform.com/253444517833056', 'handshake', 3, true),
  ('Events', 'https://www.eventbrite.com/o/modernnostalgiaclub-llc-113895902211', 'calendar', 4, true),
  ('Instagram', 'https://instagram.com/modernnostalgia.club', 'instagram', 5, true);