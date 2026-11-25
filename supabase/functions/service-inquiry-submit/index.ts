import { createClient } from 'npm:@supabase/supabase-js@2';
import { appCors } from '../_shared/app-cors.ts';
import { serviceInquirySchema, passesServiceSpamCheck, SERVICE_NAMES } from '../_shared/service-inquiry-validation.ts';
import { sendAndLogEmail } from '../_shared/send-and-log-email.ts';

Deno.serve(async (req) => {
  const cors = appCors(req.headers.get('origin'));
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors.headers });
  if (!cors.allowed && req.headers.has('origin')) return json({ error: 'Origin not allowed' }, 403);
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || !passesServiceSpamCheck(body)) return json({ error: 'Unable to submit. Please wait a moment and try again.' }, 400);
    const parsed = serviceInquirySchema.safeParse(body);
    if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || 'Please check your answers' }, 400);
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'Booking requests are temporarily unavailable' }, 503);
    const db = createClient(url, key);
    const { data: row, error } = await db.from('service_booking_requests').insert(parsed.data).select('id').single();
    if (error || !row) return json({ error: 'Could not save your booking request. Please try again.' }, 500);
    try {
      await sendAndLogEmail(db, 'service-booking-alert', 'ge@modernnostalgia.club', {
        idempotencyKey: `service-booking-alert-${row.id}`,
        replyTo: parsed.data.email,
        templateData: {
          serviceName: SERVICE_NAMES[parsed.data.service], name: parsed.data.name, email: parsed.data.email,
          artistName: parsed.data.artist_name, needs: parsed.data.needs, links: parsed.data.links,
          preferredTiming: parsed.data.preferred_timing,
        },
      });
    } catch (error) { console.error('Service request owner alert failed', error instanceof Error ? error.message : 'Unknown error'); }
    return json({ success: true });
  } catch { return json({ error: 'Could not process your request. Please try again.' }, 400); }
});