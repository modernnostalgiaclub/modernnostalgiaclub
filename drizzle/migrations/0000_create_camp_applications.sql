CREATE TABLE public.camp_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp text NOT NULL CHECK (camp IN ('sync-album','loop-pack')),
  name text NOT NULL,
  email text NOT NULL,
  artist_name text NOT NULL,
  roles text[] NOT NULL DEFAULT '{}',
  heritage text,
  city text,
  attendance text,
  links text NOT NULL,
  why text NOT NULL,
  referral_source text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.camp_applications TO authenticated;
GRANT ALL ON public.camp_applications TO service_role;
ALTER TABLE public.camp_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view camp applications" ON public.camp_applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update camp applications" ON public.camp_applications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER update_camp_applications_updated_at BEFORE UPDATE ON public.camp_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();