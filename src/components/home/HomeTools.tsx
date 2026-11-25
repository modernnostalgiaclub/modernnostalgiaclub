import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BLACK_FRIDAY_DISCOUNTS, getBlackFridayPhase, HOME_SERVICES } from '@/lib/homepageOffers';

export function HomeTools() {
  const showPromotion = getBlackFridayPhase() !== 'ended';
  const tools = [
    { id: 'pitchclub', name: 'PitchClub', description: 'Free outreach emails, one-sheets and decks for artists without a full team. Answer a few guided questions and have a finished pitch and a step-by-step game plan.', action: 'Open PitchClub', url: 'https://pitch.modernnostalgia.club' },
    { id: 'mixtapeclub', name: 'MixtapeClub', description: 'Organize your unreleased music and mixtape projects, then share them with collaborators and the people you want to reach.', action: 'Open MixtapeClub', url: 'https://mixtape.modernnostalgia.club' },
    { id: 'field-kits', name: 'Sync & Business Field Kits', description: 'eBooks, split sheets and pitch templates. Practical paperwork for the business side of your music.', action: 'Get the Kits', url: '/store' },
    { id: 'sync-quiz', name: 'Sync-Ready Diagnostic Quiz', description: 'Check your masters, splits and instrumentals before you pitch, and see what still needs attention.', action: 'Take the Quiz', url: '/sync-quiz' },
  ];
  return (
    <section id="tools" aria-labelledby="tools-heading" className="home-section border-b border-rule bg-paper py-14 md:py-20">
      <div className="container mx-auto px-6">
        <p className="mb-3 text-xs font-semibold uppercase text-ink-muted">Practical artist utilities</p>
        <h2 id="tools-heading" className="mb-10 font-anton text-4xl md:text-5xl uppercase leading-[1.15]">Tools &amp; Field Kits</h2>
        <div className="border-t-2 border-khaki">
          {tools.map(tool => (
            <article key={tool.id} id={tool.id} className="home-section grid items-start gap-3 border-b border-rule py-7 md:grid-cols-[12rem_minmax(0,1fr)_11rem] md:gap-8">
              <h3 className="font-serif text-base font-bold">{tool.name}</h3>
              <div>
                <p className="text-sm leading-relaxed text-ink-muted">{tool.description}</p>
                {tool.id === 'field-kits' && showPromotion && <p className="mt-3 text-sm font-medium">{BLACK_FRIDAY_DISCOUNTS.fieldKitsPercent}% off for Black Friday, or free with the ${HOME_SERVICES[2].blackFridayPrice} Bundle. Nov 27 to Nov 30.</p>}
              </div>
              <Button variant="link" asChild className="h-auto justify-start p-0 text-ink md:justify-end whitespace-normal text-left">
                {tool.url.startsWith('https://') ? <a href={tool.url} target="_blank" rel="noopener noreferrer">{tool.action}<ExternalLink aria-hidden="true" /></a> : <Link to={tool.url}>{tool.action}<ArrowRight aria-hidden="true" /></Link>}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}