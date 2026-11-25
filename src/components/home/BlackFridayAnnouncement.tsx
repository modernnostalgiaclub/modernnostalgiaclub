import { useState } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBlackFridayPhase } from '@/lib/homepageOffers';

const DISMISS_KEY = 'mnc-black-friday-2026-dismissed';

export function BlackFridayAnnouncement() {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(DISMISS_KEY) === 'true'; } catch { return false; }
  });

  if (dismissed || getBlackFridayPhase() === 'ended') return null;

  return (
    <aside aria-label="Black Friday announcement" className="border-b border-inverse/20 bg-khaki text-inverse">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6">
        <a href="/#services" className="flex flex-1 items-center justify-center gap-3 py-3 text-xs sm:text-sm leading-relaxed">
          <span>Black Friday (Nov 27 to Nov 30): Mogul Publishing Audits &amp; Sync Consults are $99 each, or $179 together.</span>
          <ArrowRight className="hidden sm:block h-4 w-4 shrink-0" aria-hidden="true" />
        </a>
        <Button variant="ghost" size="icon" className="shrink-0 text-inverse hover:bg-inverse/10" aria-label="Dismiss Black Friday announcement" title="Dismiss announcement" onClick={() => {
          setDismissed(true);
          try { sessionStorage.setItem(DISMISS_KEY, 'true'); } catch { /* In-memory dismissal still works. */ }
        }}>
          <X aria-hidden="true" />
        </Button>
      </div>
    </aside>
  );
}