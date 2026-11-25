CREATE TABLE public.service_booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service text NOT NULL CHECK (service IN ('book-audit', 'book-consult', 'book-bundle')),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 255),
  artist_name text NOT NULL DEFAULT '' CHECK (length(artist_name) <= 100),
  needs text NOT NULL CHECK (length(needs) BETWEEN 1 AND 3000),
  links text NOT NULL DEFAULT '' CHECK (length(links) <= 1000),
  preferred_timing text NOT NULL DEFAULT '' CHECK (length(preferred_timing) <= 500),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'contacted', 'closed')),
  admin_notes text NOT NULL DEFAULT '' CHECK (length(admin_notes) <= 3000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.service_booking_requests TO authenticated;
GRANT ALL ON public.service_booking_requests TO service_role;
ALTER TABLE public.service_booking_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read service booking requests" ON public.service_booking_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins review service booking requests" ON public.service_booking_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX service_booking_requests_created_idx ON public.service_booking_requests (created_at DESC);