import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLAYLIST_SUBMISSION_URL } from '@/lib/siteNavigation';

const PLAYLISTS = [
  { label: 'R&B(aboy)', src: 'https://open.spotify.com/embed/playlist/23H7AOjNmwl33goQTlmQNF?utm_source=generator&theme=0' },
  { label: 'SA(RAP)', src: 'https://open.spotify.com/embed/playlist/2vXjR8Th4LrRpIAa6vcW8P?utm_source=generator' },
];

export function MNCPlayer() {
  return (
    <section id="playlists" aria-labelledby="playlists-heading" className="home-section bg-chrome py-14 text-inverse md:py-20">
      <div className="container mx-auto px-6">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase text-inverse-muted">Human music, human curation</p>
            <h2 id="playlists-heading" className="font-anton text-4xl md:text-5xl uppercase leading-[1.15]">
              Listen to our Playlists
            </h2>
            <p className="mt-4 max-w-xl text-sm md:text-base text-inverse-muted">
              New voices and independent releases, selected for people who love discovering music.
            </p>
          </div>
          <Button variant="inverseOutline" asChild className="self-start shrink-0">
            <a href={PLAYLIST_SUBMISSION_URL} target="_blank" rel="noopener noreferrer">Submit to Our Playlists<ArrowRight aria-hidden="true" /></a>
          </Button>
        </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {PLAYLISTS.map((p) => (
              <div key={p.label} className="min-w-0">
                <p className="mb-3 text-sm text-inverse-muted">{p.label}</p>
                <iframe
                  src={p.src}
                  width="100%"
                  height="352"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={`${p.label} on Spotify`}
                  allowFullScreen
                  className="block w-full rounded-lg border-0"
                />
              </div>
            ))}
          </div>
      </div>
    </section>
  );
}
