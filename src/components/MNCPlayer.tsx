import { useState } from 'react';

const playlists = [
  {
    name: 'Day Party',
    embedUrl: 'https://music.youtube.com/playlist?list=PL8vMWEFhhyIL7pHJSKNzrqS3mq0OC5InH',
    embedSrc: 'https://www.youtube.com/embed/videoseries?list=PL8vMWEFhhyIL7pHJSKNzrqS3mq0OC5InH',
  },
  {
    name: 'MNC Artists',
    embedUrl: 'https://music.youtube.com/playlist?list=PL8vMWEFhhyILw_nrgbYLjDsuaiQLeKLvQ',
    embedSrc: 'https://www.youtube.com/embed/videoseries?list=PL8vMWEFhhyILw_nrgbYLjDsuaiQLeKLvQ',
  },
];

export function MNCPlayer() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-20 border-t border-border/30" style={{ background: '#0a0a0a' }}>
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* Left – text */}
          <div className="lg:w-1/2 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Listen</p>
            <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-[1.05]">
              Listen to our<br />Playlist
            </h2>
            <p className="mt-4 text-sm md:text-base text-gray-400">
              Human-curated music for active listeners — sync-ready, mood-forward, catalog-built.
            </p>

            {/* Playlist tabs */}
            <div className="mt-8 flex gap-3">
              {playlists.map((pl, i) => (
                <button
                  key={pl.name}
                  onClick={() => setActive(i)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    active === i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {pl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right – playlist embed */}
          <div className="lg:w-1/2 w-full">
            <div className="rounded-xl overflow-hidden">
              <iframe
                key={playlists[active].name}
                src={playlists[active].embedSrc}
                width="100%"
                height="500"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={`${playlists[active].name} – YouTube Music Playlist`}
                className="w-full"
                style={{ borderRadius: '12px' }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
