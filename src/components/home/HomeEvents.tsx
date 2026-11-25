import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BLACK_FRIDAY_DISCOUNTS, getBlackFridayPhase, WORKSHOP_PRICING } from '@/lib/homepageOffers';
import { PATREON_PAGE_URL } from '@/lib/siteNavigation';
import { useEventListings, eventDate } from '@/hooks/useEventListings';

const camps = [
  { slot: 'fil-am-camp', title: 'Fil-Am Songwriting Camp', date: 'Nov 2026', status: 'Waitlist / next cohort', description: 'Filipino artists, producers and instrumentalists building a sync compilation and a resource for OPM sounds.', action: 'Apply for a camp', url: '/camps' },
  { slot: 'december-camp', title: 'December Songwriting Camp', date: 'Dec 2026', status: 'Open applications', description: 'Write and produce together as you close out your catalog goals for the year.', action: 'Apply for a camp', url: '/camps' },
  { slot: 'january-sync-camp', title: 'Sync Songwriting Camp', date: 'Jan 2027', status: 'Early-bird reservation', description: 'Brief-driven writing with clear rights, clean stems and music prepared for TV and film.', action: 'Apply for a camp', url: '/camps/sync-album' },
  { slot: 'january-camp-2', title: 'January Songwriting Camp #2', date: 'Jan 2027', status: 'Waitlist / priority Club access', description: 'A second January cohort to keep building your catalog and collaborating into the new year.', action: 'Apply for a camp', url: '/camps' },
];

export function HomeEvents() {
  const showPromotion = getBlackFridayPhase() !== 'ended';
  const { data: listings = [] } = useEventListings();
  const workshop = listings.find((event) => event.slot === 'workshops');
  return (
    <section id="events" aria-labelledby="events-heading" className="home-section border-b border-rule bg-paper-muted py-14 md:py-20">
      <div className="container mx-auto px-6">
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase text-ink-muted">November 2026 through January 2027</p>
          <h2 id="events-heading" className="font-anton text-4xl md:text-5xl uppercase leading-[1.15]">Live Events &amp;<br className="sm:hidden" /> Songwriting Camps</h2>
          <p className="mt-4 max-w-2xl text-ink-muted">Time to write, ask questions and do the work together. Find the session that fits where you are.</p>
        </div>
        <div className="border-t-2 border-khaki">
          {camps.map((camp, index) => {
            const event = listings.find((listing) => listing.slot === camp.slot);
            return (
            <article key={camp.title} className="grid gap-4 border-b border-rule py-7 md:grid-cols-[7rem_minmax(0,1fr)_auto] md:gap-8 md:items-center">
              <p className="text-sm font-medium text-ink-muted">{event ? eventDate(event) : camp.date}</p>
              <div className="min-w-0">
                <h3 className="font-serif text-lg font-bold">{event?.title || camp.title}</h3>
                <p className="mt-1 text-xs font-semibold text-khaki">{event ? 'Registration open' : camp.status}</p>
                <p className="mt-3 max-w-2xl text-sm text-ink-muted leading-relaxed break-words">{event?.description ? event.description.slice(0, 400) : camp.description}</p>
                {event?.venue && <p className="mt-2 text-sm text-ink-muted">{event.venue}</p>}
                {index === 1 && showPromotion && <p className="mt-2 text-xs text-ink-muted">{BLACK_FRIDAY_DISCOUNTS.decemberCampDepositPercent}% off your deposit for Black Friday, Nov 27 to Nov 30.</p>}
              </div>
              <Button variant="editorialOutline" asChild className="justify-self-start md:justify-self-end">
                {event ? <a href={event.url} target="_blank" rel="noopener noreferrer">Register on Eventbrite<ExternalLink aria-hidden="true" /></a> : <Link to={camp.url}>{camp.action}<ArrowRight aria-hidden="true" /></Link>}
              </Button>
            </article>
            );
          })}
          <article id="workshops" className="home-section grid gap-4 border-b border-rule py-7 md:grid-cols-[7rem_minmax(0,1fr)_auto] md:gap-8 md:items-center">
            <p className="text-sm font-medium text-ink-muted">{workshop ? eventDate(workshop) : <>Starting<br className="hidden md:block" /> Dec 2026</>}</p>
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-bold">{workshop?.title || 'Bi-Weekly Artist Workshops'}</h3>
              <p className="mt-1 text-xs font-semibold text-khaki">Free for Patreon Club Members</p>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed break-words">{workshop?.description ? workshop.description.slice(0, 400) : <>Live {WORKSHOP_PRICING.durationMinutes}-minute working sessions on sync pitching, publishing and independent rollouts.</>}</p>
              {workshop?.venue && <p className="mt-2 text-sm text-ink-muted">{workshop.venue}</p>}
              <p className="mt-3 text-sm">
                {showPromotion ? <><s className="text-ink-muted">${WORKSHOP_PRICING.regular}</s> <strong className="ml-2">${WORKSHOP_PRICING.blackFriday}</strong> Black Friday drop-in, Nov 27 to Nov 30</> : <>${WORKSHOP_PRICING.regular} drop-in</>}
              </p>
              <a href={PATREON_PAGE_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-ink-muted underline underline-offset-4">Join the Club on Patreon<ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
            </div>
            <Button variant="editorialOutline" asChild className="justify-self-start md:justify-self-end">
              {workshop ? <a href={workshop.url} target="_blank" rel="noopener noreferrer">Register on Eventbrite<ExternalLink aria-hidden="true" /></a> : <Link to="/workshops">Sign up for a workshop<ArrowRight aria-hidden="true" /></Link>}
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
}