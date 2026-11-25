import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { displayedServicePrice, getBlackFridayPhase, HOME_SERVICES } from '@/lib/homepageOffers';

export function ConnectServices() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(interval);
  }, []);
  const phase = getBlackFridayPhase(now);
  const showPromotion = phase !== 'ended';

  return (
    <section aria-labelledby="connect-services-heading" className="space-y-3">
      <div className="border-t border-inverse/20 pt-6">
        {showPromotion && <p className="text-xs font-semibold uppercase text-inverse-muted mb-2">Black Friday {phase === 'upcoming' ? 'Preview' : 'Offers'} · November 27 to 30 · Pacific</p>}
        <h1 id="connect-services-heading" className="font-anton text-3xl uppercase leading-[1.15]">Work With Me</h1>
      </div>
      {HOME_SERVICES.map(service => (
        <Button key={service.id} variant="editorial" asChild className="w-full h-auto min-h-24 whitespace-normal justify-between px-5 py-4 text-left">
          <Link to={service.bookingUrl}>
            <span className="min-w-0">
              <span className="block text-base font-semibold">{service.name}</span>
              <span className="block text-xs font-normal mt-1 leading-snug">{service.description}</span>
              <span className="block text-base font-semibold mt-2">
                ${displayedServicePrice(service, now)}
                {showPromotion && <del className="ml-3 text-xs font-normal">${service.regularPrice}</del>}
              </span>
            </span>
            <ArrowRight className="shrink-0" aria-hidden="true" />
          </Link>
        </Button>
      ))}
    </section>
  );
}
