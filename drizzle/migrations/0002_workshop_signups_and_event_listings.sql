CREATE TABLE public.workshop_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (length(email) BETWEEN 3 AND 255),
  artist_name text NOT NULL DEFAULT '' CHECK (length(artist_name) <= 100),
  city text NOT NULL DEFAULT '' CHECK (length(city) <= 120),
  topics text[] NOT NULL,
  attendance text NOT NULL CHECK (attendance IN ('In person', 'Online', 'Either')),
  links text NOT NULL DEFAULT '' CHECK (length(links) <= 1000),
  notes text NOT NULL DEFAULT '' CHECK (length(notes) <= 3000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.workshop_signups TO authenticated;
GRANT ALL ON public.workshop_signups TO service_role;
ALTER TABLE public.workshop_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read workshop signups" ON public.workshop_signups FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins review workshop signups" ON public.workshop_signups FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TABLE public.event_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot text NOT NULL UNIQUE CHECK (slot IN ('fil-am-camp', 'december-camp', 'january-sync-camp', 'january-camp-2', 'workshops')),
  eventbrite_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  url text NOT NULL,
  start_utc timestamptz NOT NULL,
  end_utc timestamptz NOT NULL,
  timezone text NOT NULL DEFAULT 'America/Los_Angeles',
  venue text NOT NULL DEFAULT '',
  status text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.event_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_listings TO authenticated;
GRANT ALL ON public.event_listings TO service_role;
ALTER TABLE public.event_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read upcoming live events" ON public.event_listings FOR SELECT TO anon, authenticated USING (status = 'live' AND end_utc > now());
CREATE POLICY "Admins manage event listings" ON public.event_listings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX workshop_signups_created_at_idx ON public.workshop_signups (created_at DESC);