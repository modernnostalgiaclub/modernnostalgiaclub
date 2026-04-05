
CREATE TABLE public.incubator_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  artist_name TEXT,
  genre TEXT,
  years_active TEXT,
  goals TEXT NOT NULL,
  portfolio_url TEXT,
  referral_source TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.incubator_applications ENABLE ROW LEVEL SECURITY;

-- Anyone (even unauthenticated) can submit an application
CREATE POLICY "Anyone can submit an application"
ON public.incubator_applications
FOR INSERT
TO public
WITH CHECK (true);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.incubator_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update applications (status, notes)
CREATE POLICY "Admins can update applications"
ON public.incubator_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete applications
CREATE POLICY "Admins can delete applications"
ON public.incubator_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_incubator_applications_updated_at
BEFORE UPDATE ON public.incubator_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
