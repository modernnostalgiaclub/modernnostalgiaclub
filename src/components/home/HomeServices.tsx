import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { displayedServicePrice, getBlackFridayPhase, HOME_SERVICES } from '@/lib/homepageOffers';

export function HomeServices() {
  const showPromotion = getBlackFridayPhase() !== 'ended';
  return (
    <section id="services" aria-labelledby="services-heading" className="home-section border-b border-rule bg-paper py-14 md:py-20">
      <div className="container mx-auto px-6">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase text-ink-muted">1-on-1 Services</p>
            <h2 id="services-heading" className="font-anton text-4xl md:text-5xl uppercase leading-[1.15]">Work With Me</h2>
            <p className="mt-4 max-w-xl text-ink-muted">Get clear on your publishing, prepare your music for sync, or work through both.</p>
          </div>
          {showPromotion && <p className="text-sm text-ink-muted">Black Friday pricing: Nov 27 to Nov 30, 2026</p>}
        </div>
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {HOME_SERVICES.map((service, index) => (
            <article key={service.id} id={service.id} className="home-section flex min-w-0 flex-col border-t-2 border-khaki pt-6">
              <span className="mb-5 text-xs text-ink-muted" aria-hidden="true">0{index + 1}</span>
              <h3 className="min-h-[3.5rem] font-serif text-xl font-bold leading-snug">{service.name}</h3>
              <div className="mt-5 flex items-baseline gap-3">
                {showPromotion && <span className="text-lg text-ink-muted"><span className="sr-only">Regular price </span><s>${service.regularPrice}</s></span>}
                <span className="font-anton text-5xl leading-none">${displayedServicePrice(service)}</span>
              </div>
              <p className="mt-2 text-xs text-ink-muted">{showPromotion ? 'Black Friday' : 'Regular price'}{'separateValue' in service ? ` · $${service.separateValue} value` : ' · USD'}</p>
              <p className="mt-6 text-sm leading-relaxed text-ink-muted">{service.description}</p>
              <ul className="my-6 space-y-3 text-sm">
                {service.details.map(detail => <li key={detail} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-khaki" aria-hidden="true" /><span>{detail}</span></li>)}
              </ul>
              <Button variant="editorial" size="lg" asChild className="mt-auto w-full">
                <Link to={service.bookingUrl}>{service.action}<ArrowRight aria-hidden="true" /></Link>
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}