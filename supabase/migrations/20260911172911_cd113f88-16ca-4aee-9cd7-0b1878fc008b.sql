CREATE TABLE public.sponsor_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  website TEXT,
  role TEXT,
  partnership_type TEXT,
  budget_range TEXT,
  timeline TEXT,
  goals TEXT NOT NULL,
  referral_source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.sponsor_inquiries TO authenticated;
GRANT ALL ON public.sponsor_inquiries TO service_role;

ALTER TABLE public.sponsor_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sponsor inquiries" ON public.sponsor_inquiries
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update sponsor inquiries" ON public.sponsor_inquiries
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete sponsor inquiries" ON public.sponsor_inquiries
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_sponsor_inquiries_updated_at
  BEFORE UPDATE ON public.sponsor_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.playlist_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  song_title TEXT NOT NULL,
  song_url TEXT NOT NULL,
  genre TEXT,
  clearance TEXT,
  vocal_type TEXT,
  release_status TEXT,
  notes TEXT,
  consent BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.playlist_submissions TO authenticated;
GRANT ALL ON public.playlist_submissions TO service_role;

ALTER TABLE public.playlist_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view playlist submissions" ON public.playlist_submissions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update playlist submissions" ON public.playlist_submissions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete playlist submissions" ON public.playlist_submissions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_playlist_submissions_updated_at
  BEFORE UPDATE ON public.playlist_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();