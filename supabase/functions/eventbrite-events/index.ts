import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Domain allowlist for CORS
const ALLOWED_ORIGINS = [
  'https://gpcpovoikxgkgnabumlx.lovableproject.com',
  'https://modernnostalgiaclub.lovable.app',
  'https://modernnostalgia.club',
  'https://www.modernnostalgia.club',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.some(allowed =>
    origin === allowed ||
    origin.endsWith('.lovable.app') ||
    origin.endsWith('.lovableproject.com')
  );

  return {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
}

interface EventbriteEvent {
  id: string;
  name: { text: string };
  description?: { text: string };
  url: string;
  start: { local: string; utc: string };
  end: { local: string; utc: string };
  logo?: { url: string };
  venue?: {
    name?: string;
    address?: {
      localized_address_display?: string;
    };
  };
  status: string;
}

interface EventbriteResponse {
  events?: EventbriteEvent[];
  pagination?: {
    has_more_items?: boolean;
    continuation?: string;
  };
}

interface MappedEvent {
  id: string;
  title: string;
  description: string;
  url: string;
  startUtc: string;
  startLocal: string;
  endUtc: string;
  endLocal: string;
  imageUrl: string | null;
  venueName: string | null;
  venueAddress: string | null;
  status: string;
}

function mapEvent(event: EventbriteEvent): MappedEvent {
  return {
    id: event.id,
    title: event.name?.text || 'Untitled Event',
    description: event.description?.text || '',
    url: event.url,
    startUtc: event.start?.utc,
    startLocal: event.start?.local,
    endUtc: event.end?.utc,
    endLocal: event.end?.local,
    imageUrl: event.logo?.url || null,
    venueName: event.venue?.name || null,
    venueAddress: event.venue?.address?.localized_address_display || null,
    status: event.status,
  };
}

async function fetchEventsForOrg(
  privateToken: string,
  organizationId: string
): Promise<MappedEvent[]> {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const apiUrl = new URL(`https://www.eventbriteapi.com/v3/organizations/${organizationId}/events/`);
  apiUrl.searchParams.set('status', 'live');
  apiUrl.searchParams.set('start_date.range_start', now);
  apiUrl.searchParams.set('order_by', 'start_asc');
  apiUrl.searchParams.set('expand', 'venue');
  apiUrl.searchParams.set('page_size', '12');

  console.log("Fetching Eventbrite events:", apiUrl.toString());

  const response = await fetch(apiUrl.toString(), {
    headers: {
      'Authorization': `Bearer ${privateToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Eventbrite API error:", response.status, errorText);
    throw new Error(`Eventbrite API returned ${response.status}`);
  }

  const data: EventbriteResponse = await response.json();
  const events = (data.events || []).map(mapEvent);
  console.log("Fetched Eventbrite events:", events.length);
  return events;
}

async function resolveOrganizationId(
  privateToken: string,
  configuredOrgId: string
): Promise<string> {
  // First, try the configured organization ID.
  try {
    await fetchEventsForOrg(privateToken, configuredOrgId);
    return configuredOrgId;
  } catch {
    console.log("Configured org ID failed; looking up user organizations...");
  }

  // Fallback: list organizations accessible to this token and use the first one.
  const orgsUrl = 'https://www.eventbriteapi.com/v3/users/me/organizations/?page_size=10';
  const orgsResponse = await fetch(orgsUrl, {
    headers: {
      'Authorization': `Bearer ${privateToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!orgsResponse.ok) {
    const errorText = await orgsResponse.text();
    console.error("Eventbrite organizations lookup error:", orgsResponse.status, errorText);
    throw new Error(`Could not resolve organization ID. Eventbrite API returned ${orgsResponse.status}`);
  }

  const orgsData = await orgsResponse.json();
  const organizations = orgsData.organizations || [];

  if (organizations.length === 0) {
    throw new Error("No Eventbrite organizations found for this token.");
  }

  const firstOrg = organizations[0];
  const resolvedId = firstOrg.id;
  console.log("Resolved organization ID:", resolvedId, "from", organizations.length, "organizations");
  return resolvedId;
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PRIVATE_TOKEN = Deno.env.get("EVENTBRITE_PRIVATE_TOKEN");
    const ORGANIZATION_ID = Deno.env.get("EVENTBRITE_ORGANIZATION_ID");

    if (!PRIVATE_TOKEN) {
      throw new Error("EVENTBRITE_PRIVATE_TOKEN is not configured");
    }

    if (!ORGANIZATION_ID) {
      throw new Error("EVENTBRITE_ORGANIZATION_ID is not configured");
    }

    const resolvedOrgId = await resolveOrganizationId(PRIVATE_TOKEN, ORGANIZATION_ID);
    const events = await fetchEventsForOrg(PRIVATE_TOKEN, resolvedOrgId);

    return new Response(JSON.stringify({ events, organizationId: resolvedOrgId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching Eventbrite events:", error);
    return new Response(JSON.stringify({ error: error.message, events: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
