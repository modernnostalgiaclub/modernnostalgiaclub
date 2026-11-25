import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type EventListing = Database['public']['Tables']['event_listings']['Row'];
export const EVENT_LABELS = {
  'fil-am-camp': 'Fil-Am Songwriting Camp',
  'december-camp': 'December Songwriting Camp',
  'january-sync-camp': 'Sync Songwriting Camp',
  'january-camp-2': 'January Songwriting Camp #2',
  workshops: 'Artist Workshops',
} as const;

export function eventDate(event: EventListing) {
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: event.timezone }).format(new Date(event.start_utc));
  } catch { return new Date(event.start_utc).toLocaleString(); }
}

export function useEventListings() {
  return useQuery({
    queryKey: ['public-event-listings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('event_listings').select('*').eq('status', 'live').gt('end_utc', new Date().toISOString());
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });
}