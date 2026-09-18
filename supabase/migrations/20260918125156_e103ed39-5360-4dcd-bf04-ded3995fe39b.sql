ALTER TABLE public.discovery_call_bookings
  ADD COLUMN IF NOT EXISTS reminder_sent_at timestamp with time zone;

CREATE OR REPLACE FUNCTION public.get_booked_call_slots()
RETURNS TABLE(preferred_date date, preferred_time text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.preferred_date, b.preferred_time
  FROM public.discovery_call_bookings b
  WHERE b.preferred_date >= (now() AT TIME ZONE 'America/Los_Angeles')::date
    AND b.status <> 'cancelled'
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_call_slots() TO anon, authenticated;