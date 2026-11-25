import { corsHeaders as sdkCorsHeaders } from 'npm:@supabase/supabase-js@2/cors';

export function appCors(origin: string | null) {
  const allowed = origin !== null && (
    ['https://modernnostalgia.club', 'https://www.modernnostalgia.club', 'https://modernnostalgiaclub.lovable.app', 'http://localhost:8080'].includes(origin) ||
    /^https:\/\/id-preview--[a-z0-9-]+\.lovable\.app$/.test(origin)
  );
  return { allowed, headers: {
    ...sdkCorsHeaders,
    'Access-Control-Allow-Origin': allowed ? origin : 'https://www.modernnostalgia.club',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  } };
}