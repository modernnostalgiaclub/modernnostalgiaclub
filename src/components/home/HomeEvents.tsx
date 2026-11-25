import { ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BLACK_FRIDAY_DISCOUNTS, getBlackFridayPhase, WORKSHOP_PRICING } from '@/lib/homepageOffers';
import { PATREON_PAGE_URL } from '@/lib/siteNavigation';

const camps = [
  { title: 'Fil-Am Songwriting Camp', date: 'Nov 2026', status: 'Waitlist / next cohort', description: 'Filipino artists, producers and instrumentalists building a sync compilation and a resource for OPM sounds.', action: 'Join the waitlist', url: '/contact?subject=Fil-Am%20Songwriting%20Camp%20waitlist' },
  { title: 'December Songwriting Camp', date: 'Dec 2026', status: 'Open applications', description: 'Write and produce together as you close out your catalog goals for the year.', action: 'Apply for a camp', url: '/camps' },
  { title: 'Sync Songwriting Camp', date: 'Jan 2027', status: 'Early-bird reservation', description: 'Brief-driven writing with clear rights, clean stems and music prepared for TV and film.', action: 'Request a reservation', url: '/contact?subject=January%20Sync%20Camp%20reservation' },
  { title: 'January Songwriting Camp #2', date: 'Jan 2027', status: 'Waitlist / priority Club access', description: 'A second January cohort to keep building your catalog and collaborating into the new year.', action: 'Join the waitlist', url: '/contact?subject=January%20Camp%202%20waitlist' },
];

export function HomeEvents() {
  const showPromotion = getBlackFridayPhase() !== 'ended';
  return (
    <section id="events" aria-labelledby="events-heading" className="home-section border-b border-rule bg-paper-muted py-14 md:py-20">
      <div className="container mx-auto px-6">
        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold uppercase text-ink-muted">November 2026 through January 2027</p>
          <h2 id="events-heading" className="font-anton text-4xl md:text-5xl uppercase leading-[1.15]">Live Events &amp;<br className="sm:hidden" /> Songwriting Camps</h2>
          <p className="mt-4 max-w-2xl text-ink-muted">Time to write, ask questions and do the work together. Find the session that fits where you are.</p>
        </div>
        <div className="border-t-2 border-khaki">
          {camps.map((camp, index) => (
            <article key={camp.title} className="grid gap-4 border-b border-rule py-7 md:grid-cols-[7rem_minmax(0,1fr)_auto] md:gap-8 md:items-center">
              <p className="text-sm font-medium text-ink-muted">{camp.date}</p>
              <div className="min-w-0">
                <h3 className="font-serif text-lg font-bold">{camp.title}</h3>
                <p className="mt-1 text-xs font-semibold text-khaki">{camp.status}</p>
                <p className="mt-3 max-w-2xl text-sm text-ink-muted leading-relaxed">{camp.description}</p>
                {index === 1 && showPromotion && <p className="mt-2 text-xs text-ink-muted">{BLACK_FRIDAY_DISCOUNTS.decemberCampDepositPercent}% off your deposit for Black Friday, Nov 27 to Nov 30.</p>}
              </div>
              <Button variant="editorialOutline" asChild className="justify-self-start md:justify-self-end">
                <Link to={camp.url}>{camp.action}<ArrowRight aria-hidden="true" /></Link>
              </Button>
            </article>
          ))}
          <article id="workshops" className="home-section grid gap-4 border-b border-rule py-7 md:grid-cols-[7rem_minmax(0,1fr)_auto] md:gap-8 md:items-center">
            <p className="text-sm font-medium text-ink-muted">Starting<br className="hidden md:block" /> Dec 2026</p>
            <div className="min-w-0">
              <h3 className="font-serif text-lg font-bold">Bi-Weekly Artist Workshops</h3>
              <p className="mt-1 text-xs font-semibold text-khaki">Free for Patreon Club Members</p>
              <p className="mt-3 text-sm text-ink-muted leading-relaxed">Live {WORKSHOP_PRICING.durationMinutes}-minute working sessions on sync pitching, publishing and independent rollouts.</p>
              <p className="mt-3 text-sm">
                {showPromotion ? <><s className="text-ink-muted">${WORKSHOP_PRICING.regular}</s> <strong className="ml-2">${WORKSHOP_PRICING.blackFriday}</strong> Black Friday drop-in, Nov 27 to Nov 30</> : <>${WORKSHOP_PRICING.regular} drop-in</>}
              </p>
              <a href={PATREON_PAGE_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-ink-muted underline underline-offset-4">Join the Club on Patreon<ExternalLink className="h-3 w-3" aria-hidden="true" /></a>
            </div>
            <Button variant="editorialOutline" asChild className="justify-self-start md:justify-self-end">
              <Link to="/contact?subject=Artist%20Workshop%20signup">Sign up for a workshop<ArrowRight aria-hidden="true" /></Link>
            </Button>
          </article>
        </div>
      </div>
    </section>
  );
}