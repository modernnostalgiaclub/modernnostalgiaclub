CREATE TABLE public.discovery_call_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  artist_name text,
  phone text,
  topic text,
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  alt_date date,
  alt_time text,
  timezone text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE, DELETE ON public.discovery_call_bookings TO authenticated;
GRANT ALL ON public.discovery_call_bookings TO service_role;

ALTER TABLE public.discovery_call_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view discovery call bookings" ON public.discovery_call_bookings
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update discovery call bookings" ON public.discovery_call_bookings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete discovery call bookings" ON public.discovery_call_bookings
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_discovery_call_bookings_updated_at
  BEFORE UPDATE ON public.discovery_call_bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();