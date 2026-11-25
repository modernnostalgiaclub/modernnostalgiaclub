export const EVENT_SLOTS = ['fil-am-camp', 'december-camp', 'january-sync-camp', 'january-camp-2', 'workshops'] as const;

export function eventbriteId(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    if (!/^(www\.)?eventbrite\.(com|co\.uk|ca|com\.au)$/.test(url.hostname)) return null;
    return url.pathname.match(/^\/e\/(?:[^/]*-)?(\d+)\/?$/)?.[1] ?? null;
  } catch { return null; }
}

export function isUpcomingEvent(event: { status: string; end_utc: string }, now = Date.now()) {
  return event.status === 'live' && new Date(event.end_utc).getTime() > now;
}