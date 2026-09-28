CREATE TABLE public.interview_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  artist_name text NOT NULL,
  genre text,
  location text,
  links text,
  story text NOT NULL,
  topics text,
  release_status text,
  availability text,
  referral_source text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.interview_requests TO authenticated;
GRANT ALL ON public.interview_requests TO service_role;
ALTER TABLE public.interview_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view interview requests" ON public.interview_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update interview requests" ON public.interview_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_interview_requests_updated_at BEFORE UPDATE ON public.interview_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();