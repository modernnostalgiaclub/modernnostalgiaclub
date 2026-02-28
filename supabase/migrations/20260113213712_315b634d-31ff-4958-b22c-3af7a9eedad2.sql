-- Create webhook_events table for idempotency tracking
CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  source text NOT NULL, -- 'eventbrite', 'patreon'
  processed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, source)
);

-- Create index for fast lookup
CREATE INDEX idx_webhook_events_lookup ON public.webhook_events(event_id, source);

-- Enable RLS and block all direct access (only edge functions with service role can access)
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Block all direct access to webhook_events"
ON public.webhook_events
AS RESTRICTIVE
FOR ALL
USING (false);