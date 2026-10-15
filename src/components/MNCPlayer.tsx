const PLAYLISTS = [
  { label: 'R&B(aboy)', src: 'https://open.spotify.com/embed/playlist/23H7AOjNmwl33goQTlmQNF?utm_source=generator&theme=0' },
  { label: 'SA(RAP)', src: 'https://open.spotify.com/embed/playlist/2vXjR8Th4LrRpIAa6vcW8P?utm_source=generator' },
];

export function MNCPlayer() {
  return (
    <section className="py-20 border-t border-border/30" style={{ background: '#0a0a0a' }}>
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          <div className="lg:w-2/5 flex flex-col justify-center">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Listen</p>
            <h2 className="font-anton text-3xl md:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-[1.05]">
              Listen to our<br />Playlists
            </h2>
            <p className="mt-4 text-sm md:text-base text-gray-400">
              Human curates music for active listeners, sync ready, mood forward, catalog built
            </p>
          </div>

          <div className="lg:w-3/5 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            {PLAYLISTS.map((p) => (
              <div key={p.label}>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">{p.label}</p>
                <iframe
                  src={p.src}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={`${p.label} on Spotify`}
                  style={{ borderRadius: '12px' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
