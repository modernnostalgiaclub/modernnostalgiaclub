import { createClient } from 'npm:@supabase/supabase-js@2';
import { appCors } from '../_shared/app-cors.ts';
import { workshopSchema, passesWorkshopSpamCheck } from '../_shared/workshop-validation.ts';
import { sendAndLogEmail } from '../_shared/send-and-log-email.ts';

Deno.serve(async (req) => {
  const cors = appCors(req.headers.get('origin'));
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors.headers, 'Content-Type': 'application/json' } });
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors.headers });
  if (!cors.allowed && req.headers.has('origin')) return json({ error: 'Origin not allowed' }, 403);
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || !passesWorkshopSpamCheck(body)) return json({ error: 'Unable to submit. Please wait a moment and try again.' }, 400);
    const parsed = workshopSchema.safeParse(body);
    if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || 'Please check your answers' }, 400);
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return json({ error: 'Signup unavailable' }, 503);
    const db = createClient(url, key);
    const { data: row, error } = await db.from('workshop_signups').insert(parsed.data).select('id').single();
    if (error || !row) return json({ error: 'Could not save your signup' }, 500);
    const fields = Object.entries(parsed.data).map(([label, value]) => ({ label: label.replaceAll('_', ' '), value: Array.isArray(value) ? value.join(', ') : value || 'Not provided' }));
    let confirmationSent = false;
    try {
      await sendAndLogEmail(db, 'form-submission-alert', 'ge@modernnostalgia.club', {
        idempotencyKey: `workshop-owner-${row.id}`,
        templateData: { formName: 'Artist workshop interest', senderEmail: parsed.data.email, submittedAt: new Date().toISOString(), fields },
      });
    } catch (error) { console.error('Workshop owner alert failed', error instanceof Error ? error.message : 'Unknown error'); }
    try {
      const result = await sendAndLogEmail(db, 'workshop-signup-confirmation', parsed.data.email, {
        idempotencyKey: `workshop-confirmation-${row.id}`,
        templateData: { name: parsed.data.name, topics: parsed.data.topics.join(', ') },
      });
      confirmationSent = result.sent;
    } catch (error) { console.error('Workshop confirmation failed', error instanceof Error ? error.message : 'Unknown error'); }
    return json({ success: true, confirmationSent });
  } catch { return json({ error: 'Could not process your signup. Please try again.' }, 400); }
});