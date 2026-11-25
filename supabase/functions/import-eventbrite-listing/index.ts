import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@4.4.3';
import { appCors } from '../_shared/app-cors.ts';
import { EVENT_SLOTS, eventbriteId } from '../_shared/eventbrite-listings.ts';

const schema = z.object({ slot: z.enum(EVENT_SLOTS), url: z.string().max(2000).refine((v) => eventbriteId(v) !== null, 'Enter a full Eventbrite ticket URL'), save: z.boolean().default(false) });

Deno.serve(async (req) => {
  const cors = appCors(req.headers.get('origin'));
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors.headers });
  if (!cors.allowed && req.headers.has('origin')) return json({ error: 'Origin not allowed' }, 403);
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return json({ error: 'Event import unavailable' }, 503);
  const db = createClient(url, serviceKey);
  const authorization = req.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return json({ error: 'Sign in as an admin' }, 401);
  const { data: { user }, error: authError } = await db.auth.getUser(authorization.slice(7));
  if (authError || !user) return json({ error: 'Sign in as an admin' }, 401);
  const { data: admin, error: roleError } = await db.rpc('has_role', { _user_id: user.id, _role: 'admin' });
  if (roleError || admin !== true) return json({ error: 'Admin access required' }, 403);
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || 'Invalid event link' }, 400);
    const token = Deno.env.get('EVENTBRITE_PRIVATE_TOKEN');
    if (!token) return json({ error: 'Eventbrite is not connected' }, 503);
    const id = eventbriteId(parsed.data.url);
    if (!id) return json({ error: 'Invalid event link' }, 400);
    const response = await fetch(`https://www.eventbriteapi.com/v3/events/${id}/?expand=venue`, {
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error(`Eventbrite import failed [${response.status}]: ${details}`);
      return json({ error: 'Eventbrite could not load this event', status: response.status, details }, response.status);
    }
    const event = await response.json();
    if (!event.start?.utc || !event.end?.utc || !event.name?.text) return json({ error: 'Eventbrite has not supplied the event name and dates yet' }, 422);
    const listing = {
      slot: parsed.data.slot, eventbrite_id: id, title: event.name.text,
      description: (event.description?.text || '').slice(0, 4000),
      url: `https://www.eventbrite.com/e/${id}`, start_utc: event.start.utc, end_utc: event.end.utc,
      timezone: event.start.timezone || 'America/Los_Angeles',
      venue: event.online_event ? 'Online' : [event.venue?.name, event.venue?.address?.localized_address_display].filter(Boolean).join(', '),
      status: event.status, updated_at: new Date().toISOString(),
    };
    if (parsed.data.save) {
      const { error } = await db.from('event_listings').upsert(listing, { onConflict: 'slot' });
      if (error) return json({ error: 'Could not save the event' }, 500);
    }
    return json({ listing, saved: parsed.data.save });
  } catch { return json({ error: 'Could not load event details. Please try again.' }, 400); }
});